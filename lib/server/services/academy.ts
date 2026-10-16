import type {
  AssignmentDetailView,
  AssignmentDoc,
  AssignmentView,
  CourseDoc,
  CourseSummary,
  TestAttempt,
  TestResultView,
} from "../../domain/types";
import { isValidDate, addDays, todayISO } from "../../domain/dates";
import { getDb } from "../db";
import type { Db } from "../db";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import {
  canAssignCourseTo,
  canManageTeam,
  canViewEmployee,
  type Actor,
} from "../policy";
import { notify } from "./notifications";

/* ── Views ─────────────────────────────────────────────────────────── */

export function courseSummary(c: CourseDoc): CourseSummary {
  return {
    id: c._id,
    title: c.title,
    description: c.description,
    category: c.category,
    durationMin: c.durationMin,
    mandatory: c.mandatory,
    lessonCount: c.lessons.length,
    questionCount: c.test.questions.length,
    passScore: c.test.passScore,
  };
}

/** Each lesson is a step, plus one step for passing the final test. */
export function progressOf(a: AssignmentDoc, c: CourseDoc): number {
  const steps = c.lessons.length + 1;
  const done = a.completedLessonIds.length + (a.status === "completed" ? 1 : 0);
  return Math.round((done / steps) * 100);
}

async function assignmentViews(db: Db, docs: AssignmentDoc[]): Promise<AssignmentView[]> {
  if (!docs.length) return [];
  const courses = new Map((await db.courses.find({})).map((c) => [c._id, c]));
  const people = new Map(
    (await db.employees.find({ _id: { $in: [...new Set(docs.map((d) => d.assignedById))] } })).map((e) => [e._id, e]),
  );
  const today = todayISO();
  return docs.flatMap((a) => {
    const c = courses.get(a.courseId);
    if (!c) return [];
    return [
      {
        id: a._id,
        course: courseSummary(c),
        userId: a.userId,
        assignedBy: { id: a.assignedById, fullName: people.get(a.assignedById)?.fullName ?? "HR" },
        assignedAt: a.assignedAt,
        dueDate: a.dueDate,
        overdue: a.status !== "completed" && a.dueDate < today,
        status: a.status,
        progress: progressOf(a, c),
        completedLessons: a.completedLessonIds.length,
        bestScore: a.bestScore,
        completedAt: a.completedAt,
        attemptCount: a.attempts.length,
      },
    ];
  });
}

/** Training assigned to `userId`. Owner, their direct manager or HR only. */
export async function listAssignmentsFor(actor: Actor, userId: string = actor.id): Promise<AssignmentView[]> {
  const db = await getDb();
  const target = await db.employees.findOne({ _id: userId });
  if (!target) throw notFound("Employee not found.");
  if (!canViewEmployee(actor, target)) throw forbidden("You can't view this employee's training.");
  const docs = await db.assignments.find({ userId }, { sort: { assignedAt: -1 } });
  return assignmentViews(db, docs);
}

async function loadForViewer(db: Db, actor: Actor, id: string) {
  const a = await db.assignments.findOne({ _id: id });
  if (!a) throw notFound("Course assignment not found.");
  const owner = await db.employees.findOne({ _id: a.userId });
  if (!owner || !canViewEmployee(actor, owner)) throw forbidden("You can't view this course assignment.");
  const course = await db.courses.findOne({ _id: a.courseId });
  if (!course) throw notFound("Course not found.");
  return { a, course, owner };
}

/** Learner-only actions (opening lessons, taking the test). Managers/HR can't do them on someone's behalf. */
async function loadForLearner(db: Db, actor: Actor, id: string) {
  const loaded = await loadForViewer(db, actor, id);
  if (loaded.a.userId !== actor.id) throw forbidden("Only the assigned employee can do this.");
  return loaded;
}

export async function getAssignment(actor: Actor, id: string): Promise<AssignmentDetailView> {
  const db = await getDb();
  const { a, course } = await loadForViewer(db, actor, id);
  const [view] = await assignmentViews(db, [a]);
  return {
    ...view,
    lastLessonId: a.lastLessonId,
    testUnlocked: a.completedLessonIds.length === course.lessons.length,
    lessons: course.lessons.map((l) => ({
      ...l,
      opened: a.openedLessonIds.includes(l.id),
      completed: a.completedLessonIds.includes(l.id),
    })),
    attempts: a.attempts.map(({ answers: _answers, ...rest }) => rest),
    // The correct answers never leave the server.
    questions: course.test.questions.map(({ id: qid, text, options }) => ({ id: qid, text, options })),
  };
}

/* ── Learning progress ─────────────────────────────────────────────── */

export async function openLesson(actor: Actor, id: string, lessonId: string) {
  const db = await getDb();
  const { a, course } = await loadForLearner(db, actor, id);
  if (!course.lessons.some((l) => l.id === lessonId)) throw notFound("Lesson not found.");
  if (a.status === "completed") return getAssignment(actor, id);
  const opened = a.openedLessonIds.includes(lessonId) ? a.openedLessonIds : [...a.openedLessonIds, lessonId];
  await db.assignments.updateOne(
    { _id: id },
    {
      $set: {
        openedLessonIds: opened,
        lastLessonId: lessonId,
        status: "in_progress",
        startedAt: a.startedAt ?? new Date().toISOString(),
      },
    },
  );
  return getAssignment(actor, id);
}

export async function completeLesson(actor: Actor, id: string, lessonId: string) {
  const db = await getDb();
  const { a, course } = await loadForLearner(db, actor, id);
  if (!course.lessons.some((l) => l.id === lessonId)) throw notFound("Lesson not found.");
  if (!a.openedLessonIds.includes(lessonId)) throw conflict("Open the lesson before marking it complete.");
  if (a.status === "completed") return getAssignment(actor, id);
  const done = a.completedLessonIds.includes(lessonId) ? a.completedLessonIds : [...a.completedLessonIds, lessonId];
  await db.assignments.updateOne({ _id: id }, { $set: { completedLessonIds: done } });
  return getAssignment(actor, id);
}

/* ── Test ──────────────────────────────────────────────────────────── */

export async function submitTest(actor: Actor, id: string, input: unknown): Promise<TestResultView> {
  const db = await getDb();
  const { a, course, owner } = await loadForLearner(db, actor, id);
  if (a.status === "completed") throw conflict("You have already passed this course's test.");
  if (a.completedLessonIds.length < course.lessons.length) {
    throw conflict("Complete all lessons to unlock the test.");
  }

  const answers = (input as { answers?: unknown } | null)?.answers;
  const qs = course.test.questions;
  if (
    !Array.isArray(answers) ||
    answers.length !== qs.length ||
    !answers.every((x) => Number.isInteger(x) && x >= -1)
  ) {
    throw badRequest(`Send \`answers\`: an array of ${qs.length} option indexes (-1 = unanswered).`);
  }

  const review = qs.map((q, i) => ({ questionId: q.id, correct: answers[i] === q.correctIndex }));
  const correct = review.filter((r) => r.correct).length;
  const score = Math.round((correct / qs.length) * 100);
  const passed = score >= course.test.passScore;
  const now = new Date().toISOString();
  const attempt: TestAttempt = { at: now, score, correct, total: qs.length, passed, answers: answers as number[] };

  const best = Math.max(score, a.bestScore ?? 0);
  const $set: Record<string, unknown> = { bestScore: best, status: passed ? "completed" : "in_progress" };
  if (passed) $set.completedAt = now;
  // Compare-and-set on "not completed": a double submit can't record two passes.
  const ok = await db.assignments.updateOne(
    { _id: id, status: { $ne: "completed" } },
    { $set, $push: { attempts: attempt } },
  );
  if (!ok) throw conflict("This course was just completed.");

  if (passed) {
    await notify(db, owner._id, {
      kind: "course",
      title: "Course completed",
      body: `You passed "${course.title}" with ${score}%.`,
      href: `/academy/${id}`,
    });
    if (owner.managerId) {
      await notify(db, owner.managerId, {
        kind: "course",
        title: "Team member completed a course",
        body: `${owner.fullName} passed "${course.title}" with ${score}%.`,
        href: `/team/${owner._id}`,
      });
    }
  }

  const [assignment] = await assignmentViews(db, [(await db.assignments.findOne({ _id: id }))!]);
  return { score, correct, total: qs.length, passed, passScore: course.test.passScore, review, assignment };
}

/* ── Assigning training (manager → own team, HR → anyone) ──────────── */

export async function listCourses(actor: Actor): Promise<CourseSummary[]> {
  if (!canManageTeam(actor)) throw forbidden("Only managers and HR can browse the course catalogue.");
  const db = await getDb();
  return (await db.courses.find({}, { sort: { title: 1 } })).map(courseSummary);
}

export async function assignCourse(actor: Actor, input: unknown): Promise<AssignmentView> {
  if (!canManageTeam(actor)) throw forbidden("Only managers and HR can assign training.");
  const { userId, courseId, dueDate } = (input ?? {}) as Record<string, unknown>;
  if (typeof userId !== "string" || typeof courseId !== "string") {
    throw badRequest("`userId` and `courseId` are required.");
  }

  const db = await getDb();
  const target = await db.employees.findOne({ _id: userId });
  if (!target || !target.active) throw notFound("Employee not found.");
  if (!canAssignCourseTo(actor, target)) {
    throw forbidden("You can only assign training to your direct reports.");
  }
  const course = await db.courses.findOne({ _id: courseId });
  if (!course) throw notFound("Course not found.");

  const due = dueDate === undefined || dueDate === "" ? addDays(todayISO(), 30) : dueDate;
  if (!isValidDate(due) || due < todayISO()) {
    throw badRequest("Due date must be today or later.", { dueDate: "Pick a future date" });
  }

  const existing = await db.assignments.find({ userId, courseId });
  if (existing.some((x) => x.status !== "completed")) {
    throw conflict(`${target.fullName} already has "${course.title}" in progress.`);
  }

  const seq = await db.nextSeq("assignment");
  const doc: AssignmentDoc = {
    _id: `asg-${2000 + seq}`,
    userId,
    courseId,
    assignedById: actor.id,
    assignedAt: new Date().toISOString(),
    dueDate: due,
    status: "assigned",
    startedAt: null,
    openedLessonIds: [],
    completedLessonIds: [],
    lastLessonId: null,
    attempts: [],
    bestScore: null,
    completedAt: null,
  };
  await db.assignments.insertOne(doc);
  await notify(db, userId, {
    kind: "course",
    title: "New course assigned",
    body: `${course.title} was assigned to you by ${actor.fullName}. Due ${due}.`,
    href: `/academy/${doc._id}`,
  });
  return (await assignmentViews(db, [doc]))[0];
}
