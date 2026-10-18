import type {
  EmployeeDoc,
  HrRequestDoc,
  RequestAction,
  SessionUser,
} from "../domain/types";

/**
 * CENTRAL AUTHORIZATION POLICY.
 *
 * Every permission decision in the system goes through this file; services
 * call these functions and throw 403 when they return false. Nothing relies on
 * hidden buttons. The rules:
 *
 *  employee  - own data only.
 *  manager   - own data + data of employees whose `managerId` is the manager
 *              (direct reports only, NOT skip-level, NOT other teams).
 *  hr        - company-wide read; can act on any request except their own.
 *
 * Nobody may approve/reject their own request (no self-approval).
 */

export type Actor = SessionUser;

export const isHr = (a: Actor) => a.role === "hr";
export const isManager = (a: Actor) => a.role === "manager";

/** Is `target` one of the actor's direct reports? */
export const isDirectReport = (actor: Actor, target: Pick<EmployeeDoc, "managerId">) =>
  actor.role === "manager" && target.managerId === actor.id;

/** May the actor read this employee's profile, requests and training? */
export function canViewEmployee(actor: Actor, target: Pick<EmployeeDoc, "_id" | "managerId">): boolean {
  return actor.id === target._id || isHr(actor) || isDirectReport(actor, target);
}

/** May the actor use the team/people views (and assign training)? */
export const canManageTeam = (actor: Actor) => actor.role === "manager" || actor.role === "hr";

/** May the actor assign training to this employee? */
export function canAssignCourseTo(actor: Actor, target: Pick<EmployeeDoc, "_id" | "managerId">): boolean {
  if (isHr(actor)) return true;
  return isDirectReport(actor, target);
}

/** May the actor decide (review/approve/reject) requests raised by `employee`? */
export function canDecideRequestOf(actor: Actor, employee: Pick<EmployeeDoc, "_id" | "managerId">): boolean {
  if (actor.id === employee._id) return false; // no self-approval
  return isHr(actor) || isDirectReport(actor, employee);
}

/**
 * The state machine for requests, filtered by who is asking.
 *
 *   draft --submit--> submitted --start_review--> in_review --approve--> approved
 *       |                           |      \--reject--> rejected
 *       \------------ cancel (owner only) ---/--> cancelled
 */
export function allowedRequestActions(
  actor: Actor,
  request: Pick<HrRequestDoc, "status" | "employeeId">,
  employee: Pick<EmployeeDoc, "_id" | "managerId">,
): RequestAction[] {
  const actions: RequestAction[] = [];
  if (actor.id === request.employeeId && request.status === "draft") {
    actions.push("submit", "cancel");
    return actions;
  }
  const open = request.status === "submitted" || request.status === "in_review";
  if (actor.id === request.employeeId && open) actions.push("cancel");
  if (canDecideRequestOf(actor, employee)) {
    if (request.status === "submitted") actions.push("start_review");
    if (request.status === "in_review") actions.push("approve", "reject");
  }
  return actions;
}
