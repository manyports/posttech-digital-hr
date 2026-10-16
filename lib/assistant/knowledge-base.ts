/**
 * Al Jana knowledge base.
 *
 * ⚠ FICTIONAL SAMPLE DATA. "Jana Group", its documents, revisions, numbers and
 * rules are invented for this hackathon prototype. They are NOT real HR policy
 * or legal advice.
 *
 * Rules for editing this file:
 *  - `answer` is the ONLY text ever shown to the user for an entry. The engine
 *    shows it verbatim, so every claim must be written (and checked) here.
 *  - Facts about vacation, requests, salary advances, Jana Academy, payslips
 *    and documents mirror what the real portal enforces. Keep them in sync.
 *  - Topics we deliberately do NOT cover (parental leave, equity, bonuses and
 *    salary levels, relocation, pets, dress code, IT support, legal advice)
 *    must not appear here, so Al Jana answers "no answer" and offers to
 *    forward the question to HR.
 */

import type { KbEntry, KbSource } from "../domain/types";

const HR = "HR Department";

function src(
  docId: string,
  docTitle: string,
  section: string,
  revision: string,
  owner: string = HR,
): KbSource {
  return { docId, docTitle, section, revision, owner };
}

const LEAVE = (section: string, rev = "rev. 2025-01") =>
  src("HR-POL-01", "Leave Policy", section, rev);
const SICK = (section: string) =>
  src("HR-POL-02", "Sick Leave Policy", section, "rev. 2024-11");
const TIME = (section: string) =>
  src("HR-POL-03", "Working Time & Remote Work Policy", section, "rev. 2025-02");
const PAY = (section: string) =>
  src("HR-POL-04", "Payroll & Salary Advance Policy", section, "rev. 2025-03", "Finance & HR");
const BEN = (section: string) =>
  src("HR-POL-05", "Benefits Guide", section, "rev. 2025-01");
const TRAVEL = (section: string) =>
  src("HR-POL-06", "Business Travel Policy", section, "rev. 2024-09", "Finance");
const LIFE = (section: string) =>
  src("HR-POL-07", "Employment Lifecycle Handbook", section, "rev. 2025-02");
const ACADEMY = (section: string) =>
  src("HR-POL-08", "Jana Academy Training Policy", section, "rev. 2025-04");
const GUIDE = (section: string) =>
  src("HR-GUIDE-01", "Digital HR Portal User Guide", section, "rev. 2025-05");

export const KB: KbEntry[] = [
  /* ── Leave (HR-POL-01) ─────────────────────────────────────────────── */
  {
    id: "annual-leave-entitlement",
    title: "Annual paid leave entitlement",
    questions: [
      "How many days of annual leave am I entitled to?",
      "What is the annual vacation entitlement at Jana Group?",
      "How many days of vacation do we have?",
      "What is my yearly holiday allowance?",
      "How much paid time off do employees get each year?",
      "How many vacation days do employees get per year?",
    ],
    keywords: [
      "entitlement",
      "allowance",
      "paid vacation",
      "paid leave",
      "pto",
      "per year",
      "20 days",
      "working days",
      "weekends",
    ],
    answer:
      "Every employee is entitled to 20 paid vacation days per year. Vacation is counted in working days (Monday to Friday), so weekends are not counted.",
    source: LEAVE("§2.1 Annual paid leave"),
    related: ["vacation-balance-personal", "how-to-request-vacation", "leave-carry-over"],
  },
  {
    id: "vacation-balance-personal",
    title: "Checking your remaining vacation balance",
    questions: [
      "How many vacation days do I have left?",
      "What is my remaining vacation balance?",
      "Where can I find my vacation balance?",
      "How many days of leave are still available to me?",
      "Where do I look up how much leave I have remaining?",
    ],
    keywords: [
      "balance",
      "remaining",
      "left",
      "available",
      "days left",
      "my balance",
      "profile",
      "used days",
    ],
    answer:
      "Employees receive 20 working days of paid vacation per year. Your exact personal balance is shown on the Profile page of the Digital HR portal: it lists the days you have remaining and the days still available after pending requests.",
    source: GUIDE("§3.2 Profile page and vacation balance"),
    action: { label: "Open my profile", href: "/profile" },
    related: [
      "annual-leave-entitlement",
      "vacation-balance-deduction",
      "how-to-request-vacation",
    ],
  },
  {
    id: "how-to-request-vacation",
    title: "How to request vacation",
    questions: [
      "How do I request vacation?",
      "How can I apply for leave in the portal?",
      "What are the steps to book time off?",
      "Where do I submit a vacation request?",
      "How do I enter my holiday dates in the portal?",
    ],
    keywords: ["apply", "submit", "book", "new request", "my requests", "portal", "dates"],
    answer:
      "Open the Digital HR portal, go to \"My requests\" and click \"New request\". Choose Vacation, pick your dates and submit.",
    source: LEAVE("§3.1 Requesting vacation"),
    action: { label: "Open My requests", href: "/requests" },
    related: ["vacation-approval-flow", "vacation-request-rules", "vacation-lead-time"],
  },
  {
    id: "vacation-approval-flow",
    title: "Request statuses and who approves",
    questions: [
      "Who approves my vacation request?",
      "What happens after I submit a vacation request?",
      "How does the approval process for leave work?",
      "What do the request statuses mean?",
      "What if I have no manager, who approves my request?",
      "Can my manager reject my request and tell me why?",
    ],
    keywords: [
      "approval",
      "approve",
      "reject",
      "status",
      "submitted",
      "in review",
      "decision",
      "manager",
      "comment",
      "approver",
    ],
    answer:
      "A request moves from Submitted to In review (your direct manager picks it up) and then to Approved or Rejected. The manager can add a comment with the decision. HR can act on any request, and employees without a manager are approved by HR. You get a notification at every step.",
    source: LEAVE("§3.2 Approval process"),
    action: { label: "Open My requests", href: "/requests" },
    related: ["cancel-request", "notifications", "how-to-request-vacation"],
  },
  {
    id: "vacation-balance-deduction",
    title: "When vacation days are deducted",
    questions: [
      "When are vacation days deducted from my balance?",
      "Are days taken off my balance when I submit or when it is approved?",
      "What does pending mean for my vacation days?",
      "Why is my available vacation lower than my remaining balance?",
      "Do pending requests reduce my available days?",
    ],
    keywords: ["deducted", "deduction", "pending", "reserved", "available", "remaining", "balance"],
    answer:
      "Vacation days are deducted from your balance only when the request is finally approved. While a request is pending, its days are reserved: the portal shows \"available\" days as your remaining balance minus the pending days.",
    source: LEAVE("§3.3 Balance and reserved days"),
    action: { label: "Open my profile", href: "/profile" },
    related: ["vacation-balance-personal", "vacation-request-rules"],
  },
  {
    id: "vacation-request-rules",
    title: "Rules for vacation requests",
    questions: [
      "Can I request vacation for dates in the past?",
      "Why won't the portal accept my vacation request?",
      "Can two vacation requests overlap?",
      "Can I ask for more days than I have available?",
      "Which conditions must a vacation request meet?",
    ],
    keywords: ["past", "overlap", "exceed", "available days", "error", "blocked", "conditions", "not accepted"],
    answer:
      "A vacation request cannot be in the past, cannot overlap another active request of yours, and cannot exceed your available days.",
    source: LEAVE("§3.4 Request conditions"),
    related: ["how-to-request-vacation", "vacation-balance-deduction"],
  },
  {
    id: "vacation-lead-time",
    title: "How early to submit vacation",
    questions: [
      "How early should I submit a vacation request?",
      "How far ahead should I ask for a long vacation?",
      "Is there a minimum lead time for requesting leave?",
      "How many weeks before my holiday should I apply?",
      "Do I have to apply for time off beforehand?",
    ],
    keywords: [
      "lead time",
      "beforehand",
      "early",
      "notice",
      "14 days",
      "two weeks",
      "recommendation",
      "5 days",
    ],
    answer:
      "For vacation of 5 or more working days we recommend submitting the request at least 14 calendar days before it starts. This is a recommendation, not a requirement enforced by the portal.",
    source: LEAVE("§3.5 Recommended lead time"),
    related: ["how-to-request-vacation", "vacation-approval-flow"],
  },
  {
    id: "cancel-request",
    title: "Cancelling a request",
    questions: [
      "How do I cancel a vacation request?",
      "Can I withdraw a request after sending it?",
      "I submitted a request by mistake, can I cancel it?",
      "Until which status can I cancel my request?",
      "Can I cancel my salary advance request?",
    ],
    keywords: ["cancel", "withdraw", "revoke", "mistake", "undo", "change my mind"],
    answer:
      "You can cancel your own request while it is Submitted or In review. Find the request under \"My requests\" and cancel it there.",
    source: GUIDE("§4.3 Cancelling a request"),
    action: { label: "Open My requests", href: "/requests" },
    related: ["vacation-approval-flow", "how-to-request-vacation"],
  },
  {
    id: "leave-carry-over",
    title: "Carrying over unused vacation",
    questions: [
      "Can I carry over unused vacation days to the next year?",
      "What happens to my leftover leave at the end of the year?",
      "Do my unused vacation days expire?",
      "Is it possible to roll over holiday days?",
      "Until when can I use last year's vacation days?",
    ],
    keywords: ["carry over", "carryover", "unused", "leftover", "expire", "roll over", "31 march", "10 days"],
    answer:
      "Up to 10 unused vacation days can be carried over to the next year. Carried-over days can be used until 31 March.",
    source: LEAVE("§2.3 Carry-over of unused leave"),
    related: ["annual-leave-entitlement", "vacation-balance-personal"],
  },
  {
    id: "unpaid-leave",
    title: "Unpaid leave",
    questions: [
      "Can I take unpaid leave?",
      "How many days of leave without pay are possible per year?",
      "What is the process for unpaid vacation?",
      "Who approves unpaid leave?",
      "Is a leave of absence possible when my vacation days are used up?",
    ],
    keywords: ["unpaid", "without pay", "leave of absence", "14 days", "manager and hr"],
    answer:
      "Unpaid leave of up to 14 days per calendar year is possible. It needs approval from both your direct manager and HR, so please contact HR to arrange it.",
    source: LEAVE("§2.4 Unpaid leave"),
    related: ["annual-leave-entitlement", "hr-contact"],
  },
  {
    id: "public-holidays",
    title: "Public holiday calendar",
    questions: [
      "Which public holidays does the company observe?",
      "Where can I find the list of public holidays?",
      "When is the holiday calendar published?",
      "Does Jana Group follow the national holiday calendar?",
      "Who publishes the calendar of public holidays?",
    ],
    keywords: ["public holiday", "national holiday", "bank holiday", "calendar", "december", "official"],
    answer:
      "The company follows the official national public-holiday calendar. HR publishes it every December.",
    source: LEAVE("§2.5 Public holidays"),
    related: ["annual-leave-entitlement"],
  },

  /* ── Sick leave (HR-POL-02) ────────────────────────────────────────── */
  {
    id: "sick-leave-what-to-do",
    title: "What to do when you are sick",
    questions: [
      "What do I do when I am ill?",
      "Who do I notify if I cannot come to work because I am unwell?",
      "How do I report sick leave?",
      "I woke up with a fever, what should I do?",
      "How do I tell my manager that I am sick?",
    ],
    keywords: [
      "sick",
      "sick leave",
      "ill",
      "illness",
      "unwell",
      "sickness",
      "fever",
      "flu",
      "notify",
      "report",
      "same day",
      "manager",
    ],
    answer:
      "Notify your direct manager on the same day, as early as you can. If the sickness continues, a medical certificate is required from the 3rd day.",
    source: SICK("§2.1 Reporting sickness"),
    related: ["sick-certificate", "sick-leave-pay"],
  },
  {
    id: "sick-certificate",
    title: "Medical certificate for sick leave",
    questions: [
      "Do I need a doctor's note for sick leave?",
      "From which day is a medical certificate required?",
      "How long can I be sick without a certificate?",
      "Is a sick note necessary for a single day of illness?",
      "Which documents do I need after being ill?",
    ],
    keywords: [
      "medical certificate",
      "doctor",
      "doctor's note",
      "sick note",
      "certificate",
      "3rd day",
      "third day",
      "proof",
    ],
    answer:
      "A medical certificate is required from the 3rd day of sickness. Even for shorter absences you must notify your manager on the same day.",
    source: SICK("§2.2 Medical certificate"),
    related: ["sick-leave-what-to-do", "sick-leave-pay"],
  },
  {
    id: "sick-leave-pay",
    title: "Payment during sick leave",
    questions: [
      "Is sick leave paid?",
      "How much do I get paid when I am sick?",
      "Will I lose salary if I am ill?",
      "How is sick leave compensated?",
      "Who can tell me about payment for sick days?",
    ],
    keywords: ["pay", "paid", "payment", "salary", "compensation", "national labour law", "sick pay"],
    answer:
      "Payment for sick leave follows the national labour law. HR can advise you on how it applies to your case.",
    source: SICK("§3.1 Payment"),
    related: ["sick-leave-what-to-do", "hr-contact"],
  },

  /* ── Working time & remote work (HR-POL-03) ────────────────────────── */
  {
    id: "working-hours",
    title: "Working hours",
    questions: [
      "What are our working hours?",
      "When does the working day start and end?",
      "How long is the lunch break?",
      "How many hours per week do I have to work?",
      "What time do we start in the morning?",
    ],
    keywords: [
      "schedule",
      "hours",
      "start",
      "finish",
      "end",
      "lunch",
      "break",
      "time",
      "40 hours",
      "monday to friday",
      "office hours",
    ],
    answer:
      "Standard working hours are 09:00 to 18:00, Monday to Friday, including a 1-hour lunch break. This makes a 40-hour working week.",
    source: TIME("§2.1 Working hours"),
    related: ["remote-work", "overtime"],
  },
  {
    id: "remote-work",
    title: "Remote work",
    questions: [
      "Am I allowed to work remotely?",
      "What is the remote work policy?",
      "How many days per week can I work from home?",
      "Do I need approval to work from home?",
      "Is hybrid work possible at Jana Group?",
    ],
    keywords: ["remote", "wfh", "work from home", "home office", "hybrid", "2 days", "approval", "manager"],
    answer:
      "Remote work is possible up to 2 days per week with your manager's approval.",
    source: TIME("§3.1 Remote work"),
    related: ["working-hours", "overtime"],
  },
  {
    id: "overtime",
    title: "Overtime",
    questions: [
      "How does overtime work?",
      "Will I be compensated for staying late at work?",
      "Do I need permission before working extra hours?",
      "How is overtime compensated?",
    ],
    keywords: ["overtime", "extra hours", "late", "compensation", "compensated", "time off in lieu", "written approval"],
    answer:
      "Overtime needs prior written approval from your manager. Approved overtime is compensated with time off.",
    source: TIME("§4.1 Overtime"),
    related: ["working-hours", "remote-work"],
  },

  /* ── Payroll & salary advance (HR-POL-04) ──────────────────────────── */
  {
    id: "salary-advance-how",
    title: "How to request a salary advance",
    questions: [
      "How can I get an advance on my salary?",
      "Where do I apply for a salary advance?",
      "What are the steps to ask for early salary?",
      "Can I get part of my salary before payday?",
      "Do I have to give a reason for an advance?",
    ],
    keywords: [
      "advance",
      "prepayment",
      "early salary",
      "reason",
      "required",
      "new request",
      "my requests",
      "apply",
      "submit",
    ],
    answer:
      "Open the Digital HR portal, go to \"My requests\", click \"New request\" and choose Salary advance. Enter the amount and a reason (the reason is required), then submit.",
    source: PAY("§3.1 Requesting a salary advance"),
    action: { label: "Open My requests", href: "/requests" },
    related: ["salary-advance-limit", "salary-advance-timing", "salary-payday"],
  },
  {
    id: "salary-advance-limit",
    title: "Salary advance limits",
    questions: [
      "How much of my salary can I get as an advance?",
      "What is the maximum salary advance?",
      "How many advance requests can I make per month?",
      "Is there a limit for salary advances?",
      "Can I ask for an advance twice in one month?",
    ],
    keywords: ["limit", "maximum", "amount", "50%", "net salary", "once a month", "per month", "calendar month"],
    answer:
      "An advance can be up to 50% of your monthly net salary. You can submit at most one advance request per calendar month.",
    source: PAY("§3.2 Advance limits"),
    related: ["salary-advance-how", "salary-advance-timing"],
  },
  {
    id: "salary-advance-timing",
    title: "When an approved advance is paid",
    questions: [
      "When will I receive my approved advance?",
      "How long does it take for the salary advance to be paid out?",
      "How many days until an advance is paid after approval?",
      "When does the advance money arrive?",
    ],
    keywords: ["approved", "payout", "paid out", "3 working days", "arrive", "transfer", "receive", "advance"],
    answer:
      "An approved salary advance is paid within 3 working days after approval.",
    source: PAY("§3.3 Advance payout"),
    related: ["salary-advance-how", "salary-payday"],
  },
  {
    id: "salary-payday",
    title: "Salary payday",
    questions: [
      "On which day of the month is salary paid?",
      "What is the payday?",
      "When do I get my salary?",
      "Which date does my pay arrive each month?",
    ],
    keywords: ["payday", "pay date", "salary date", "paycheck", "wages", "10th", "month", "transfer", "get paid"],
    answer:
      "Regular salary is paid on the 10th of each month.",
    source: PAY("§2.1 Pay dates"),
    related: ["payslip", "salary-advance-how"],
  },
  {
    id: "payslip",
    title: "Where to find your payslip",
    questions: [
      "Where can I find my payslip?",
      "How do I get my pay slip?",
      "Can I see my salary slip in the portal?",
      "Where do I download the payslip for last month?",
      "Is the payslip available in Digital HR?",
    ],
    keywords: ["payslip", "pay slip", "salary slip", "pay stub", "1c", "zup", "1c:zup", "payroll system", "integration"],
    answer:
      "Payslips are issued in 1C:ZUP, the payroll system. The portal will show them after the planned 1C:ZUP integration; until then, please ask HR for your payslip.",
    source: PAY("§4.1 Payslips"),
    action: { label: "Ask HR via Al Jana", href: "/assistant" },
    related: ["salary-payday", "employment-certificate"],
  },
  {
    id: "employment-certificate",
    title: "Employment certificates and other documents",
    questions: [
      "How do I get an employment certificate?",
      "Where can I request a certificate of employment?",
      "I need a letter confirming that I work here",
      "How can I get a document from HR?",
      "How long does HR take to issue a certificate?",
    ],
    keywords: [
      "employment certificate",
      "certificate",
      "document",
      "documents",
      "letter",
      "proof of employment",
      "reference letter",
      "3 working days",
      "ask hr",
    ],
    answer:
      "Send your request to HR using the \"Ask HR\" option in Al Jana. HR issues employment certificates and other documents within 3 working days.",
    source: LIFE("§5.1 Certificates and documents"),
    action: { label: "Ask HR via Al Jana", href: "/assistant" },
    related: ["hr-contact", "ask-hr-escalation"],
  },

  /* ── Benefits & learning (HR-POL-05, HR-POL-08) ────────────────────── */
  {
    id: "health-insurance",
    title: "Voluntary health insurance",
    questions: [
      "Does the company provide health insurance?",
      "Is there medical insurance for employees?",
      "When can I join the voluntary health insurance?",
      "Am I covered by health insurance during probation?",
    ],
    keywords: ["health insurance", "medical insurance", "insurance", "voluntary", "coverage", "after probation", "benefit"],
    answer:
      "Voluntary health insurance is available to employees after the probation period.",
    source: BEN("§2.1 Voluntary health insurance"),
    related: ["probation", "learning-budget"],
  },
  {
    id: "learning-budget",
    title: "Annual learning budget",
    questions: [
      "Is there a budget for my professional development?",
      "Can the company pay for an external training?",
      "How much is my yearly learning budget?",
      "Can I attend a conference at the company's expense?",
    ],
    keywords: [
      "learning budget",
      "budget",
      "professional development",
      "external course",
      "conference",
      "education",
      "study",
      "how much",
      "amount",
    ],
    answer:
      "Every employee has an annual learning budget for external courses and conferences. Agree on how to use it with your manager first, and ask HR for the current amount.",
    source: ACADEMY("§4.1 Annual learning budget"),
    related: ["academy-mandatory-courses", "health-insurance"],
  },
  {
    id: "business-trip",
    title: "Business trips and travel expenses",
    questions: [
      "How do I get approval for a business trip?",
      "What do I need to do before going on a work trip?",
      "How do I claim my travel expenses?",
      "How long do I have to submit an expense report after a trip?",
    ],
    keywords: ["business trip", "travel", "trip", "expense", "expenses", "expense report", "reimbursement", "5 working days", "return"],
    answer:
      "Business trips need your manager's approval beforehand. After you return, submit your expense report within 5 working days.",
    source: TRAVEL("§2.1 Approval and expense reports"),
    related: ["hr-contact"],
  },

  /* ── Employment lifecycle (HR-POL-07) ──────────────────────────────── */
  {
    id: "resignation",
    title: "Resignation and notice period",
    questions: [
      "How do I resign from the company?",
      "How much notice do I need to give when I quit?",
      "What is the procedure if I want to leave my job?",
      "Do I have to resign in writing?",
    ],
    keywords: ["resign", "resignation", "quit", "notice period", "how long", "30 days", "written notice", "leave the company"],
    answer:
      "Resignation requires 30 calendar days of written notice.",
    source: LIFE("§4.1 Resignation"),
    related: ["probation", "hr-contact"],
  },
  {
    id: "probation",
    title: "Probation period",
    questions: [
      "How long is the probation period?",
      "How long is the trial period for new colleagues?",
      "When does my probation end?",
      "What is the probationary period at Jana Group?",
    ],
    keywords: ["probation", "probationary", "trial period", "new hire", "3 months", "three months"],
    answer:
      "The probation period for new employees is 3 months.",
    source: LIFE("§2.1 Probation"),
    related: ["health-insurance", "resignation"],
  },

  /* ── Jana Academy (HR-POL-08) ──────────────────────────────────────── */
  {
    id: "academy-mandatory-courses",
    title: "Mandatory Jana Academy courses",
    questions: [
      "Which Jana Academy courses are mandatory?",
      "How long do I have to finish my assigned mandatory training?",
      "What is the deadline for compulsory courses?",
      "Do I have to complete the Information Security course?",
      "When is the Code of Conduct training due?",
    ],
    keywords: [
      "mandatory",
      "compulsory",
      "deadline",
      "due",
      "30 days",
      "assignment",
      "information security",
      "code of conduct",
      "ethics",
      "academy",
    ],
    answer:
      "The mandatory courses are Information Security Basics and Code of Conduct & Ethics. They must be completed within 30 days of assignment.",
    source: ACADEMY("§2.1 Mandatory courses"),
    action: { label: "Open Academy", href: "/academy" },
    related: ["academy-pass-mark", "academy-results"],
  },
  {
    id: "academy-pass-mark",
    title: "Course tests and pass mark",
    questions: [
      "What score do I need to pass a course test?",
      "How do I pass a Jana Academy course?",
      "Is there a minimum score for the academy exam?",
      "Can I retake a failed test?",
      "How many times can I retry a test?",
      "Does every course end with a test?",
    ],
    keywords: ["test", "exam", "quiz", "pass mark", "passing score", "70%", "retake", "retries", "unlimited", "failed", "academy"],
    answer:
      "Every Jana Academy course ends with a test. The pass mark is 70%, and you can retake the test as many times as you need.",
    source: ACADEMY("§3.1 Tests"),
    action: { label: "Open Academy", href: "/academy" },
    related: ["academy-mandatory-courses", "academy-results"],
  },
  {
    id: "academy-results",
    title: "Where course results are recorded",
    questions: [
      "Where can I see my course results?",
      "Where are my training results recorded?",
      "How do I check whether I completed a course?",
      "Where can I find my academy progress?",
      "Are my test scores saved?",
    ],
    keywords: ["results", "progress", "recorded", "completed", "completion", "scores", "history", "academy"],
    answer:
      "Test results are recorded in the portal. You can see your courses, progress and results in the Academy section.",
    source: ACADEMY("§3.2 Records"),
    action: { label: "Open Academy", href: "/academy" },
    related: ["academy-pass-mark", "academy-mandatory-courses"],
  },

  /* ── Contacts & portal guide (HR-GUIDE-01) ─────────────────────────── */
  {
    id: "hr-contact",
    title: "Contacting the HR team",
    questions: [
      "How can I contact the HR team?",
      "What is the HR email address?",
      "Who do I write to with an HR matter?",
      "Where can I reach HR?",
    ],
    keywords: ["contact", "email", "e-mail", "hr", "hr@jana.example", "reach", "write to", "human resources"],
    answer:
      "You can reach the HR team at hr@jana.example. You can also ask Al Jana: if I cannot answer, I can forward your question to HR.",
    source: GUIDE("§5.1 Contacting HR"),
    action: { label: "Ask HR via Al Jana", href: "/assistant" },
    related: ["ask-hr-escalation"],
  },
  {
    id: "ask-hr-escalation",
    title: "What happens when Al Jana cannot answer",
    questions: [
      "What happens if Al Jana cannot answer my question?",
      "Can you forward my question to HR?",
      "How do I ask HR something that is missing from the knowledge base?",
      "How does the Ask HR option work?",
      "Will a real person answer my question?",
    ],
    keywords: ["escalate", "escalation", "forward", "ask hr", "knowledge base", "human", "unanswered", "no answer"],
    answer:
      "Al Jana answers only from the HR knowledge base. If there is no reliable answer, it says so and offers to pass your question on to the HR team, who answer it themselves.",
    source: GUIDE("§5.2 Ask HR"),
    action: { label: "Open Al Jana", href: "/assistant" },
    related: ["hr-contact"],
  },
  {
    id: "notifications",
    title: "Notifications in the portal",
    questions: [
      "Where can I see my notifications?",
      "How will I know when the status of my request changes?",
      "Will I be notified when my vacation is approved?",
      "Where do I read messages from the portal?",
    ],
    keywords: ["notifications", "notify", "notified", "alerts", "messages", "status change", "unread"],
    answer:
      "You get a notification in the portal at every step of a request: submitted, in review, and approved or rejected. Open Notifications to read them.",
    source: GUIDE("§4.2 Notifications"),
    action: { label: "Open Notifications", href: "/notifications" },
    related: ["vacation-approval-flow"],
  },
  {
    id: "portal-overview",
    title: "What you can do in the Digital HR portal",
    questions: [
      "What can I do in the Digital HR portal?",
      "What features does the HR portal have?",
      "Where can I see who my manager is?",
      "What is the Digital HR portal for?",
    ],
    keywords: ["portal", "digital hr", "features", "profile", "manager", "overview", "functions", "sections"],
    answer:
      "In the Digital HR portal you can submit vacation and salary advance requests under \"My requests\", see your profile (including your direct manager and vacation balance), take Jana Academy courses, and read your notifications.",
    source: GUIDE("§1 Overview"),
    action: { label: "Open my profile", href: "/profile" },
    related: ["how-to-request-vacation", "salary-advance-how", "academy-results"],
  },
];
