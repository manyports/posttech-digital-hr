import type {
  AssignmentDoc,
  AssistantLogDoc,
  CourseDoc,
  EmployeeDoc,
  EscalationDoc,
  HrRequestDoc,
  NotificationDoc,
  SessionDoc,
} from "../../domain/types";

/**
 * Minimal, MongoDB-compatible collection interface.
 *
 * Services only talk to this interface, so the same business logic runs on
 *  - MemoryDb  (default: zero setup, fake data seeded at first use), and
 *  - MongoDb   (when MONGODB_URI is set: persistent, serverless-friendly).
 *
 * Supported filter syntax (a strict subset of MongoDB's):
 *   { field: value }  { field: { $in: [...] } }  { field: { $ne: value } }
 *   { field: { $gte: number } }
 * Supported update operators: $set, $push, $inc.
 */
export type Filter = Record<string, unknown>;

export interface UpdateOps {
  $set?: Record<string, unknown>;
  $push?: Record<string, unknown>;
  $inc?: Record<string, number>;
}

export interface FindOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
}

export interface Collection<T extends { _id: string }> {
  find(filter?: Filter, opts?: FindOptions): Promise<T[]>;
  findOne(filter: Filter): Promise<T | null>;
  count(filter?: Filter): Promise<number>;
  insertOne(doc: T): Promise<void>;
  insertMany(docs: T[]): Promise<void>;
  /**
   * Atomic compare-and-set: applies `update` to the first document matching
   * `filter` and reports whether one matched. Including the expected current
   * state in `filter` (e.g. `status: "submitted"`) gives optimistic
   * concurrency, so two concurrent approvals cannot both succeed.
   */
  updateOne(filter: Filter, update: UpdateOps): Promise<boolean>;
  deleteMany(filter?: Filter): Promise<number>;
}

export interface Db {
  readonly kind: "memory" | "mongodb";
  employees: Collection<EmployeeDoc>;
  requests: Collection<HrRequestDoc>;
  notifications: Collection<NotificationDoc>;
  courses: Collection<CourseDoc>;
  assignments: Collection<AssignmentDoc>;
  escalations: Collection<EscalationDoc>;
  assistantLog: Collection<AssistantLogDoc>;
  sessions: Collection<SessionDoc>;
  /** Monotonic counters for human-friendly ids (REQ-0001, ESC-0001, ...). */
  nextSeq(name: string): Promise<number>;
}

/** Collections wiped (and re-seeded) by the demo reset. Sessions survive. */
export const RESETTABLE = [
  "employees",
  "requests",
  "notifications",
  "courses",
  "assignments",
  "escalations",
  "assistantLog",
] as const;
