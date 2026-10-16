import type { AssignmentView, ProfileView, RequestView } from "../../domain/types";
import { getDb } from "../db";
import { forbidden, notFound } from "../errors";
import { canManageTeam, canViewEmployee, type Actor } from "../policy";
import { listAssignmentsFor } from "./academy";
import { buildProfile } from "./employees";
import { listRequestsOf } from "./requests";

export interface TeamMemberDetail {
  profile: ProfileView;
  requests: RequestView[];
  training: AssignmentView[];
}

/**
 * One team member's profile + requests + training. Managers: direct reports
 * only. HR: anyone. Employees: always 403 (they have /profile for themselves).
 */
export async function getTeamMember(actor: Actor, id: string): Promise<TeamMemberDetail> {
  if (!canManageTeam(actor)) throw forbidden("Only managers and HR can view team members.");
  const db = await getDb();
  const target = await db.employees.findOne({ _id: id });
  if (!target) throw notFound("Employee not found.");
  if (!canViewEmployee(actor, target)) throw forbidden("This employee isn't in your team.");
  const [profile, requests, training] = await Promise.all([
    buildProfile(db, target),
    listRequestsOf(actor, id),
    listAssignmentsFor(actor, id),
  ]);
  return { profile, requests, training };
}
