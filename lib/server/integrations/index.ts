import { mockDocumentflow, mockHrCore } from "./mock";
import type { Integrations } from "./ports";

/**
 * Composition root for external systems. Swap an adapter here (e.g. based on
 * `process.env.HR_CORE_ADAPTER === "zup"`) to go from mock to real.
 */
export const integrations: Integrations = {
  hrCore: mockHrCore,
  documentflow: mockDocumentflow,
};

export type { Integrations } from "./ports";
