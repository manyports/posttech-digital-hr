/**
 * Domain model shared by the server (services, DB adapters) and the client
 * (type-only imports). Everything in this project is FICTIONAL mock data.
 *
 * Naming: `*Doc` = shape stored in the database (server-only, may hold
 * sensitive fields). `*View` = shape returned by the API (already filtered
 * for the caller by the service layer).
 */

/* ── People ─────────────────────────────────────────────────────────── */

export type Role = "employee" | "manager" | "hr";

export interface EmployeeDoc {
  _id: string; // e.g. "emp-e1"
  email: string;
  fullName: string;
  role: Role;
  company: string;
  position: string;
  department: string;
  managerId: string | null;
  hireDate: string; // YYYY-MM-DD
  location: string;
  employeeNumber: string;
  vacationEntitlement: number; // working days per year
  vacationBalance: number; // remaining working days (deducted on approval)
  /** SENSITIVE: never returned by the API. Used only for advance limits. */
  monthlySalary: number;
  active: boolean;
}

/** What other people may see about an employee (no balances, no salary). */
export interface EmployeeSummary {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  position: string;
  department: string;
  managerId: string | null;
  managerName: string | null;
}

/** Full profile: returned only to the owner, their direct manager, or HR. */
export interface ProfileView extends EmployeeSummary {
  company: string;
  hireDate: string;
  location: string;
  employeeNumber: string;
  vacation: {
    entitlement: number;
    remaining: number;
    pending: number; // days in not-yet-decided requests
    available: number; // remaining - pending
  };
}

/* ── Requests ───────────────────────────────────────────────────────── */

export type RequestType = "vacation" | "salary_advance";

export type RequestStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected"
  | "cancelled";

export interface VacationPayload {
  kind: "vacation";
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number; // working days (Mon-Fri)
  comment?: string;
}

export interface AdvancePayload {
  kind: "salary_advance";
  amount: number;
  currency: "KZT";
  reason: string;
}

export type RequestPayload = VacationPayload | AdvancePayload;

export interface RequestEvent {
  at: string; // ISO timestamp
  status: RequestStatus;
  actorId: string;
  actorName: string;
  note: string; // short system text, e.g. "Request submitted"
  comment?: string; // free text from the actor
}

/** Handles returned by (mock) external systems, see lib/server/integrations. */
export interface IntegrationRefs {
  documentolog?: { ref: string; state: string };
  zup?: { ref: string; state: string };
}

export interface HrRequestDoc {
  _id: string; // e.g. "REQ-0001"
  type: RequestType;
  employeeId: string;
  approverId: string; // direct manager, or HR for people without a manager
  status: RequestStatus;
  payload: RequestPayload;
  createdAt: string;
  updatedAt: string;
  history: RequestEvent[];
  integration: IntegrationRefs;
}

export type RequestAction = "submit" | "start_review" | "approve" | "reject" | "cancel";

export interface RequestView {
  id: string;
  type: RequestType;
  status: RequestStatus;
  employee: { id: string; fullName: string; position: string };
  approver: { id: string; fullName: string };
  payload: RequestPayload;
  createdAt: string;
  updatedAt: string;
  history: RequestEvent[];
  integration: IntegrationRefs;
  /** Actions the *current caller* may perform right now (server-computed). */
  allowedActions: RequestAction[];
}

/* ── Notifications ──────────────────────────────────────────────────── */

export type NotificationKind = "request" | "course" | "escalation" | "system";

export interface NotificationDoc {
  _id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  readAt: string | null;
}

export type NotificationView = Omit<NotificationDoc, "userId" | "_id"> & { id: string };

/* ── Jana Academy ───────────────────────────────────────────────────── */

export interface Lesson {
  id: string; // unique within the course, e.g. "l1"
  title: string;
  durationMin: number;
  summary: string; // one sentence
  body: string[]; // paragraphs
  keyPoints: string[];
}

export interface TestQuestion {
  id: string; // e.g. "q1"
  text: string;
  options: string[]; // 3-4 options
  correctIndex: number; // SERVER-ONLY: stripped before sending to clients
}

export interface CourseDoc {
  _id: string; // e.g. "course-infosec"
  title: string;
  description: string;
  category: string;
  durationMin: number;
  mandatory: boolean;
  lessons: Lesson[];
  test: { passScore: number; questions: TestQuestion[] }; // passScore in percent
}

export type AssignmentStatus = "assigned" | "in_progress" | "completed";

export interface TestAttempt {
  at: string;
  score: number; // percent, 0-100
  correct: number;
  total: number;
  passed: boolean;
  answers: number[]; // chosen option index per question, -1 = unanswered
}

export interface AssignmentDoc {
  _id: string; // e.g. "asg-0001"
  userId: string;
  courseId: string;
  assignedById: string;
  assignedAt: string;
  dueDate: string; // YYYY-MM-DD
  status: AssignmentStatus;
  startedAt: string | null;
  openedLessonIds: string[];
  completedLessonIds: string[];
  lastLessonId: string | null;
  attempts: TestAttempt[];
  bestScore: number | null;
  completedAt: string | null;
}

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMin: number;
  mandatory: boolean;
  lessonCount: number;
  questionCount: number;
  passScore: number;
}

export interface AssignmentView {
  id: string;
  course: CourseSummary;
  userId: string;
  assignedBy: { id: string; fullName: string };
  assignedAt: string;
  dueDate: string;
  overdue: boolean;
  status: AssignmentStatus;
  /** 0-100. Lessons completed + passing the test, each a step. */
  progress: number;
  completedLessons: number;
  bestScore: number | null;
  completedAt: string | null;
  attemptCount: number;
}

export interface LessonView extends Lesson {
  opened: boolean;
  completed: boolean;
}

export interface AssignmentDetailView extends AssignmentView {
  lessons: LessonView[];
  lastLessonId: string | null;
  testUnlocked: boolean;
  attempts: Omit<TestAttempt, "answers">[];
  /** Questions WITHOUT the correct answer. */
  questions: { id: string; text: string; options: string[] }[];
}

export interface TestResultView {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  passScore: number;
  /** Per-question outcome. Only whether it was right, never the right answer. */
  review: { questionId: string; correct: boolean }[];
  assignment: AssignmentView;
}

/* ── Al Jana (HR assistant) ─────────────────────────────────────────── */

export interface KbSource {
  docId: string; // e.g. "HR-POL-01"
  docTitle: string; // e.g. "Leave Policy"
  section: string; // e.g. "§2.1 Annual paid leave"
  revision: string; // e.g. "rev. 2025-01"
  owner: string; // e.g. "HR Department"
}

export interface KbEntry {
  id: string;
  title: string;
  /** Example phrasings of the question this entry answers (used for matching). */
  questions: string[];
  /** Extra match terms: synonyms, jargon, abbreviations. */
  keywords: string[];
  /** The ONLY text ever shown to the user for this entry. Written by HR. */
  answer: string;
  /** Optional Russian text; if omitted, Al Jana uses the legacy translation. */
  answerRu?: string;
  source: KbSource;
  /** Optional deep link into the portal. */
  action?: { label: string; href: string };
  /** Ids of related entries, shown as follow-up suggestions. */
  related?: string[];
}

export interface KnowledgeArticleVersion {
  version: number;
  entry: KbEntry;
  editorId: string;
  editorName: string;
  savedAt: string;
  publishedAt: string;
}

export interface KnowledgeArticleDoc {
  _id: string;
  ownerId: string;
  ownerName: string;
  currentVersion: number;
  draft: KbEntry | null;
  versions: KnowledgeArticleVersion[];
  updatedAt: string;
}

export type AssistantReply =
  | {
      kind: "answer";
      question: string;
      entryId: string;
      title: string;
      answer: string;
      source: KbSource;
      action?: { label: string; href: string };
      related: { entryId: string; question: string }[];
      confidence: number; // 0-1
    }
  | {
      kind: "no_answer";
      question: string;
      message: string;
      suggestions: string[];
      canEscalate: true;
    }
  | {
      kind: "smalltalk";
      question: string;
      message: string;
      suggestions: string[];
    };

export interface EscalationDoc {
  _id: string; // e.g. "ESC-0001"
  userId: string;
  question: string;
  createdAt: string;
  status: "open" | "answered";
  answer?: string;
  answeredById?: string;
  answeredAt?: string;
}

export interface EscalationView {
  id: string;
  question: string;
  createdAt: string;
  status: "open" | "answered";
  answer?: string;
  answeredAt?: string;
  employee: { id: string; fullName: string };
}

export interface AssistantLogDoc {
  _id: string;
  userId: string;
  question: string;
  outcome: "answered" | "no_answer" | "smalltalk";
  entryId?: string;
  createdAt: string;
}

/* ── Auth ───────────────────────────────────────────────────────────── */

export interface SessionDoc {
  _id: string; // opaque random token (cookie value), generated at runtime
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  position: string;
  department: string;
}
