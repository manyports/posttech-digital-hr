import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { getDb } from "../lib/server/db";
import {
  assignCourse,
  completeLesson,
  getAssignment,
  listAssignmentsFor,
  openLesson,
  submitTest,
} from "../lib/server/services/academy";
import { listNotifications } from "../lib/server/services/notifications";
import { actor, fresh, rejectsWith } from "./helpers";

beforeEach(fresh);

async function key(courseId: string): Promise<number[]> {
  const db = await getDb();
  return (await db.courses.findOne({ _id: courseId }))!.test.questions.map((q) => q.correctIndex);
}

describe("Jana Academy: open course, track progress, record test result", () => {
  it("shows seeded progress (2 of 4 lessons + test = 40%)", async () => {
    const [a] = (await listAssignmentsFor(await actor("emp-e1"))).filter((x) => x.course.id === "course-infosec");
    assert.equal(a.status, "in_progress");
    assert.equal(a.completedLessons, 2);
    assert.equal(a.progress, 40);
  });

  it("full journey: lessons -> locked test -> fail -> pass -> completed + notifications", async () => {
    const me = await actor("emp-e1");
    const id = "asg-1001";

    // Test is locked until every lesson is complete (server-enforced).
    assert.equal((await getAssignment(me, id)).testUnlocked, false);
    await rejectsWith(submitTest(me, id, { answers: [0, 0, 0, 0, 0, 0] }), 409, "locked test");

    // Cannot complete a lesson that was never opened.
    await rejectsWith(completeLesson(me, id, "l3"), 409, "complete before open");

    let d = await openLesson(me, id, "l3");
    assert.equal(d.lastLessonId, "l3");
    assert.equal(d.lessons.find((l) => l.id === "l3")!.opened, true);
    d = await completeLesson(me, id, "l3");
    assert.equal(d.progress, 60);
    await openLesson(me, id, "l4");
    d = await completeLesson(me, id, "l4");
    assert.equal(d.progress, 80); // 4 of 5 steps; the test is the last one
    assert.equal(d.testUnlocked, true);

    // The questions sent to the client must NOT contain the answer key.
    assert.ok(d.questions.every((q) => !("correctIndex" in q)));
    assert.ok(!JSON.stringify(d).includes("correctIndex"));

    // Failing attempt is recorded, course stays open.
    const k = await key("course-infosec");
    const wrong = k.map((c, i) => (i < 4 ? (c + 1) % 3 : c));
    const failed = await submitTest(me, id, { answers: wrong });
    assert.equal(failed.passed, false);
    assert.equal(failed.correct, 2);
    assert.equal(failed.assignment.status, "in_progress");
    assert.equal(failed.assignment.attemptCount, 1);
    assert.equal(failed.assignment.bestScore, 33);
    assert.ok(failed.review.every((r) => typeof r.correct === "boolean"));
    assert.ok(!JSON.stringify(failed).includes("correctIndex"));

    // Passing attempt completes the course and records the result.
    const passed = await submitTest(me, id, { answers: k });
    assert.equal(passed.passed, true);
    assert.equal(passed.score, 100);
    assert.equal(passed.assignment.status, "completed");
    assert.equal(passed.assignment.progress, 100);
    assert.equal(passed.assignment.bestScore, 100);
    assert.equal(passed.assignment.attemptCount, 2);

    const detail = await getAssignment(me, id);
    assert.deepEqual(detail.attempts.map((a) => a.score), [33, 100]);
    assert.ok(detail.completedAt);

    // Employee and manager are notified of completion.
    const mine = (await listNotifications(me)).notifications;
    assert.ok(mine.some((n) => n.title === "Course completed" && n.body.includes("Information Security Basics")));
    const mgr = (await listNotifications(await actor("emp-m1"))).notifications;
    assert.ok(mgr.some((n) => n.title === "Team member completed a course" && n.body.includes("Aruzhan")));

    // No further attempts after completion.
    await rejectsWith(submitTest(me, id, { answers: k }), 409, "after completion");
  });

  it("validates test submissions", async () => {
    const me = await actor("emp-e3"); // already completed infosec; use an unlocked one
    void me;
    const e1 = await actor("emp-e1");
    for (const l of ["l3", "l4"]) {
      await openLesson(e1, "asg-1001", l);
      await completeLesson(e1, "asg-1001", l);
    }
    await rejectsWith(submitTest(e1, "asg-1001", { answers: [1] }), 400, "wrong length");
    await rejectsWith(submitTest(e1, "asg-1001", {}), 400, "no answers");
    await rejectsWith(submitTest(e1, "asg-1001", { answers: ["a", "b", "c", "d", "e", "f"] }), 400, "non-numeric");
  });

  it("only the assigned learner can progress; managers/HR can only view", async () => {
    const mgr = await actor("emp-m1");
    const hr = await actor("emp-hr1");
    assert.equal((await getAssignment(mgr, "asg-1001")).userId, "emp-e1"); // can view
    assert.equal((await getAssignment(hr, "asg-1001")).userId, "emp-e1");
    await rejectsWith(openLesson(mgr, "asg-1001", "l3"), 403, "manager opens lesson");
    await rejectsWith(completeLesson(hr, "asg-1001", "l1"), 403, "hr completes lesson");
    await rejectsWith(submitTest(mgr, "asg-1001", { answers: [] }), 403, "manager takes test");
    await rejectsWith(openLesson(await actor("emp-e2"), "asg-1001", "l3"), 403, "peer");
  });

  it("unknown lesson / assignment", async () => {
    const me = await actor("emp-e1");
    await rejectsWith(openLesson(me, "asg-1001", "nope"), 404, "lesson");
    await rejectsWith(getAssignment(me, "asg-9999"), 404, "assignment");
  });
});

describe("assigning training", () => {
  it("notifies the employee; duplicates are refused until completed", async () => {
    const mgr = await actor("emp-m1");
    const a = await assignCourse(mgr, { userId: "emp-e2", courseId: "course-remote" });
    assert.equal(a.status, "assigned");
    assert.equal(a.progress, 0);
    const n = (await listNotifications(await actor("emp-e2"))).notifications[0];
    assert.equal(n.title, "New course assigned");
    assert.match(n.body, /Remote & Hybrid Work Essentials/);
    assert.equal(n.href, `/academy/${a.id}`);
    await rejectsWith(assignCourse(mgr, { userId: "emp-e2", courseId: "course-remote" }), 409, "duplicate");
    // Completed courses can be assigned again (e.g. annual refresher)
    const hr = await actor("emp-hr1");
    const again = await assignCourse(hr, { userId: "emp-e3", courseId: "course-infosec" });
    assert.equal(again.status, "assigned");
  });

  it("validates input", async () => {
    const hr = await actor("emp-hr1");
    await rejectsWith(assignCourse(hr, {}), 400, "empty");
    await rejectsWith(assignCourse(hr, { userId: "emp-e1", courseId: "nope" }), 404, "course");
    await rejectsWith(assignCourse(hr, { userId: "ghost", courseId: "course-remote" }), 404, "user");
    await rejectsWith(assignCourse(hr, { userId: "emp-e6", courseId: "course-remote", dueDate: "2001-01-01" }), 400, "past due");
  });
});
