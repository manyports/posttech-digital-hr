import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { getDb } from "../lib/server/db";
import { getProfile, listTeam } from "../lib/server/services/employees";
import { listNotifications, markRead } from "../lib/server/services/notifications";
import { getRequest, actOnRequest, listApprovals, listMyRequests } from "../lib/server/services/requests";
import { getTeamMember } from "../lib/server/services/team";
import { assignCourse, getAssignment, listAssignmentsFor, listCourses } from "../lib/server/services/academy";
import { actor, fresh, rejectsWith } from "./helpers";

/**
 * Scenario 3 and the "server-side enforcement" requirement: every rule is
 * exercised through the SERVICE layer (the same code the API routes call),
 * with no UI involved.
 */

beforeEach(fresh);

describe("employee sees only their own data", () => {
  it("can read own profile", async () => {
    const me = await actor("emp-e1");
    const p = await getProfile(me);
    assert.equal(p.fullName, "Aruzhan Kassymova");
    assert.equal(p.managerName, "Daniyar Omarov");
    assert.equal(p.company, "Jana Group");
    assert.equal(p.vacation.remaining, 15);
  });

  it("cannot read a colleague's profile, requests, training or team views", async () => {
    const me = await actor("emp-e1");
    await rejectsWith(getProfile(me, "emp-e2"), 403, "peer profile");
    await rejectsWith(getRequest(me, "REQ-1003"), 403, "peer request");
    await rejectsWith(listAssignmentsFor(me, "emp-e2"), 403, "peer training");
    await rejectsWith(getAssignment(me, "asg-1003"), 403, "peer assignment");
    await rejectsWith(listTeam(me), 403, "team list");
    await rejectsWith(listApprovals(me), 403, "approvals");
    await rejectsWith(getTeamMember(me, "emp-e1"), 403, "team detail (even self)");
    await rejectsWith(listCourses(me), 403, "catalogue");
  });

  it("only ever lists their own requests", async () => {
    const mine = await listMyRequests(await actor("emp-e1"));
    assert.deepEqual(mine.map((r) => r.id).sort(), ["REQ-1001", "REQ-1002"]);
    assert.ok(mine.every((r) => r.employee.id === "emp-e1"));
  });

  it("never receives salary or other sensitive fields", async () => {
    const json = JSON.stringify(await getProfile(await actor("emp-e1")));
    assert.ok(!/salary/i.test(json), "no salary in profile payload");
  });

  it("cannot assign training or act on requests", async () => {
    const me = await actor("emp-e1");
    await rejectsWith(assignCourse(me, { userId: "emp-e1", courseId: "course-remote" }), 403, "assign");
    await rejectsWith(actOnRequest(me, "REQ-1003", { action: "start_review" }), 403, "decide peer request");
  });
});

describe("manager sees only their direct team", () => {
  it("team list has exactly the 4 direct reports", async () => {
    const team = await listTeam(await actor("emp-m1"));
    assert.deepEqual(team.map((t) => t.id).sort(), ["emp-e1", "emp-e2", "emp-e3", "emp-e4"]);
  });

  it("the other manager gets a different, disjoint team", async () => {
    const team = await listTeam(await actor("emp-m2"));
    assert.deepEqual(team.map((t) => t.id).sort(), ["emp-e5", "emp-e6", "emp-e7"]);
  });

  it("approvals contain only team requests", async () => {
    const list = await listApprovals(await actor("emp-m1"));
    const ids = list.map((r) => r.id).sort();
    assert.deepEqual(ids, ["REQ-1001", "REQ-1002", "REQ-1003", "REQ-1004", "REQ-1005"]);
    assert.ok(!ids.includes("REQ-1006"), "other team's request is hidden");
    assert.ok(!ids.includes("REQ-1007"), "own request is not in own approval inbox");
  });

  it("cannot open another team's employee, request, or training", async () => {
    const m1 = await actor("emp-m1");
    await rejectsWith(getProfile(m1, "emp-e5"), 403, "other team profile");
    await rejectsWith(getTeamMember(m1, "emp-e5"), 403, "other team detail");
    await rejectsWith(getRequest(m1, "REQ-1006"), 403, "other team request");
    await rejectsWith(listAssignmentsFor(m1, "emp-e5"), 403, "other team training");
    await rejectsWith(getAssignment(m1, "asg-1005"), 403, "other team assignment");
  });

  it("cannot see skip-level people (their own manager, HR)", async () => {
    const m1 = await actor("emp-m1");
    await rejectsWith(getProfile(m1, "emp-ceo"), 403, "ceo");
    await rejectsWith(getProfile(m1, "emp-hr1"), 403, "hr");
  });

  it("cannot decide requests of another team", async () => {
    const m1 = await actor("emp-m1");
    for (const action of ["start_review", "approve", "reject"]) {
      await rejectsWith(actOnRequest(m1, "REQ-1006", { action, comment: "nope" }), 403, action);
    }
    const db = await getDb();
    assert.equal((await db.requests.findOne({ _id: "REQ-1006" }))!.status, "submitted");
  });

  it("cannot approve their own request", async () => {
    const m1 = await actor("emp-m1");
    await rejectsWith(actOnRequest(m1, "REQ-1007", { action: "start_review" }), 403, "self-approval");
  });

  it("can view a direct report in full", async () => {
    const detail = await getTeamMember(await actor("emp-m1"), "emp-e2");
    assert.equal(detail.profile.fullName, "Nurlan Abenov");
    assert.ok(detail.requests.every((r) => r.employee.id === "emp-e2"));
    assert.ok(detail.training.every((t) => t.userId === "emp-e2"));
  });

  it("can assign training to a report but not to someone else's report", async () => {
    const m1 = await actor("emp-m1");
    const ok = await assignCourse(m1, { userId: "emp-e1", courseId: "course-remote" });
    assert.equal(ok.course.id, "course-remote");
    await rejectsWith(assignCourse(m1, { userId: "emp-e5", courseId: "course-remote" }), 403, "other team");
  });
});

describe("HR / admin", () => {
  it("sees the whole company and every request", async () => {
    const hr = await actor("emp-hr1");
    assert.equal((await listTeam(hr)).length, 10);
    assert.equal((await listApprovals(hr)).length, 7);
    assert.equal((await getProfile(hr, "emp-e5")).fullName, "Alikhan Ryskulov");
  });

  it("can assign training to anyone", async () => {
    const a = await assignCourse(await actor("emp-hr1"), { userId: "emp-e6", courseId: "course-infosec" });
    assert.equal(a.userId, "emp-e6");
  });

  it("can act on any request except their own", async () => {
    const hr = await actor("emp-hr1");
    const r = await actOnRequest(hr, "REQ-1006", { action: "start_review" });
    assert.equal(r.status, "in_review");
  });
});

describe("notifications are private", () => {
  it("lists only the caller's and ignores foreign ids in markRead", async () => {
    const e1 = await actor("emp-e1");
    const e2 = await actor("emp-e2");
    const mine = await listNotifications(e1);
    assert.ok(mine.notifications.length > 0);
    const theirs = await listNotifications(e2);
    const foreignId = theirs.notifications[0].id;
    await markRead(e1, { ids: [foreignId] });
    const after = await listNotifications(e2);
    assert.equal(after.notifications.find((n) => n.id === foreignId)!.readAt, theirs.notifications[0].readAt);
  });

  it("marks own notifications in one update and rejects malformed bulk input", async () => {
    const e1 = await actor("emp-e1");
    const e2 = await actor("emp-e2");
    const foreign = (await listNotifications(e2)).notifications[0];
    const own = (await listNotifications(e1)).notifications;
    await rejectsWith(markRead(e1, { all: "false" }), 400);
    await rejectsWith(markRead(e1, { ids: Array(1001).fill(own[0].id) }), 400);
    await markRead(e1, { ids: [own[0].id, foreign.id, own[0].id] });
    assert.ok((await listNotifications(e1)).notifications.find((n) => n.id === own[0].id)?.readAt);
    assert.equal((await listNotifications(e2)).notifications.find((n) => n.id === foreign.id)?.readAt, foreign.readAt);
    await markRead(e1, { all: true });
    assert.equal((await listNotifications(e1)).unread, 0);
    assert.equal((await listNotifications(e2)).notifications.find((n) => n.id === foreign.id)?.readAt, foreign.readAt);
  });
});
