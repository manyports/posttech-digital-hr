import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { KB } from "../lib/assistant/knowledge-base";
import type { KbEntry } from "../lib/domain/types";
import { actor, fresh, rejectsWith } from "./helpers";
import { ask as askAlJana } from "../lib/server/services/assistant";
import { getDb, type Db } from "../lib/server/db";
import { MemoryDb } from "../lib/server/db/memory";
import {
  getPublishedKnowledgeBase,
  listKnowledgeArticles,
  publishKnowledgeArticle,
  restoreKnowledgeVersion,
  saveKnowledgeDraft,
} from "../lib/server/services/knowledge-base";

function updateAnswers(entry: KbEntry, ru: string, kk: string): KbEntry {
  const translations = entry.translations!;
  return {
    ...entry,
    answer: ru,
    answerRu: ru,
    translations: {
      ...translations,
      ru: { ...translations.ru, answer: ru },
      kk: { ...translations.kk, answer: kk },
    },
  };
}

describe("HR knowledge base editor", () => {
  beforeEach(fresh);

  it("upgrades a cached pre-editor database without losing the running demo data", async () => {
    const current = await getDb();
    const cached = globalThis as unknown as { __hrDb?: Promise<Db> };
    const original = cached.__hrDb;
    const legacy = new MemoryDb();
    await legacy.employees.insertMany(await current.employees.find());
    delete (legacy as Partial<Db>).knowledgeArticles;
    cached.__hrDb = Promise.resolve(legacy);
    try {
      const repaired = await getDb();
      assert.equal(repaired, legacy);
      assert.ok(repaired.knowledgeArticles);
      const articles = await listKnowledgeArticles(await actor("emp-hr1"));
      assert.equal(articles.length, KB.length);
    } finally {
      cached.__hrDb = original;
    }
  });

  it("loads the JSON knowledge base when MongoDB cannot connect", async () => {
    const hr = await actor("emp-hr1");
    const cached = globalThis as unknown as { __hrDb?: Promise<Db> };
    const original = cached.__hrDb;
    const originalUri = process.env.MONGODB_URI;
    cached.__hrDb = undefined;
    process.env.MONGODB_URI = "invalid://";
    try {
      const db = await getDb();
      assert.equal(db.kind, "memory");
      const articles = await listKnowledgeArticles(hr);
      assert.equal(articles.length, KB.length);
    } finally {
      cached.__hrDb = original;
      if (originalUri === undefined) delete process.env.MONGODB_URI;
      else process.env.MONGODB_URI = originalUri;
    }
  });

  it("imports the embedded articles into persistent database storage once", async () => {
    const entries = await getPublishedKnowledgeBase();
    assert.equal(entries.length, KB.length);
    assert.ok(entries.some((entry) => entry.id === "annual-leave-entitlement"));
    const visibleInEditor = await listKnowledgeArticles(await actor("emp-hr1"));
    assert.equal(visibleInEditor.length, KB.length);
    assert.equal(visibleInEditor.find((article) => article.id === KB[0].id)?.published?.entry.title, KB[0].title);
    const storedEntry = (await getPublishedKnowledgeBase()).find((entry) => entry.id === KB[0].id)!;
    assert.ok(storedEntry.translations?.ru.title);
    assert.ok(storedEntry.translations?.ru.answer);
    assert.ok(storedEntry.translations?.kk.title);
    assert.ok(storedEntry.translations?.kk.answer);
    const saved = JSON.parse(await readFile(process.env.JANA_KB_STORE_PATH!, "utf8")) as unknown[];
    assert.equal(saved.length, KB.length);
  });

  it("does not rescan article history to import starter content on every read", async () => {
    await getPublishedKnowledgeBase();
    const db = await getDb();
    const originalFind = db.knowledgeArticles.find.bind(db.knowledgeArticles);
    let reads = 0;
    db.knowledgeArticles.find = async (...args) => {
      reads++;
      return originalFind(...args);
    };
    try {
      await getPublishedKnowledgeBase();
      await getPublishedKnowledgeBase();
      assert.equal(reads, 2);
    } finally {
      db.knowledgeArticles.find = originalFind;
    }
  });

  it("keeps draft edits hidden from Al Jana until publication", async () => {
    const hr = await actor("emp-hr1");
    const article = (await listKnowledgeArticles(hr)).find((item) => item.id === KB[0].id)!;
    const edited = updateAnswers(article.published!.entry, "Обновлённый ответ по политике.", "Саясат бойынша жаңартылған жауап.");
    await saveKnowledgeDraft(hr, article.id, edited);
    assert.equal((await getPublishedKnowledgeBase()).find((item) => item.id === article.id)?.answer, article.published!.entry.answer);
    const pending = (await listKnowledgeArticles(hr)).find((item) => item.id === article.id)!;
    assert.equal(pending.draft?.answer, edited.answer);
    assert.equal(pending.owner.name, hr.fullName);
    const employee = await actor("emp-e1");
    const beforePublish = await askAlJana(employee, "How many vacation days do I get?");
    assert.equal(beforePublish.kind, "answer");
    if (beforePublish.kind === "answer") assert.equal(beforePublish.answer, article.published!.entry.translations!.ru.answer);
    await publishKnowledgeArticle(hr, article.id);
    const afterPublish = await askAlJana(employee, "How many vacation days do I get?");
    assert.equal(afterPublish.kind, "answer");
    if (afterPublish.kind === "answer") assert.equal(afterPublish.answer, edited.translations!.ru.answer);
    const kazakh = await askAlJana(employee, "How many vacation days do I get?", "kk");
    assert.equal(kazakh.kind, "answer");
    if (kazakh.kind === "answer") assert.equal(kazakh.answer, edited.translations!.kk.answer);
  });

  it("publishes a draft as a new version and supports restoring an old version to draft", async () => {
    const hr = await actor("emp-hr1");
    const article = (await listKnowledgeArticles(hr)).find((item) => item.id === KB[0].id)!;
    const original = article.published!.entry;
    const firstVersion = article.history.find((item) => item.version === 1)!.entry;
    const initialHistoryLength = article.history.length;
    const initialVersion = article.published!.version;
    await saveKnowledgeDraft(hr, article.id, updateAnswers(original, "Ответ второй версии.", "Екінші нұсқаның жауабы."));
    await publishKnowledgeArticle(hr, article.id);
    assert.equal((await getPublishedKnowledgeBase()).find((item) => item.id === article.id)?.answer, "Ответ второй версии.");
    let updated = (await listKnowledgeArticles(hr)).find((item) => item.id === article.id)!;
    assert.equal(updated.history.length, initialHistoryLength + 1);
    await restoreKnowledgeVersion(hr, article.id, 1);
    updated = (await listKnowledgeArticles(hr)).find((item) => item.id === article.id)!;
    assert.equal(updated.draft?.answer, firstVersion.answer);
    assert.equal(updated.published?.version, initialVersion + 1);
  });

  it("rejects invalid drafts and non-HR access", async () => {
    const employee = await actor("emp-e1");
    await rejectsWith(listKnowledgeArticles(employee), 403);
    const hr = await actor("emp-hr1");
    const article = (await listKnowledgeArticles(hr))[0];
    await rejectsWith(saveKnowledgeDraft(hr, article.id, { ...article.published!.entry, answer: " " }), 400);
  });

  it("uses the authenticated editor as source owner instead of client-provided names", async () => {
    const hr = await actor("emp-hr1");
    const article = (await listKnowledgeArticles(hr))[0];
    const forged = structuredClone(article.published!.entry);
    forged.source.owner = "Forged owner";
    forged.translations!.ru.source.owner = "Forged owner";
    forged.translations!.kk.source.owner = "Forged owner";
    const saved = await saveKnowledgeDraft(hr, article.id, forged);
    assert.equal(saved.draft?.source.owner, hr.fullName);
    assert.equal(saved.draft?.translations?.ru.source.owner, hr.fullName);
    assert.equal(saved.draft?.translations?.kk.source.owner, hr.fullName);
  });
});
