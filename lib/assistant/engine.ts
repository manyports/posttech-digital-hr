/**
 * Al Jana engine: deterministic, offline retrieval over the HR knowledge base.
 *
 * ALGORITHM
 *  1. Normalise the question (lowercase, contractions, punctuation), rewrite
 *     multi-word synonyms ("work from home" -> "remote", "time off" -> "vacation"),
 *     drop stopwords, map single-word synonyms and lightly stem the rest.
 *     Exactly the same pipeline indexes every KB field (questions, title,
 *     keywords, answer body), so both sides always speak the same vocabulary.
 *  2. Score every entry with BM25 over weighted term frequencies
 *     (question x3, title x3, keywords x2, answer body x1).
 *  3. Coverage gate: the share of the question's IDF weight that the entry
 *     actually matches (body-only matches count 0.4). Terms found nowhere in
 *     the KB vocabulary get the maximum IDF, so they count AGAINST coverage:
 *     "Can I bring my dog to the office?" cannot hide behind the word "office".
 *  4. Entries are ranked by 0.5 * coverage + 0.5 * best IDF-weighted Dice
 *     similarity with one single entry question/title (prefers the entry whose
 *     question is closest, not just one that mentions the same words).
 *  5. An answer is returned only if the best entry passes ALL gates:
 *     - coverage >= MIN_COVERAGE (0.6) and BM25 >= MIN_SCORE (1.5);
 *     - topic gate: it contains the question's rarest known term (a question
 *       about "sick days" can't be answered by an entry that never mentions sick);
 *     - main-topic gate: if the entry lacks a headline term of the question (one that is
 *       central to >= 4 entries, e.g. "vacation"), coverage must be >= 0.8;
 *     - the runner-up is not a near tie (rank within AMBIGUITY_RATIO = 0.97,
 *       unless it is one of the best entry's declared related entries);
 *     - a question reduced to ONE term that is central to more than
 *       SINGLE_TERM_MAX_ENTRIES (5) entries ("vacation", "How do I get vacation?")
 *       is too vague, unless it is equivalent to one KB question (dice ~ 1)
 *       and was typed as a real question (3+ words).
 *     Otherwise: no_answer.
 *  Smalltalk (greetings, thanks, "who are you") and prompt-injection phrases
 *  are handled before retrieval and never produce an HR answer.
 *
 * WHY IT CANNOT HALLUCINATE
 *  There is no text generation. The text of an "answer" reply is the KB entry's
 *  `answer` string, copied verbatim; the source/action come from the same entry.
 *  Smalltalk/no_answer messages are fixed strings that state no HR rule, and
 *  suggestions are questions taken from the KB. If nothing passes the gates the
 *  engine says so honestly and offers escalation to HR.
 */

import type { AssistantReply, KbEntry } from "../domain/types";
import { KB } from "./knowledge-base";

/* ── Thresholds (tuned with tests/assistant.test.ts) ───────────────────── */

export const MIN_COVERAGE = 0.6;
export const MIN_SCORE = 1.5;
export const AMBIGUITY_RATIO = 0.97;
/** A question reduced to one term that is a strong term of more entries than this is too generic to pick one. */
export const SINGLE_TERM_MAX_ENTRIES = 5;
/**
 * Main-topic gate: a term that is central (questions/title/keywords) to at least this many entries
 * is a headline topic like "vacation" or "salary". If the best entry lacks one, coverage must be
 * MAIN_TOPIC_COVERAGE instead of MIN_COVERAGE, so a rare shared word ("month") cannot carry a match.
 */
export const MAIN_TOPIC_MIN_ENTRIES = 4;
export const MAIN_TOPIC_COVERAGE = 0.8;
const BM25_K1 = 1.2;
const BM25_B = 0.4;
const BODY_ONLY_MATCH = 0.4;
const MAX_QUESTION_CHARS = 500;

/* ── Vocabulary ────────────────────────────────────────────────────────── */

const STOPWORDS = new Set(
  (
    "a an the is are am was were be been being do does did doing done have has had having " +
    "i me my mine myself we us our ours you your yours he she it its they them their this that these those " +
    "what whats which who whom whose where why how can could would should will shall may might must " +
    "to of in on at for from by with about as into onto up down out off and or but if so then there here any some " +
    "get gets got getting take takes took taken taking give gave make made put let lets keep go going goes went come came coming " +
    "tell told ask asking asked question questions explain know knew need needs want wanted like wondering wonder curious " +
    "please pls thanks thank hi hello hey dear ok okay al ai jana just really actually exactly basically simply maybe kindly " +
    "also still yet very too more most less least each every all both few many much long far per etc via " +
    "not no yes never now again another other next last " +
    "someone anyone everyone anything something already ever anymore always often sometimes hand " +
    "see seen check view show find look looking display help info information " +
    "policy policies rule rules procedure process step steps way possible able allowed allow permitted " +
    "company employee employees staff worker work working worked " +
    "before after during until till since within over under between through while because whether " +
    "u ur r"
  ).split(" "),
);

/**
 * Synonym groups: canonical term -> surface forms. Entries containing a space
 * are phrases (rewritten before stopword removal). Single words also match
 * their stemmed form, so "holidays" and "holiday" both map.
 * Order of groups does not matter; longer phrases are always applied first.
 */
const GROUPS: Record<string, string[]> = {
  publicholiday: [
    "public holiday", "public holidays", "national holiday", "national holidays",
    "bank holiday", "bank holidays", "official holiday", "official holidays",
    "state holiday", "holiday calendar", "calendar of holidays",
  ],
  vacation: [
    "vacation", "holiday", "leave", "pto", "time off",
    "annual leave", "paid leave", "paid time off", "paid vacation", "paid holiday",
    "annual paid leave", "paid annual leave", "annual vacation",
    "vacation leave", "holiday leave", "paid holidays",
  ],
  "vacation day": ["days off", "day off", "paid days off", "paid day off", "vacation days", "vacation day"],
  unpaid: [
    "unpaid", "unpaid leave", "leave without pay", "unpaid vacation", "unpaid holiday",
    "leave of absence", "without pay", "day without pay", "days without pay",
    "unpaid time off", "unpaid days off",
  ],
  sick: [
    "sick", "sickness", "ill", "illness", "unwell", "sick leave", "sick day", "sick days",
    "off sick", "sick time", "call in sick", "feel sick", "feeling sick",
    "not feeling well", "feel unwell", "fall ill", "fell ill", "get sick", "got sick",
  ],
  "sick certificate": [
    "medical certificate", "doctor note", "doctors note", "doctor certificate",
    "sick note", "medical note", "sick certificate", "medical report", "medical document",
    "doctor letter", "doctors certificate",
  ],
  remote: [
    "remote", "remotely", "wfh", "work from home", "working from home", "work remotely",
    "work remote", "remote work", "home office", "homeoffice", "telework", "telecommute",
    "telecommuting", "hybrid", "work at home", "working at home", "from home",
    "work from anywhere", "working remotely",
  ],
  advance: [
    "advance", "prepayment", "pre payment", "early salary", "salary in advance",
    "advance payment", "payroll advance", "paid early", "get paid early", "before payday",
    "before pay day", "ahead of payday", "salary prepayment", "pay in advance",
    "money in advance",
  ],
  beforehand: ["in advance", "ahead of time", "how early", "how far ahead", "well ahead", "far ahead"],
  payslip: [
    "payslip", "payslips", "pay slip", "pay slips", "salary slip", "pay stub", "paystub",
    "wage slip", "payroll slip", "salary statement", "pay statement",
  ],
  "payday salary": [
    "payday", "pay day", "pay date", "salary date", "salary day", "paycheck", "pay check",
  ],
  salary: [
    "salary", "salaries", "wage", "wages", "pay", "paid", "paying", "payment", "payments", "payroll",
  ],
  resign: [
    "resign", "resignation", "resigning", "quit", "quitting", "hand in notice", "hand in my notice",
    "give notice", "give my notice", "notice period", "two weeks notice", "leave the company",
    "leave my job", "leave the job", "leave my company", "leaving the company",
    "leaving my job", "leaving", "terminate my contract", "end my contract", "leave employment",
    "notice of resignation", "serve notice",
  ],
  approve: [
    "approve", "approved", "approval", "approving", "approver", "permission", "authorize",
    "authorise", "authorization", "authorisation", "sign off", "go ahead", "consent", "approves",
  ],
  reject: ["reject", "rejected", "rejection", "decline", "declined", "refuse", "refused", "denied", "deny"],
  entitlement: ["entitle", "entitled", "entitlement", "entitlements", "allowance", "quota"],
  balance: ["left", "remaining", "remains", "remain", "balance", "balances", "available", "availability", "spare"],
  carryover: [
    "carryover", "carry over", "carry forward", "carried over", "roll over", "rollover",
    "leftover", "left over", "unused", "transfer to next year", "carried forward",
  ],
  request: ["request", "requests", "book", "booking", "apply", "applying", "application", "applications", "submit", "submission", "ask for", "asking for"],
  cancel: ["cancel", "cancelled", "canceled", "cancelling", "canceling", "withdraw", "withdrawal", "revoke", "retract", "call off"],
  notif: ["notify", "notified", "notification", "notifications", "notifying", "inform", "informed", "alert", "alerts", "let know"],
  manager: ["manager", "managers", "supervisor", "boss", "line manager", "direct manager", "team lead", "teamlead", "my line manager"],
  hr: ["human resources", "hr department", "hr team", "hr"],
  contact: ["contact", "email", "e mail", "emailing", "reach", "write to"],
  course: ["course", "courses", "training", "trainings", "lesson", "lessons", "class", "classes"],
  learning: ["learning", "learn", "study", "studying", "education", "professional development", "development"],
  budget: ["budget", "budgets", "funding", "sponsor", "sponsorship"],
  test: ["test", "tests", "exam", "exams", "quiz", "quizzes", "examination", "assessment"],
  "pass score": [
    "pass mark", "passing score", "pass score", "passing grade", "passing mark", "pass rate",
    "minimum score", "minimum grade", "required score", "cut off", "cutoff", "pass threshold",
    "passmark", "pass grade",
  ],
  score: ["score", "scores", "mark", "marks", "grade", "grades", "percent", "percentage", "points"],
  result: ["result", "results", "outcome", "outcomes"],
  retake: [
    "retake", "retakes", "retaking", "retry", "retries", "try again", "take again", "re take",
    "resit", "another attempt", "attempt", "attempts",
  ],
  mandatory: ["mandatory", "compulsory", "required", "obligatory", "must do"],
  deadline: ["deadline", "deadlines", "due date", "due", "overdue", "due by"],
  hour: ["office hours", "business hours", "opening hours", "working time", "work time", "work hours", "working hours", "hours", "hour"],
  overtime: [
    "overtime", "extra hours", "extra hour", "additional hours", "stay late", "staying late",
    "work late", "working late", "late hours", "longer hours", "after hours", "over time",
  ],
  probation: ["probation", "probationary", "trial period", "trial", "probation period", "probationary period"],
  "health insurance": [
    "health insurance", "medical insurance", "health cover", "health coverage", "health plan",
    "dms", "voluntary insurance", "vhi",
  ],
  trip: [
    "trip", "trips", "travel", "travelling", "traveling", "travelled", "traveled", "journey",
    "business trip", "work trip", "business travel", "work travel", "trip abroad", "business journey",
  ],
  expense: ["expense", "expenses", "reimbursement", "reimburse", "reimbursed", "receipt", "receipts", "claim", "claims"],
  "employment certificate": [
    "employment certificate", "certificate of employment", "employment letter",
    "employment verification", "work certificate", "certificate from work", "proof of employment",
    "employment confirmation", "employment proof", "employment reference", "reference letter",
  ],
  employment: ["employment", "employer", "employed"],
  document: ["document", "documents", "paperwork", "papers", "letter", "letters"],
  portal: ["portal", "app", "website", "site", "platform", "intranet", "digital hr"],
  profile: ["profile", "my page", "my account", "personal page"],
  count: ["how many", "number of"],
  amount: ["how much", "amount", "sum", "limit", "maximum", "max", "cap", "ceiling"],
  duration: ["how long"],
  year: ["annual", "annually", "yearly", "year", "years"],
  schedule: ["schedule", "timetable", "shift", "shifts"],
  start: ["start", "begin", "begins", "beginning", "commence"],
  "2": ["two"], "3": ["three"], "4": ["four"], "5": ["five"], "6": ["six"],
  "7": ["seven"], "8": ["eight"], "9": ["nine"], "10": ["ten"],
  "14": ["fourteen"], "20": ["twenty"], "30": ["thirty"], "50": ["fifty"], "70": ["seventy"],
};

/* ── Text normalisation ────────────────────────────────────────────────── */

/** Lowercase, apostrophes removed, non-alphanumerics -> single spaces. */
function simplePlain(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Like simplePlain but contraction-aware ("can't", "what's", "doctor's"). */
function plainText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\bcan't\b/g, "can not")
    .replace(/\bcannot\b/g, "can not")
    .replace(/\bwon't\b/g, "will not")
    .replace(/n't\b/g, " not")
    .replace(/\b(i|you|we|they|he|she|it|that|there|what|who|how|where|when|here|let)'(s|m|ll|d|ve|re)\b/g, "$1")
    .replace(/'s\b/g, "")
    .replace(/'/g, "")
    .replace(/(\d):(\d)/g, "$1$2")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Light stemmer: plurals, -ing, -ed, trailing e. Applied to both sides, so only consistency matters. */
export function stem(word: string): string {
  if (word.length <= 3 || /\d/.test(word)) return word;
  let s = word;
  if (s.endsWith("ies") && s.length > 4) {
    s = s.slice(0, -3) + "y";
  } else if (s.endsWith("sses")) {
    s = s.slice(0, -2);
  } else if (s.endsWith("ing") && s.length > 5) {
    s = undouble(s.slice(0, -3));
  } else if (s.endsWith("ed") && s.length > 4) {
    s = undouble(s.slice(0, -2));
  } else if (/(ch|sh|x|zz)es$/.test(s) && s.length > 4) {
    s = s.slice(0, -2);
  } else if (s.endsWith("s") && !/(ss|us|is)$/.test(s)) {
    s = s.slice(0, -1);
  }
  if (s.length > 3 && s.endsWith("e")) s = s.slice(0, -1);
  return s;
}

function undouble(s: string): string {
  return /([^aeioulsz])\1$/.test(s) ? s.slice(0, -1) : s;
}

const WORD_SYNONYMS = new Map<string, string>();
const PHRASES: { phrase: string; canon: string; re: RegExp }[] = [];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const [canon, forms] of Object.entries(GROUPS)) {
  for (const form of forms) {
    const n = plainText(form);
    if (n.includes(" ")) {
      PHRASES.push({ phrase: n, canon, re: new RegExp(`(?<= )${escapeRe(n)}(?= )`, "g") });
    } else {
      WORD_SYNONYMS.set(n, canon);
      WORD_SYNONYMS.set(stem(n), canon);
    }
  }
}
PHRASES.sort(
  (a, b) =>
    b.phrase.split(" ").length - a.phrase.split(" ").length ||
    b.phrase.length - a.phrase.length,
);

/** Normalised text with multi-word synonyms rewritten to canonical terms. */
export function normalize(text: string): string {
  let t = ` ${plainText(text)} `;
  for (const { re, canon } of PHRASES) t = t.replace(re, canon);
  return t.trim().replace(/\s+/g, " ");
}

/** Content terms of a text: normalised, stopwords removed, synonyms mapped, stemmed. */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const w of normalize(text).split(" ")) {
    if (!w || STOPWORDS.has(w)) continue;
    const term = WORD_SYNONYMS.get(w) ?? WORD_SYNONYMS.get(stem(w)) ?? stem(w);
    if (term.length < 2 || STOPWORDS.has(term)) continue;
    out.push(term);
  }
  return out;
}

/* ── Index ─────────────────────────────────────────────────────────────── */

interface EntryIndex {
  entry: KbEntry;
  tf: Map<string, number>; // field-weighted term frequency
  strong: Set<string>; // terms in questions / title / keywords
  length: number;
  phrases: Set<string>[]; // one term set per question + title
}

interface Index {
  signature: string;
  entries: EntryIndex[];
  df: Map<string, number>;
  strongDf: Map<string, number>; // number of entries where the term is in questions/title/keywords
  avgLength: number;
  idfUnknown: number;
}

const FIELD_WEIGHT = { question: 3, title: 3, keyword: 2, answer: 1 } as const;
const indexCache = new WeakMap<KbEntry[], Index>();

function signatureOf(kb: KbEntry[]): string {
  return kb
    .map((e) => `${e.id}:${e.title.length}:${e.questions.join("|").length}:${e.keywords.join("|").length}:${e.answer.length}`)
    .join(";");
}

function buildIndex(kb: KbEntry[]): Index {
  const signature = signatureOf(kb);
  const cached = indexCache.get(kb);
  if (cached && cached.signature === signature) return cached;

  const df = new Map<string, number>();
  const strongDf = new Map<string, number>();
  const entries: EntryIndex[] = kb.map((entry) => {
    const tf = new Map<string, number>();
    const strong = new Set<string>();
    const phrases: Set<string>[] = [];
    const add = (text: string, weight: number, isStrong: boolean) => {
      for (const term of tokenize(text)) {
        tf.set(term, (tf.get(term) ?? 0) + weight);
        if (isStrong) strong.add(term);
      }
    };
    for (const q of entry.questions) {
      add(q, FIELD_WEIGHT.question, true);
      phrases.push(new Set(tokenize(q)));
    }
    add(entry.title, FIELD_WEIGHT.title, true);
    phrases.push(new Set(tokenize(entry.title)));
    for (const k of entry.keywords) add(k, FIELD_WEIGHT.keyword, true);
    add(entry.answer, FIELD_WEIGHT.answer, false);
    let length = 0;
    for (const v of tf.values()) length += v;
    for (const term of tf.keys()) df.set(term, (df.get(term) ?? 0) + 1);
    for (const term of strong) strongDf.set(term, (strongDf.get(term) ?? 0) + 1);
    return { entry, tf, strong, length, phrases };
  });

  const N = Math.max(kb.length, 1);
  const avgLength = entries.reduce((s, e) => s + e.length, 0) / N || 1;
  const index: Index = {
    signature,
    entries,
    df,
    strongDf,
    avgLength,
    idfUnknown: Math.log(1 + (N + 0.5) / 0.5),
  };
  indexCache.set(kb, index);
  return index;
}

function idf(index: Index, term: string): number {
  const df = index.df.get(term) ?? 0;
  if (df === 0) return index.idfUnknown;
  const N = Math.max(index.entries.length, 1);
  return Math.log(1 + (N - df + 0.5) / (df + 0.5));
}

/* ── Scoring ───────────────────────────────────────────────────────────── */

export interface Candidate {
  entryId: string;
  score: number; // BM25
  coverage: number; // 0-1, weighted share of question terms matched
  dice: number; // 0-1, best similarity with a single question/title
  rank: number;
  matched: string[];
  unmatched: string[]; // includes terms unknown to the whole KB
}

function scoreEntries(terms: string[], index: Index): Candidate[] {
  const unique = [...new Set(terms)];
  const weights = new Map(unique.map((t) => [t, idf(index, t)]));
  const totalWeight = unique.reduce((s, t) => s + (weights.get(t) ?? 0), 0) || 1;

  const result: Candidate[] = index.entries.map((e) => {
    let bm25 = 0;
    let matchedWeight = 0;
    const matched: string[] = [];
    const unmatched: string[] = [];
    for (const t of unique) {
      const w = weights.get(t) ?? 0;
      const tf = e.tf.get(t) ?? 0;
      if (tf > 0) {
        const norm = BM25_K1 * (1 - BM25_B + (BM25_B * e.length) / index.avgLength);
        bm25 += (w * tf * (BM25_K1 + 1)) / (tf + norm);
        matchedWeight += w * (e.strong.has(t) ? 1 : BODY_ONLY_MATCH);
        matched.push(t);
      } else {
        unmatched.push(t);
      }
    }
    const coverage = matchedWeight / totalWeight;

    let dice = 0;
    for (const p of e.phrases) {
      if (p.size === 0) continue;
      let shared = 0;
      let pWeight = 0;
      for (const t of p) {
        const w = idf(index, t);
        pWeight += w;
        if (weights.has(t)) shared += w;
      }
      dice = Math.max(dice, (2 * shared) / (totalWeight + pWeight));
    }
    return {
      entryId: e.entry.id,
      score: bm25,
      coverage,
      dice,
      rank: 0.5 * coverage + 0.5 * dice,
      matched,
      unmatched,
    };
  });
  return result.sort((a, b) => b.rank - a.rank || b.score - a.score);
}

/* ── Smalltalk and guards ──────────────────────────────────────────────── */

const ADDRESSING = /(?<= )(al jana|al|jana|assistant|bot|there|team|everyone|all)(?= )/g;

type SmalltalkKind = "greeting" | "thanks" | "bye" | "identity" | "howareyou";

const THANKS_WORDS = new Set(
  ("thanks thank thx ty cheers much many very a lot so ok okay great perfect cool nice awesome got it understood alright " +
    "appreciate appreciated that helpful helps was is good super brilliant wonderful excellent you u").split(" "),
);

const BYE_WORDS = new Set(
  "bye goodbye good see you later soon cya ciao farewell take care have a nice day talk".split(" "),
);
const BYE_MARKERS = new Set(["bye", "goodbye", "cya", "ciao", "farewell", "later"]);

const GREETING_RE =
  /^(hi|hello|hey|hiya|howdy|greetings|yo|salam|hola|good (morning|afternoon|evening|day)|hi hi|hello hello)( (hi|hello|hey))*$/;
const HOW_ARE_YOU_RE =
  /^((hi|hello|hey|hiya|howdy|good (morning|afternoon|evening)) )?(how are you( doing| today)?|hows it going|how is it going|whats up|how do you do)$/;
const IDENTITY_RES: RegExp[] = [
  /^(who|what) (are|r) (you|u)( exactly)?$/,
  /^who is (al )?jana$/,
  /^what is (al )?jana$/,
  /^what is your name$/,
  /^whats your name$/,
  /^(what|how) (can|could) you (do|help)( me| with| for me)*$/,
  /^what (do|can) you do( for me)?$/,
  /^what are you (able to do|capable of|for)$/,
  /^what can i ask( you)?$/,
  /^what (kind of |sort of )?(questions|things) can i ask( you)?$/,
  /^help( me)?$/,
  /^are you (a )?(bot|robot|human|real|ai|person|chatbot|assistant)( or (a )?(human|bot|robot|person))?$/,
  /^(introduce yourself|tell me about yourself|what is this)$/,
];

function classifySmalltalk(raw: string): SmalltalkKind | null {
  const plain = simplePlain(raw);
  if (!plain) return null;
  const stripped = ` ${plain} `.replace(ADDRESSING, " ").replace(ADDRESSING, " ").trim().replace(/\s+/g, " ");
  for (const candidate of [plain, stripped]) {
    if (!candidate) continue;
    if (IDENTITY_RES.some((re) => re.test(candidate))) return "identity";
    if (HOW_ARE_YOU_RE.test(candidate)) return "howareyou";
    if (GREETING_RE.test(candidate)) return "greeting";
  }
  const words = stripped.split(" ").filter(Boolean);
  if (words.length > 0 && words.length <= 8) {
    if (words.every((w) => BYE_WORDS.has(w)) && words.some((w) => BYE_MARKERS.has(w))) return "bye";
    if (words.every((w) => THANKS_WORDS.has(w))) return "thanks";
  }
  return null;
}

const INJECTION_RES: RegExp[] = [
  /\b(ignore|disregard|forget|override|bypass)\b.*\b(instructions?|rules?|prompt|guidelines?|above|previous|system|restrictions?|everything)\b/,
  /\b(system prompt|developer mode|jailbreak|dan mode|you are now|pretend (to be|you are)|act as (a|an|if|my)|roleplay|role play)\b/,
  /\b(reveal|show|print|repeat|leak) (me )?(your|the) (prompt|instructions?|rules|system)\b/,
  /\bnew (instructions?|rules)\b/,
];

function looksLikeInjection(raw: string): boolean {
  const plain = simplePlain(raw);
  return INJECTION_RES.some((re) => re.test(plain));
}

/* ── Suggestions and messages ──────────────────────────────────────────── */

const PREFERRED_STARTERS = [
  "annual-leave-entitlement",
  "how-to-request-vacation",
  "salary-advance-how",
  "sick-leave-what-to-do",
  "remote-work",
  "academy-pass-mark",
];

export function starterQuestions(kb: KbEntry[], max = 4): string[] {
  const byId = new Map(kb.map((e) => [e.id, e]));
  const picked: KbEntry[] = [];
  for (const id of PREFERRED_STARTERS) {
    const e = byId.get(id);
    if (e && picked.length < max) picked.push(e);
  }
  for (const e of kb) {
    if (picked.length >= max) break;
    if (!picked.includes(e)) picked.push(e);
  }
  return picked.filter((e) => e.questions.length > 0).map((e) => e.questions[0]);
}

const MESSAGES = {
  greeting:
    "Hello! I'm Al Jana, the HR assistant of Jana Group. I answer common HR questions using only the official HR knowledge base, and I always show where an answer comes from. What would you like to know?",
  howareyou:
    "I'm doing well, thank you! I'm Al Jana, the HR assistant. Ask me an HR question and I'll look it up in the HR knowledge base.",
  thanks: "You're welcome! If anything else comes up, just ask.",
  bye: "Goodbye! You can come back any time with an HR question.",
  identity:
    "I'm Al Jana, the Digital HR assistant of Jana Group. I answer common HR questions only from the HR knowledge base and always show the source. If I can't find a reliable answer, I'll say so and offer to pass your question on to the HR team.",
  noAnswer:
    "I couldn't find a reliable answer to that in the HR knowledge base, so I won't guess. I can pass your question on to the HR team.",
  empty:
    "I didn't catch a question. Try one of the examples below. If I can't answer, I can pass your question on to the HR team.",
  injection:
    "I can only answer from the HR knowledge base, and I can't change that. I couldn't find a reliable answer to this, so I won't guess. I can pass your question on to the HR team.",
};

/* ── Public API ────────────────────────────────────────────────────────── */

export interface Explanation {
  tokens: string[];
  candidates: Candidate[];
  decision: "answer" | "no_answer" | "smalltalk" | "injection" | "empty";
  reason: string;
  entryId?: string;
}

/** Full decision trace (used by tests and debugging; `ask` is built on it). */
export function explain(question: string, kb: KbEntry[] = KB): Explanation {
  const raw = typeof question === "string" ? question.slice(0, MAX_QUESTION_CHARS) : "";
  if (!/[a-z0-9]{2}/i.test(raw)) {
    return { tokens: [], candidates: [], decision: "empty", reason: "no usable text" };
  }
  if (classifySmalltalk(raw)) {
    return { tokens: [], candidates: [], decision: "smalltalk", reason: "greeting/thanks/identity" };
  }
  if (looksLikeInjection(raw)) {
    return { tokens: [], candidates: [], decision: "injection", reason: "prompt-injection pattern" };
  }
  const tokens = tokenize(raw);
  if (tokens.length === 0 || kb.length === 0) {
    return { tokens, candidates: [], decision: "no_answer", reason: "no content terms" };
  }
  const index = buildIndex(kb);
  const candidates = scoreEntries(tokens, index);
  const best = candidates[0];
  const bestEntry = kb.find((e) => e.id === best.entryId);
  const fail = (reason: string): Explanation => ({ tokens, candidates, decision: "no_answer", reason });

  if (best.coverage < MIN_COVERAGE) return fail(`coverage ${best.coverage.toFixed(2)} < ${MIN_COVERAGE}`);
  if (best.score < MIN_SCORE) return fail(`score ${best.score.toFixed(2)} < ${MIN_SCORE}`);
  const bestIndex = index.entries.find((e) => e.entry.id === best.entryId);
  const known = [...new Set(tokens)].filter((t) => index.df.has(t));
  const topic = known.sort((a, b) => idf(index, b) - idf(index, a))[0];
  if (topic && !bestIndex?.tf.has(topic)) return fail(`topic term "${topic}" missing from ${best.entryId}`);
  const missingMain = known.find(
    (t) => (index.strongDf.get(t) ?? 0) >= MAIN_TOPIC_MIN_ENTRIES && !bestIndex?.strong.has(t),
  );
  if (missingMain && best.coverage < MAIN_TOPIC_COVERAGE) {
    return fail(`main topic "${missingMain}" missing from ${best.entryId} and coverage ${best.coverage.toFixed(2)} < ${MAIN_TOPIC_COVERAGE}`);
  }
  const uniqueTerms = [...new Set(tokens)];
  if (uniqueTerms.length === 1 && (index.strongDf.get(uniqueTerms[0]) ?? 0) > SINGLE_TERM_MAX_ENTRIES) {
    const typedWords = simplePlain(raw).split(" ").length;
    if (typedWords < 3 || best.dice < 0.99) return fail(`single generic term "${uniqueTerms[0]}"`);
  }
  const second = candidates[1];
  if (
    second &&
    second.coverage >= MIN_COVERAGE &&
    second.rank >= best.rank * AMBIGUITY_RATIO &&
    !bestEntry?.related?.includes(second.entryId)
  ) {
    return fail(`ambiguous: ${best.entryId} vs ${second.entryId}`);
  }
  return { tokens, candidates, decision: "answer", reason: "passed all gates", entryId: best.entryId };
}

export function ask(question: string, kb: KbEntry[] = KB): AssistantReply {
  const q = typeof question === "string" ? question.trim() : "";
  const exp = explain(q, kb);

  if (exp.decision === "smalltalk") {
    const kind = classifySmalltalk(q) ?? "greeting";
    return { kind: "smalltalk", question: q, message: MESSAGES[kind], suggestions: starterQuestions(kb) };
  }
  if (exp.decision === "answer" && exp.entryId) {
    const entry = kb.find((e) => e.id === exp.entryId);
    const best = exp.candidates[0];
    if (entry) {
      const related: { entryId: string; question: string }[] = [];
      for (const id of entry.related ?? []) {
        const rel = kb.find((e) => e.id === id);
        if (rel && rel.id !== entry.id && rel.questions.length > 0 && related.length < 3) {
          related.push({ entryId: rel.id, question: rel.questions[0] });
        }
      }
      const confidence = Math.min(0.99, Math.round((0.5 * best.coverage + 0.5 * best.dice) * 100) / 100);
      return {
        kind: "answer",
        question: q,
        entryId: entry.id,
        title: entry.title,
        answer: entry.answer,
        source: entry.source,
        ...(entry.action ? { action: entry.action } : {}),
        related,
        confidence,
      };
    }
  }
  const message =
    exp.decision === "empty" ? MESSAGES.empty : exp.decision === "injection" ? MESSAGES.injection : MESSAGES.noAnswer;
  return { kind: "no_answer", question: q, message, suggestions: starterQuestions(kb), canEscalate: true };
}
