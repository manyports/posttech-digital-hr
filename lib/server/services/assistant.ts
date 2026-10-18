import type {
  AssistantLogDoc,
  AssistantReply,
  EscalationDoc,
  EscalationView,
} from "../../domain/types";
import { answerFromEntry, ask as askKnowledgeBase, noAnswerReply } from "../../assistant/engine";
import { routeEntryId } from "../../assistant/model-router";
import { parseVacationRange } from "../../assistant/vacation-phrase";
import { getDb } from "../db";
import type { Db } from "../db";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import { isHr, type Actor } from "../policy";
import { notify } from "./notifications";
import { pendingVacationDays } from "./employees";
import { createRequest } from "./requests";
import { MESSAGES_RU } from "../../assistant/translations";
import { localizedKnowledgeQuestion, translateKnowledgeEntry } from "../../assistant/reference-translations";
import { getPublishedKnowledgeBase } from "./knowledge-base";

const MAX_QUESTION = 500;

function cleanQuestion(q: unknown): string {
  if (typeof q !== "string" || !q.trim()) throw badRequest("Please type a question.", { question: "Required" });
  const s = q.trim();
  if (s.length > MAX_QUESTION) throw badRequest(`Questions are limited to ${MAX_QUESTION} characters.`, { question: "Too long" });
  return s;
}

const RU_TO_EN_EXACT: Record<string, string> = {
  "сколько дней отпуска мне положено?": "How many vacation days do I get?",
  "сколько дней отпуска мне положено": "How many vacation days do I get?",
  "как запросить аванс по зарплате?": "How do I request a salary advance?",
  "как запросить аванс по зарплате": "How do I request a salary advance?",
  "что делать, если я заболел?": "What should I do if I am sick?",
  "что делать, если я заболел": "What should I do if I am sick?",
  "могу ли я работать из дома?": "Can I work from home?",
  "могу ли я работать из дома": "Can I work from home?",
  "в какой день выплачивается зарплата?": "When is salary paid?",
  "в какой день выплачивается зарплата": "When is salary paid?",
  "есть ли у нас опционы на акции?": "Do we have stock options?",
  "есть ли у нас опционы на акции": "Do we have stock options?",
  "жылына неше күн демалыс беріледі?": "How many vacation days do I get?",
  "жылына неше күн демалыс беріледі": "How many vacation days do I get?",
  "жалақы авансын қалай сұраймын?": "How do I request a salary advance?",
  "жалақы авансын қалай сұраймын": "How do I request a salary advance?",
  "ауырып қалсам не істеуім керек?": "What should I do if I am sick?",
  "ауырып қалсам не істеуім керек": "What should I do if I am sick?",
  "үйден жұмыс істей аламын ба?": "Can I work from home?",
  "үйден жұмыс істей аламын ба": "Can I work from home?",
  "жалақы қай күні төленеді?": "When is salary paid?",
  "жалақы қай күні төленеді": "When is salary paid?",
};

const CYRILLIC = /[а-яёәғқңөұүһі]/i;

function mapRussianQuery(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (RU_TO_EN_EXACT[lower]) return RU_TO_EN_EXACT[lower];

  // If no Cyrillic characters, return as is.
  if (!CYRILLIC.test(raw)) return raw;

  if (/отпуск|демалыс/i.test(raw) && parseVacationRange(raw)) return "How do I apply for a vacation?";
  if (/декабр/i.test(raw) && /отпуск/i.test(raw)) return "Can the whole branch take December off together?";
  if (/желтоқсан/i.test(raw) && /демалыс/i.test(raw)) return "Can the whole branch take December off together?";

  if (/демалыс/i.test(raw)) {
    if (/қалдық|баланс|неше/i.test(raw)) return "How many vacation days do I get?";
    if (/қалай|өтінім/i.test(raw)) return "How do I apply for a vacation?";
    if (/келісім|кім/i.test(raw)) return "Who has to approve my leave?";
    if (/келесі жыл/i.test(raw)) return "Can I carry unused vacation over into next year?";
    if (/жалақысыз/i.test(raw)) return "Is it possible to get leave without pay?";
    return "How many vacation days do I get?";
  }
  if (/ауыр/i.test(raw)) {
    if (/ақы|төлен/i.test(raw)) return "Do I get paid during sick leave?";
    if (/анықтама|парақ/i.test(raw)) return "Do I need a medical certificate when I am sick?";
    return "What should I do if I am sick?";
  }
  if (/аванс/i.test(raw)) {
    if (/қанша|лимит|пайыз|максимум/i.test(raw)) return "How much can I take as an advance on my salary?";
    if (/қашан|мерзім/i.test(raw)) return "How long until my advance is paid out?";
    return "How do I request a salary advance?";
  }
  if (/үйден|қашықтан/i.test(raw)) return "Can I work from home?";
  if (/жалақы/i.test(raw) && !/аванс/i.test(raw)) return "When is salary paid?";

  if (/опцион|акци/i.test(raw)) return "Do we have stock options?";
  if (/привет|здравствуй|добрый (день|вечер|утро)/i.test(raw)) return "hello";
  if (/спасибо|благодар/i.test(raw)) return "thanks";
  if (/пока|до свидания/i.test(raw)) return "bye";
  if (/кто ты|что ты (умеешь|можешь)/i.test(raw)) return "who are you?";

  if (/больничн|заболел|врач|болею/i.test(raw)) {
    if (/оплат|плат/i.test(raw)) return "Do I get paid during sick leave?";
    if (/справк|лист|сертификат/i.test(raw)) return "Do I need a medical certificate when I am sick?";
    return "What should I do if I am sick?";
  }
  if (/аванс/i.test(raw)) {
    if (/скольк|максимум|лимит|процент/i.test(raw)) return "How much can I take as an advance on my salary?";
    if (/когда|сроки|выплат/i.test(raw)) return "How long until my advance is paid out?";
    return "How do I request a salary advance?";
  }
  if (/отпуск/i.test(raw)) {
    if (/остаток|баланс|сколько/i.test(raw)) return "How many vacation days do I get?";
    if (/оформить|подать|запрос|заявк/i.test(raw)) return "How do I apply for a vacation?";
    if (/согласов|кто/i.test(raw)) return "Who has to approve my leave?";
    if (/перенос|следующ/i.test(raw)) return "Can I carry unused vacation over into next year?";
    if (/без содерж|за свой счет/i.test(raw)) return "Is it possible to get leave without pay?";
    return "How many vacation days do I get?";
  }
  if (/дом|удален|дистанцион/i.test(raw)) return "Can I work from home?";
  if (/расчетн|квитанц|листок/i.test(raw)) return "Where do I download my pay slip?";
  if (/зарплат|деньги|оплат/i.test(raw)) return "When is salary paid?";
  if (/командиров/i.test(raw)) return "What approval do I need for a business trip?";
  if (/увольн|уход/i.test(raw)) return "How do I hand in my resignation?";
  if (/страхов/i.test(raw)) return "Do employees get health insurance?";
  if (/обучен|курс|академи/i.test(raw)) return "Is there a budget for training courses?";
  if (/контакт|связаться|hr/i.test(raw)) return "How do I reach HR?";
  if (/справк/i.test(raw)) return "I need proof of employment, who can issue it?";

  return raw;
}

/**
 * Answer from the knowledge base ONLY. The engine is deterministic retrieval;
 * the returned text is the KB entry verbatim, never generated.
 */
export async function ask(actor: Actor, question: unknown, locale: "ru" | "kk" = "ru"): Promise<AssistantReply> {
  const q = cleanQuestion(question);
  const kb = await getPublishedKnowledgeBase();
  const cyrillic = CYRILLIC.test(q);
  const routed = await routeEntryId(q, undefined, kb);
  let reply: AssistantReply;
  if (routed.status === "picked") {
    reply = answerFromEntry(routed.entryId, q, kb) ?? askKnowledgeBase(mapRussianQuery(q), kb);
  } else if (routed.status === "none") {
    reply = noAnswerReply(q, kb);
  } else {
    reply = askKnowledgeBase(mapRussianQuery(q), kb);
  }
  const range = parseVacationRange(q);
  if (range && /отпуск|демалыс/i.test(q)) {
    const forced = answerFromEntry("how-to-request-vacation", q, kb);
    if (forced && forced.kind === "answer") reply = forced;
  }
  const db = await getDb();
  const log: AssistantLogDoc = {
    _id: `log-${await db.nextSeq("assistantLog")}`,
    userId: actor.id,
    question: q,
    outcome: reply.kind === "answer" ? "answered" : reply.kind,
    ...(reply.kind === "answer" ? { entryId: reply.entryId } : {}),
    createdAt: new Date().toISOString(),
  };
  await db.assistantLog.insertOne(log);

  if (range && reply.kind === "answer" && reply.entryId === "how-to-request-vacation") {
    try {
      const created = await createRequest(actor, {
        type: "vacation",
        intent: "draft",
        startDate: range.startDate,
        endDate: range.endDate,
      });
      reply = { ...reply, action: { label: "draft", href: `/requests/${created.id}` } };
    } catch {
      reply = { ...reply };
    }
  }

  if (reply.kind === "answer" && reply.entryId === "vacation-balance-personal") {
    const me = await db.employees.findOne({ _id: actor.id });
    if (me) {
      const pending = await pendingVacationDays(db, me._id);
      reply = { ...reply, personalBalance: { available: Math.max(0, me.vacationBalance - pending) } };
    }
  }

  if (reply.kind === "answer") {
    const entry = kb.find((item) => item.id === reply.entryId);
    const translations = entry ? (entry.translations ?? translateKnowledgeEntry(entry)) : null;
    const localized = locale === "kk" ? translations?.kk : translations?.ru;
    const legacyRussian = entry?.answerRu ?? entry?.answer;
    return {
      ...reply,
      question: q,
      title: localized?.title ?? reply.title,
      answer: localized?.answer ?? legacyRussian ?? reply.answer,
      localizedSource: localized?.source,
      related: reply.related.map((item) => ({
        ...item,
        question: localizedKnowledgeQuestion(item.entryId, locale, item.question),
      })),
    };
  }

  if (cyrillic && locale === "ru") {
    if (reply.kind === "no_answer") {
      return {
        ...reply,
        question: q,
        message: MESSAGES_RU.noAnswer,
      };
    }
    return {
      ...reply,
      question: q,
      message: MESSAGES_RU[reply.kind as keyof typeof MESSAGES_RU] ?? reply.message,
    };
  }

  return { ...reply, question: q };
}

async function toView(db: Db, docs: EscalationDoc[]): Promise<EscalationView[]> {
  const people = new Map(
    (await db.employees.find({ _id: { $in: [...new Set(docs.map((d) => d.userId))] } })).map((e) => [e._id, e]),
  );
  return docs.map((d) => ({
    id: d._id,
    question: d.question,
    createdAt: d.createdAt,
    status: d.status,
    ...(d.answer ? { answer: d.answer } : {}),
    ...(d.answeredAt ? { answeredAt: d.answeredAt } : {}),
    employee: { id: d.userId, fullName: people.get(d.userId)?.fullName ?? "Unknown" },
  }));
}

/** Forward an unanswered question to the HR team. */
export async function escalate(actor: Actor, question: unknown): Promise<EscalationView> {
  const q = cleanQuestion(question);
  const db = await getDb();

  // Idempotent: the same open question isn't filed twice.
  const open = (await db.escalations.find({ userId: actor.id, status: "open" })).find((e) => e.question === q);
  if (open) return (await toView(db, [open]))[0];

  const doc: EscalationDoc = {
    _id: `ESC-${2000 + (await db.nextSeq("escalation"))}`,
    userId: actor.id,
    question: q,
    createdAt: new Date().toISOString(),
    status: "open",
  };
  await db.escalations.insertOne(doc);

  await notify(db, actor.id, {
    kind: "escalation",
    title: "Question sent to HR",
    body: `Your question (${doc._id}) was forwarded to the HR team. You'll be notified when they reply.`,
    href: "/assistant",
  });
  for (const hr of await db.employees.find({ role: "hr", active: true })) {
    await notify(db, hr._id, {
      kind: "escalation",
      title: "New question from Al Jana",
      body: `${actor.fullName} asked: "${q.length > 90 ? `${q.slice(0, 90)}…` : q}"`,
      href: "/hr",
    });
  }
  return (await toView(db, [doc]))[0];
}

/** Employees see their own escalations; HR sees all. */
export async function listEscalations(actor: Actor): Promise<EscalationView[]> {
  const db = await getDb();
  const docs = await db.escalations.find(isHr(actor) ? {} : { userId: actor.id }, { sort: { createdAt: -1 } });
  return toView(db, docs);
}

export async function replyToEscalation(actor: Actor, id: string, answer: unknown): Promise<EscalationView> {
  if (!isHr(actor)) throw forbidden("Only HR can reply to escalated questions.");
  if (typeof answer !== "string" || answer.trim().length < 3) {
    throw badRequest("Write a reply (at least 3 characters).", { answer: "Required" });
  }
  if (answer.length > 1000) throw badRequest("Reply is too long.", { answer: "At most 1000 characters" });

  const db = await getDb();
  const esc = await db.escalations.findOne({ _id: id });
  if (!esc) throw notFound("Escalation not found.");

  const now = new Date().toISOString();
  const won = await db.escalations.updateOne(
    { _id: id, status: "open" },
    { $set: { status: "answered", answer: answer.trim(), answeredById: actor.id, answeredAt: now } },
  );
  if (!won) throw conflict("This question was already answered.");

  await notify(db, esc.userId, {
    kind: "escalation",
    title: "HR replied to your question",
    body: `${actor.fullName} answered ${esc._id}: "${answer.trim().slice(0, 140)}"`,
    href: "/assistant",
  });
  return (await toView(db, [(await db.escalations.findOne({ _id: id }))!]))[0];
}

/** HR-only insight: what Al Jana could NOT answer (drives knowledge-base improvements). */
export async function unansweredQuestions(actor: Actor, limit = 20) {
  if (!isHr(actor)) throw forbidden("Only HR can view assistant analytics.");
  const db = await getDb();
  const logs = await db.assistantLog.find({ outcome: "no_answer" }, { sort: { createdAt: -1 }, limit: 200 });
  const byQuestion = new Map<string, { question: string; count: number; lastAskedAt: string }>();
  for (const l of logs) {
    const key = l.question.toLowerCase();
    const cur = byQuestion.get(key);
    if (cur) cur.count++;
    else byQuestion.set(key, { question: l.question, count: 1, lastAskedAt: l.createdAt });
  }
  const total = await db.assistantLog.count({});
  const answered = await db.assistantLog.count({ outcome: "answered" });
  return { total, answered, unanswered: [...byQuestion.values()].slice(0, limit) };
}
