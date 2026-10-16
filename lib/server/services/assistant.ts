import type {
  AssistantLogDoc,
  AssistantReply,
  EscalationDoc,
  EscalationView,
} from "../../domain/types";
import { ask as askKnowledgeBase } from "../../assistant/engine";
import { getDb } from "../db";
import type { Db } from "../db";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import { isHr, type Actor } from "../policy";
import { notify } from "./notifications";

const MAX_QUESTION = 500;

function cleanQuestion(q: unknown): string {
  if (typeof q !== "string" || !q.trim()) throw badRequest("Please type a question.", { question: "Required" });
  const s = q.trim();
  if (s.length > MAX_QUESTION) throw badRequest(`Questions are limited to ${MAX_QUESTION} characters.`, { question: "Too long" });
  return s;
}

/**
 * Answer from the knowledge base ONLY. The engine is deterministic retrieval;
 * the returned text is the KB entry verbatim, never generated.
 */
export async function ask(actor: Actor, question: unknown): Promise<AssistantReply> {
  const q = cleanQuestion(question);
  const reply = askKnowledgeBase(q);
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
  return reply;
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
