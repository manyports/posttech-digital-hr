/**
 * Demo seed. EVERYTHING here is fictional: invented people at the invented
 * company "Jana Group", example.com-style addresses, no real data, and no
 * passwords or tokens of any kind.
 *
 * Org chart
 *   Timur Bekov (CEO, manager role)
 *   |- Aigerim Sadykova   HR Director            [hr]
 *   |- Daniyar Omarov     Head of Engineering    [manager]  team A
 *   |    |- Aruzhan Kassymova, Nurlan Abenov, Dana Zhaksylykova, Yerlan Sagyndykov
 *   |- Madina Tleuova     Head of Marketing      [manager]  team B
 *        |- Alikhan Ryskulov, Zhanel Amirkhanova, Kamila Sultanova
 */
import { addDays, nextWeekday, todayISO, workingDays } from "../domain/dates";
import type {
  AssignmentDoc,
  CourseDoc,
  EmployeeDoc,
  HrRequestDoc,
  NotificationDoc,
  RequestEvent,
  TestAttempt,
} from "../domain/types";
import { COURSES } from "./courses";

export const COMPANY = "Jana Group";
const DOMAIN = "jana.example";

export interface SeedData {
  employees: EmployeeDoc[];
  courses: CourseDoc[];
  requests: HrRequestDoc[];
  notifications: NotificationDoc[];
  assignments: AssignmentDoc[];
}

type PersonInput = Omit<
  EmployeeDoc,
  "company" | "email" | "active" | "vacationEntitlement" | "employeeNumber"
> & { emailLocal: string; n: number };

const PEOPLE: PersonInput[] = [
  { _id: "emp-ceo", emailLocal: "timur.bekov", n: 1, fullName: "Timur Bekov", role: "manager", position: "Chief Executive Officer", department: "Executive", managerId: null, hireDate: "2016-03-01", location: "Almaty", vacationBalance: 20, monthlySalary: 2_000_000 },
  { _id: "emp-hr1", emailLocal: "aigerim.sadykova", n: 2, fullName: "Aigerim Sadykova", role: "hr", position: "HR Director", department: "Human Resources", managerId: "emp-ceo", hireDate: "2018-09-10", location: "Almaty", vacationBalance: 12, monthlySalary: 900_000 },
  { _id: "emp-m1", emailLocal: "daniyar.omarov", n: 3, fullName: "Daniyar Omarov", role: "manager", position: "Head of Engineering", department: "Engineering", managerId: "emp-ceo", hireDate: "2019-02-18", location: "Almaty", vacationBalance: 14, monthlySalary: 1_100_000 },
  { _id: "emp-m2", emailLocal: "madina.tleuova", n: 4, fullName: "Madina Tleuova", role: "manager", position: "Head of Marketing", department: "Marketing", managerId: "emp-ceo", hireDate: "2020-06-01", location: "Astana", vacationBalance: 17, monthlySalary: 950_000 },
  { _id: "emp-e1", emailLocal: "aruzhan.kassymova", n: 5, fullName: "Aruzhan Kassymova", role: "employee", position: "Senior Frontend Developer", department: "Engineering", managerId: "emp-m1", hireDate: "2021-04-12", location: "Almaty", vacationBalance: 15, monthlySalary: 650_000 },
  { _id: "emp-e2", emailLocal: "nurlan.abenov", n: 6, fullName: "Nurlan Abenov", role: "employee", position: "Backend Developer", department: "Engineering", managerId: "emp-m1", hireDate: "2022-01-24", location: "Almaty", vacationBalance: 20, monthlySalary: 600_000 },
  { _id: "emp-e3", emailLocal: "dana.zhaksylykova", n: 7, fullName: "Dana Zhaksylykova", role: "employee", position: "QA Engineer", department: "Engineering", managerId: "emp-m1", hireDate: "2023-05-15", location: "Astana", vacationBalance: 18, monthlySalary: 480_000 },
  { _id: "emp-e4", emailLocal: "yerlan.sagyndykov", n: 8, fullName: "Yerlan Sagyndykov", role: "employee", position: "DevOps Engineer", department: "Engineering", managerId: "emp-m1", hireDate: "2020-11-02", location: "Almaty", vacationBalance: 15, monthlySalary: 620_000 },
  { _id: "emp-e5", emailLocal: "alikhan.ryskulov", n: 9, fullName: "Alikhan Ryskulov", role: "employee", position: "Marketing Specialist", department: "Marketing", managerId: "emp-m2", hireDate: "2022-08-08", location: "Astana", vacationBalance: 20, monthlySalary: 420_000 },
  { _id: "emp-e6", emailLocal: "zhanel.amirkhanova", n: 10, fullName: "Zhanel Amirkhanova", role: "employee", position: "Content Manager", department: "Marketing", managerId: "emp-m2", hireDate: "2023-09-04", location: "Astana", vacationBalance: 20, monthlySalary: 400_000 },
  { _id: "emp-e7", emailLocal: "kamila.sultanova", n: 11, fullName: "Kamila Sultanova", role: "employee", position: "Graphic Designer", department: "Marketing", managerId: "emp-m2", hireDate: "2024-02-19", location: "Almaty", vacationBalance: 20, monthlySalary: 380_000 },
];

/** Demo personas shown on the login screen (public, fake, no secrets). */
export const DEMO_PERSONAS = [
  { email: `aruzhan.kassymova@${DOMAIN}`, label: "Employee", hint: "Senior Frontend Developer · Engineering" },
  { email: `daniyar.omarov@${DOMAIN}`, label: "Manager", hint: "Head of Engineering · 4 direct reports" },
  { email: `aigerim.sadykova@${DOMAIN}`, label: "HR / Admin", hint: "HR Director · sees the whole company" },
  { email: `alikhan.ryskulov@${DOMAIN}`, label: "Employee (other team)", hint: "Marketing · reports to Madina" },
  { email: `madina.tleuova@${DOMAIN}`, label: "Manager (other team)", hint: "Head of Marketing · 3 direct reports" },
] as const;

const isoAt = (now: Date, daysAgo: number, hour = 10) => {
  const d = new Date(now.getTime() - daysAgo * 86_400_000);
  d.setUTCHours(hour, (daysAgo * 7) % 60, 0, 0);
  return d.toISOString();
};

export function buildSeed(now: Date = new Date()): SeedData {
  const today = todayISO(now);
  const name = (id: string) => PEOPLE.find((p) => p._id === id)!.fullName;

  const employees: EmployeeDoc[] = PEOPLE.map(({ emailLocal, n, ...p }) => ({
    ...p,
    email: `${emailLocal}@${DOMAIN}`,
    company: COMPANY,
    employeeNumber: `JN-${String(1000 + n).padStart(4, "0")}`,
    vacationEntitlement: 20,
    active: true,
  }));

  /* ── Requests ─────────────────────────────────────────────────────── */
  const ev = (
    daysAgo: number,
    status: RequestEvent["status"],
    actorId: string,
    note: string,
    comment?: string,
  ): RequestEvent => ({
    at: isoAt(now, daysAgo, 9 + (daysAgo % 6)),
    status,
    actorId,
    actorName: name(actorId),
    note,
    ...(comment ? { comment } : {}),
  });

  const pastStart = nextWeekday(addDays(today, -100), 1);
  const pastEnd = addDays(pastStart, 4);
  const futureStartA = nextWeekday(addDays(today, 30), 1);
  const futureEndA = addDays(futureStartA, 11);
  const futureStartB = nextWeekday(addDays(today, 45), 1);
  const futureEndB = addDays(futureStartB, 4);
  const futureStartC = nextWeekday(addDays(today, 21), 1);
  const futureEndC = addDays(futureStartC, 6);
  const futureStartD = nextWeekday(addDays(today, 60), 1);
  const futureEndD = addDays(futureStartD, 4);

  const requests: HrRequestDoc[] = [
    {
      _id: "REQ-1001", type: "vacation", employeeId: "emp-e1", approverId: "emp-m1", status: "approved",
      payload: { kind: "vacation", startDate: pastStart, endDate: pastEnd, days: workingDays(pastStart, pastEnd), comment: "Family trip" },
      createdAt: isoAt(now, 130), updatedAt: isoAt(now, 128),
      history: [
        ev(130, "submitted", "emp-e1", "Request submitted"),
        ev(129, "in_review", "emp-m1", "Manager started review"),
        ev(128, "approved", "emp-m1", "Approved by manager", "Enjoy the break!"),
      ],
      integration: { documentolog: { ref: "DL-2026-0101", state: "completed" }, zup: { ref: "ZUP-ORD-0101", state: "registered" } },
    },
    {
      _id: "REQ-1002", type: "salary_advance", employeeId: "emp-e1", approverId: "emp-m1", status: "rejected",
      payload: { kind: "salary_advance", amount: 200_000, currency: "KZT", reason: "Car repair" },
      createdAt: isoAt(now, 41), updatedAt: isoAt(now, 40),
      history: [
        ev(41, "submitted", "emp-e1", "Request submitted"),
        ev(41, "in_review", "emp-m1", "Manager started review"),
        ev(40, "rejected", "emp-m1", "Rejected by manager", "Payroll is closing this week. Please resubmit after the 10th."),
      ],
      integration: { documentolog: { ref: "DL-2026-0102", state: "completed" } },
    },
    {
      _id: "REQ-1003", type: "vacation", employeeId: "emp-e2", approverId: "emp-m1", status: "submitted",
      payload: { kind: "vacation", startDate: futureStartA, endDate: futureEndA, days: workingDays(futureStartA, futureEndA), comment: "Summer holiday" },
      createdAt: isoAt(now, 1), updatedAt: isoAt(now, 1),
      history: [ev(1, "submitted", "emp-e2", "Request submitted")],
      integration: { documentolog: { ref: "DL-2026-0103", state: "routing" } },
    },
    {
      _id: "REQ-1004", type: "salary_advance", employeeId: "emp-e3", approverId: "emp-m1", status: "in_review",
      payload: { kind: "salary_advance", amount: 150_000, currency: "KZT", reason: "Medical expenses" },
      createdAt: isoAt(now, 2), updatedAt: isoAt(now, 1),
      history: [
        ev(2, "submitted", "emp-e3", "Request submitted"),
        ev(1, "in_review", "emp-m1", "Manager started review"),
      ],
      integration: { documentolog: { ref: "DL-2026-0104", state: "routing" } },
    },
    {
      _id: "REQ-1005", type: "vacation", employeeId: "emp-e4", approverId: "emp-m1", status: "approved",
      payload: { kind: "vacation", startDate: futureStartB, endDate: futureEndB, days: workingDays(futureStartB, futureEndB) },
      createdAt: isoAt(now, 9), updatedAt: isoAt(now, 7),
      history: [
        ev(9, "submitted", "emp-e4", "Request submitted"),
        ev(8, "in_review", "emp-m1", "Manager started review"),
        ev(7, "approved", "emp-m1", "Approved by manager"),
      ],
      integration: { documentolog: { ref: "DL-2026-0105", state: "completed" }, zup: { ref: "ZUP-ORD-0102", state: "registered" } },
    },
    {
      _id: "REQ-1006", type: "vacation", employeeId: "emp-e5", approverId: "emp-m2", status: "submitted",
      payload: { kind: "vacation", startDate: futureStartC, endDate: futureEndC, days: workingDays(futureStartC, futureEndC), comment: "Visiting family" },
      createdAt: isoAt(now, 1, 15), updatedAt: isoAt(now, 1, 15),
      history: [ev(1, "submitted", "emp-e5", "Request submitted")],
      integration: { documentolog: { ref: "DL-2026-0106", state: "routing" } },
    },
    {
      _id: "REQ-1007", type: "vacation", employeeId: "emp-m1", approverId: "emp-ceo", status: "submitted",
      payload: { kind: "vacation", startDate: futureStartD, endDate: futureEndD, days: workingDays(futureStartD, futureEndD) },
      createdAt: isoAt(now, 0, 8), updatedAt: isoAt(now, 0, 8),
      history: [ev(0, "submitted", "emp-m1", "Request submitted")],
      integration: { documentolog: { ref: "DL-2026-0107", state: "routing" } },
    },
  ];

  // Keep the stored balance consistent with approved seed requests.
  const used = new Map<string, number>();
  for (const r of requests) {
    if (r.status === "approved" && r.payload.kind === "vacation") {
      used.set(r.employeeId, (used.get(r.employeeId) ?? 0) + r.payload.days);
    }
  }
  for (const e of employees) {
    if (used.has(e._id)) e.vacationBalance = e.vacationEntitlement - used.get(e._id)!;
  }

  /* ── Academy assignments ──────────────────────────────────────────── */
  const course = (id: string) => COURSES.find((c) => c._id === id)!;
  const allCorrect = (c: CourseDoc) => c.test.questions.map((q) => q.correctIndex);
  const attempt = (c: CourseDoc, daysAgo: number, wrong = 0): TestAttempt => {
    const answers = allCorrect(c);
    for (let i = 0; i < wrong; i++) {
      const idx = answers.length - 1 - i;
      answers[idx] = (answers[idx] + 1) % c.test.questions[idx].options.length;
    }
    const total = answers.length;
    const correct = total - wrong;
    const score = Math.round((correct / total) * 100);
    return { at: isoAt(now, daysAgo, 14), score, correct, total, passed: score >= c.test.passScore, answers };
  };
  const base = (
    id: string, userId: string, courseId: string, assignedById: string,
    assignedDaysAgo: number, dueInDays: number,
  ): AssignmentDoc => ({
    _id: id, userId, courseId, assignedById,
    assignedAt: isoAt(now, assignedDaysAgo, 9),
    dueDate: addDays(today, dueInDays),
    status: "assigned", startedAt: null,
    openedLessonIds: [], completedLessonIds: [], lastLessonId: null,
    attempts: [], bestScore: null, completedAt: null,
  });

  const infosec = course("course-infosec");
  const onboard = course("course-onboard");

  const a1 = base("asg-1001", "emp-e1", "course-infosec", "emp-hr1", 5, 25);
  a1.status = "in_progress";
  a1.startedAt = isoAt(now, 3, 11);
  a1.openedLessonIds = ["l1", "l2"];
  a1.completedLessonIds = ["l1", "l2"];
  a1.lastLessonId = "l2";

  const a4 = base("asg-1004", "emp-e3", "course-infosec", "emp-hr1", 20, 10);
  a4.status = "completed";
  a4.startedAt = isoAt(now, 12, 11);
  a4.openedLessonIds = infosec.lessons.map((l) => l.id);
  a4.completedLessonIds = infosec.lessons.map((l) => l.id);
  a4.lastLessonId = infosec.lessons.at(-1)!.id;
  a4.attempts = [attempt(infosec, 3, 1)];
  a4.bestScore = a4.attempts[0].score;
  a4.completedAt = a4.attempts[0].at;

  const a8 = base("asg-1008", "emp-e1", "course-onboard", "emp-hr1", 70, -40);
  a8.status = "completed";
  a8.startedAt = isoAt(now, 68, 11);
  a8.openedLessonIds = onboard.lessons.map((l) => l.id);
  a8.completedLessonIds = onboard.lessons.map((l) => l.id);
  a8.lastLessonId = onboard.lessons.at(-1)!.id;
  a8.attempts = [attempt(onboard, 66)];
  a8.bestScore = 100;
  a8.completedAt = a8.attempts[0].at;

  const assignments: AssignmentDoc[] = [
    a1,
    base("asg-1002", "emp-e1", "course-conduct", "emp-m1", 4, 30),
    base("asg-1003", "emp-e2", "course-infosec", "emp-hr1", 5, 25),
    a4,
    base("asg-1005", "emp-e5", "course-conduct", "emp-m2", 3, 28),
    base("asg-1006", "emp-m1", "course-1on1", "emp-hr1", 6, 30),
    base("asg-1007", "emp-e4", "course-remote", "emp-m1", 2, 20),
    a8,
  ];

  /* ── Notifications ────────────────────────────────────────────────── */
  let nid = 0;
  const ntf = (
    userId: string, kind: NotificationDoc["kind"], title: string, body: string,
    href: string, daysAgo: number, read: boolean,
  ): NotificationDoc => ({
    _id: `ntf-s${++nid}`, userId, kind, title, body, href,
    createdAt: isoAt(now, daysAgo, 12), readAt: read ? isoAt(now, daysAgo, 13) : null,
  });

  const notifications: NotificationDoc[] = [
    ntf("emp-e1", "request", "Vacation request approved", "Your vacation request REQ-1001 was approved by Daniyar Omarov.", "/requests/REQ-1001", 128, true),
    ntf("emp-e1", "request", "Salary advance rejected", "Your salary advance request REQ-1002 was rejected. See the manager's comment.", "/requests/REQ-1002", 40, true),
    ntf("emp-e1", "course", "New course assigned", "Information Security Basics was assigned to you by Aigerim Sadykova. Due in 25 days.", "/academy/asg-1001", 5, false),
    ntf("emp-e1", "course", "New course assigned", "Code of Conduct & Ethics was assigned to you by Daniyar Omarov.", "/academy/asg-1002", 4, false),
    ntf("emp-e2", "course", "New course assigned", "Information Security Basics was assigned to you by Aigerim Sadykova.", "/academy/asg-1003", 5, false),
    ntf("emp-e3", "course", "Course completed", "You completed Information Security Basics.", "/academy/asg-1004", 3, true),
    ntf("emp-e5", "course", "New course assigned", "Code of Conduct & Ethics was assigned to you by Madina Tleuova.", "/academy/asg-1005", 3, false),
    ntf("emp-m1", "request", "New vacation request", "Nurlan Abenov submitted a vacation request (REQ-1003) for your review.", "/approvals", 1, false),
    ntf("emp-m1", "request", "Salary advance awaiting decision", "Dana Zhaksylykova's salary advance (REQ-1004) is in review.", "/approvals", 1, true),
    ntf("emp-m1", "course", "New course assigned", "Running Effective 1:1s was assigned to you by Aigerim Sadykova.", "/academy/asg-1006", 6, false),
    ntf("emp-m2", "request", "New vacation request", "Alikhan Ryskulov submitted a vacation request (REQ-1006) for your review.", "/approvals", 1, false),
    ntf("emp-ceo", "request", "New vacation request", "Daniyar Omarov submitted a vacation request (REQ-1007) for your review.", "/approvals", 0, false),
    ntf("emp-hr1", "system", "Welcome to Digital HR", "You have company-wide access. Escalated Al Jana questions will appear in the HR inbox.", "/hr", 7, true),
  ];

  return { employees, courses: COURSES.map((c) => structuredClone(c)), requests, notifications, assignments };
}
