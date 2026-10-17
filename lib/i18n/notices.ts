import type { Locale } from "./locale";

const EXACT: Record<string, { ru: string; kk: string }> = {
  "Request submitted": { ru: "Заявка отправлена", kk: "Өтінім жіберілді" },
  "Request cancelled": { ru: "Заявка отменена", kk: "Өтінім болдырылмады" },
  "Your request is in review": { ru: "Заявка на рассмотрении", kk: "Өтінім қаралуда" },
  "Question sent to HR": { ru: "Вопрос передан в HR", kk: "Сұрақ HR-ға жіберілді" },
  "New question from Al Jana": { ru: "Новый вопрос от Al Jana", kk: "Al Jana-дан жаңа сұрақ" },
  "HR replied to your question": { ru: "HR ответил на ваш вопрос", kk: "HR сұрағыңызға жауап берді" },
  "Course completed": { ru: "Курс завершен", kk: "Курс аяқталды" },
  "Team member completed a course": { ru: "Сотрудник завершил курс", kk: "Қызметкер курс аяқтады" },
  "New course assigned": { ru: "Назначен новый курс", kk: "Жаңа курс тағайындалды" },
  "Vacation request approved": { ru: "Заявка на отпуск одобрена", kk: "Демалыс өтінімі мақұлданды" },
  "Salary advance rejected": { ru: "Заявка на аванс отклонена", kk: "Аванс өтінімі қабылданбады" },
  "Salary advance awaiting decision": { ru: "Аванс ожидает решения", kk: "Аванс шешім күтуде" },
  "Welcome to Digital HR": { ru: "Добро пожаловать в Digital HR", kk: "Digital HR-ға қош келдіңіз" },
  "New vacation request": { ru: "Новая заявка на отпуск", kk: "Жаңа демалыс өтінімі" },
  "New salary advance request": { ru: "Новая заявка на аванс", kk: "Жаңа аванс өтінімі" },
  "Your vacation request was approved": { ru: "Заявка на отпуск одобрена", kk: "Демалыс өтінімі мақұлданды" },
  "Your vacation request was rejected": { ru: "Заявка на отпуск отклонена", kk: "Демалыс өтінімі қабылданбады" },
  "Your salary advance request was approved": { ru: "Заявка на аванс одобрена", kk: "Аванс өтінімі мақұлданды" },
  "Your salary advance request was rejected": { ru: "Заявка на аванс отклонена", kk: "Аванс өтінімі қабылданбады" },
};

export function localizeTitle(title: string, locale: Locale): string {
  return EXACT[title]?.[locale] ?? title;
}

type Pair = { ru: string; kk: string };

function fill(pair: Pair, locale: Locale, vars: Record<string, string>): string {
  return pair[locale].replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

const BODY: { test: RegExp; text: Pair; keys: string[] }[] = [
  {
    test: /^Your vacation request ([\w-]+) was approved by (.+)\.$/,
    keys: ["id", "name"],
    text: { ru: "Заявка на отпуск {id} одобрена: {name}.", kk: "Демалыс өтінімі {id} мақұлданды: {name}." },
  },
  {
    test: /^Your salary advance request ([\w-]+) was rejected\. See the manager's comment\.$/,
    keys: ["id"],
    text: { ru: "Заявка на аванс {id} отклонена. Смотрите комментарий руководителя.", kk: "Аванс өтінімі {id} қабылданбады. Басшы пікірін қараңыз." },
  },
  {
    test: /^(.+) was assigned to you by (.+)\. Due in (\d+) days\.$/,
    keys: ["course", "name", "days"],
    text: { ru: "Курс «{course}» назначил(а) {name}. Срок: {days} дн.", kk: "«{course}» курсын {name} тағайындады. Мерзімі: {days} күн." },
  },
  {
    test: /^(.+) was assigned to you by (.+)\. Due (.+)\.$/,
    keys: ["course", "name", "due"],
    text: { ru: "Курс «{course}» назначил(а) {name}. Срок: {due}.", kk: "«{course}» курсын {name} тағайындады. Мерзімі: {due}." },
  },
  {
    test: /^(.+) was assigned to you by (.+)\.$/,
    keys: ["course", "name"],
    text: { ru: "Курс «{course}» назначил(а) {name}.", kk: "«{course}» курсын {name} тағайындады." },
  },
  {
    test: /^You completed (.+)\.$/,
    keys: ["course"],
    text: { ru: "Вы завершили курс «{course}».", kk: "Сіз «{course}» курсын аяқтадыңыз." },
  },
  {
    test: /^You passed "(.+)" with (\d+)%\.$/,
    keys: ["course", "score"],
    text: { ru: "Вы сдали «{course}» на {score}%.", kk: "Сіз «{course}» курсын {score}% нәтижемен тапсырдыңыз." },
  },
  {
    test: /^(.+) passed "(.+)" with (\d+)%\.$/,
    keys: ["name", "course", "score"],
    text: { ru: "{name} сдал(а) «{course}» на {score}%.", kk: "{name} «{course}» курсын {score}% нәтижемен тапсырды." },
  },
  {
    test: /^(.+) submitted a vacation request \(([\w-]+)\) for your review\.$/,
    keys: ["name", "id"],
    text: { ru: "{name} отправил(а) заявку на отпуск ({id}) вам на рассмотрение.", kk: "{name} демалыс өтінімін ({id}) сізге жіберді." },
  },
  {
    test: /^(.+)'s salary advance \(([\w-]+)\) is in review\.$/,
    keys: ["name", "id"],
    text: { ru: "Аванс {name} ({id}) на рассмотрении.", kk: "{name} авансы ({id}) қаралуда." },
  },
  {
    test: /^You have company-wide access\. Escalated Al Jana questions will appear in the HR inbox\.$/,
    keys: [],
    text: {
      ru: "У вас доступ ко всей компании. Вопросы из Al Jana появятся во входящих HR.",
      kk: "Сізде бүкіл компанияға қолжетімділік бар. Al Jana сұрақтары HR кіріс жәшігінде көрінеді.",
    },
  },
  {
    test: /^Your (.+) request ([\w-]+) \((.+)\) was sent to (.+)\.$/,
    keys: ["kind", "id", "detail", "name"],
    text: { ru: "Ваша заявка ({kind}) {id} ({detail}) отправлена: {name}.", kk: "Сіздің өтініміңіз ({kind}) {id} ({detail}) {name} адамға жіберілді." },
  },
  {
    test: /^(.+) submitted a (.+) request \(([\w-]+)\): (.+)\.$/,
    keys: ["name", "kind", "id", "detail"],
    text: { ru: "{name} отправил(а) заявку ({kind}) {id}: {detail}.", kk: "{name} өтінім жіберді ({kind}) {id}: {detail}." },
  },
  {
    test: /^(.+) cancelled their (.+) request ([\w-]+)\.$/,
    keys: ["name", "kind", "id"],
    text: { ru: "{name} отменил(а) заявку ({kind}) {id}.", kk: "{name} өтінімді ({kind}) {id} болғызбады." },
  },
  {
    test: /^(.+): ([\w-]+) \((.+)\) is now ([^.]+)\.(?: Comment: "(.+)")?$/,
    keys: ["name", "id", "detail", "status", "comment"],
    text: { ru: "{name}: {id} ({detail}) — статус «{status}».{comment}", kk: "{name}: {id} ({detail}) — күйі «{status}».{comment}" },
  },
  {
    test: /^Your question \((.+)\) was forwarded to the HR team\. You'll be notified when they reply\.$/,
    keys: ["id"],
    text: { ru: "Ваш вопрос ({id}) передан в HR. Вы получите уведомление, когда ответят.", kk: "Сұрағыңыз ({id}) HR-ға жіберілді. Жауап бергенде хабарлама аласыз." },
  },
  {
    test: /^(.+) asked: "(.+)"$/,
    keys: ["name", "question"],
    text: { ru: "{name} спросил(а): «{question}»", kk: "{name} сұрады: «{question}»" },
  },
  {
    test: /^(.+) answered (.+): "(.+)"$/,
    keys: ["name", "id", "answer"],
    text: { ru: "{name} ответил(а) на {id}: «{answer}»", kk: "{name} {id} сұрағына жауап берді: «{answer}»" },
  },
];

const HISTORY: { test: RegExp; text: Pair; keys: string[] }[] = [
  { test: /^Draft saved$/, keys: [], text: { ru: "Черновик сохранён", kk: "Жоба сақталды" } },
  { test: /^Request submitted$/, keys: [], text: { ru: "Заявка отправлена", kk: "Өтінім жіберілді" } },
  { test: /^Manager started review$/, keys: [], text: { ru: "Руководитель начал рассмотрение", kk: "Басшы қарауды бастады" } },
  { test: /^Approved by manager$/, keys: [], text: { ru: "Одобрено руководителем", kk: "Басшы мақұлдады" } },
  { test: /^Rejected by manager$/, keys: [], text: { ru: "Отклонено руководителем", kk: "Басшы қабылдамады" } },
  { test: /^Approved by (.+)$/, keys: ["name"], text: { ru: "Одобрил(а): {name}", kk: "Мақұлдады: {name}" } },
  { test: /^Rejected by (.+)$/, keys: ["name"], text: { ru: "Отклонил(а): {name}", kk: "Қабылдамады: {name}" } },
  { test: /^Cancelled by employee$/, keys: [], text: { ru: "Отменено сотрудником", kk: "Қызметкер болдырмады" } },
];

export function localizeHistoryNote(note: string, locale: Locale): string {
  for (const rule of HISTORY) {
    const match = note.match(rule.test);
    if (!match) continue;
    const vars: Record<string, string> = {};
    rule.keys.forEach((key, index) => {
      vars[key] = match[index + 1] ?? "";
    });
    return fill(rule.text, locale, vars);
  }
  return note;
}

export function localizeBody(body: string, locale: Locale): string {
  for (const rule of BODY) {
    const match = body.match(rule.test);
    if (!match) continue;
    const vars: Record<string, string> = {};
    rule.keys.forEach((key, index) => {
      vars[key] = match[index + 1] ?? "";
    });
    if (vars.comment) {
      vars.comment = locale === "kk" ? ` Пікір: «${vars.comment}»` : ` Комментарий: «${vars.comment}»`;
    }
    return fill(rule.text, locale, vars);
  }
  return body;
}
