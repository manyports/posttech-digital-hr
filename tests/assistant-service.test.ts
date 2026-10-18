import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { ask, escalate, listEscalations, replyToEscalation, unansweredQuestions } from "../lib/server/services/assistant";
import { listNotifications } from "../lib/server/services/notifications";
import { actor, fresh, rejectsWith } from "./helpers";

beforeEach(fresh);

describe("Al Jana service (scenarios 5 and 6)", () => {
  it("scenario 5: a real HR question gets a sourced, verbatim KB answer", async () => {
    const r = await ask(await actor("emp-e1"), "How many vacation days do I get?");
    assert.equal(r.kind, "answer");
    if (r.kind !== "answer") return;
    assert.match(r.answer, /20 оплачиваемых рабочих дней/);
    assert.ok(r.source.docId && r.source.docTitle && r.source.section && r.source.revision);
  });

  it("scenario 6: an out-of-KB question gets an honest no-answer with escalation offer", async () => {
    const r = await ask(await actor("emp-e1"), "What is the maternity leave policy in Germany?");
    assert.equal(r.kind, "no_answer");
    if (r.kind !== "no_answer") return;
    assert.equal(r.canEscalate, true);
    assert.match(r.message, /couldn't find|won't guess|no reliable/i);
    assert.ok(!("answer" in r), "no answer text is ever fabricated");
  });

  it("validates input", async () => {
    const e = await actor("emp-e1");
    await rejectsWith(ask(e, ""), 400, "empty");
    await rejectsWith(ask(e, "   "), 400, "blank");
    await rejectsWith(ask(e, 42), 400, "non-string");
    await rejectsWith(ask(e, "x".repeat(501)), 400, "too long");
  });
});

describe("escalation to HR", () => {
  it("creates a ticket, notifies HR + employee, HR replies, employee is notified", async () => {
    const emp = await actor("emp-e1");
    const hr = await actor("emp-hr1");
    const q = "Do we get stock options?";

    const esc = await escalate(emp, q);
    assert.equal(esc.status, "open");
    assert.match(esc.id, /^ESC-/);
    assert.ok((await listNotifications(emp)).notifications.some((n) => n.title === "Question sent to HR"));
    assert.ok((await listNotifications(hr)).notifications.some((n) => n.title === "New question from Al Jana"));

    // Idempotent for the same open question
    assert.equal((await escalate(emp, q)).id, esc.id);

    // Visibility: owner and HR only
    assert.equal((await listEscalations(emp)).length, 1);
    assert.equal((await listEscalations(await actor("emp-e2"))).length, 0);
    assert.equal((await listEscalations(hr)).length, 1);

    // Only HR may reply
    await rejectsWith(replyToEscalation(emp, esc.id, "I answer myself"), 403, "employee reply");
    await rejectsWith(replyToEscalation(await actor("emp-m1"), esc.id, "manager reply"), 403, "manager reply");
    await rejectsWith(replyToEscalation(hr, esc.id, "x"), 400, "too short");

    const answered = await replyToEscalation(hr, esc.id, "Not at the moment. We'll publish the policy soon.");
    assert.equal(answered.status, "answered");
    await rejectsWith(replyToEscalation(hr, esc.id, "Second reply"), 409, "already answered");
    await rejectsWith(replyToEscalation(hr, "ESC-0", "nope here"), 404, "unknown id");

    const note = (await listNotifications(emp)).notifications[0];
    assert.equal(note.title, "HR replied to your question");
    assert.match(note.body, /publish the policy/);
    assert.equal((await listEscalations(emp))[0].answer, "Not at the moment. We'll publish the policy soon.");
  });

  it("unanswered-question analytics are HR-only and aggregate repeats", async () => {
    const e1 = await actor("emp-e1");
    const e2 = await actor("emp-e2");
    await ask(e1, "Do we have stock options?");
    await ask(e2, "do we have stock options?");
    await ask(e1, "How many vacation days do I get?");
    const stats = await unansweredQuestions(await actor("emp-hr1"));
    assert.equal(stats.total, 3);
    assert.equal(stats.answered, 1);
    assert.equal(stats.unanswered.length, 1);
    assert.equal(stats.unanswered[0].count, 2);
    await rejectsWith(unansweredQuestions(e1), 403, "employee analytics");
  });
});
