import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { completeGeneratedSource, type GeneratedKnowledgeDraft } from "../lib/assistant/knowledge-draft";
import { MemoryDb } from "../lib/server/db/memory";
import { consumeAiQuota } from "../lib/server/services/ai-rate-limit";

const draft: GeneratedKnowledgeDraft = {
  ru: { title: "Адаптация", questions: ["Когда встреча?"], keywords: ["адаптация"], answer: "Встреча в течение недели.", source: { docTitle: "", section: "" } },
  kk: { title: "Бейімдеу", questions: ["Кездесу қашан?"], keywords: ["бейімдеу"], answer: "Кездесу бір апта ішінде өтеді.", source: { docTitle: "", section: "" } },
  docId: "",
  revision: "",
};

describe("AI knowledge draft", () => {
  it("labels missing provenance as an internal HR article and sets the editor", () => {
    const source = completeGeneratedSource(draft, "onboarding", "Aigerim HR", "2026-10-18");
    assert.equal(source.docId, "KB-ONBOARDING");
    assert.equal(source.revision, "rev. 2026-10-18");
    assert.equal(source.ru.docTitle, "Материал HR: Адаптация");
    assert.equal(source.kk.docTitle, "HR материалы: Бейімдеу");
    assert.equal(source.ru.owner, "Aigerim HR");
    assert.equal(source.kk.owner, "Aigerim HR");
  });

  it("keeps a document title and section extracted from the supplied text", () => {
    const source = completeGeneratedSource({ ...draft, docId: "HR-07", revision: "rev. 2026-10", ru: { ...draft.ru, source: { docTitle: "Порядок адаптации", section: "§3 Встреча" } } }, "onboarding", "Editor", "2026-10-18");
    assert.equal(source.docId, "HR-07");
    assert.equal(source.ru.docTitle, "Порядок адаптации");
    assert.equal(source.ru.section, "§3 Встреча");
  });
});

describe("AI request limits", () => {
  it("allows three requests per editor per minute, including concurrent requests", async () => {
    const db = new MemoryDb();
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => consumeAiQuota("hr-1", 0, db)));
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 3);
    assert.equal(results.filter((result) => result.status === "rejected" && result.reason?.status === 429).length, 2);
    await consumeAiQuota("hr-1", 60_000, db);
  });

  it("enforces the shared project cap across editors", async () => {
    const db = new MemoryDb();
    for (let i = 0; i < 10; i++) await consumeAiQuota(`hr-${i}`, 0, db);
    await assert.rejects(consumeAiQuota("hr-10", 0, db), { status: 429 });
  });

  it("enforces a daily editor cap even when minute windows reset", async () => {
    const db = new MemoryDb();
    for (let i = 0; i < 20; i++) await consumeAiQuota("hr-1", i * 60_000, db);
    await assert.rejects(consumeAiQuota("hr-1", 20 * 60_000, db), { status: 429 });
  });
});
