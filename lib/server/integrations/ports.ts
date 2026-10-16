import type { EmployeeDoc, HrRequestDoc } from "../../domain/types";

/**
 * INTEGRATION PORTS (hexagonal architecture).
 *
 * The portal's business logic depends only on these interfaces. Today they are
 * implemented by in-process mocks (./mock.ts). To go live, add an adapter that
 * implements the same interface and select it in ./index.ts, with no change to
 * services, API routes or UI.
 *
 *   HrCorePort        -> 1C:ZUP (payroll / personnel records, system of record
 *                        for balances, orders, salary)
 *   DocumentflowPort  -> Documentolog (electronic document flow, approval
 *                        routes and the legal paper trail)
 *
 * Contract notes for real adapters:
 *  - Calls happen AFTER the portal has committed its own state change, and a
 *    failure must never roll back or block the employee's request; the adapter
 *    reports `state: "sync_failed"` and a retry job picks it up (outbox).
 *  - Methods must be idempotent on `request._id` (safe to retry).
 */

export interface ExternalRef {
  /** Identifier in the external system (e.g. Documentolog document number). */
  ref: string;
  /** Free-form external state, shown on the request card. */
  state: string;
}

export interface HrCorePort {
  readonly name: "1C:ZUP";
  /** Source of truth for the leave balance (portal caches it). */
  getVacationBalance(employee: EmployeeDoc): Promise<number>;
  /** Create the vacation order / timesheet entry after final approval. */
  registerVacation(request: HrRequestDoc, employee: EmployeeDoc): Promise<ExternalRef>;
  /** Register the advance payment in payroll after final approval. */
  registerAdvance(request: HrRequestDoc, employee: EmployeeDoc): Promise<ExternalRef>;
}

export interface DocumentflowPort {
  readonly name: "Documentolog";
  /** Open an approval route/document for a newly submitted request. */
  startApproval(request: HrRequestDoc, employee: EmployeeDoc): Promise<ExternalRef>;
  /** Close the route with the final outcome. */
  finishApproval(
    request: HrRequestDoc,
    outcome: "approved" | "rejected" | "cancelled",
  ): Promise<ExternalRef>;
}

export interface Integrations {
  hrCore: HrCorePort;
  documentflow: DocumentflowPort;
}
