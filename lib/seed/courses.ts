/**
 * Jana Academy course catalogue. All content is FICTIONAL / generic
 * best-practice material written for the "Jana Group" demo company.
 *
 * Rules kept by every course (checked in tests/courses.test.ts):
 * - durationMin = sum of lesson durations + 5 (test)
 * - test.passScore = 70
 * - every test question is answerable from the lesson text
 */
import type { CourseDoc } from "../domain/types";

export const COURSES: CourseDoc[] = [
  /* ── 1. Information Security Basics ─────────────────────────────── */
  {
    _id: "course-infosec",
    title: "Information Security Basics",
    description:
      "Learn the everyday habits that keep Jana Group's data and systems safe: strong credentials, phishing awareness and careful handling of information and devices.",
    category: "Security",
    durationMin: 27,
    mandatory: true,
    lessons: [
      {
        id: "l1",
        title: "Why security is everyone's job",
        durationMin: 5,
        summary:
          "Information security protects confidentiality, integrity and availability, and most incidents start with ordinary human mistakes.",
        body: [
          "Information security is about protecting the information the company works with, whether it lives in a system, on paper or in someone's head. It rests on three goals: confidentiality, integrity and availability.",
          "Confidentiality means information is visible only to people who are authorised to see it. Integrity means information is accurate and is not changed without authorisation. Availability means authorised people can reach the information and systems when they need them.",
          "Security tools help, but many incidents begin with a simple human action, such as clicking a link, reusing a password or leaving a laptop unlocked. That is why security is everyone's job, not only the IT team's. Small daily habits, repeated by everyone, are the strongest defence.",
        ],
        keyPoints: [
          "The three goals are confidentiality, integrity and availability.",
          "Integrity means information is accurate and not altered without authorisation.",
          "Everyday human habits matter as much as technical tools.",
        ],
      },
      {
        id: "l2",
        title: "Strong passwords and secure accounts",
        durationMin: 6,
        summary:
          "Use a long, unique passphrase for every account, store it in a password manager and turn on multi-factor authentication.",
        body: [
          "Length matters more than complexity. A long passphrase made of several unrelated words is harder to guess than a short password with a few substituted symbols. Avoid names, birthdays and anything that someone could find out about you.",
          "Every account needs its own password. If you reuse one password and a single website is breached, attackers will try it on your other accounts as well. A password manager lets you keep a different long passphrase for each account without having to memorise them all.",
          "Turn on multi-factor authentication wherever it is offered. It asks for a second proof of identity, such as a code from an app, so a stolen password alone is not enough to get in.",
          "Passwords are personal. Never share yours, not even with a trusted colleague or someone who says they are from IT. If a colleague needs access to something while you are away, ask for proper access to be arranged through IT instead of lending your login.",
        ],
        keyPoints: [
          "Prefer a long passphrase that is unique for every account.",
          "Keep passwords in a password manager and enable multi-factor authentication.",
          "Never share your password; request proper access through IT instead.",
        ],
      },
      {
        id: "l3",
        title: "Spotting phishing and social engineering",
        durationMin: 6,
        summary:
          "Learn the typical warning signs of phishing messages and what to do immediately if you suspect or fall for one.",
        body: [
          "Phishing is a message designed to trick you into revealing credentials, opening a harmful attachment or taking an action you would not normally take. It can arrive by email, text message, chat or even a phone call. This wider family of tricks is called social engineering, because it targets people rather than technology.",
          "Typical warning signs include a sense of urgency or threat, a sender address that does not quite match the real one, an unexpected attachment, a request to confirm your password or other credentials through a link, and an unusual request for money or information. Hover over a link to see where it really leads before you click.",
          "If a message looks suspicious, do not click, do not open attachments and do not reply. Report it to IT security so they can warn others and block it.",
          "If you already clicked a link or entered your password, do not stay silent and do not wait to see what happens. Report it to IT security immediately and change the password that may be exposed. Quick reporting limits the damage, and nobody is punished for reporting honestly.",
        ],
        keyPoints: [
          "Warning signs: urgency, odd sender, unexpected attachment, request for credentials.",
          "Do not click or reply to a suspicious message; report it to IT security.",
          "If you clicked or entered your password, report it immediately and change the password.",
        ],
      },
      {
        id: "l4",
        title: "Handling data and devices safely",
        durationMin: 5,
        summary:
          "Protect information by locking your screen, sharing only what is needed, using a VPN on public networks and reporting lost devices at once.",
        body: [
          "Treat information according to how sensitive it is. Share confidential data only with people who need it for their work, and send it only through company-approved tools. Avoid copying work files to personal cloud storage or personal email.",
          "Lock your screen every time you step away, even in the office and even for a minute. Do not leave laptops, phones or printed documents unattended in public places such as cafes, trains or airports.",
          "Public Wi-Fi networks can be watched by other people. When you have to work on one, connect through the company-approved VPN so that your traffic is protected. Keep your devices updated, because updates often fix security weaknesses.",
          "If a laptop, phone or access card is lost or stolen, report it to IT security immediately. Do not wait a few days to see if it turns up. Fast reporting lets the company lock the device and protect the data on it.",
        ],
        keyPoints: [
          "Share confidential data only on a need-to-know basis, through approved tools.",
          "Lock your screen when you leave and use the approved VPN on public Wi-Fi.",
          "Report a lost or stolen device to IT security immediately.",
        ],
      },
    ],
    test: {
      passScore: 70,
      questions: [
        {
          id: "q1",
          text: "Which statement describes the 'integrity' goal of information security?",
          options: [
            "Authorised people can reach information and systems whenever they need them.",
            "Information is accurate and is not changed without authorisation.",
            "Information is visible only to people who are authorised to see it.",
          ],
          correctIndex: 1,
        },
        {
          id: "q2",
          text: "Which approach to passwords is recommended?",
          options: [
            "A long, unique passphrase for each account, kept in a password manager.",
            "One strong password reused everywhere so it is easy to remember.",
            "A short password with a few symbols, written on a sticky note.",
            "Your birthday followed by the name of the company.",
          ],
          correctIndex: 0,
        },
        {
          id: "q3",
          text: "A colleague going on leave asks for your password so they can cover a task. What should you do?",
          options: [
            "Share it by phone only, then change it later.",
            "Share it, because they are a trusted colleague.",
            "Decline, because passwords are personal, and ask IT to arrange proper access.",
          ],
          correctIndex: 2,
        },
        {
          id: "q4",
          text: "You clicked a link in a suspicious email and entered your password. What should you do first?",
          options: [
            "Delete the email and wait to see whether anything unusual happens.",
            "Report it to IT security immediately and change the password.",
            "Forward the email to your team so they can look at it.",
            "Do nothing unless you notice a problem within a week.",
          ],
          correctIndex: 1,
        },
        {
          id: "q5",
          text: "You need to work from a cafe that offers public Wi-Fi. What is the safest approach?",
          options: [
            "Work normally, because public networks are always encrypted.",
            "Switch off the screen lock so you do not lose your connection.",
            "Connect through the company-approved VPN.",
          ],
          correctIndex: 2,
        },
        {
          id: "q6",
          text: "Your work laptop is lost on a train. What should you do?",
          options: [
            "Report it to IT security immediately.",
            "Wait a few days in case someone returns it.",
            "Buy a replacement yourself and say nothing.",
            "Ask a colleague to reset your password next week.",
          ],
          correctIndex: 0,
        },
      ],
    },
  },

  /* ── 2. Code of Conduct & Ethics ────────────────────────────────── */
  {
    _id: "course-conduct",
    title: "Code of Conduct & Ethics",
    description:
      "Understand the principles of honest, respectful behaviour at work, how to handle conflicts of interest and gifts, and how to raise concerns safely.",
    category: "Compliance",
    durationMin: 21,
    mandatory: true,
    lessons: [
      {
        id: "l1",
        title: "Integrity and respect at work",
        durationMin: 5,
        summary:
          "Honesty, respect, fairness and accountability are the foundation of how people at Jana Group are expected to behave.",
        body: [
          "A code of conduct turns shared values into everyday behaviour. Four principles carry most of the weight: honesty, respect, fairness and accountability. Be truthful in what you say and record, treat colleagues and partners with courtesy, apply the same standards to everyone, and take responsibility for your actions and mistakes.",
          "Respect means that discrimination and harassment have no place at work. This covers remarks, jokes, messages and behaviour that make someone feel excluded, threatened or humiliated, whether they happen in person or online. Decisions about hiring, pay and promotion should rest on merit and facts.",
          "Ethics is also about the small moments when nobody is watching: reporting an error you made, not overstating results, and keeping confidential information confidential. People who lead by example make it easier for everyone else to do the right thing.",
        ],
        keyPoints: [
          "The core principles are honesty, respect, fairness and accountability.",
          "Discrimination and harassment, in person or online, are never acceptable.",
          "Ethical behaviour includes the small moments when nobody is watching.",
        ],
      },
      {
        id: "l2",
        title: "Conflicts of interest and gifts",
        durationMin: 6,
        summary:
          "Disclose any situation where personal interests could influence your work decisions, and be careful with gifts and hospitality.",
        body: [
          "A conflict of interest is a situation where your personal interests, or those of your family or close friends, could influence, or could appear to influence, your decisions at work. Typical examples are hiring a relative, choosing a supplier owned by a friend, or running a side business that competes with your employer.",
          "Having a conflict is not automatically wrong. Hiding it is the problem. As soon as you notice a possible conflict, disclose it early to your manager or the compliance team and let them decide how to handle it, for example by moving the decision to someone else. Do not decide on your own that a conflict is too small to mention.",
          "Gifts and hospitality need the same care. Never accept or offer cash or cash equivalents such as vouchers. Small, modest items such as a branded notebook may be acceptable, but never while a tender, contract negotiation or other decision involving the giver is under way.",
          "A simple test helps: if it would embarrass you or the company to see the gift or arrangement described openly, decline it or ask for advice first.",
        ],
        keyPoints: [
          "A conflict of interest is when personal interests could influence or appear to influence your work decisions.",
          "Disclose possible conflicts early to your manager or compliance.",
          "Always decline cash or equivalents, and any gift during a decision involving the giver.",
        ],
      },
      {
        id: "l3",
        title: "Speaking up and handling reports",
        durationMin: 5,
        summary:
          "Raise concerns about misconduct through the right channels, stick to facts, and never retaliate against someone who speaks up.",
        body: [
          "If you see behaviour that breaks the code of conduct or the law, speak up. You can talk to your manager, to HR or to the compliance channel, whichever feels safest. Raising a concern early is much better than letting a problem grow.",
          "Describe what you personally saw or heard, with dates and facts, rather than guesses about motives. Do not investigate on your own: do not collect colleagues' private messages or confront the person involved. Trained people will review the report and keep it as confidential as possible.",
          "People who report a concern in good faith are protected, even if it later turns out the concern was mistaken. Retaliation against them is itself a serious violation of the code. Retaliation includes obvious steps such as dismissal or demotion, and quieter ones such as excluding someone from meetings, giving them worse tasks or ignoring them.",
        ],
        keyPoints: [
          "Raise concerns with your manager, HR or the compliance channel.",
          "Report the facts you observed and do not investigate on your own.",
          "Retaliation against a good-faith report, including exclusion, is itself a violation.",
        ],
      },
    ],
    test: {
      passScore: 70,
      questions: [
        {
          id: "q1",
          text: "What is a conflict of interest?",
          options: [
            "A disagreement between two colleagues about project priorities.",
            "A situation where personal interests could influence, or appear to influence, your work decisions.",
            "Working on two projects at the same time.",
          ],
          correctIndex: 1,
        },
        {
          id: "q2",
          text: "You realise that a supplier you are about to select is owned by a close friend. What should you do?",
          options: [
            "Disclose it early to your manager or compliance and let them decide how to handle it.",
            "Go ahead, because the friendship is unlikely to affect your judgement.",
            "Wait until someone asks you about it.",
            "Choose a different supplier without telling anyone why.",
          ],
          correctIndex: 0,
        },
        {
          id: "q3",
          text: "Which of the following should you always decline?",
          options: [
            "A branded notebook handed out at a conference when no decision is pending.",
            "A thank-you card from a colleague after a project.",
            "Cash or a voucher offered by a business partner.",
          ],
          correctIndex: 2,
        },
        {
          id: "q4",
          text: "A colleague reported a concern in good faith. Afterwards, their manager begins leaving them out of meetings because of it. How should this be seen?",
          options: [
            "Acceptable, because the concern turned out to be mistaken.",
            "Retaliation, which is itself a violation of the code.",
            "Normal team dynamics that need no action.",
          ],
          correctIndex: 1,
        },
        {
          id: "q5",
          text: "You suspect that a colleague broke a rule. What is the best first step?",
          options: [
            "Collect the colleague's private messages to build a case.",
            "Discuss the suspicion informally with other colleagues to gather opinions.",
            "Report the facts you observed to your manager, HR or the compliance channel without investigating yourself.",
          ],
          correctIndex: 2,
        },
      ],
    },
  },

  /* ── 3. Remote & Hybrid Work Essentials ─────────────────────────── */
  {
    _id: "course-remote",
    title: "Remote & Hybrid Work Essentials",
    description:
      "Practical habits for staying productive, connected and healthy when you work from home or split your week between home and the office.",
    category: "Ways of working",
    durationMin: 21,
    mandatory: false,
    lessons: [
      {
        id: "l1",
        title: "Setting up a productive workspace",
        durationMin: 5,
        summary:
          "A comfortable, quiet and secure workspace with regular breaks makes remote work sustainable.",
        body: [
          "Try to have a regular place for work, even if it is only one corner of a room. A consistent space helps your mind switch into work mode and makes it easier to switch off at the end of the day. Choose a spot with good light and as little noise as possible, and check that your internet connection is stable.",
          "Set up your body as carefully as your screen. Place the top of the monitor roughly at eye level, keep your feet flat on the floor and your forearms relaxed at desk height. Avoid working for long periods from a sofa or bed.",
          "Take a short break roughly every 50 to 60 minutes: stand up, stretch, look away from the screen and drink some water. Short, regular breaks protect your eyes and back and keep your focus higher than pushing through for hours.",
          "Keep your workspace secure too. Lock your screen when you leave it, and do not let family or visitors see confidential material on your screen.",
        ],
        keyPoints: [
          "Use a regular, quiet, well-lit workspace with a stable connection.",
          "Set the monitor at eye level and sit with feet flat.",
          "Take a short break about every 50 to 60 minutes.",
        ],
      },
      {
        id: "l2",
        title: "Communicating across distance",
        durationMin: 6,
        summary:
          "Choose the right channel for each message, write clearly and make your availability and decisions visible.",
        body: [
          "When people are not in the same room, clear communication replaces the casual hallway chat. Write messages that can be understood without a follow-up question: state the context, what you need and by when.",
          "Match the channel to the message. Use chat for quick, low-stakes questions, email or a shared document for longer or more formal information, and a short call or video meeting for complex, sensitive or emotional topics, where tone is easily misread in writing. Follow up a call with a short written summary.",
          "Make your availability visible by keeping your calendar and status up to date, so colleagues know when to expect an answer. Agree within the team what a reasonable response time is for each channel, so that nobody feels they must reply instantly.",
          "Write down decisions and next steps in a shared place. People who were not in the meeting, or who work in other time zones, can then catch up without asking again.",
        ],
        keyPoints: [
          "Give context, the request and the deadline in each message.",
          "Use a short call for complex or sensitive topics and follow up in writing.",
          "Keep your status current and record decisions in a shared place.",
        ],
      },
      {
        id: "l3",
        title: "Boundaries and wellbeing in hybrid work",
        durationMin: 5,
        summary:
          "Plan office days for collaboration, protect your off-hours and make sure remote colleagues are not overlooked.",
        body: [
          "Without a commute, work can quietly expand into the evening. Decide on your usual start and end times and share them with your team. At the end of the day, run a short shutdown ritual: close your work applications, note tomorrow's top priorities and set your status to offline.",
          "In a hybrid week, use office days for what is best done together, such as workshops, brainstorming and building relationships. Keep quiet, heads-down tasks for home days when your focus is less likely to be interrupted. Agree with your team which days overlap so that planned collaboration really happens.",
          "Be aware of proximity bias, the tendency to favour colleagues who are physically visible over those who work remotely. Counter it by sharing meeting notes, giving remote colleagues space to speak first and judging work by its results rather than by hours seen at a desk.",
          "Use your time off, and talk to your manager early if your workload is not sustainable.",
        ],
        keyPoints: [
          "Fix your working hours and end the day with a shutdown ritual.",
          "Use office days for collaboration and home days for focused work.",
          "Counter proximity bias by including remote colleagues and judging results.",
        ],
      },
    ],
    test: {
      passScore: 70,
      questions: [
        {
          id: "q1",
          text: "What break rhythm does the course recommend?",
          options: [
            "A short break roughly every 50 to 60 minutes.",
            "One long break at lunchtime and none otherwise.",
            "A break only when your eyes start to hurt.",
          ],
          correctIndex: 0,
        },
        {
          id: "q2",
          text: "Which channel suits a complex or sensitive discussion best?",
          options: [
            "A large group chat where everyone can see it.",
            "A short call or video meeting, followed by a written summary.",
            "A long email with many people in copy.",
          ],
          correctIndex: 1,
        },
        {
          id: "q3",
          text: "Which kind of work is best suited to office days in a hybrid week?",
          options: [
            "Answering routine email.",
            "Quiet, heads-down tasks that need deep focus.",
            "Workshops, brainstorming and building relationships.",
          ],
          correctIndex: 2,
        },
        {
          id: "q4",
          text: "What is proximity bias?",
          options: [
            "A preference for working from home rather than in the office.",
            "A tendency to favour colleagues who are physically visible over those who work remotely.",
            "A habit of choosing a workspace close to the kitchen.",
          ],
          correctIndex: 1,
        },
        {
          id: "q5",
          text: "Which habit best helps you keep a boundary at the end of the working day?",
          options: [
            "Keep chat open so you can answer anything that arrives.",
            "Check your email once more in bed in case something urgent came in.",
            "Run a shutdown ritual: close work applications, note tomorrow's priorities and set your status offline.",
          ],
          correctIndex: 2,
        },
      ],
    },
  },

  /* ── 4. Getting Started with Digital HR ─────────────────────────── */
  {
    _id: "course-onboard",
    title: "Getting Started with Digital HR",
    description:
      "A quick tour of the single Digital HR portal: your profile, requests, Jana Academy, the Al Jana assistant and notifications.",
    category: "Onboarding",
    durationMin: 19,
    mandatory: false,
    lessons: [
      {
        id: "l1",
        title: "One portal for your HR needs",
        durationMin: 4,
        summary:
          "Digital HR brings your profile, requests, learning, questions and notifications into a single place.",
        body: [
          "Digital HR is the single portal for everyday HR matters at Jana Group. Instead of searching for forms, emails and separate tools, you sign in once and find everything in one place: your profile, your requests, Jana Academy, the Al Jana assistant and the notification center.",
          "Start with Profile. It shows your position, department, manager, hire date and your vacation balance: your yearly entitlement, the days remaining, the days already waiting in pending requests and the days still available to request.",
          "Take a minute to check that your details are correct. If something is wrong, tell HR so it can be fixed at the source.",
        ],
        keyPoints: [
          "Digital HR is the single portal for your HR needs.",
          "Profile shows your role, manager and vacation balance.",
          "Tell HR if any of your details are wrong.",
        ],
      },
      {
        id: "l2",
        title: "My requests: vacation and salary advance",
        durationMin: 5,
        summary:
          "Submit a vacation or salary-advance request and follow it as it moves from Submitted to In review and then Approved or Rejected.",
        body: [
          "Use My requests to ask for time off or a salary advance. For a vacation request you choose the start and end dates and may add a comment. The portal counts working days, Monday to Friday, within those dates, so weekends are not deducted from your balance. For a salary advance you enter the amount and the reason.",
          "Every request moves through clear statuses. It begins as Submitted, then becomes In review when the approver starts looking at it, and finally ends as Approved or Rejected. Your approver is usually your direct manager.",
          "You can open any request in My requests to see its current status and its history, including who made each change and any comment they left. Days in vacation requests that have not been decided yet are shown as pending, so they reduce the days still available to you.",
        ],
        keyPoints: [
          "Vacation days are counted as working days, Monday to Friday.",
          "Status path: Submitted, then In review, then Approved or Rejected.",
          "Open a request to follow its status and history.",
        ],
      },
      {
        id: "l3",
        title: "Academy, Al Jana and notifications",
        durationMin: 5,
        summary:
          "Learn in Jana Academy, ask Al Jana HR questions and stay informed through the notification center.",
        body: [
          "Jana Academy lists the courses assigned to you and others you can explore. Each course has short lessons and a final test. Open the lessons, read the key points, then take the test to confirm your understanding and complete the course.",
          "Al Jana is the HR assistant. It answers only from the HR knowledge base, never from guesses, and every answer shows its source: the document, section and revision it came from. If Al Jana cannot find an answer in the knowledge base, it says so and offers to forward your question to HR, who will reply to you directly.",
          "The notification center collects updates in one list: a change in the status of your request, a course assigned to you, or an answer from HR to a forwarded question. Check it regularly so that you do not miss anything that needs your attention.",
        ],
        keyPoints: [
          "Each Academy course has lessons followed by a test.",
          "Al Jana answers only from the HR knowledge base and cites its sources.",
          "The notification center shows request updates, course assignments and HR answers.",
        ],
      },
    ],
    test: {
      passScore: 70,
      questions: [
        {
          id: "q1",
          text: "What is the correct order of statuses for a request?",
          options: [
            "Approved, then Submitted, then In review.",
            "In review, then Rejected, then Submitted.",
            "Submitted, then In review, then Approved or Rejected.",
          ],
          correctIndex: 2,
        },
        {
          id: "q2",
          text: "How are days counted when you submit a vacation request?",
          options: [
            "As working days, Monday to Friday, within the chosen dates.",
            "As all calendar days, including weekends.",
            "Only the first five days of the chosen period are counted.",
          ],
          correctIndex: 0,
        },
        {
          id: "q3",
          text: "What does Al Jana do when the HR knowledge base has no answer to your question?",
          options: [
            "It gives its best guess based on general knowledge.",
            "It says it has no answer and offers to forward your question to HR.",
            "It ends the conversation without a reply.",
          ],
          correctIndex: 1,
        },
        {
          id: "q4",
          text: "Where do you find updates such as a change in a request's status or a newly assigned course?",
          options: [
            "In the notification center.",
            "Only in a printed report sent by HR.",
            "In your Academy test results.",
          ],
          correctIndex: 0,
        },
      ],
    },
  },

  /* ── 5. Running Effective 1:1s ──────────────────────────────────── */
  {
    _id: "course-1on1",
    title: "Running Effective 1:1s",
    description:
      "For people managers: how to set up, structure and follow through on regular one-to-one meetings that build trust and support growth.",
    category: "Leadership",
    durationMin: 21,
    mandatory: false,
    lessons: [
      {
        id: "l1",
        title: "Why 1:1s matter and how to set them up",
        durationMin: 5,
        summary:
          "A regular, protected 1:1 is the employee's meeting and the main place where trust is built.",
        body: [
          "A 1:1 is a regular private conversation between a manager and one team member. It is where problems surface early, trust grows and people feel seen. Treat it as one of the most valuable hours in your week.",
          "Set a regular rhythm, usually weekly or every two weeks, at a fixed time, for around 30 minutes. Consistency matters more than length. Choose a private setting where neither of you will be interrupted.",
          "Remember whose meeting it is: the 1:1 belongs to the employee. It is not a status review for the manager. If you must move it, reschedule rather than cancel, because repeated cancellations tell people they are not a priority.",
        ],
        keyPoints: [
          "Hold 1:1s weekly or every two weeks at a fixed time.",
          "The 1:1 belongs to the employee, not the manager's status review.",
          "Reschedule instead of cancelling.",
        ],
      },
      {
        id: "l2",
        title: "Structuring the conversation",
        durationMin: 6,
        summary:
          "Use a shared agenda, let the employee's topics come first and ask open questions that invite real answers.",
        body: [
          "Keep a shared agenda document where both of you add topics before the meeting. Start with the employee's topics, then move to yours. This signals that the time is theirs and makes sure their concerns are not squeezed out.",
          "Good 1:1s cover more than task updates. Typical themes are priorities, obstacles, feedback, growth and wellbeing. If the conversation is only about status, you can usually get that information more cheaply in writing.",
          "Ask open questions that cannot be answered with yes or no, such as what would make your work easier this week, or what is getting in your way. Closed questions like whether everything is fine tend to produce the answer that everything is fine.",
          "Aim to listen more than you talk. Pause after asking, let silence work, and summarise what you heard to check that you understood.",
        ],
        keyPoints: [
          "Use a shared agenda and start with the employee's topics.",
          "Cover priorities, obstacles, feedback, growth and wellbeing, not only status.",
          "Ask open questions and listen more than you talk.",
        ],
      },
      {
        id: "l3",
        title: "Feedback, follow-up and growth",
        durationMin: 5,
        summary:
          "Give specific and timely feedback, record action items with owners and dates, and keep returning to growth.",
        body: [
          "Good feedback is specific and timely. Describe the observable behaviour and its impact, for example what you saw and what effect it had, rather than labelling the person. Give it soon after the event instead of saving it for an annual review. Recognise good work as often as you point out what to improve.",
          "Close every 1:1 by recording agreed action items, each with an owner and a date. Review them at the start of the next meeting. Following through on your own commitments is the fastest way to build trust.",
          "Make room for growth regularly, not only when something goes wrong. Ask about the skills the person wants to build and the work that energises them, then look for projects, learning or mentoring that fit. Keep what is shared in a 1:1 confidential unless the person agrees otherwise or there is a serious safety or compliance concern.",
        ],
        keyPoints: [
          "Feedback should be specific, timely and describe behaviour and impact.",
          "Record action items with owners and dates, and review them next time.",
          "Discuss growth regularly and keep 1:1 conversations confidential.",
        ],
      },
    ],
    test: {
      passScore: 70,
      questions: [
        {
          id: "q1",
          text: "Whose meeting is the 1:1 considered to be?",
          options: [
            "The manager's, as a status review of the team.",
            "The wider team's, as a shared planning session.",
            "The HR department's, as a compliance check.",
            "The employee's.",
          ],
          correctIndex: 3,
        },
        {
          id: "q2",
          text: "What cadence does the course recommend for 1:1s?",
          options: [
            "Weekly or every two weeks, at a fixed time.",
            "Only when a problem has occurred.",
            "Once a year, together with the annual review.",
          ],
          correctIndex: 0,
        },
        {
          id: "q3",
          text: "Which of these is an open question suitable for a 1:1?",
          options: [
            "Is everything fine with your tasks?",
            "Did you finish the report?",
            "What would make your work easier this week?",
          ],
          correctIndex: 2,
        },
        {
          id: "q4",
          text: "Which feedback follows the guidance of the course?",
          options: [
            "Saving all comments for the annual review.",
            "A specific, timely comment that describes the behaviour and its impact.",
            "A general remark about the person's attitude.",
          ],
          correctIndex: 1,
        },
      ],
    },
  },
];
