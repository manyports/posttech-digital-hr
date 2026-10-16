import type {
  AssignmentView,
  NotificationView,
  ProfileView,
  RequestView,
} from "../../domain/types";
import { getDb } from "../db";
import { isHr, isManager, type Actor } from "../policy";
import { listAssignmentsFor } from "./academy";
import { buildProfile, visibleEmployees } from "./employees";
import { listNotifications } from "./notifications";
import { listMyRequests } from "./requests";

export interface ProfileBundle {
  profile: ProfileView;
  training: AssignmentView[];
  notifications: NotificationView[];
  unread: number;
}

/** Everything the Profile page shows, for the CALLER only. */
export async function getProfileBundle(actor: Actor): Promise<ProfileBundle> {
  const db = await getDb();
  const me = (await db.employees.findOne({ _id: actor.id }))!;
  const [profile, training, n] = await Promise.all([
    buildProfile(db, me),
    listAssignmentsFor(actor),
    listNotifications(actor, 5),
  ]);
  return { profile, training, notifications: n.notifications, unread: n.unread };
}

export interface DashboardView {
  vacation: ProfileView["vacation"];
  recentRequests: RequestView[];
  openRequests: number;
  training: { total: number; completed: number; overdue: number; next: AssignmentView | null };
  unread: number;
  manager?: { teamSize: number; awaitingDecision: number; teamOverdueTraining: number };
  hr?: { employees: number; awaitingDecision: number; openEscalations: number; mandatoryCompletionPct: number };
}

export async function getDashboard(actor: Actor): Promise<DashboardView> {
  const db = await getDb();
  const me = (await db.employees.findOne({ _id: actor.id }))!;
  const [profile, requests, training, n] = await Promise.all([
    buildProfile(db, me),
    listMyRequests(actor),
    listAssignmentsFor(actor),
    listNotifications(actor, 1),
  ]);

  const pending = training.filter((a) => a.status !== "completed");
  const next =
    [...pending].sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.dueDate.localeCompare(b.dueDate))[0] ?? null;

  const view: DashboardView = {
    vacation: profile.vacation,
    recentRequests: requests.slice(0, 3),
    openRequests: requests.filter((r) => r.status === "submitted" || r.status === "in_review").length,
    training: {
      total: training.length,
      completed: training.length - pending.length,
      overdue: pending.filter((a) => a.overdue).length,
      next,
    },
    unread: n.unread,
  };

  if (isManager(actor) || isHr(actor)) {
    const scope = await visibleEmployees(db, actor);
    const ids = scope.map((e) => e._id);
    const awaiting = await db.requests.count({
      employeeId: { $in: ids },
      status: { $in: ["submitted", "in_review"] },
    });
    const teamAssignments = await db.assignments.find({ userId: { $in: ids } });
    const today = new Date().toISOString().slice(0, 10);
    const overdue = teamAssignments.filter((a) => a.status !== "completed" && a.dueDate < today).length;

    if (isManager(actor)) {
      view.manager = { teamSize: scope.length, awaitingDecision: awaiting, teamOverdueTraining: overdue };
    } else {
      const courses = new Map((await db.courses.find({})).map((c) => [c._id, c]));
      const mandatory = teamAssignments.filter((a) => courses.get(a.courseId)?.mandatory);
      const done = mandatory.filter((a) => a.status === "completed").length;
      view.hr = {
        employees: scope.length + 1,
        awaitingDecision: awaiting,
        openEscalations: await db.escalations.count({ status: "open" }),
        mandatoryCompletionPct: mandatory.length ? Math.round((done / mandatory.length) * 100) : 100,
      };
    }
  }
  return view;
}
