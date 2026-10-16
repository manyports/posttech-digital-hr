import type {
  AdvancePayload,
  EmployeeDoc,
  HrRequestDoc,
  IntegrationRefs,
  RequestAction,
  RequestEvent,
  RequestStatus,
  RequestType,
  RequestView,
  VacationPayload,
} from "../../domain/types";
import { isValidDate, rangesOverlap, todayISO, workingDays } from "../../domain/dates";
import { getDb } from "../db";
import type { Db } from "../db";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import { integrations } from "../integrations";
import type { ExternalRef } from "../integrations/ports";
import {
  allowedRequestActions,
  canDecideRequestOf,
  canViewEmployee,
  type Actor,
} from "../policy";
import { pendingVacationDays, visibleEmployees } from "./employees";
import { notify } from "./notifications";

/* ── Policy constants (mirrored in the HR knowledge base) ──────────── */
export const ADVANCE_MAX_RATIO = 0.5; // of monthly salary
export const ADVANCE_MIN_AMOUNT = 10_000;

export const TYPE_LABEL: Record<RequestType, string> = {
  vacation: "Vacation",
  salary_advance: "Salary advance",
};

const TARGET_STATUS: Record<RequestAction, RequestStatus> = {
  start_review: "in_review",
  approve: "approved",
  reject: "rejected",
  cancel: "cancelled",
};

const EVENT_NOTE: Record<RequestAction, string> = {
  start_review: "Manager started review",
  approve: "Approved",
  reject: "Rejected",
  cancel: "Cancelled by employee",
};

/** Requests that still count against balance/limits. */
const LIVE: RequestStatus[] = ["submitted", "in_review", "approved"];

export const advanceLimitFor = (e: Pick<EmployeeDoc, "monthlySalary">) =>
  Math.floor(e.monthlySalary * ADVANCE_MAX_RATIO);

/* ── Input parsing helpers ─────────────────────────────────────────── */

function text(v: unknown, field: string, min: number, max: number, required = true): string | undefined {
  if (v === undefined || v === null || v === "") {
    if (required) throw badRequest(`${field} is required.`, { [field]: "Required" });
    return undefined;
  }
  if (typeof v !== "string") throw badRequest(`${field} must be text.`, { [field]: "Must be text" });
  const s = v.trim();
  if (s.length < min) throw badRequest(`${field} is too short.`, { [field]: `At least ${min} characters` });
  if (s.length > max) throw badRequest(`${field} is too long.`, { [field]: `At most ${max} characters` });
  return s;
}

const describe = (r: Pick<HrRequestDoc, "payload">) =>
  r.payload.kind === "vacation"
    ? `${r.payload.startDate} to ${r.payload.endDate} (${r.payload.days} working day${r.payload.days === 1 ? "" : "s"})`
    : `${r.payload.amount.toLocaleString("en-US")} ${r.payload.currency}`;

/* ── Views ─────────────────────────────────────────────────────────── */

async function hydrate(db: Db, actor: Actor, docs: HrRequestDoc[]): Promise<RequestView[]> {
  const ids = new Set<string>();
  for (const d of docs) {
    ids.add(d.employeeId);
    ids.add(d.approverId);
  }
  const people = new Map(
    (await db.employees.find({ _id: { $in: [...ids] } })).map((e) => [e._id, e]),
  );
  return docs.map((d) => {
    const emp = people.get(d.employeeId)!;
    const approver = people.get(d.approverId);
    return {
      id: d._id,
      type: d.type,
      status: d.status,
      employee: { id: emp._id, fullName: emp.fullName, position: emp.position },
      approver: { id: d.approverId, fullName: approver?.fullName ?? "HR" },
      payload: d.payload,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      history: d.history,
      integration: d.integration,
      allowedActions: allowedRequestActions(actor, d, emp),
    };
  });
}

/* ── Queries ───────────────────────────────────────────────────────── */

export async function listMyRequests(actor: Actor): Promise<RequestView[]> {
  const db = await getDb();
  const docs = await db.requests.find({ employeeId: actor.id }, { sort: { createdAt: -1 } });
  return hydrate(db, actor, docs);
}

/** Owner, their direct manager, or HR. Everyone else gets 403. */
export async function getRequest(actor: Actor, id: string): Promise<RequestView> {
  const db = await getDb();
  const doc = await db.requests.findOne({ _id: id });
  if (!doc) throw notFound("Request not found.");
  const emp = await db.employees.findOne({ _id: doc.employeeId });
  if (!emp || !canViewEmployee(actor, emp)) throw forbidden("You can't view this request.");
  return (await hydrate(db, actor, [doc]))[0];
}

/** All requests of one employee. Owner, their direct manager, or HR. */
export async function listRequestsOf(actor: Actor, employeeId: string): Promise<RequestView[]> {
  const db = await getDb();
  const emp = await db.employees.findOne({ _id: employeeId });
  if (!emp) throw notFound("Employee not found.");
  if (!canViewEmployee(actor, emp)) throw forbidden("You can't view this employee's requests.");
  const docs = await db.requests.find({ employeeId }, { sort: { createdAt: -1 } });
  return hydrate(db, actor, docs);
}

/** Requests raised by the actor's direct reports (HR: everyone). */
export async function listApprovals(actor: Actor): Promise<RequestView[]> {
  const db = await getDb();
  const scope = await visibleEmployees(db, actor); // throws 403 for employees
  const docs = await db.requests.find(
    { employeeId: { $in: scope.map((e) => e._id) } },
    { sort: { createdAt: -1 } },
  );
  return hydrate(db, actor, docs);
}

/** Numbers the "new request" form needs (balance, limits). Caller's own only. */
export async function getRequestFormInfo(actor: Actor) {
  const db = await getDb();
  const me = await db.employees.findOne({ _id: actor.id });
  if (!me) throw notFound();
  const pending = await pendingVacationDays(db, me._id);
  const monthStart = todayISO().slice(0, 7);
  const advances = await db.requests.find({
    employeeId: me._id,
    type: "salary_advance",
    status: { $in: LIVE },
  });
  return {
    today: todayISO(),
    vacation: {
      remaining: me.vacationBalance,
      pending,
      available: Math.max(0, me.vacationBalance - pending),
    },
    advance: {
      limit: advanceLimitFor(me),
      minAmount: ADVANCE_MIN_AMOUNT,
      currency: "KZT" as const,
      alreadyRequestedThisMonth: advances.some((a) => a.createdAt.startsWith(monthStart)),
    },
  };
}

/* ── Commands ──────────────────────────────────────────────────────── */

async function resolveApprover(db: Db, employee: EmployeeDoc): Promise<string> {
  if (employee.managerId) {
    const m = await db.employees.findOne({ _id: employee.managerId });
    if (m && m.active) return m._id;
  }
  // No manager (e.g. the CEO): HR approves.
  const hr = (await db.employees.find({ role: "hr", active: true })).find((h) => h._id !== employee._id);
  if (!hr) throw conflict("No approver is available for your request. Contact HR.");
  return hr._id;
}

async function syncExternal(
  fn: () => Promise<ExternalRef>,
): Promise<{ ref: string; state: string } | undefined> {
  try {
    return await fn();
  } catch {
    // Integration trouble must never block the employee (see ports.ts).
    return { ref: "-", state: "sync_failed" };
  }
}

export async function createRequest(actor: Actor, input: unknown): Promise<RequestView> {
  if (typeof input !== "object" || input === null) throw badRequest("Invalid request body.");
  const body = input as Record<string, unknown>;
  const type = body.type;
  if (type !== "vacation" && type !== "salary_advance") {
    throw badRequest("Unknown request type.", { type: "Choose vacation or salary advance" });
  }

  const db = await getDb();
  const me = await db.employees.findOne({ _id: actor.id });
  if (!me) throw notFound();

  let payload: VacationPayload | AdvancePayload;

  if (type === "vacation") {
    const { startDate, endDate } = body;
    if (!isValidDate(startDate)) throw badRequest("Start date is invalid.", { startDate: "Pick a valid date" });
    if (!isValidDate(endDate)) throw badRequest("End date is invalid.", { endDate: "Pick a valid date" });
    if (endDate < startDate) throw badRequest("End date is before the start date.", { endDate: "Must be on or after the start date" });
    if (startDate < todayISO()) throw badRequest("Vacation can't start in the past.", { startDate: "Must be today or later" });
    const days = workingDays(startDate, endDate);
    if (days < 1) throw badRequest("The selected range has no working days.", { endDate: "Include at least one weekday" });

    const available = me.vacationBalance - (await pendingVacationDays(db, me._id));
    if (days > available) {
      throw badRequest(
        `Not enough vacation days: you requested ${days} but have ${Math.max(0, available)} available.`,
        { endDate: `Only ${Math.max(0, available)} day(s) available` },
      );
    }
    const mine = await db.requests.find({ employeeId: me._id, type: "vacation", status: { $in: LIVE } });
    const clash = mine.find(
      (r) => r.payload.kind === "vacation" && rangesOverlap(startDate, endDate, r.payload.startDate, r.payload.endDate),
    );
    if (clash) throw conflict(`These dates overlap your existing request ${clash._id}.`);

    const comment = text(body.comment, "comment", 0, 300, false);
    payload = { kind: "vacation", startDate, endDate, days, ...(comment ? { comment } : {}) };
  } else {
    const amount = body.amount;
    if (typeof amount !== "number" || !Number.isInteger(amount)) {
      throw badRequest("Amount must be a whole number.", { amount: "Enter a whole number" });
    }
    const limit = advanceLimitFor(me);
    if (amount < ADVANCE_MIN_AMOUNT) {
      throw badRequest(`Minimum advance is ${ADVANCE_MIN_AMOUNT.toLocaleString("en-US")} KZT.`, { amount: "Below the minimum" });
    }
    if (amount > limit) {
      throw badRequest(
        `The advance can't exceed 50% of your monthly salary (${limit.toLocaleString("en-US")} KZT).`,
        { amount: `Maximum ${limit.toLocaleString("en-US")} KZT` },
      );
    }
    const reason = text(body.reason, "reason", 3, 300)!;
    const month = todayISO().slice(0, 7);
    const live = await db.requests.find({ employeeId: me._id, type: "salary_advance", status: { $in: LIVE } });
    if (live.some((r) => r.createdAt.startsWith(month))) {
      throw conflict("You already have a salary advance request for this month.");
    }
    payload = { kind: "salary_advance", amount, currency: "KZT", reason };
  }

  const approverId = await resolveApprover(db, me);
  const now = new Date().toISOString();
  const seq = await db.nextSeq("request");
  const doc: HrRequestDoc = {
    _id: `REQ-${2000 + seq}`,
    type,
    employeeId: me._id,
    approverId,
    status: "submitted",
    payload,
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, status: "submitted", actorId: me._id, actorName: me.fullName, note: "Request submitted" }],
    integration: {},
  };
  await db.requests.insertOne(doc);

  // Post-commit side effects (never block the employee).
  const dl = await syncExternal(() => integrations.documentflow.startApproval(doc, me));
  doc.integration = { documentolog: dl };
  await db.requests.updateOne({ _id: doc._id }, { $set: { integration: doc.integration } });

  const label = TYPE_LABEL[type].toLowerCase();
  await notify(db, me._id, {
    kind: "request",
    title: "Request submitted",
    body: `Your ${label} request ${doc._id} (${describe(doc)}) was sent to ${(await db.employees.findOne({ _id: approverId }))?.fullName ?? "your approver"}.`,
    href: `/requests/${doc._id}`,
  });
  await notify(db, approverId, {
    kind: "request",
    title: `New ${label} request`,
    body: `${me.fullName} submitted a ${label} request (${doc._id}): ${describe(doc)}.`,
    href: "/approvals",
  });

  return (await hydrate(db, actor, [doc]))[0];
}

export async function actOnRequest(
  actor: Actor,
  id: string,
  input: unknown,
): Promise<RequestView> {
  if (typeof input !== "object" || input === null) throw badRequest("Invalid request body.");
  const { action, comment: rawComment } = input as { action?: unknown; comment?: unknown };
  if (typeof action !== "string" || !(action in TARGET_STATUS)) {
    throw badRequest("Unknown action.", { action: "Use start_review, approve, reject or cancel" });
  }
  const act = action as RequestAction;

  const db = await getDb();
  const doc = await db.requests.findOne({ _id: id });
  if (!doc) throw notFound("Request not found.");
  const emp = await db.employees.findOne({ _id: doc.employeeId });
  if (!emp || !canViewEmployee(actor, emp)) throw forbidden("You can't act on this request.");

  // Role check first (403), then state check (409).
  const mayDoThis = act === "cancel" ? actor.id === doc.employeeId : canDecideRequestOf(actor, emp);
  if (!mayDoThis) {
    throw forbidden(
      act === "cancel"
        ? "Only the requester can cancel a request."
        : actor.id === doc.employeeId
          ? "You can't approve or reject your own request."
          : "You aren't an approver for this employee.",
    );
  }
  if (!allowedRequestActions(actor, doc, emp).includes(act)) {
    throw conflict(`This request is already ${doc.status.replace("_", " ")}; it can't be ${TARGET_STATUS[act]}.`);
  }

  const comment = text(rawComment, "comment", act === "reject" ? 3 : 0, 300, act === "reject");

  // Guarded balance deduction BEFORE the status change; refunded if we lose a race.
  let deducted = 0;
  if (act === "approve" && doc.payload.kind === "vacation") {
    const days = doc.payload.days;
    const ok = await db.employees.updateOne(
      { _id: emp._id, vacationBalance: { $gte: days } },
      { $inc: { vacationBalance: -days } },
    );
    if (!ok) throw conflict("The employee no longer has enough vacation days for this request.");
    deducted = days;
  }

  const now = new Date().toISOString();
  const toStatus = TARGET_STATUS[act];
  const event: RequestEvent = {
    at: now,
    status: toStatus,
    actorId: actor.id,
    actorName: actor.fullName,
    note: act === "approve" || act === "reject" ? `${EVENT_NOTE[act]} by ${actor.fullName}` : EVENT_NOTE[act],
    ...(comment ? { comment } : {}),
  };

  // Compare-and-set on the status we validated: concurrent decisions can't both win.
  const won = await db.requests.updateOne(
    { _id: id, status: doc.status },
    { $set: { status: toStatus, updatedAt: now }, $push: { history: event } },
  );
  if (!won) {
    if (deducted) await db.employees.updateOne({ _id: emp._id }, { $inc: { vacationBalance: deducted } });
    throw conflict("This request was just updated by someone else. Please refresh.");
  }

  // External systems (mock today). Post-commit, failure-tolerant.
  const integration: IntegrationRefs = { ...doc.integration };
  const updated = { ...doc, status: toStatus };
  if (act === "approve" || act === "reject" || act === "cancel") {
    integration.documentolog = await syncExternal(() =>
      integrations.documentflow.finishApproval(updated, toStatus as "approved" | "rejected" | "cancelled"),
    );
  }
  if (act === "approve") {
    integration.zup = await syncExternal(() =>
      doc.payload.kind === "vacation"
        ? integrations.hrCore.registerVacation(updated, emp)
        : integrations.hrCore.registerAdvance(updated, emp),
    );
  }
  if (act !== "start_review") {
    await db.requests.updateOne({ _id: id }, { $set: { integration } });
  }

  // Notifications.
  const label = TYPE_LABEL[doc.type].toLowerCase();
  if (act === "cancel") {
    await notify(db, doc.approverId, {
      kind: "request",
      title: "Request cancelled",
      body: `${emp.fullName} cancelled their ${label} request ${doc._id}.`,
      href: "/approvals",
    });
  } else {
    const titles: Record<string, string> = {
      start_review: "Your request is in review",
      approve: `Your ${label} request was approved`,
      reject: `Your ${label} request was rejected`,
    };
    await notify(db, emp._id, {
      kind: "request",
      title: titles[act],
      body: `${actor.fullName}: ${doc._id} (${describe(doc)}) is now ${toStatus.replace("_", " ")}.${comment ? ` Comment: "${comment}"` : ""}`,
      href: `/requests/${doc._id}`,
    });
  }

  return getRequest(actor, id);
}
