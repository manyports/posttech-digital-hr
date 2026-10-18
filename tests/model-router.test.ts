import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { KB } from "../lib/assistant/knowledge-base";
import { routeEntryId, setModelFetch } from "../lib/assistant/model-router";
import { ask } from "../lib/server/services/assistant";
import { getRequest } from "../lib/server/services/requests";
import { actor, fresh } from "./helpers";

const ENV = {
  ASSISTANT_MODEL_BASE_URL: "https://example.test/v1",
  ASSISTANT_MODEL_KEY: "test-key",
  ASSISTANT_MODEL_NAME: "test-model",
};

function jsonResponse(entryId: string | null): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: JSON.stringify({ entryId }) } }] }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

afterEach(() => {
  setModelFetch(null);
  delete process.env.ASSISTANT_MODEL_BASE_URL;
  delete process.env.ASSISTANT_MODEL_KEY;
  delete process.env.ASSISTANT_MODEL_NAME;
});

describe("model router", () => {
  it("stays off when env is missing", async () => {
    assert.deepEqual(await routeEntryId("How many vacation days do I get?", {}), { status: "off" });
  });

  it("returns a known article id and nothing else", async () => {
    setModelFetch(async () => jsonResponse("annual-leave-entitlement"));
    const routed = await routeEntryId("демалыс", ENV);
    assert.deepEqual(routed, { status: "picked", entryId: "annual-leave-entitlement" });
  });

  it("treats null as no article", async () => {
    setModelFetch(async () => jsonResponse(null));
    assert.deepEqual(await routeEntryId("Do we have stock options?", ENV), { status: "none" });
  });

  it("falls back when the id is not in the knowledge base", async () => {
    setModelFetch(async () => jsonResponse("not-a-real-article"));
    assert.deepEqual(await routeEntryId("vacation", ENV), { status: "failed" });
  });
});

describe("model router through the assistant", () => {
  it("shows the knowledge-base paragraph for the picked id", async () => {
    await fresh();
    process.env.ASSISTANT_MODEL_BASE_URL = ENV.ASSISTANT_MODEL_BASE_URL;
    process.env.ASSISTANT_MODEL_KEY = ENV.ASSISTANT_MODEL_KEY;
    process.env.ASSISTANT_MODEL_NAME = ENV.ASSISTANT_MODEL_NAME;
    setModelFetch(async () => jsonResponse("annual-leave-entitlement"));
    const reply = await ask(await actor("emp-e1"), "tell me about leave", "ru");
    assert.equal(reply.kind, "answer");
    if (reply.kind !== "answer") return;
    const entry = KB.find((item) => item.id === "annual-leave-entitlement");
    assert.match(reply.answer, /20 оплачиваемых рабочих дней/);
    assert.equal(reply.source.docId, entry?.source.docId);
  });

  it("saves a vacation draft from a dated sentence and links it", async () => {
    await fresh();
    const reply = await ask(await actor("emp-e1"), "Хочу отпуск с 12 по 16 ноября");
    assert.equal(reply.kind, "answer");
    if (reply.kind !== "answer" || !reply.action) return;
    assert.equal(reply.action.label, "draft");
    const id = reply.action.href.split("/").pop() ?? "";
    assert.equal(reply.action.href, `/requests/${id}`);
    const saved = await getRequest(await actor("emp-e1"), id);
    assert.equal(saved.status, "draft");
    assert.equal(saved.payload.kind, "vacation");
    assert.ok(saved.allowedActions.includes("submit"), "the request page must let the employee submit the draft");
  });

  it("shows the caller's own available days beside the balance article", async () => {
    await fresh();
    const reply = await ask(await actor("emp-e1"), "How many vacation days do I have left?");
    assert.equal(reply.kind, "answer");
    if (reply.kind !== "answer") return;
    assert.equal(reply.entryId, "vacation-balance-personal");
    assert.equal(reply.personalBalance?.available, 15);
  });

  it("answers a Kazakh starter from the same article", async () => {
    await fresh();
    const reply = await ask(await actor("emp-e1"), "Жылына неше күн демалыс беріледі?");
    assert.equal(reply.kind, "answer");
    if (reply.kind !== "answer") return;
    assert.equal(reply.entryId, "annual-leave-entitlement");
    assert.match(reply.answer, /20/);
  });

  it("does not answer when the model returns null", async () => {
    await fresh();
    process.env.ASSISTANT_MODEL_BASE_URL = ENV.ASSISTANT_MODEL_BASE_URL;
    process.env.ASSISTANT_MODEL_KEY = ENV.ASSISTANT_MODEL_KEY;
    process.env.ASSISTANT_MODEL_NAME = ENV.ASSISTANT_MODEL_NAME;
    setModelFetch(async () => jsonResponse(null));
    const reply = await ask(await actor("emp-e1"), "How many vacation days do I get?", "kk");
    assert.equal(reply.kind, "no_answer");
  });
});
