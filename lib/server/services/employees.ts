import type {
  EmployeeDoc,
  EmployeeSummary,
  ProfileView,
} from "../../domain/types";
import { addDays, isValidDate, isWeekend, todayISO } from "../../domain/dates";
import { getDb } from "../db";
import type { Db } from "../db";
import { badRequest, forbidden, notFound } from "../errors";
import { canManageTeam, canViewEmployee, isHr, type Actor } from "../policy";

export const ACTIVE_REQUEST_STATUSES = ["submitted", "in_review"] as const;

export function toSummary(e: EmployeeDoc, manager: EmployeeDoc | undefined | null): EmployeeSummary {
  return {
    id: e._id,
    fullName: e.fullName,
    email: e.email,
    role: e.role,
    position: e.position,
    department: e.department,
    managerId: e.managerId,
    managerName: manager?.fullName ?? null,
  };
}

/** Vacation days locked by requests that are not yet decided. */
export async function pendingVacationDays(db: Db, employeeId: string): Promise<number> {
  const open = await db.requests.find({
    employeeId,
    type: "vacation",
    status: { $in: [...ACTIVE_REQUEST_STATUSES] },
  });
  return open.reduce((sum, r) => sum + (r.payload.kind === "vacation" ? r.payload.days : 0), 0);
}

export async function buildProfile(db: Db, e: EmployeeDoc): Promise<ProfileView> {
  const [manager, pending] = await Promise.all([
    e.managerId ? db.employees.findOne({ _id: e.managerId }) : null,
    pendingVacationDays(db, e._id),
  ]);
  return {
    ...toSummary(e, manager),
    company: e.company,
    hireDate: e.hireDate,
    location: e.location,
    employeeNumber: e.employeeNumber,
    vacation: {
      entitlement: e.vacationEntitlement,
      remaining: e.vacationBalance,
      pending,
      available: Math.max(0, e.vacationBalance - pending),
    },
  };
}

/** Profile of `id` (default: the caller). 403 unless owner, direct manager or HR. */
export async function getProfile(actor: Actor, id: string = actor.id): Promise<ProfileView> {
  const db = await getDb();
  const target = await db.employees.findOne({ _id: id });
  if (!target) throw notFound("Employee not found.");
  if (!canViewEmployee(actor, target)) {
    throw forbidden("You can only view your own profile and your direct reports.");
  }
  return buildProfile(db, target);
}

/** Employees the actor is allowed to see in the team/people views. */
export async function visibleEmployees(db: Db, actor: Actor): Promise<EmployeeDoc[]> {
  if (!canManageTeam(actor)) throw forbidden("Only managers and HR can view teams.");
  const list = isHr(actor)
    ? await db.employees.find({ active: true }, { sort: { fullName: 1 } })
    : await db.employees.find({ managerId: actor.id, active: true }, { sort: { fullName: 1 } });
  return list.filter((e) => e._id !== actor.id);
}

export interface TeamMemberView extends EmployeeSummary {
  vacationRemaining: number;
  openRequests: number;
  coursesAssigned: number;
  coursesCompleted: number;
  coursesOverdue: number;
}

export interface TeamWeekDay {
  date: string;
  state: "clear" | "open" | "approved";
  requestId?: string;
}

export interface TeamWeekPerson {
  id: string;
  fullName: string;
  days: TeamWeekDay[];
}

export interface TeamCalendarConflict {
  date: string;
  groupLabel: string;
  absent: number;
  total: number;
  pendingRequestIds: string[];
}

export interface TeamCalendarView {
  start: string;
  end: string;
  people: TeamWeekPerson[];
  conflicts: TeamCalendarConflict[];
}

/** Calendar range including open requests so coverage risks are visible before approval. */
export async function teamCalendar(actor: Actor, start: string, days = 42): Promise<TeamCalendarView> {
  if (!isValidDate(start)) throw badRequest("Calendar start must be a valid date.");
  if (!Number.isInteger(days) || days < 7 || days > 62) throw badRequest("Calendar range must be 7–62 days.");

  const db = await getDb();
  const people = await visibleEmployees(db, actor);
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const live = people.length
    ? await db.requests.find({
        employeeId: { $in: people.map((p) => p._id) },
        type: "vacation",
        status: { $in: ["submitted", "in_review", "approved"] },
      })
    : [];
  const activeOn = (employeeId: string, date: string) =>
    live.find(
      (req) =>
        req.employeeId === employeeId &&
        req.payload.kind === "vacation" &&
        req.payload.startDate <= date &&
        req.payload.endDate >= date,
    );

  const calendarPeople = people.map((person) => ({
    id: person._id,
    fullName: person.fullName,
    days: dates.map((date) => {
      const hit = activeOn(person._id, date);
      const state: TeamWeekDay["state"] = !hit ? "clear" : hit.status === "approved" ? "approved" : "open";
      return { date, state, ...(hit ? { requestId: hit._id } : {}) };
    }),
  }));

  const groups = new Map<string, EmployeeDoc[]>();
  for (const person of people) {
    const key = isHr(actor) ? person.managerId ?? `department:${person.department}` : actor.id;
    groups.set(key, [...(groups.get(key) ?? []), person]);
  }
  const managerIds = [...groups.keys()].filter((key) => !key.startsWith("department:") && key !== actor.id);
  const managers = new Map(
    (managerIds.length ? await db.employees.find({ _id: { $in: managerIds } }) : []).map((person) => [person._id, person.fullName]),
  );
  const conflicts: TeamCalendarConflict[] = [];
  for (const date of dates) {
    if (isWeekend(date)) continue;
    for (const [key, members] of groups) {
      const hits = members.flatMap((person) => {
        const request = activeOn(person._id, date);
        return request ? [request] : [];
      });
      const pendingRequestIds = [...new Set(hits.filter((request) => request.status !== "approved").map((request) => request._id))];
      if (hits.length !== members.length) continue;
      conflicts.push({
        date,
        groupLabel: key.startsWith("department:") ? key.slice("department:".length) : managers.get(key) ?? actor.fullName,
        absent: hits.length,
        total: members.length,
        pendingRequestIds,
      });
    }
  }

  return { start, end: dates.at(-1) ?? start, people: calendarPeople, conflicts };
}

export async function teamWeek(actor: Actor, days = 14): Promise<TeamWeekPerson[]> {
  return (await teamCalendar(actor, todayISO(), days)).people;
}

export async function listTeam(actor: Actor): Promise<TeamMemberView[]> {
  const db = await getDb();
  const people = await visibleEmployees(db, actor);
  const names = new Map((await db.employees.find({})).map((e) => [e._id, e]));
  const today = new Date().toISOString().slice(0, 10);

  return Promise.all(
    people.map(async (e) => {
      const [open, assignments] = await Promise.all([
        db.requests.count({ employeeId: e._id, status: { $in: [...ACTIVE_REQUEST_STATUSES] } }),
        db.assignments.find({ userId: e._id }),
      ]);
      return {
        ...toSummary(e, names.get(e.managerId ?? "")),
        vacationRemaining: e.vacationBalance,
        openRequests: open,
        coursesAssigned: assignments.length,
        coursesCompleted: assignments.filter((a) => a.status === "completed").length,
        coursesOverdue: assignments.filter((a) => a.status !== "completed" && a.dueDate < today).length,
      };
    }),
  );
}
