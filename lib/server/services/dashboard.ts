import type {
  AssignmentView,
  NotificationView,
  ProfileView,
  RequestView,
} from "../../domain/types";
import { getDb, type Db } from "../db";
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
  // The personal part and the team/company part don't depend on each other.
  const [profile, requests, training, n, team] = await Promise.all([
    db.employees.findOne({ _id: actor.id }).then((me) => buildProfile(db, me!)),
    listMyRequests(actor),
    listAssignmentsFor(actor),
    listNotifications(actor, 1),
    isManager(actor) || isHr(actor) ? teamOverview(db, actor) : undefined,
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
    ...team,
  };
  return view;
}

async function teamOverview(db: Db, actor: Actor): Promise<Pick<DashboardView, "manager" | "hr">> {
  const scope = await visibleEmployees(db, actor);
  const ids = scope.map((e) => e._id);
  const hr = isHr(actor);
  const [awaiting, teamAssignments, courses, openEscalations] = await Promise.all([
    db.requests.count({ employeeId: { $in: ids }, status: { $in: ["submitted", "in_review"] } }),
    db.assignments.find({ userId: { $in: ids } }),
    hr ? db.courses.find({}) : [],
    hr ? db.escalations.count({ status: "open" }) : 0,
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = teamAssignments.filter((a) => a.status !== "completed" && a.dueDate < today).length;

  if (!hr) return { manager: { teamSize: scope.length, awaitingDecision: awaiting, teamOverdueTraining: overdue } };
  const byId = new Map(courses.map((c) => [c._id, c]));
  const mandatory = teamAssignments.filter((a) => byId.get(a.courseId)?.mandatory);
  const done = mandatory.filter((a) => a.status === "completed").length;
  return {
    hr: {
      employees: scope.length + 1,
      awaitingDecision: awaiting,
      openEscalations,
      mandatoryCompletionPct: mandatory.length ? Math.round((done / mandatory.length) * 100) : 100,
    },
  };
}
