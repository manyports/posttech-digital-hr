import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { addDays, todayISO } from "../lib/domain/dates";
import { getDb } from "../lib/server/db";
import { getProfile } from "../lib/server/services/employees";
import { listNotifications } from "../lib/server/services/notifications";
import {
  actOnRequest,
  createRequest,
  getRequest,
  getRequestFormInfo,
  listMyRequests,
} from "../lib/server/services/requests";
import { actor, fresh, rejectsWith, weekRange } from "./helpers";

beforeEach(fresh);

describe("vacation: submitted -> in review -> approved", () => {
  it("runs end to end with live status, history, balance and notifications", async () => {
    const emp = await actor("emp-e2"); // Nurlan, 20 days, REQ-1003 already pending (10d)
    const mgr = await actor("emp-m1");
    const range = weekRange(10);

    const before = await getProfile(emp);
    assert.equal(before.vacation.remaining, 20);
    assert.equal(before.vacation.pending, 10);

    // 1. Employee submits
    const created = await createRequest(emp, { type: "vacation", ...range, comment: "Trip" });
    assert.equal(created.status, "submitted");
    assert.equal(created.payload.kind === "vacation" && created.payload.days, 5);
    assert.equal(created.approver.id, "emp-m1");
    assert.deepEqual(created.allowedActions, ["cancel"]);
    assert.equal(created.history.length, 1);
    assert.ok(created.integration.documentolog?.ref, "Documentolog route opened (mock)");

    // Manager is notified; employee gets confirmation.
    const mgrInbox = await listNotifications(mgr);
    assert.ok(mgrInbox.notifications.some((n) => n.title === "New vacation request" && n.body.includes(created.id)));

    // 2. Pending days are reserved, but the real balance is untouched
    const during = await getProfile(emp);
    assert.equal(during.vacation.remaining, 20);
    assert.equal(during.vacation.pending, 15);
    assert.equal(during.vacation.available, 5);

    // 3. Manager starts review. The employee sees the new status.
    const inReview = await actOnRequest(mgr, created.id, { action: "start_review" });
    assert.equal(inReview.status, "in_review");
    assert.deepEqual(inReview.allowedActions, ["approve", "reject"]);
    const seen = await getRequest(emp, created.id);
    assert.equal(seen.status, "in_review");
    assert.deepEqual(seen.allowedActions, ["cancel"]);

    // 4. Manager approves with a comment
    const approved = await actOnRequest(mgr, created.id, { action: "approve", comment: "Have fun" });
    assert.equal(approved.status, "approved");
    assert.deepEqual(
      approved.history.map((h) => h.status),
      ["submitted", "in_review", "approved"],
    );
    assert.equal(approved.history[2].comment, "Have fun");
    assert.equal(approved.history[2].actorName, "Daniyar Omarov");
    assert.ok(approved.integration.zup?.ref, "1C:ZUP order registered (mock)");
    assert.deepEqual(approved.allowedActions, []);

    // 5. Balance deducted exactly once
    const after = await getProfile(emp);
    assert.equal(after.vacation.remaining, 15);
    assert.equal(after.vacation.pending, 10); // only REQ-1003 still pending

    // 6. Employee was notified at every step, newest first
    const titles = (await listNotifications(emp)).notifications.map((n) => n.title);
    assert.ok(titles.includes("Request submitted"));
    assert.ok(titles.includes("Your request is in review"));
    assert.ok(titles.includes("Your vacation request was approved"));
  });

  it("rejection needs a comment, keeps the balance, and notifies the employee", async () => {
    const emp = await actor("emp-e2");
    const mgr = await actor("emp-m1");
    await actOnRequest(mgr, "REQ-1003", { action: "start_review" });

    await rejectsWith(actOnRequest(mgr, "REQ-1003", { action: "reject" }), 400, "no comment");
    const r = await actOnRequest(mgr, "REQ-1003", { action: "reject", comment: "Release freeze" });
    assert.equal(r.status, "rejected");
    assert.equal((await getProfile(emp)).vacation.remaining, 20);
    assert.equal((await getProfile(emp)).vacation.pending, 0);
    const last = (await listNotifications(emp)).notifications[0];
    assert.match(last.title, /rejected/);
    assert.match(last.body, /Release freeze/);
  });

  it("enforces the state machine: no skipping review, no deciding twice", async () => {
    const mgr = await actor("emp-m1");
    await rejectsWith(actOnRequest(mgr, "REQ-1003", { action: "approve" }), 409, "approve from submitted");
    await actOnRequest(mgr, "REQ-1003", { action: "start_review" });
    await rejectsWith(actOnRequest(mgr, "REQ-1003", { action: "start_review" }), 409, "review twice");
    await actOnRequest(mgr, "REQ-1003", { action: "approve" });
    await rejectsWith(actOnRequest(mgr, "REQ-1003", { action: "approve" }), 409, "approve twice");
    await rejectsWith(actOnRequest(mgr, "REQ-1003", { action: "reject", comment: "late" }), 409, "reject after approve");
    await rejectsWith(actOnRequest(mgr, "REQ-1003", { action: "explode" }), 400, "unknown action");
  });

  it("two concurrent approvals deduct the balance only once", async () => {
    const mgr = await actor("emp-m1");
    const hr = await actor("emp-hr1");
    await actOnRequest(mgr, "REQ-1003", { action: "start_review" });
    const results = await Promise.allSettled([
      actOnRequest(mgr, "REQ-1003", { action: "approve" }),
      actOnRequest(hr, "REQ-1003", { action: "approve" }),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    const db = await getDb();
    assert.equal((await db.employees.findOne({ _id: "emp-e2" }))!.vacationBalance, 10);
  });

  it("employee can cancel while open; pending days are released; approver is told", async () => {
    const emp = await actor("emp-e2");
    const r = await actOnRequest(emp, "REQ-1003", { action: "cancel" });
    assert.equal(r.status, "cancelled");
    assert.equal((await getProfile(emp)).vacation.pending, 0);
    const inbox = await listNotifications(await actor("emp-m1"));
    assert.ok(inbox.notifications.some((n) => n.title === "Request cancelled"));
    await rejectsWith(actOnRequest(emp, "REQ-1003", { action: "cancel" }), 409, "cancel twice");
  });

  it("an employee cannot approve or cancel on someone else's behalf", async () => {
    await rejectsWith(actOnRequest(await actor("emp-e2"), "REQ-1003", { action: "approve" }), 403, "self approve");
    await rejectsWith(actOnRequest(await actor("emp-m1"), "REQ-1003", { action: "cancel" }), 403, "manager cancel");
  });
});

describe("vacation validation (server-side)", () => {
  const emp = () => actor("emp-e1"); // 15 days remaining, nothing pending
  const base = weekRange(12);

  it("rejects bad input with field errors", async () => {
    await rejectsWith(createRequest(await emp(), { type: "nope" }), 400, "type");
    await rejectsWith(createRequest(await emp(), { type: "vacation" }), 400, "missing dates");
    await rejectsWith(createRequest(await emp(), { type: "vacation", startDate: "2026-02-30", endDate: "2026-03-01" }), 400, "impossible date");
    await rejectsWith(createRequest(await emp(), { type: "vacation", startDate: base.endDate, endDate: base.startDate }), 400, "end before start");
    await rejectsWith(createRequest(await emp(), { type: "vacation", startDate: addDays(todayISO(), -3), endDate: addDays(todayISO(), 3) }), 400, "past");
    await rejectsWith(createRequest(await emp(), null), 400, "null body");
  });

  it("rejects a weekend-only range", async () => {
    const sat = addDays(base.startDate, 5);
    await rejectsWith(createRequest(await emp(), { type: "vacation", startDate: sat, endDate: addDays(sat, 1) }), 400, "weekend");
  });

  it("rejects more days than available (counting pending)", async () => {
    const long = { startDate: base.startDate, endDate: addDays(base.startDate, 27) }; // 20 working days
    await rejectsWith(createRequest(await emp(), { type: "vacation", ...long }), 400, "too long");
  });

  it("rejects overlap with an existing active request", async () => {
    await createRequest(await emp(), { type: "vacation", ...base });
    await rejectsWith(createRequest(await emp(), { type: "vacation", startDate: base.endDate, endDate: addDays(base.endDate, 3) }), 409, "overlap");
  });

  it("a rejected request frees the dates again", async () => {
    const mgr = await actor("emp-m1");
    const r = await createRequest(await emp(), { type: "vacation", ...base });
    await actOnRequest(mgr, r.id, { action: "start_review" });
    await actOnRequest(mgr, r.id, { action: "reject", comment: "busy" });
    const again = await createRequest(await emp(), { type: "vacation", ...base });
    assert.equal(again.status, "submitted");
  });

  it("requests are listed newest first and carry history", async () => {
    const created = await createRequest(await emp(), { type: "vacation", ...base });
    const list = await listMyRequests(await emp());
    assert.equal(list[0].id, created.id);
    assert.equal(list.length, 3);
    assert.ok(list.every((r) => r.history.length >= 1));
  });
});

describe("salary advance", () => {
  it("is limited to 50% of salary and once per month", async () => {
    const emp = await actor("emp-e4"); // salary 620k -> limit 310k
    const info = await getRequestFormInfo(emp);
    assert.equal(info.advance.limit, 310_000);

    await rejectsWith(createRequest(emp, { type: "salary_advance", amount: 310_001, reason: "Rent" }), 400, "above limit");
    await rejectsWith(createRequest(emp, { type: "salary_advance", amount: 5_000, reason: "Rent" }), 400, "below minimum");
    await rejectsWith(createRequest(emp, { type: "salary_advance", amount: 100_000.5, reason: "Rent" }), 400, "fraction");
    await rejectsWith(createRequest(emp, { type: "salary_advance", amount: 100_000, reason: "" }), 400, "reason");
    await rejectsWith(createRequest(emp, { type: "salary_advance", amount: "100000", reason: "Rent" }), 400, "string amount");

    const ok = await createRequest(emp, { type: "salary_advance", amount: 300_000, reason: "Rent deposit" });
    assert.equal(ok.type, "salary_advance");
    await rejectsWith(createRequest(emp, { type: "salary_advance", amount: 100_000, reason: "More" }), 409, "second in month");
  });

  it("goes through the same flow and doesn't touch the vacation balance", async () => {
    const emp = await actor("emp-e4");
    const mgr = await actor("emp-m1");
    const r = await createRequest(emp, { type: "salary_advance", amount: 200_000, reason: "Tuition" });
    await actOnRequest(mgr, r.id, { action: "start_review" });
    const done = await actOnRequest(mgr, r.id, { action: "approve" });
    assert.equal(done.status, "approved");
    assert.match(done.integration.zup!.ref, /^ZUP-ADV-/);
    assert.equal((await getProfile(emp)).vacation.remaining, 15);
  });
});

describe("approver routing", () => {
  it("employees without a manager route to HR", async () => {
    const ceo = await actor("emp-ceo");
    const r = await createRequest(ceo, { type: "vacation", ...weekRange(14) });
    assert.equal(r.approver.id, "emp-hr1");
    const hr = await actor("emp-hr1");
    assert.equal((await actOnRequest(hr, r.id, { action: "start_review" })).status, "in_review");
  });

  it("a manager's own request goes to their manager", async () => {
    const r = await getRequest(await actor("emp-m1"), "REQ-1007");
    assert.equal(r.approver.id, "emp-ceo");
    assert.equal(r.status, "submitted");
  });
});
