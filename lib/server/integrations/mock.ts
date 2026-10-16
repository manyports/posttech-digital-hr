import type { DocumentflowPort, ExternalRef, HrCorePort } from "./ports";

/**
 * In-process mocks for 1C:ZUP and Documentolog. They return plausible
 * references so the UI can show "synced" badges, but talk to nothing.
 */

const suffix = (requestId: string) => requestId.replace(/\D/g, "").padStart(4, "0");
const year = () => new Date().getUTCFullYear();

export const mockHrCore: HrCorePort = {
  name: "1C:ZUP",
  async getVacationBalance(employee) {
    return employee.vacationBalance;
  },
  async registerVacation(request): Promise<ExternalRef> {
    return { ref: `ZUP-ORD-${suffix(request._id)}`, state: "registered (mock)" };
  },
  async registerAdvance(request): Promise<ExternalRef> {
    return { ref: `ZUP-ADV-${suffix(request._id)}`, state: "registered (mock)" };
  },
};

export const mockDocumentflow: DocumentflowPort = {
  name: "Documentolog",
  async startApproval(request): Promise<ExternalRef> {
    return { ref: `DL-${year()}-${suffix(request._id)}`, state: "routing (mock)" };
  },
  async finishApproval(request, outcome): Promise<ExternalRef> {
    return { ref: `DL-${year()}-${suffix(request._id)}`, state: `${outcome} (mock)` };
  },
};
