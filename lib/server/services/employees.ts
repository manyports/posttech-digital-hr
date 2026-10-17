import type {
  EmployeeDoc,
  EmployeeSummary,
  ProfileView,
} from "../../domain/types";
import { getDb } from "../db";
import type { Db } from "../db";
import { forbidden, notFound } from "../errors";
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
