import type { KbEntry, KnowledgeArticleDoc } from "../../domain/types";
import { KB as INITIAL_KB } from "../../assistant/knowledge-base";
import { KB_ANSWERS_RU } from "../../assistant/translations";
import { withKnowledgeTranslations } from "../../assistant/reference-translations";
import { getDb, type Db } from "../db";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import { isHr, type Actor } from "../policy";

export interface KnowledgeArticleView {
  id: string;
  owner: { id: string; name: string };
  draft: KbEntry | null;
  published: { version: number; entry: KbEntry; publishedAt: string; editorName: string } | null;
  history: { version: number; entry: KbEntry; publishedAt: string; editorName: string }[];
  updatedAt: string;
}

function assertHr(actor: Actor) {
  if (!isHr(actor)) throw forbidden("Only HR can manage knowledge-base articles.");
}

function validateEntry(value: unknown): KbEntry {
  if (!value || typeof value !== "object") throw badRequest("Complete the article before saving.");
  const entry = value as Partial<KbEntry>;
  const errors: Record<string, string> = {};
  if (typeof entry.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) errors.id = "Use lowercase English letters, numbers and hyphens.";
  if (typeof entry.title !== "string" || !entry.title.trim() || entry.title.length > 120) errors.title = "Add a title (up to 120 characters).";
  if (typeof entry.answer !== "string" || entry.answer.trim().length < 3 || entry.answer.length > 6000) errors.answer = "Add an answer (3–6000 characters).";
  const translations = entry.translations;
  for (const locale of ["ru", "kk"] as const) {
    const copy = translations?.[locale];
    if (!copy || typeof copy.title !== "string" || !copy.title.trim() || copy.title.length > 120) errors[`title_${locale}`] = `Add the ${locale.toUpperCase()} article title.`;
    if (!copy || typeof copy.answer !== "string" || copy.answer.trim().length < 3 || copy.answer.length > 6000) errors[`answer_${locale}`] = `Add the ${locale.toUpperCase()} answer.`;
    if (!copy || !Array.isArray(copy.questions) || !copy.questions.length || copy.questions.some((item) => typeof item !== "string" || !item.trim())) errors[`questions_${locale}`] = `Add at least one ${locale.toUpperCase()} example question.`;
    if (!copy || !Array.isArray(copy.keywords) || !copy.keywords.length || copy.keywords.some((item) => typeof item !== "string" || !item.trim())) errors[`keywords_${locale}`] = `Add at least one ${locale.toUpperCase()} keyword.`;
    if (!copy?.source || [copy.source.docTitle, copy.source.section, copy.source.owner].some((part) => typeof part !== "string" || !part.trim())) errors[`source_${locale}`] = `Complete the ${locale.toUpperCase()} source details.`;
  }
  if (!Array.isArray(entry.questions) || entry.questions.some((item) => typeof item !== "string")) errors.questions = "Check the example questions.";
  if (!Array.isArray(entry.keywords) || entry.keywords.some((item) => typeof item !== "string")) errors.keywords = "Check the keywords.";
  const source = entry.source;
  if (!source || [source.docId, source.docTitle, source.section, source.revision, source.owner].some((part) => typeof part !== "string" || !part.trim())) errors.source = "Complete all source details.";
  if (entry.action && (typeof entry.action.label !== "string" || typeof entry.action.href !== "string" || !/^\/(profile|requests|academy|notifications|assistant)$/.test(entry.action.href))) errors.action = "Choose a valid portal link.";
  if (errors.id || errors.title || errors.answer || errors.questions || errors.keywords || errors.source || errors.action || Object.keys(errors).some((key) => key.startsWith("title_") || key.startsWith("answer_") || key.startsWith("questions_") || key.startsWith("keywords_") || key.startsWith("source_"))) {
    throw badRequest("Check the highlighted article details.", errors);
  }
  const valid = structuredClone(entry as KbEntry);
  const russian = valid.translations!.ru;
  valid.title = russian.title;
  valid.answer = russian.answer;
  valid.answerRu = russian.answer;
  valid.questions = [...new Set([...valid.questions, ...russian.questions, ...valid.translations!.kk.questions].map((item) => item.trim()).filter(Boolean))];
  valid.keywords = [...new Set([...valid.keywords, ...russian.keywords, ...valid.translations!.kk.keywords].map((item) => item.trim()).filter(Boolean))];
  valid.source = { ...valid.source, ...russian.source };
  return valid;
}

/** Import the shipped starter content once; later starts never overwrite HR edits. */
const imports = new WeakMap<Db, Promise<void>>();

async function ensureImported() {
  const db = await getDb();
  let pending = imports.get(db);
  if (!pending) {
    pending = importStarterArticles(db).catch((error) => {
      imports.delete(db);
      throw error;
    });
    imports.set(db, pending);
  }
  await pending;
}

async function importStarterArticles(db: Db) {
  const articles = await db.knowledgeArticles.find();
  const existing = new Set(articles.map((article) => article._id));
  const initialById = new Map(INITIAL_KB.map((entry) => [entry.id, entry]));
  for (const article of articles) {
    const initial = initialById.get(article._id);
    if (!initial) continue;
    let changed = false;
    const upgrade = (entry: KbEntry | null) => {
      if (!entry) return entry;
      if (entry.translations?.ru.questions?.length && entry.translations?.kk.questions?.length && entry.translations?.ru.keywords?.length && entry.translations?.kk.keywords?.length) return entry;
      // Only auto-backfill unchanged shipped copy. HR-authored legacy edits are
      // left intact and can be given both versions in the editor.
      const isShipped = entry.title === initial.title && entry.answer === initial.answer;
      changed = true;
      return withKnowledgeTranslations({ ...entry, answerRu: entry.answerRu ?? (isShipped ? KB_ANSWERS_RU[entry.id] : undefined) }, isShipped);
    };
    const draft = upgrade(article.draft);
    const versions = article.versions.map((version) => ({ ...version, entry: upgrade(version.entry)! }));
    if (changed) {
      await db.knowledgeArticles.updateOne({ _id: article._id }, { $set: { draft, versions } });
    }
  }
  if (INITIAL_KB.every((entry) => existing.has(entry.id))) return;
  const hr = (await db.employees.find({ role: "hr", active: true }, { limit: 1 }))[0];
  const now = new Date().toISOString();
  for (const entry of INITIAL_KB) {
    if (existing.has(entry.id)) continue;
    const doc: KnowledgeArticleDoc = {
      _id: entry.id,
      ownerId: hr?._id ?? "system",
      ownerName: hr?.fullName ?? "HR",
      currentVersion: 1,
      draft: null,
      versions: [{ version: 1, entry: withKnowledgeTranslations({ ...entry, answerRu: KB_ANSWERS_RU[entry.id] }), editorId: hr?._id ?? "system", editorName: hr?.fullName ?? "HR", savedAt: now, publishedAt: now }],
      updatedAt: now,
    };
    try { await db.knowledgeArticles.insertOne(doc); }
    catch (error) {
      if (!(error instanceof Error) || !/E11000|Duplicate _id/.test(error.message)) throw error;
    }
  }
}

const viewOf = (doc: KnowledgeArticleDoc): KnowledgeArticleView => {
  const history = doc.versions.map((version) => ({
    version: version.version,
    entry: version.entry,
    publishedAt: version.publishedAt,
    editorName: version.editorName,
  }));
  const published = history.find((version) => version.version === doc.currentVersion) ?? null;
  return { id: doc._id, owner: { id: doc.ownerId, name: doc.ownerName }, draft: doc.draft, published, history, updatedAt: doc.updatedAt };
};

export async function getPublishedKnowledgeBase(): Promise<KbEntry[]> {
  await ensureImported();
  const db = await getDb();
  const docs = await db.knowledgeArticles.find({});
  return docs.flatMap((doc) => doc.versions.find((version) => version.version === doc.currentVersion)?.entry ?? []);
}

export async function listKnowledgeArticles(actor: Actor): Promise<KnowledgeArticleView[]> {
  assertHr(actor);
  await ensureImported();
  const db = await getDb();
  return (await db.knowledgeArticles.find({}, { sort: { _id: 1 } })).map(viewOf);
}

export async function saveKnowledgeDraft(actor: Actor, id: string, value: unknown) {
  assertHr(actor);
  const entry = validateEntry(value);
  if (entry.id !== id) throw badRequest("The article ID cannot be changed.", { id: "ID does not match." });
  await ensureImported();
  const db = await getDb();
  const current = await db.knowledgeArticles.findOne({ _id: id });
  if (!current) throw notFound("Article not found.");
  const now = new Date().toISOString();
  await db.knowledgeArticles.updateOne({ _id: id }, { $set: { draft: entry, ownerId: actor.id, ownerName: actor.fullName, updatedAt: now } });
  return viewOf((await db.knowledgeArticles.findOne({ _id: id }))!);
}

export async function createKnowledgeDraft(actor: Actor, value: unknown) {
  assertHr(actor);
  const entry = validateEntry(value);
  await ensureImported();
  const db = await getDb();
  if (await db.knowledgeArticles.findOne({ _id: entry.id })) throw conflict("An article with this ID already exists.");
  const now = new Date().toISOString();
  const doc: KnowledgeArticleDoc = { _id: entry.id, ownerId: actor.id, ownerName: actor.fullName, currentVersion: 0, draft: entry, versions: [], updatedAt: now };
  try { await db.knowledgeArticles.insertOne(doc); }
  catch (error) { if (error instanceof Error && /E11000|Duplicate _id/.test(error.message)) throw conflict("An article with this ID already exists."); throw error; }
  return viewOf(doc);
}

export async function publishKnowledgeArticle(actor: Actor, id: string) {
  assertHr(actor);
  await ensureImported();
  const db = await getDb();
  const doc = await db.knowledgeArticles.findOne({ _id: id });
  if (!doc) throw notFound("Article not found.");
  if (!doc.draft) throw badRequest("Save a draft before publishing.");
  const now = new Date().toISOString();
  const version = doc.currentVersion + 1;
  const won = await db.knowledgeArticles.updateOne({ _id: id, currentVersion: doc.currentVersion }, {
    $set: { currentVersion: version, draft: null, ownerId: actor.id, ownerName: actor.fullName, updatedAt: now },
    $push: { versions: { version, entry: doc.draft, editorId: actor.id, editorName: actor.fullName, savedAt: now, publishedAt: now } },
  });
  if (!won) throw conflict("This article changed while you were publishing. Reload and try again.");
  return viewOf((await db.knowledgeArticles.findOne({ _id: id }))!);
}

export async function restoreKnowledgeVersion(actor: Actor, id: string, version: number) {
  assertHr(actor);
  await ensureImported();
  const db = await getDb();
  const doc = await db.knowledgeArticles.findOne({ _id: id });
  if (!doc) throw notFound("Article not found.");
  const previous = doc.versions.find((item) => item.version === version);
  if (!previous) throw notFound("Version not found.");
  await db.knowledgeArticles.updateOne({ _id: id }, { $set: { draft: previous.entry, ownerId: actor.id, ownerName: actor.fullName, updatedAt: new Date().toISOString() } });
  return viewOf((await db.knowledgeArticles.findOne({ _id: id }))!);
}
