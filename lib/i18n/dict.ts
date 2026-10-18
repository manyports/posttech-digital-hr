import type { Locale } from "./locale";

export interface Dict {
  switchLabel: string;
  ru: string;
  kz: string;
  nav: {
    aria: string;
    main: string;
    home: string;
    profile: string;
    requests: string;
    academy: string;
    assistant: string;
    notifications: string;
    myTeam: string;
    approvals: string;
    team: string;
    hr: string;
    allRequests: string;
    employees: string;
    inbox: string;
    prototype: string;
    account: string;
    signOut: string;
    openMenu: string;
    collapse: string;
    expand: string;
    unread: string;
  };
  roles: { employee: string; manager: string; hr: string };
  requestType: { vacation: string; salary_advance: string };
  requestStatus: {
    draft: string;
    submitted: string;
    in_review: string;
    approved: string;
    rejected: string;
    cancelled: string;
    decision: string;
    filed: string;
  };
  courseStatus: { assigned: string; in_progress: string; completed: string; overdue: string };
  common: {
    errorTitle: string;
    retry: string;
    loading: string;
    deniedTitle: string;
    deniedBody: string;
    deniedNote: string;
    cancel: string;
    close: string;
    back: string;
    working: string;
    failed: string;
    daysShort: string;
    due: string;
    score: string;
    mandatory: string;
    noManager: string;
    read: string;
    unread: string;
    done: string;
    live: string;
    previous: string;
    next: string;
    noResults: string;
    noResultsDetail: string;
    navigationLabel: string;
    previousSlide: string;
    nextSlide: string;
    apiBadRequest: string;
    apiConflict: string;
    apiNotFound: string;
    apiForbidden: string;
    apiUnauthorized: string;
    apiNetwork: string;
    apiUnknown: string;
  };
  login: {
    title: string;
    lead: string;
    email: string;
    password: string;
    enter: string;
    entering: string;
    fail: string;
    sso: string;
    ssoPassword: string;
    demos: string;
    demoHint: string;
    passwordFirst: string;
    roles: Record<string, string>;
    hints: Record<string, string>;
  };
  dashboard: {
    welcome: string;
    ask: string;
    newRequest: string;
    summary: string;
    vacationDays: string;
    availableOf: string;
    pendingBit: string;
    openRequests: string;
    waiting: string;
    noOpen: string;
    training: string;
    overdueN: string;
    coursesDone: string;
    unread: string;
    needsAttention: string;
    allRead: string;
    team: string;
    teamHint: string;
    goTeam: string;
    people: string;
    awaiting: string;
    overdueTraining: string;
    company: string;
    companyHint: string;
    hrInbox: string;
    questions: string;
    mandatory: string;
    recent: string;
    allRequests: string;
    empty: string;
    first: string;
    academy: string;
    noCourse: string;
    due: string;
    progress: string;
    start: string;
    continue: string;
    allDone: string;
    attention: string;
    allClear: string;
    todoCourse: string;
    todoCourseStart: string;
    todoOverdue: string;
    todoApprove: string;
    todoEsc: string;
    todoUnread: string;
    todoRejected: string;
    todoRejectedPlain: string;
    open: string;
  };
  requests: {
    title: string;
    description: string;
    new: string;
    all: string;
    open: string;
    approved: string;
    rejected: string;
    empty: string;
    emptyHint: string;
    none: string;
    noneHint: string;
    filed: string;
  };
  request: {
    mine: string;
    approvals: string;
    heading: string;
    byYou: string;
    savedByYou: string;
    live: string;
    canCancel: string;
    draftActions: string;
    awaitsYou: string;
    details: string;
    employee: string;
    approver: string;
    dates: string;
    workDays: string;
    comment: string;
    amount: string;
    reason: string;
    updated: string;
    systems: string;
    systemsHint: string;
    notStarted: string;
    afterApprove: string;
    history: string;
    historyHint: string;
    coverageEmpty: string;
    coverageDecember: string;
    progress: string;
    stepDone: string;
  };
  actions: {
    submit: string;
    submitTitle: string;
    submitDone: string;
    start: string;
    startTitle: string;
    startDone: string;
    approve: string;
    approveTitle: string;
    approveDone: string;
    reject: string;
    rejectTitle: string;
    rejectDone: string;
    cancel: string;
    cancelTitle: string;
    cancelDone: string;
    fail: string;
    reason: string;
    note: string;
  };
  modal: {
    title: string;
    description: string;
    send: string;
    sending: string;
    saveDraft: string;
    savingDraft: string;
    draftSaved: string;
    draftSavedHint: string;
    sent: string;
    sentTo: string;
    network: string;
    start: string;
    end: string;
    pickDates: string;
    weekends: string;
    available: string;
    pending: string;
    comment: string;
    amount: string;
    amountHint: string;
    already: string;
    dates: string;
    pickStart: string;
    pickEnd: string;
    capHint: string;
    noDays: string;
    prevMonth: string;
    nextMonth: string;
    range: string;
    tooMuch: string;
    tooLittle: string;
    less: string;
    more: string;
    reason: string;
  };
  profile: {
    title: string;
    description: string;
    name: string;
    company: string;
    position: string;
    department: string;
    manager: string;
    hired: string;
    number: string;
    city: string;
    vacation: string;
    entitlement: string;
    left: string;
    used: string;
    pending: string;
    available: string;
    remainingOf: string;
    request: string;
    training: string;
    finished: string;
    academy: string;
    noCourses: string;
    notices: string;
    unreadN: string;
    allRead: string;
    allNotices: string;
    noNotices: string;
  };
  academy: {
    description: string;
    empty: string;
    emptyHint: string;
    todo: string;
    done: string;
    minutes: string;
    plusTest: string;
    result: string;
    due: string;
    lessonsOf: string;
    review: string;
    start: string;
    continue: string;
  };
  lesson: {
    saved: string;
    saveFail: string;
    assignedBy: string;
    passScore: string;
    overall: string;
    contents: string;
    finishNext: string;
    finishTest: string;
    next: string;
    toTest: string;
    passedTitle: string;
    passedBody: string;
    failedTitle: string;
    failedBody: string;
    submitFail: string;
    attempts: string;
    attemptsHint: string;
    passed: string;
    failed: string;
    youPassed: string;
    youFailed: string;
    quiz: string;
    quizHint: string;
    answered: string;
    learnerOnly: string;
    checking: string;
    submit: string;
    completedAt: string;
    back: string;
    countLine: string;
    thenTest: string;
    testDone: string;
    viewer: string;
    points: string;
    markDone: string;
    questionsN: string;
    locked: string;
    lockedHint: string;
    resultLine: string;
    retry: string;
    backAcademy: string;
    passedScore: string;
    attempt: string;
  };
  team: {
    title: string;
    employees: string;
    all: string;
    reports: string;
    managerOf: string;
    vacation: string;
    open: string;
    training: string;
    overdueOne: string;
    overdueMany: string;
    back: string;
    since: string;
    assign: string;
    pending: string;
    yearly: string;
    requests: string;
    noRequests: string;
    trainingPanel: string;
    finished: string;
    noCourses: string;
    assignTitle: string;
    assignHint: string;
    assigning: string;
    assignBtn: string;
    assigned: string;
    assignFail: string;
    course: string;
    pickCourse: string;
    mandatory: string;
    dueOptional: string;
    week: string;
    weekHint: string;
    onSite: string;
    away: string;
    pendingAway: string;
    calendar: string;
    calendarHint: string;
    today: string;
    previousMonth: string;
    nextMonth: string;
    approvedLeave: string;
    pendingLeave: string;
    conflicts: string;
    conflictCount: string;
    noConflicts: string;
    coverageConflict: string;
    noAbsences: string;
    absenceCount: string;
    more: string;
  };
  approvals: {
    title: string;
    allTitle: string;
    hrHint: string;
    mgrHint: string;
    action: string;
    decided: string;
    all: string;
    emptyIn: string;
    emptyInHint: string;
    empty: string;
    emptyHint: string;
  };
  notices: {
    title: string;
    description: string;
    markAll: string;
    empty: string;
    emptyHint: string;
    request: string;
    course: string;
    assistant: string;
    system: string;
  };
  hr: {
    title: string;
    denied: string;
    description: string;
    open: string;
    answered: string;
    noneOpen: string;
    noneOpenHint: string;
    noneDone: string;
    noneDoneHint: string;
    waiting: string;
    replied: string;
    yourReply: string;
    reply: string;
    sent: string;
    sentHint: string;
    sendFail: string;
    resetOk: string;
    resetOkHint: string;
    resetFail: string;
    queue: string;
    insights: string;
    insightsHint: string;
    asked: string;
    fromKb: string;
    gaps: string;
    noGaps: string;
    demo: string;
    demoHint: string;
    demoBody: string;
    reset: string;
    replyTitle: string;
    askedBy: string;
    yourAnswer: string;
    sending: string;
    send: string;
    resetTitle: string;
    resetBody: string;
    resetting: string;
  };
  knowledge: {
    title: string;
    articles: string;
    search: string;
    searchPlaceholder: string;
    newArticle: string;
    noArticles: string;
    chooseArticle: string;
    chooseOrCreate: string;
    newTitle: string;
    content: string;
    saveDraftFirst: string;
    titleLabel: string;
    titleRu: string;
    titleKk: string;
    idLabel: string;
    idHint: string;
    questionsLabel: string;
    questionsHint: string;
    questionsRu: string;
    questionsKk: string;
    keywordsLabel: string;
    keywordsRu: string;
    keywordsKk: string;
    answerLabel: string;
    answerHint: string;
    secondaryAnswerLabel: string;
    answerRu: string;
    answerKk: string;
    source: string;
    sourceHint: string;
    documentId: string;
    documentTitle: string;
    documentTitleRu: string;
    documentTitleKk: string;
    section: string;
    sectionRu: string;
    sectionKk: string;
    sectionHint: string;
    revision: string;
    owner: string;
    preview: string;
    previewText: string;
    articleHeading: string;
    answerPlaceholder: string;
    translationsRequired: string;
    sections: string;
    sourceLabel: string;
    history: string;
    versionLabel: string;
    historyHint: string;
    current: string;
    restore: string;
    ownerLabel: string;
    draftSaved: string;
    published: string;
    unpublished: string;
    draft: string;
    saveDraft: string;
    saving: string;
    publish: string;
    publishing: string;
    saveFail: string;
    publishFail: string;
    restoreFail: string;
    notFound: string;
    accessDenied: string;
    back: string;
    aiButton: string;
    aiTitle: string;
    aiDescription: string;
    aiInput: string;
    aiPlaceholder: string;
    aiPrivacy: string;
    aiCancel: string;
    aiGenerate: string;
    aiGenerating: string;
    aiApplied: string;
    aiError: string;
    aiRateLimited: string;
    aiReviewSource: string;
  };
  assistant: {
    description: string;
    kbOnly: string;
    dialog: string;
    hello: string;
    try: string;
    outside: string;
    outsideQ: string;
    askLabel: string;
    placeholder: string;
    ask: string;
    how: string;
    point1: string;
    point2: string;
    point3: string;
    mine: string;
    mineHint: string;
    none: string;
    answered: string;
    waiting: string;
    hrSaid: string;
    source: string;
    related: string;
    noAnswer: string;
    sent: string;
    sentHint: string;
    escalate: string;
    escalating: string;
    hrWill: string;
    orTry: string;
    fail: string;
    escalated: string;
    escalatedHint: string;
    escalateFail: string;
    thinking: string;
    you: string;
    send: string;
    newline: string;
    greet: string;
    botNotice: string;
    messages: Record<string, string>;
    bot: string;
    helpful: string;
    yes: string;
    no: string;
    thanks: string;
    sorry: string;
    canHelp: string;
    toHuman: string;
    restart: string;
    openDraft: string;
    balanceLine: string;
    starters: string[];
    knowledgeEditor: string;
    history: string;
    noHistory: string;
    newChat: string;
    deleteChat: string;
    clearHistory: string;
    restoreHistoryError: string;
    saveHistoryError: string;
  };
}

const ru: Dict = {
  switchLabel: "Язык интерфейса",
  ru: "RU",
  kz: "KZ",
  nav: {
    aria: "Основная навигация",
    main: "Основное",
    home: "Главная",
    profile: "Мой профиль",
    requests: "Мои заявки",
    academy: "Jana Academy",
    assistant: "Al Jana",
    notifications: "Уведомления",
    myTeam: "Моя команда",
    approvals: "Согласования",
    team: "Команда",
    hr: "HR / Админ",
    allRequests: "Все заявки",
    employees: "Сотрудники",
    inbox: "Входящие HR",
    prototype: "Прототип · все данные вымышлены",
    account: "Меню аккаунта",
    signOut: "Выйти",
    openMenu: "Открыть меню",
    collapse: "Свернуть меню",
    expand: "Развернуть меню",
    unread: "Уведомления ({n} непрочитанных)",
  },
  roles: { employee: "Сотрудник", manager: "Руководитель", hr: "HR / Админ" },
  requestType: { vacation: "Отпуск", salary_advance: "Аванс" },
  requestStatus: {
    draft: "Черновик",
    submitted: "Отправлено",
    in_review: "На рассмотрении",
    approved: "Одобрено",
    rejected: "Отклонено",
    cancelled: "Отменено",
    decision: "Решение",
    filed: "Подано",
  },
  courseStatus: { assigned: "Не начато", in_progress: "В процессе", completed: "Завершено", overdue: "Просрочено" },
  common: {
    errorTitle: "Что-то пошло не так",
    retry: "Попробовать снова",
    loading: "Загрузка",
    deniedTitle: "Доступ запрещен",
    deniedBody: "У вас нет доступа к этой странице.",
    deniedNote: "Ограничение действует на уровне сервера, а не только скрыто в интерфейсе.",
    cancel: "Отмена",
    close: "Закрыть",
    back: "Назад",
    working: "Обработка…",
    failed: "Что-то пошло не так.",
    daysShort: "{n} дн.",
    due: "срок: {date}",
    score: "балл: {n}%",
    mandatory: "Обязательный",
    noManager: "Нет руководителя (высшее руководство)",
    read: "прочитано",
    unread: "не прочитано",
    done: "завершено",
    live: "В реальном времени",
    previous: "Назад",
    next: "Вперед",
    noResults: "Нет результатов",
    noResultsDetail: "Пока здесь ничего нет.",
    navigationLabel: "Навигация",
    previousSlide: "Предыдущий слайд",
    nextSlide: "Следующий слайд",
    apiBadRequest: "Проверьте введённые данные и попробуйте снова.",
    apiConflict: "Данные изменились. Обновите страницу и повторите действие.",
    apiNotFound: "Запрошенные данные не найдены.",
    apiForbidden: "У вас нет доступа к этому действию.",
    apiUnauthorized: "Сессия завершилась. Войдите в портал снова.",
    apiNetwork: "Не удалось связаться с сервером. Проверьте подключение.",
    apiUnknown: "Не удалось выполнить запрос. Попробуйте снова.",
  },
  login: {
    title: "Digital HR",
    lead: "Заявки, обучение и ответы на вопросы.\nЕдиный портал вместо пяти систем.",
    email: "Рабочий e-mail",
    password: "Демо-пароль",
    enter: "Войти",
    entering: "Вход…",
    fail: "Не удалось войти.",
    sso: "Тестовый SSO: пароли не требуются в прототипе. В рабочей среде используется корпоративный Identity Provider.",
    ssoPassword: "Тестовый SSO с общим демо-паролем.",
    demos: "Демо-аккаунты",
    demoHint: "демо-пользователи",
    passwordFirst: "Сначала введите демо-пароль выше, затем выберите аккаунт.",
    roles: {
      Employee: "Сотрудник",
      Manager: "Руководитель",
      "HR / Admin": "HR / Админ",
      "Employee · other team": "Сотрудник · другая команда",
      "Manager · other team": "Руководитель · другая команда",
    },
    hints: {
      "aruzhan.kassymova@jana.example": "Курьер · отделение Алматы",
      "daniyar.omarov@jana.example": "Начальник отделения · 4 подчиненных",
      "aigerim.sadykova@jana.example": "HR-директор · вся компания",
      "alikhan.ryskulov@jana.example": "Курьер · подчиняется Madina",
      "madina.tleuova@jana.example": "Начальник отделения · 3 подчиненных",
    },
  },
  dashboard: {
    welcome: "С возвращением, {name}",
    ask: "Спросить Al Jana",
    newRequest: "Новая заявка",
    summary: "Сводка",
    vacationDays: "Дни отпуска",
    availableOf: "доступно из {n} оставшихся",
    pendingBit: " · {n} на рассмотрении",
    openRequests: "Открытые заявки",
    waiting: "ожидают решения",
    noOpen: "нет открытых заявок",
    training: "Обучение",
    overdueN: "{n} просрочено",
    coursesDone: "курсов пройдено",
    unread: "Непрочитанные",
    needsAttention: "требуют внимания",
    allRead: "все прочитано",
    team: "Моя команда",
    teamHint: "Только ваши прямые подчиненные",
    goTeam: "Перейти к команде",
    people: "Сотрудников",
    awaiting: "Ожидают решения",
    overdueTraining: "Просрочено обучение",
    company: "Обзор компании",
    companyHint: "Вид для HR / Администратора",
    hrInbox: "Входящие HR",
    questions: "Вопросов к HR",
    mandatory: "Обязательное обучение",
    recent: "Недавние заявки",
    allRequests: "Все заявки",
    empty: "Заявок пока нет.",
    first: "Подать первую заявку",
    academy: "Обучение в Jana Academy",
    noCourse: "Нет текущих курсов",
    due: "Срок до {date}",
    progress: "Прогресс",
    start: "Начать курс",
    continue: "Продолжить",
    allDone: "Все курсы пройдены. Отличная работа!",
    attention: "Требует внимания",
    allClear: "Всё в порядке, новых задач нет.",
    todoCourse: "Продолжите курс «{title}»",
    todoCourseStart: "Начните курс «{title}»",
    todoOverdue: "Курс «{title}» просрочен",
    todoApprove: "Заявки ждут вашего решения: {n}",
    todoEsc: "Вопросы сотрудников без ответа: {n}",
    todoUnread: "Непрочитанные уведомления: {n}",
    todoRejected: "Заявка отклонена. {comment}",
    todoRejectedPlain: "Заявка отклонена",
    open: "Открыть",
  },
  requests: {
    title: "Мои заявки",
    description: "Все заявки на отпуск и аванс в одном месте с актуальным статусом и полной историей.",
    new: "Новая заявка",
    all: "Все · {n}",
    open: "Открытые · {n}",
    approved: "Одобренные · {n}",
    rejected: "Отклоненные / отмененные · {n}",
    empty: "Заявок пока нет",
    emptyHint: "Подайте заявку на отпуск или аванс и отслеживайте её статус здесь.",
    none: "Ничего не найдено",
    noneHint: "Нет заявок, соответствующих этому фильтру.",
    filed: "Подано {date}",
  },
  request: {
    mine: "Мои заявки",
    approvals: "Согласования",
    heading: "Заявка: {type}",
    byYou: "Подана вами",
    savedByYou: "Сохранена вами",
    live: "В реальном времени",
    canCancel: "Вы можете отозвать эту заявку, пока она открыта.",
    draftActions: "Черновик виден только вам. Отправьте его руководителю, когда будете готовы.",
    awaitsYou: "Эта заявка ожидает вашего решения.",
    details: "Детали заявки",
    employee: "Сотрудник",
    approver: "Согласующий",
    dates: "Даты",
    workDays: "Рабочих дней",
    comment: "Комментарий",
    amount: "Сумма",
    reason: "Причина",
    updated: "Обновлено",
    systems: "Интегрированные системы",
    systemsHint: "Тестовые адаптеры (см. архитектурные заметки)",
    notStarted: "Не запущено",
    afterApprove: "Регистрация после одобрения",
    history: "История",
    historyHint: "Каждое изменение статуса, кто изменил и когда",
    coverageEmpty: "На эти дни в команде никого не останется.",
    coverageDecember: "В декабре из отделения нельзя уйти всем сразу. На эти дни никого не останется.",
    progress: "Прогресс заявки",
    stepDone: "завершено",
  },
  actions: {
    submit: "Отправить руководителю",
    submitTitle: "Отправить черновик руководителю?",
    submitDone: "Заявка отправлена. Руководитель уведомлен.",
    start: "Взять в работу",
    startTitle: "Начать рассмотрение заявки?",
    startDone: "Рассмотрение начато. Сотрудник уведомлен.",
    approve: "Одобрить",
    approveTitle: "Одобрить заявку",
    approveDone: "Заявка одобрена. Сотрудник уведомлен.",
    reject: "Отклонить",
    rejectTitle: "Отклонить заявку",
    rejectDone: "Заявка отклонена. Сотрудник уведомлен.",
    cancel: "Отозвать заявку",
    cancelTitle: "Отозвать эту заявку?",
    cancelDone: "Заявка отменена.",
    fail: "Ошибка выполнения действия",
    reason: "Причина (будет видна сотруднику)",
    note: "Комментарий (необязательно)",
  },
  modal: {
    title: "Новая заявка",
    description: "Заявка сначала поступает вашему руководителю. Вы сможете отслеживать каждый этап на странице заявки.",
    send: "Отправить заявку",
    sending: "Отправка…",
    saveDraft: "Сохранить черновик",
    savingDraft: "Сохранение…",
    draftSaved: "Черновик сохранён",
    draftSavedHint: "Заявка {id} сохранена и пока видна только вам.",
    sent: "Заявка отправлена",
    sentTo: "Заявка {id} направлена: {name}.",
    network: "Ошибка сети.",
    start: "Дата начала",
    end: "Дата окончания",
    pickDates: "Выберите даты, чтобы рассчитать рабочие дни.",
    weekends: "(без учета выходных)",
    available: "{n} доступно",
    pending: " ({n} на рассмотрении)",
    comment: "Комментарий (необязательно)",
    amount: "Сумма (тенге)",
    amountHint: "До {limit} (50% от месячного оклада). Не более одного аванса в месяц.",
    already: "В этом месяце вы уже запрашивали аванс, повторный запрос недоступен.",
    dates: "Даты отпуска",
    pickStart: "Выберите первый день отпуска",
    pickEnd: "Теперь выберите последний день",
    capHint: "Можно выбрать до {n}",
    noDays: "Нет доступных дней отпуска.",
    prevMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    range: "От {min} до {max}",
    tooMuch: "Не больше {max}",
    tooLittle: "Не меньше {min}",
    less: "Уменьшить",
    more: "Увеличить",
    reason: "Причина",
  },
  profile: {
    title: "Мой профиль",
    description: "Данные сотрудника, баланс отпуска, обучение и последние уведомления.",
    name: "ФИО",
    company: "Компания",
    position: "Должность",
    department: "Отдел",
    manager: "Руководитель",
    hired: "Дата приема",
    number: "Табельный номер",
    city: "Город",
    vacation: "Отпуск",
    entitlement: "Годовой отпуск: {n} рабочих дней",
    left: "дней осталось",
    used: "Использовано: ",
    pending: "На рассмотрении: ",
    available: "Доступно для заявки: ",
    remainingOf: "Остаток от годового отпуска",
    request: "Запросить отпуск",
    training: "Назначенное обучение",
    finished: "{done} из {total} завершено",
    academy: "В Академию",
    noCourses: "Нет назначенных курсов.",
    notices: "Уведомления",
    unreadN: "{n} непрочитанных",
    allRead: "Все прочитано",
    allNotices: "Все уведомления",
    noNotices: "Уведомлений пока нет.",
  },
  academy: {
    description: "Курсы, назначенные вам. Изучайте материалы, следите за прогрессом и сдавайте тесты для завершения курсов.",
    empty: "Нет назначенных курсов",
    emptyHint: "Когда руководитель или HR назначит вам курс, он появится здесь и в ваших уведомлениях.",
    todo: "К прохождению",
    done: "Завершено",
    minutes: "{n} мин.",
    plusTest: "{lessons} + тест",
    result: "Результат {n}%",
    due: "Срок до {date}",
    lessonsOf: "{done} из {total} уроков",
    review: "Повторить",
    start: "Начать курс",
    continue: "Продолжить",
  },
  lesson: {
    saved: "Урок завершен",
    saveFail: "Не удалось сохранить прогресс",
    assignedBy: "Назначил(а) {name} · срок до {date} · проходной балл {score}%",
    passScore: "проходной балл {n}%",
    overall: "Общий прогресс",
    contents: "Содержание курса",
    finishNext: "Завершить и продолжить",
    finishTest: "Завершить и перейти к тесту",
    next: "Следующий урок",
    toTest: "Перейти к тесту",
    passedTitle: "Курс завершен",
    passedBody: "Вы набрали {n}%.",
    failedTitle: "Тест пока не сдан",
    failedBody: "Вы набрали {n}%; проходной балл: {pass}%.",
    submitFail: "Не удалось отправить тест.",
    attempts: "Попытки",
    attemptsHint: "История всех попыток сохраняется",
    passed: "Сдано",
    failed: "Не сдано",
    youPassed: "Вы сдали тест! Курс завершен.",
    youFailed: "В этот раз тест не сдан",
    quiz: "Итоговый тест",
    quizHint: "{n} вопросов · проходной балл {score}% · количество попыток не ограничено",
    answered: "Отвечено на {done} из {total}",
    learnerOnly: "Проходить тест может только назначенный сотрудник.",
    checking: "Проверка…",
    submit: "Сдать тест",
    completedAt: "Завершено {date}.",
    back: "Jana Academy",
    countLine: "{done} из {total} уроков",
    thenTest: " · затем тест",
    testDone: " · тест сдан",
    viewer: "Вы просматриваете этот курс как руководитель/HR. Проходить уроки может только назначенный сотрудник.",
    points: "Ключевые моменты",
    markDone: "Отметьте урок завершенным, чтобы сохранить прогресс.",
    questionsN: "{n} вопросов",
    locked: "Тест заблокирован",
    lockedHint: "Пройдите все {total} уроков, чтобы открыть тест. Пройдено: {done}.",
    resultLine: "{correct} из {total} верно · проходной балл {pass}%. Ваш результат сохранен.",
    retry: "Пройти тест повторно",
    backAcademy: "Вернуться в Академию",
    passedScore: "Тест сдан с результатом {n}%",
    attempt: "Попытка {n} · {date}",
  },
  team: {
    title: "Команда",
    employees: "Сотрудники",
    all: "Все сотрудники Jana Group.",
    reports: "Ваши прямые подчиненные{count}. Доступ к сотрудникам вне вашей команды ограничен.",
    managerOf: "руководитель: {name}",
    vacation: "Остаток отпуска",
    open: "Открытые заявки",
    training: "Обучение",
    overdueOne: "курс просрочен",
    overdueMany: "курса(-ов) просрочено",
    back: "Команда",
    since: "в компании с {date}",
    assign: "Назначить курс",
    pending: "На рассмотрении",
    yearly: "Ежегодный отпуск",
    requests: "Заявки",
    noRequests: "Нет заявок.",
    trainingPanel: "Обучение",
    finished: "{done} из {total} завершено",
    noCourses: "Нет назначенных курсов.",
    assignTitle: "Назначить курс",
    assignHint: "{name} получит уведомление, и курс появится в его Академии.",
    assigning: "Назначение…",
    assignBtn: "Назначить",
    assigned: "Курс назначен",
    assignFail: "Не удалось назначить курс.",
    course: "Курс",
    pickCourse: "Выберите курс…",
    mandatory: "(обязательный)",
    dueOptional: "Срок прохождения (необязательно, по умолчанию 30 дней)",
    week: "Две недели команды",
    weekHint: "Кто уже в отпуске и чья заявка ещё открыта",
    onSite: "Эти дни на месте",
    away: "в отпуске",
    pendingAway: "заявка открыта",
    calendar: "Календарь отпусков команды",
    calendarHint: "Согласованные отпуска, открытые заявки и риски покрытия до принятия решения",
    today: "Сегодня",
    previousMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    approvedLeave: "Согласован отпуск",
    pendingLeave: "Ожидает решения",
    conflicts: "Конфликт покрытия",
    conflictCount: "Конфликтных дней: {n}",
    noConflicts: "В этом месяце конфликтов покрытия нет.",
    coverageConflict: "{date} · {group}: отсутствуют все {n} сотрудника(-ов)",
    noAbsences: "Все на месте",
    absenceCount: "В отпуске: {n}",
    more: "+ ещё {n}",
  },
  approvals: {
    title: "Согласования",
    allTitle: "Все заявки",
    hrHint: "Просмотр по всей компании. Принятие решений по любым заявкам, кроме собственных.",
    mgrHint: "Заявки только от ваших прямых подчиненных. Никто вне вашей команды здесь не отображается.",
    action: "Требуют решения · {n}",
    decided: "Рассмотрено · {n}",
    all: "Все · {n}",
    emptyIn: "Входящих нет",
    emptyInHint: "Нет заявок, ожидающих вашего решения.",
    empty: "Ничего не найдено",
    emptyHint: "В этом разделе нет заявок.",
  },
  notices: {
    title: "Уведомления",
    description: "Изменения статусов ваших заявок, назначение и завершение курсов, ответы от HR.",
    markAll: "Прочитать все",
    empty: "Все уведомления прочитаны",
    emptyHint: "Новые оповещения появляются здесь и во всплывающих уведомлениях в момент события.",
    request: "Заявка",
    course: "Обучение",
    assistant: "Al Jana",
    system: "Система",
  },
  hr: {
    title: "Входящие HR",
    denied: "Только HR / Администратор может открывать входящие HR.",
    description: "Вопросы, на которые не смогла ответить Al Jana, пробелы в базе знаний и управление демо-данными.",
    open: "Открытые · {n}",
    answered: "С ответом · {n}",
    noneOpen: "Нет открытых вопросов",
    noneOpenHint: "Когда Al Jana не может найти ответ и сотрудник передает вопрос в HR, он появляется здесь.",
    noneDone: "Ответов пока нет",
    noneDoneHint: "Отправленные вами ответы отображаются здесь.",
    waiting: "Ожидает ответа",
    replied: "Отвечено",
    yourReply: "Ваш ответ",
    reply: "Ответить",
    sent: "Ответ отправлен",
    sentHint: "{name} получил(а) уведомление.",
    sendFail: "Не удалось отправить ответ.",
    resetOk: "Демо-данные восстановлены",
    resetOkHint: "Все демонстрационные данные возвращены к исходному состоянию.",
    resetFail: "Сброс не удался",
    queue: "Переданные вопросы",
    insights: "Аналитика Al Jana",
    insightsHint: "Помогает улучшать базу знаний",
    asked: "Вопросов задано",
    fromKb: "Ответов из базы",
    gaps: "Без ответа, последние",
    noGaps: "Нет. База знаний покрыла все заданные вопросы.",
    demo: "Управление демо",
    demoHint: "Только для прототипа",
    demoBody: "Сбросьте все заявки, курсы, уведомления и вопросы до исходного состояния демо-данных, чтобы пройти сценарии заново.",
    reset: "Сбросить демо-данные",
    replyTitle: "Ответить сотруднику",
    askedBy: "{name} спросил(а): «{question}»",
    yourAnswer: "Ваш ответ",
    sending: "Отправка…",
    send: "Отправить ответ",
    resetTitle: "Сбросить демо-данные?",
    resetBody: "Это удалит все созданные во время демонстрации данные (новые заявки, назначения, уведомления, вопросы в HR) и восстановит исходные данные. Текущие сессии останутся активными.",
    resetting: "Сброс…",
  },
  knowledge: {
    title: "База знаний Al Jana",
    articles: "Статьи",
    search: "Найти статью",
    searchPlaceholder: "Например, отпуск или аванс",
    newArticle: "Новая статья",
    noArticles: "Ничего не найдено.",
    chooseArticle: "Выберите статью",
    chooseOrCreate: "Выберите материал слева или создайте новый.",
    newTitle: "Новая статья",
    content: "Содержание статьи",
    saveDraftFirst: "Сначала сохраните черновик. Изменения станут доступны Al Jana только после публикации.",
    titleLabel: "Заголовок статьи",
    titleRu: "Заголовок на русском",
    titleKk: "Заголовок на казахском",
    idLabel: "ID статьи",
    idHint: "Латиница, цифры и дефис; после создания не меняется.",
    questionsLabel: "Примеры вопросов — по одному в строке",
    questionsHint: "Так Al Jana поймёт, когда показать этот ответ.",
    questionsRu: "Примеры вопросов на русском — по одному в строке",
    questionsKk: "Примеры вопросов на казахском — по одному в строке",
    keywordsLabel: "Ключевые слова — по одному в строке",
    keywordsRu: "Ключевые слова на русском — по одному в строке",
    keywordsKk: "Ключевые слова на казахском — по одному в строке",
    answerLabel: "Основной ответ",
    answerHint: "Введите утверждённый ответ из исходного материала.",
    secondaryAnswerLabel: "Дополнительный вариант ответа",
    answerRu: "Ответ на русском",
    answerKk: "Ответ на казахском",
    source: "Источник ответа",
    sourceHint: "Эти данные появятся по ссылке рядом с ответом Al Jana.",
    documentId: "Код документа",
    documentTitle: "Название документа",
    documentTitleRu: "Название документа на русском",
    documentTitleKk: "Название документа на казахском",
    section: "Раздел документа",
    sectionRu: "Раздел на русском",
    sectionKk: "Раздел на казахском",
    sectionHint: "Например: §2.1 Ежегодный оплачиваемый отпуск",
    revision: "Редакция документа",
    owner: "Владелец исходного документа",
    preview: "Предпросмотр для сотрудника",
    previewText: "Пример отображения материала в базе Al Jana.",
    articleHeading: "Заголовок статьи",
    answerPlaceholder: "Текст ответа появится здесь.",
    translationsRequired: "Заполните русскую и казахскую версии заголовка, ответа и источника.",
    sections: "Разделы документа",
    sourceLabel: "Источник",
    history: "История публикаций",
    versionLabel: "Версия",
    historyHint: "Старая версия сначала загружается как черновик — её можно проверить и только потом опубликовать.",
    current: "текущая",
    restore: "Загрузить в черновик",
    ownerLabel: "Последний редактор",
    draftSaved: "Черновик сохранён",
    published: "Опубликована",
    unpublished: "Не опубликована",
    draft: "Черновик",
    saveDraft: "Сохранить черновик",
    saving: "Сохраняем…",
    publish: "Опубликовать",
    publishing: "Публикуем…",
    saveFail: "Не удалось сохранить статью.",
    publishFail: "Не удалось опубликовать статью.",
    restoreFail: "Не удалось восстановить версию.",
    notFound: "Документ не найден.",
    accessDenied: "Редактор доступен только сотрудникам HR.",
    back: "К Al Jana",
    aiButton: "Заполнить с ИИ",
    aiTitle: "Подготовить статью с ИИ",
    aiDescription: "Вставьте готовый материал на любом языке. ИИ подготовит поля на русском и казахском для вашей проверки.",
    aiInput: "Исходный материал",
    aiPlaceholder: "Вставьте утверждённый текст, условия и сведения о документе…",
    aiPrivacy: "Текст будет отправлен в Gemini. Проверьте результат перед сохранением и публикацией.",
    aiCancel: "Отмена",
    aiGenerate: "Заполнить форму",
    aiGenerating: "Готовим статью…",
    aiApplied: "Форма заполнена — проверьте текст",
    aiError: "Не удалось подготовить статью. Проверьте настройки ИИ и попробуйте ещё раз.",
    aiRateLimited: "Достигнут лимит генерации. Попробуйте позже.",
    aiReviewSource: "Часть сведений об источнике заполнена как внутренняя статья HR. Проверьте код, название и раздел перед сохранением.",
  },
  assistant: {
    description: "Ваш HR-ассистент. Отвечает строго по корпоративной базе знаний HR, всегда указывает источник и не выдумывает факты.",
    kbOnly: "Ответы только из базы знаний HR",
    dialog: "Диалог",
    hello: "Здравствуйте! Спросите меня об отпуске, авансе, больничных, рабочем времени, льготах или обучении. Я отвечаю только по нашей базе знаний HR и всегда показываю источник. Если точного ответа нет, я честно сообщу об этом и предложу передать вопрос в HR.",
    try: "Попробуйте спросить",
    outside: "Вне базы знаний (пример передачи в HR)",
    outsideQ: "Есть ли у нас опционы на акции?",
    askLabel: "Задать вопрос HR",
    placeholder: "Задайте вопрос HR…",
    ask: "Спросить",
    how: "Как работает Al Jana",
    point1: "Ответы составлены HR и отображаются слово в слово. Ничего не генерируется и не додумывается.",
    point2: "Каждый ответ содержит ссылку на исходный документ и раздел.",
    point3: "Нет надежного совпадения? Ассистент скажет об этом и предложит передать вопрос в HR.",
    mine: "Мои вопросы в HR",
    mineHint: "Передано из Al Jana",
    none: "Пока вопросов нет. Если Al Jana не сможет ответить, вы сможете отправить вопрос в HR.",
    answered: "Отвечено",
    waiting: "Ожидает HR",
    hrSaid: "HR ответил(а)",
    source: "Источник",
    related: "Похожие вопросы",
    noAnswer: "Надежный ответ не найден",
    sent: "Передано в HR · {id}",
    sentHint: "Вы получите уведомление, когда HR ответит. Отслеживать можно в разделе «Мои вопросы в HR».",
    escalate: "Передать этот вопрос в HR",
    escalating: "Отправка…",
    hrWill: "Сотрудник HR подготовит ответ.",
    orTry: "Или попробуйте один из этих вопросов",
    fail: "Al Jana не смогла ответить",
    escalated: "Вопрос передан в HR",
    escalatedHint: "Обращение {id}. Вы получите уведомление, когда HR ответит.",
    escalateFail: "Не удалось связаться с HR",
    thinking: "Al Jana ищет ответ в базе знаний",
    you: "Вы",
    send: "отправить",
    newline: "новая строка",
    greet: "Здравствуйте, {name}! Чем помочь?",
    botNotice: "Я бот HR. Отвечаю только по базе знаний и всегда показываю источник.",
    messages: {
      greeting: "Здравствуйте! Я Al Jana — HR-ассистент Jana Group. Чем я могу помочь?",
      howareyou: "Спасибо, всё хорошо! Чем могу помочь по вопросам HR?",
      thanks: "Пожалуйста! Если появятся другие вопросы, обращайтесь.",
      bye: "До свидания!",
      identity: "Я Al Jana, HR-ассистент Jana Group.",
      noAnswer: "В базе знаний HR не найден надёжный ответ. Могу передать вопрос сотруднику HR.",
      empty: "Введите вопрос или выберите один из примеров ниже.",
      injection: "Я отвечаю на вопросы по базе знаний HR. Могу передать этот вопрос сотруднику HR.",
    },
    bot: "БОТ",
    helpful: "Ответ помог?",
    yes: "Да",
    no: "Нет",
    thanks: "Спасибо за оценку.",
    sorry: "Жаль. Могу передать вопрос специалисту HR.",
    canHelp: "Я могу помочь с этим:",
    toHuman: "Спросить специалиста HR",
    restart: "Новый диалог",
    openDraft: "Открыть черновик",
    balanceLine: "Вам доступно {n} дн.",
    starters: [
      "Сколько дней отпуска мне положено?",
      "Как запросить аванс по зарплате?",
      "Что делать, если я заболел?",
      "Могу ли я работать из дома?",
      "В какой день выплачивается зарплата?",
    ],
    knowledgeEditor: "Редактор базы знаний",
    history: "История чатов",
    noHistory: "Сохранённых чатов пока нет.",
    newChat: "Новый чат",
    deleteChat: "Удалить чат",
    clearHistory: "Очистить историю",
    restoreHistoryError: "Не удалось прочитать историю чата.",
    saveHistoryError: "Не удалось сохранить историю на этом устройстве.",
  },
};

const kk: Dict = {
  switchLabel: "Интерфейс тілі",
  ru: "RU",
  kz: "KZ",
  nav: {
    aria: "Негізгі навигация",
    main: "Негізгі",
    home: "Басты бет",
    profile: "Менің профилім",
    requests: "Менің өтінімдерім",
    academy: "Jana Academy",
    assistant: "Al Jana",
    notifications: "Хабарламалар",
    myTeam: "Менің командам",
    approvals: "Келісу",
    team: "Команда",
    hr: "HR / Әкімші",
    allRequests: "Барлық өтінім",
    employees: "Қызметкерлер",
    inbox: "HR кіріс жәшігі",
    prototype: "Прототип · барлық дерек ойдан шығарылған",
    account: "Аккаунт мәзірі",
    signOut: "Шығу",
    openMenu: "Мәзірді ашу",
    collapse: "Мәзірді жию",
    expand: "Мәзірді ашу",
    unread: "Хабарламалар ({n} оқылмаған)",
  },
  roles: { employee: "Қызметкер", manager: "Басшы", hr: "HR / Әкімші" },
  requestType: { vacation: "Демалыс", salary_advance: "Аванс" },
  requestStatus: {
    draft: "Жоба",
    submitted: "Жіберілді",
    in_review: "Қаралуда",
    approved: "Мақұлданды",
    rejected: "Қабылданбады",
    cancelled: "Болдырылмады",
    decision: "Шешім",
    filed: "Берілді",
  },
  courseStatus: { assigned: "Басталмаған", in_progress: "Жүріп жатыр", completed: "Аяқталды", overdue: "Мерзімі өтті" },
  common: {
    errorTitle: "Бірдеңе дұрыс болмады",
    retry: "Қайта көру",
    loading: "Жүктелуде",
    deniedTitle: "Қол жеткізу жабық",
    deniedBody: "Бұл бетке рұқсатыңыз жоқ.",
    close: "Жабу",
    deniedNote: "Шектеу серверде қолданылады, тек интерфейсте жасырылмайды.",
    cancel: "Болдырмау",
    back: "Артқа",
    working: "Орындалуда…",
    failed: "Бірдеңе дұрыс болмады.",
    daysShort: "{n} күн",
    due: "мерзімі: {date}",
    score: "балл: {n}%",
    mandatory: "Міндетті",
    noManager: "Басшы жоқ (жоғары басшылық)",
    read: "оқылды",
    unread: "оқылмаған",
    done: "аяқталды",
    live: "Нақты уақытта",
    previous: "Артқа",
    next: "Алға",
    noResults: "Нәтиже жоқ",
    noResultsDetail: "Әзірге мұнда ештеңе жоқ.",
    navigationLabel: "Навигация",
    previousSlide: "Алдыңғы слайд",
    nextSlide: "Келесі слайд",
    apiBadRequest: "Енгізілген деректерді тексеріп, қайталап көріңіз.",
    apiConflict: "Деректер өзгерді. Бетті жаңартып, әрекетті қайталаңыз.",
    apiNotFound: "Сұралған дерек табылмады.",
    apiForbidden: "Бұл әрекетке рұқсатыңыз жоқ.",
    apiUnauthorized: "Сессия аяқталды. Порталға қайта кіріңіз.",
    apiNetwork: "Серверге қосылу мүмкін болмады. Байланысты тексеріңіз.",
    apiUnknown: "Сұрауды орындау мүмкін болмады. Қайталап көріңіз.",
  },
  login: {
    title: "Digital HR",
    lead: "Өтінімдер, оқыту және сұрақтарға жауап.\nБес жүйенің орнына бір портал.",
    email: "Жұмыс e-mail",
    password: "Демо-құпиясөз",
    enter: "Кіру",
    entering: "Кіру…",
    fail: "Кіру мүмкін болмады.",
    sso: "Сынақ SSO: прототипте құпиясөз керек емес. Жұмыс ортасында корпоративтік Identity Provider қолданылады.",
    ssoPassword: "Ортақ демо-құпиясөзі бар сынақ SSO.",
    demos: "Демо-аккаунттар",
    demoHint: "демо-пайдаланушылар",
    passwordFirst: "Алдымен жоғарыдағы демо-құпиясөзді енгізіп, содан кейін аккаунтты таңдаңыз.",
    roles: {
      Employee: "Қызметкер",
      Manager: "Басшы",
      "HR / Admin": "HR / Әкімші",
      "Employee · other team": "Қызметкер · басқа команда",
      "Manager · other team": "Басшы · басқа команда",
    },
    hints: {
      "aruzhan.kassymova@jana.example": "Курьер · Алматы бөлімшесі",
      "daniyar.omarov@jana.example": "Бөлімше басшысы · 4 бағынышты",
      "aigerim.sadykova@jana.example": "HR-директор · бүкіл компания",
      "alikhan.ryskulov@jana.example": "Курьер · Madina-ға бағынады",
      "madina.tleuova@jana.example": "Бөлімше басшысы · 3 бағынышты",
    },
  },
  dashboard: {
    welcome: "Қош келдіңіз, {name}",
    ask: "Al Jana-дан сұрау",
    newRequest: "Жаңа өтінім",
    summary: "Жиынтық",
    vacationDays: "Демалыс күндері",
    availableOf: "{n} қалғаннан қолжетімді",
    pendingBit: " · {n} қаралуда",
    openRequests: "Ашық өтінімдер",
    waiting: "шешім күтуде",
    noOpen: "ашық өтінім жоқ",
    training: "Оқыту",
    overdueN: "{n} мерзімі өтті",
    coursesDone: "курс аяқталды",
    unread: "Оқылмаған",
    needsAttention: "назар керек",
    allRead: "бәрі оқылды",
    team: "Менің командам",
    teamHint: "Тек тікелей бағыныштылар",
    goTeam: "Командаға өту",
    people: "Қызметкер",
    awaiting: "Шешім күтуде",
    overdueTraining: "Мерзімі өткен оқыту",
    company: "Компания шолуы",
    companyHint: "HR / Әкімші көрінісі",
    hrInbox: "HR кіріс жәшігі",
    questions: "HR-ға сұрақ",
    mandatory: "Міндетті оқыту",
    recent: "Соңғы өтінімдер",
    allRequests: "Барлық өтінім",
    empty: "Өтінім әлі жоқ.",
    first: "Алғашқы өтінім беру",
    academy: "Jana Academy оқуы",
    noCourse: "Ағымдағы курс жоқ",
    due: "Мерзімі {date}",
    progress: "Прогресс",
    start: "Курсты бастау",
    continue: "Жалғастыру",
    allDone: "Барлық курс аяқталды.",
    attention: "Назар аударыңыз",
    allClear: "Бәрі жақсы, жаңа тапсырма жоқ.",
    todoCourse: "«{title}» курсын жалғастырыңыз",
    todoCourseStart: "«{title}» курсын бастаңыз",
    todoOverdue: "«{title}» курсының мерзімі өтті",
    todoApprove: "Шешіміңізді күтетін өтінімдер: {n}",
    todoEsc: "Жауапсыз сұрақтар: {n}",
    todoUnread: "Оқылмаған хабарламалар: {n}",
    todoRejected: "Өтінім қабылданбады. {comment}",
    todoRejectedPlain: "Өтінім қабылданбады",
    open: "Ашу",
  },
  requests: {
    title: "Менің өтінімдерім",
    description: "Демалыс пен аванс өтінімдері бір жерде: күйі мен толық тарихы.",
    new: "Жаңа өтінім",
    all: "Барлығы · {n}",
    open: "Ашық · {n}",
    approved: "Мақұлданған · {n}",
    rejected: "Қабылданбаған / болдырылмаған · {n}",
    empty: "Өтінім әлі жоқ",
    emptyHint: "Демалыс немесе аванс өтінімін беріп, күйін осында бақылаңыз.",
    none: "Ештеңе табылмады",
    noneHint: "Бұл сүзгіге сай өтінім жоқ.",
    filed: "Берілді {date}",
  },
  request: {
    mine: "Менің өтінімдерім",
    approvals: "Келісу",
    heading: "Өтінім: {type}",
    byYou: "Сіз бердіңіз",
    savedByYou: "Сіз сақтадыңыз",
    live: "Нақты уақытта",
    canCancel: "Өтінім ашық тұрғанда оны кері қайтара аласыз.",
    draftActions: "Жоба тек сізге көрінеді. Дайын болғанда оны басшыға жіберіңіз.",
    awaitsYou: "Бұл өтінім сіздің шешіміңізді күтуде.",
    details: "Өтінім мәліметі",
    employee: "Қызметкер",
    approver: "Келісуші",
    dates: "Күндер",
    workDays: "Жұмыс күні",
    comment: "Пікір",
    amount: "Сома",
    reason: "Себебі",
    updated: "Жаңартылды",
    systems: "Байланысқан жүйелер",
    systemsHint: "Сынақ адаптерлері",
    notStarted: "Басталмаған",
    afterApprove: "Мақұлданғаннан кейін тіркеледі",
    history: "Тарих",
    historyHint: "Әр күй өзгерісі: кім және қашан",
    coverageEmpty: "Осы күндері командада ешкім қалмайды.",
    coverageDecember: "Желтоқсанда бөлімшеден бәрі бірдей кете алмайды. Осы күндері ешкім қалмайды.",
    progress: "Өтінім барысы",
    stepDone: "аяқталды",
  },
  actions: {
    submit: "Басшыға жіберу",
    submitTitle: "Жобаны басшыға жіберу керек пе?",
    submitDone: "Өтінім жіберілді. Басшыға хабар берілді.",
    start: "Жұмысқа алу",
    startTitle: "Өтінімді қарауды бастау керек пе?",
    startDone: "Қарау басталды. Қызметкерге хабар жіберілді.",
    approve: "Мақұлдау",
    approveTitle: "Өтінімді мақұлдау",
    approveDone: "Өтінім мақұлданды. Қызметкерге хабар жіберілді.",
    reject: "Қабылдамау",
    rejectTitle: "Өтінімді қабылдамау",
    rejectDone: "Өтінім қабылданбады. Қызметкерге хабар жіберілді.",
    cancel: "Өтінімді кері қайтару",
    cancelTitle: "Осы өтінімді кері қайтару керек пе?",
    cancelDone: "Өтінім болдырылмады.",
    fail: "Әрекет орындалмады",
    reason: "Себебі (қызметкер көреді)",
    note: "Пікір (міндетті емес)",
  },
  modal: {
    title: "Жаңа өтінім",
    description: "Өтінім алдымен басшыңызға түседі. Әр кезеңді өтінім бетінде көресіз.",
    send: "Өтінім жіберу",
    sending: "Жіберілуде…",
    saveDraft: "Жобаны сақтау",
    savingDraft: "Сақталуда…",
    draftSaved: "Жоба сақталды",
    draftSavedHint: "{id} өтінімі сақталды және әзірге тек сізге көрінеді.",
    sent: "Өтінім жіберілді",
    sentTo: "{id} өтінімі {name} адамға жіберілді.",
    network: "Желі қатесі.",
    start: "Басталу күні",
    end: "Аяқталу күні",
    pickDates: "Жұмыс күндерін есептеу үшін күндерді таңдаңыз.",
    weekends: "(демалыс күндерін есептемегенде)",
    available: "{n} қолжетімді",
    pending: " ({n} қаралуда)",
    comment: "Пікір (міндетті емес)",
    amount: "Сома (теңге)",
    amountHint: "{limit} дейін (айлықтың 50%). Айына бір аванс.",
    already: "Осы айда аванс сұралған, қайта сұрауға болмайды.",
    dates: "Демалыс күндері",
    pickStart: "Демалыстың бірінші күнін таңдаңыз",
    pickEnd: "Енді соңғы күнді таңдаңыз",
    capHint: "{n} дейін таңдауға болады",
    noDays: "Қолжетімді демалыс күні жоқ.",
    prevMonth: "Алдыңғы ай",
    nextMonth: "Келесі ай",
    range: "{min} – {max}",
    tooMuch: "{max} аспауы керек",
    tooLittle: "{min} кем болмауы керек",
    less: "Азайту",
    more: "Көбейту",
    reason: "Себебі",
  },
  profile: {
    title: "Менің профилім",
    description: "Қызметкер деректері, демалыс қалдығы, оқыту және соңғы хабарламалар.",
    name: "Аты-жөні",
    company: "Компания",
    position: "Лауазым",
    department: "Бөлім",
    manager: "Басшы",
    hired: "Қабылданған күні",
    number: "Табель нөмірі",
    city: "Қала",
    vacation: "Демалыс",
    entitlement: "Жылдық демалыс: {n} жұмыс күні",
    left: "күн қалды",
    used: "Пайдаланылды: ",
    pending: "Қаралуда: ",
    available: "Өтінімге қолжетімді: ",
    remainingOf: "Жылдық демалыстан қалғаны",
    request: "Демалыс сұрау",
    training: "Тағайындалған оқыту",
    finished: "{done} / {total} аяқталды",
    academy: "Академияға",
    noCourses: "Тағайындалған курс жоқ.",
    notices: "Хабарламалар",
    unreadN: "{n} оқылмаған",
    allRead: "Бәрі оқылды",
    allNotices: "Барлық хабарлама",
    noNotices: "Хабарлама әлі жоқ.",
  },
  academy: {
    description: "Сізге тағайындалған курстар. Материалды оқып, прогресті көріп, тест тапсырыңыз.",
    empty: "Тағайындалған курс жоқ",
    emptyHint: "Басшы немесе HR курс тағайындаса, ол осында және хабарламада көрінеді.",
    todo: "Өту керек",
    done: "Аяқталды",
    minutes: "{n} мин.",
    plusTest: "{lessons} + тест",
    result: "Нәтиже {n}%",
    due: "Мерзімі {date}",
    lessonsOf: "{done} / {total} сабақ",
    review: "Қайталау",
    start: "Курсты бастау",
    continue: "Жалғастыру",
  },
  lesson: {
    saved: "Сабақ аяқталды",
    saveFail: "Прогресті сақтау мүмкін болмады",
    assignedBy: "Тағайындаған {name} · мерзімі {date} · өту балы {score}%",
    passScore: "өту балы {n}%",
    overall: "Жалпы прогресс",
    contents: "Курс мазмұны",
    finishNext: "Аяқтап, жалғастыру",
    finishTest: "Аяқтап, тестке өту",
    next: "Келесі сабақ",
    toTest: "Тестке өту",
    passedTitle: "Курс аяқталды",
    passedBody: "Сіз {n}% жинадыңыз.",
    failedTitle: "Тест әлі тапсырылмады",
    failedBody: "Сіз {n}% жинадыңыз; өту балы: {pass}%.",
    submitFail: "Тестті жіберу мүмкін болмады.",
    attempts: "Әрекеттер",
    attemptsHint: "Барлық әрекет тарихы сақталады",
    passed: "Тапсырылды",
    failed: "Тапсырылмады",
    youPassed: "Тестті тапсырдыңыз! Курс аяқталды.",
    youFailed: "Бұл жолы тест тапсырылмады",
    quiz: "Қорытынды тест",
    quizHint: "{n} сұрақ · өту балы {score}% · әрекет саны шектелмеген",
    answered: "{done} / {total} жауап берілді",
    learnerOnly: "Тестті тек тағайындалған қызметкер тапсыра алады.",
    checking: "Тексерілуде…",
    submit: "Тестті тапсыру",
    completedAt: "Аяқталды {date}.",
    back: "Jana Academy",
    countLine: "{done} / {total} сабақ",
    thenTest: " · содан кейін тест",
    testDone: " · тест тапсырылды",
    viewer: "Бұл курсты басшы/HR ретінде қарап отырсыз. Сабақты тек тағайындалған қызметкер өтеді.",
    points: "Негізгі тұстар",
    markDone: "Прогресті сақтау үшін сабақты аяқталды деп белгілеңіз.",
    questionsN: "{n} сұрақ",
    locked: "Тест жабық",
    lockedHint: "Тестті ашу үшін барлық {total} сабақты өтіңіз. Өтілді: {done}.",
    resultLine: "{correct} / {total} дұрыс · өту балы {pass}%. Нәтиже сақталды.",
    retry: "Тестті қайта тапсыру",
    backAcademy: "Академияға оралу",
    passedScore: "Тест {n}% нәтижемен тапсырылды",
    attempt: "Әрекет {n} · {date}",
  },
  team: {
    title: "Команда",
    employees: "Қызметкерлер",
    all: "Jana Group қызметкерлерінің бәрі.",
    reports: "Тікелей бағыныштылар{count}. Командаңыздан тыс қызметкерлерге қол жеткізу шектелген.",
    managerOf: "басшы: {name}",
    vacation: "Демалыс қалдығы",
    open: "Ашық өтінім",
    training: "Оқыту",
    overdueOne: "курс мерзімі өтті",
    overdueMany: "курс мерзімі өтті",
    back: "Команда",
    since: "компанияда {date} бастап",
    assign: "Курс тағайындау",
    pending: "Қаралуда",
    yearly: "Жылдық демалыс",
    requests: "Өтінімдер",
    noRequests: "Өтінім жоқ.",
    trainingPanel: "Оқыту",
    finished: "{done} / {total} аяқталды",
    noCourses: "Тағайындалған курс жоқ.",
    assignTitle: "Курс тағайындау",
    assignHint: "{name} хабарлама алады, курс оның Академиясында көрінеді.",
    assigning: "Тағайындалуда…",
    assignBtn: "Тағайындау",
    assigned: "Курс тағайындалды",
    assignFail: "Курсты тағайындау мүмкін болмады.",
    course: "Курс",
    pickCourse: "Курсты таңдаңыз…",
    mandatory: "(міндетті)",
    dueOptional: "Өту мерзімі (міндетті емес, әдепкі 30 күн)",
    week: "Команданың екі аптасы",
    weekHint: "Кім демалыста және кімнің өтінімі ашық",
    onSite: "Осы күндері орнында",
    away: "демалыста",
    pendingAway: "өтінім ашық",
    calendar: "Команданың демалыс күнтізбесі",
    calendarHint: "Мақұлданған демалыстар, ашық өтінімдер және шешімге дейінгі қамту тәуекелдері",
    today: "Бүгін",
    previousMonth: "Алдыңғы ай",
    nextMonth: "Келесі ай",
    approvedLeave: "Демалыс мақұлданды",
    pendingLeave: "Шешім күтуде",
    conflicts: "Қамту қайшылығы",
    conflictCount: "Қайшылықты күндер: {n}",
    noConflicts: "Бұл айда қамту қайшылығы жоқ.",
    coverageConflict: "{date} · {group}: барлық {n} қызметкер жоқ",
    noAbsences: "Барлығы орнында",
    absenceCount: "Демалыста: {n}",
    more: "+ тағы {n}",
  },
  approvals: {
    title: "Келісу",
    allTitle: "Барлық өтінім",
    hrHint: "Бүкіл компания. Өз өтініміңізден басқа кез келгені бойынша шешім.",
    mgrHint: "Тек тікелей бағыныштылардың өтінімдері. Командаңыздан тыс ешкім мұнда жоқ.",
    action: "Шешім керек · {n}",
    decided: "Қаралды · {n}",
    all: "Барлығы · {n}",
    emptyIn: "Кіріс жоқ",
    emptyInHint: "Шешіміңізді күткен өтінім жоқ.",
    empty: "Ештеңе табылмады",
    emptyHint: "Бұл бөлімде өтінім жоқ.",
  },
  notices: {
    title: "Хабарламалар",
    description: "Өтінім күйі, курс тағайындау мен аяқтау, HR жауаптары.",
    markAll: "Барлығын оқу",
    empty: "Барлық хабарлама оқылды",
    emptyHint: "Жаңа хабарлама осында және оқиға сәтінде қалқыма хабарда көрінеді.",
    request: "Өтінім",
    course: "Оқыту",
    assistant: "Al Jana",
    system: "Жүйе",
  },
  hr: {
    title: "HR кіріс жәшігі",
    denied: "HR кіріс жәшігін тек HR / Әкімші аша алады.",
    description: "Al Jana жауап бере алмаған сұрақтар, білім базасындағы олқылық және демо-дерек.",
    open: "Ашық · {n}",
    answered: "Жауап бар · {n}",
    noneOpen: "Ашық сұрақ жоқ",
    noneOpenHint: "Al Jana жауап таппай, қызметкер сұрақты HR-ға жіберсе, ол осында шығады.",
    noneDone: "Жауап әлі жоқ",
    noneDoneHint: "Жіберген жауаптарыңыз осында көрінеді.",
    waiting: "Жауап күтуде",
    replied: "Жауап берілді",
    yourReply: "Сіздің жауабыңыз",
    reply: "Жауап беру",
    sent: "Жауап жіберілді",
    sentHint: "{name} хабарлама алды.",
    sendFail: "Жауап жіберу мүмкін болмады.",
    resetOk: "Демо-дерек қалпына келтірілді",
    resetOkHint: "Барлық демо-дерек бастапқы күйге қайтты.",
    resetFail: "Қалпына келтіру сәтсіз",
    queue: "Жіберілген сұрақтар",
    insights: "Al Jana талдауы",
    insightsHint: "Білім базасын жақсартуға көмектеседі",
    asked: "Қойылған сұрақ",
    fromKb: "Базадан жауап",
    gaps: "Жауапсыз, соңғылары",
    noGaps: "Жоқ. Білім базасы барлық сұрақты жапты.",
    demo: "Демоны басқару",
    demoHint: "Тек прототип үшін",
    demoBody: "Сценарийді қайта өту үшін өтінім, курс, хабарлама және сұрақтарды бастапқы демо-күйге қайтарыңыз.",
    reset: "Демо-деректі қалпына келтіру",
    replyTitle: "Қызметкерге жауап",
    askedBy: "{name} сұрады: «{question}»",
    yourAnswer: "Сіздің жауабыңыз",
    sending: "Жіберілуде…",
    send: "Жауап жіберу",
    resetTitle: "Демо-деректі қалпына келтіру керек пе?",
    resetBody: "Көрсетілімде жасалған дерек (жаңа өтінім, тағайындау, хабарлама, HR сұрақтары) жойылып, бастапқы дерек қайтады. Сессиялар ашық қалады.",
    resetting: "Қалпына келтіру…",
  },
  knowledge: {
    title: "Al Jana білім базасы",
    articles: "Мақалалар",
    search: "Мақаланы іздеу",
    searchPlaceholder: "Мысалы, демалыс немесе аванс",
    newArticle: "Жаңа мақала",
    noArticles: "Ештеңе табылмады.",
    chooseArticle: "Мақаланы таңдаңыз",
    chooseOrCreate: "Сол жақтан материалды таңдаңыз немесе жаңасын жасаңыз.",
    newTitle: "Жаңа мақала",
    content: "Мақала мазмұны",
    saveDraftFirst: "Алдымен жобаны сақтаңыз. Өзгерістер жарияланғаннан кейін Al Jana жүйесінде қолжетімді болады.",
    titleLabel: "Мақала тақырыбы",
    titleRu: "Орыс тіліндегі тақырып",
    titleKk: "Қазақ тіліндегі тақырып",
    idLabel: "Мақала ID-і",
    idHint: "Латын әріптері, сандар және дефис; жасалғаннан кейін өзгермейді.",
    questionsLabel: "Сұрақ үлгілері — әр жолға біреуден",
    questionsHint: "Al Jana бұл жауапты қашан көрсету керегін түсінеді.",
    questionsRu: "Орыс тіліндегі сұрақ үлгілері — әр жолға біреуден",
    questionsKk: "Қазақ тіліндегі сұрақ үлгілері — әр жолға біреуден",
    keywordsLabel: "Түйінді сөздер — әр жолға біреуден",
    keywordsRu: "Орыс тіліндегі түйінді сөздер — әр жолға біреуден",
    keywordsKk: "Қазақ тіліндегі түйінді сөздер — әр жолға біреуден",
    answerLabel: "Негізгі жауап",
    answerHint: "Бастапқы материалдағы бекітілген жауапты енгізіңіз.",
    secondaryAnswerLabel: "Жауаптың қосымша нұсқасы",
    answerRu: "Орыс тіліндегі жауап",
    answerKk: "Қазақ тіліндегі жауап",
    source: "Жауап дереккөзі",
    sourceHint: "Бұл мәліметтер Al Jana жауабының жанындағы сілтемеде көрінеді.",
    documentId: "Құжат коды",
    documentTitle: "Құжат атауы",
    documentTitleRu: "Құжаттың орыс тіліндегі атауы",
    documentTitleKk: "Құжаттың қазақ тіліндегі атауы",
    section: "Құжат бөлімі",
    sectionRu: "Орыс тіліндегі бөлім атауы",
    sectionKk: "Қазақ тіліндегі бөлім атауы",
    sectionHint: "Мысалы: §2.1 Жыл сайынғы ақылы демалыс",
    revision: "Құжат нұсқасы",
    owner: "Бастапқы құжат иесі",
    preview: "Қызметкерге арналған көрініс",
    previewText: "Материалдың Al Jana білім базасында көріну үлгісі.",
    articleHeading: "Мақала тақырыбы",
    answerPlaceholder: "Жауап мәтіні осында көрінеді.",
    translationsRequired: "Тақырыптың, жауаптың және дереккөздің орысша және қазақша нұсқаларын толтырыңыз.",
    sections: "Құжат бөлімдері",
    sourceLabel: "Дереккөз",
    history: "Жарияланымдар тарихы",
    versionLabel: "Нұсқа",
    historyHint: "Ескі нұсқа алдымен жоба ретінде жүктеледі. Оны тексеріп, содан кейін жариялауға болады.",
    current: "ағымдағы",
    restore: "Жобаға жүктеу",
    ownerLabel: "Соңғы редактор",
    draftSaved: "Жоба сақталды",
    published: "Жарияланған",
    unpublished: "Жарияланбаған",
    draft: "Жоба",
    saveDraft: "Жобаны сақтау",
    saving: "Сақталуда…",
    publish: "Жариялау",
    publishing: "Жариялануда…",
    saveFail: "Мақаланы сақтау мүмкін болмады.",
    publishFail: "Мақаланы жариялау мүмкін болмады.",
    restoreFail: "Нұсқаны қалпына келтіру мүмкін болмады.",
    notFound: "Құжат табылмады.",
    accessDenied: "Редакторға тек HR қызметкерлері кіре алады.",
    back: "Al Jana-ға қайту",
    aiButton: "ЖИ арқылы толтыру",
    aiTitle: "ЖИ арқылы мақала дайындау",
    aiDescription: "Дайын материалды кез келген тілде енгізіңіз. ЖИ орысша және қазақша өрістерді тексеруіңіз үшін дайындайды.",
    aiInput: "Бастапқы материал",
    aiPlaceholder: "Бекітілген мәтінді, шарттарды және құжат деректерін енгізіңіз…",
    aiPrivacy: "Мәтін Gemini жүйесіне жіберіледі. Сақтап, жарияламас бұрын нәтижені тексеріңіз.",
    aiCancel: "Бас тарту",
    aiGenerate: "Нысанды толтыру",
    aiGenerating: "Мақала дайындалуда…",
    aiApplied: "Нысан толтырылды — мәтінді тексеріңіз",
    aiError: "Мақаланы дайындау мүмкін болмады. ЖИ баптауын тексеріп, қайта көріңіз.",
    aiRateLimited: "Генерация шегіне жетті. Кейінірек қайталап көріңіз.",
    aiReviewSource: "Дереккөздің кейбір мәліметі ішкі HR мақаласы ретінде толтырылды. Сақтамас бұрын кодты, атауды және бөлімді тексеріңіз.",
  },
  assistant: {
    description: "HR көмекшісі. Тек HR білім базасы бойынша жауап береді, дереккөзді көрсетеді және ойдан шығармайды.",
    kbOnly: "Жауап тек HR білім базасынан",
    dialog: "Диалог",
    hello: "Сәлеметсіз бе! Демалыс, аванс, сырқатнама, жұмыс уақыты, жеңілдік немесе оқыту туралы сұраңыз. Мен тек HR білім базасы бойынша жауап беремін және дереккөзді көрсетемін. Нақты жауап болмаса, оны айтып, сұрақты HR-ға жіберуді ұсынамын.",
    try: "Мынаны сұрап көріңіз",
    outside: "Базадан тыс (HR-ға жіберу мысалы)",
    outsideQ: "Бізде акция опционы бар ма?",
    askLabel: "HR-ға сұрақ қою",
    placeholder: "HR-ға сұрақ қойыңыз…",
    ask: "Сұрау",
    how: "Al Jana қалай жұмыс істейді",
    point1: "Жауаптарды HR дайындаған және олар сөзбе-сөз көрсетіледі. Ештеңе генерацияланбайды.",
    point2: "Әр жауапта бастапқы құжат пен бөлімге сілтеме бар.",
    point3: "Сенімді сәйкестік жоқ па? Көмекші оны айтып, сұрақты HR-ға жіберуді ұсынады.",
    mine: "HR-ға менің сұрақтарым",
    mineHint: "Al Jana арқылы жіберілді",
    none: "Сұрақ әлі жоқ. Al Jana жауап бере алмаса, сұрақты HR-ға жібере аласыз.",
    answered: "Жауап берілді",
    waiting: "HR күтуде",
    hrSaid: "HR жауап берді",
    source: "Дереккөз",
    related: "Ұқсас сұрақтар",
    noAnswer: "Сенімді жауап табылмады",
    sent: "HR-ға жіберілді · {id}",
    sentHint: "HR жауап бергенде хабарлама аласыз. «HR-ға менің сұрақтарым» бөлімінде бақылайсыз.",
    escalate: "Осы сұрақты HR-ға жіберу",
    escalating: "Жіберілуде…",
    hrWill: "HR қызметкері жауап дайындайды.",
    orTry: "Немесе мына сұрақтардың бірін көріңіз",
    fail: "Al Jana жауап бере алмады",
    escalated: "Сұрақ HR-ға жіберілді",
    escalatedHint: "Өтініш {id}. HR жауап бергенде хабарлама аласыз.",
    escalateFail: "HR-мен байланысу мүмкін болмады",
    thinking: "Al Jana білім базасынан жауап іздеп жатыр",
    you: "Сіз",
    send: "жіберу",
    newline: "жаңа жол",
    greet: "Сәлеметсіз бе, {name}! Қалай көмектесейін?",
    botNotice: "Мен HR ботымын. Тек білім базасы бойынша жауап беремін және дереккөзді көрсетемін.",
    messages: {
      greeting: "Сәлеметсіз бе! Мен Jana Group компаниясының HR көмекшісі Al Jana-мын. Қалай көмектесейін?",
      howareyou: "Рақмет, бәрі жақсы! HR бойынша қандай сұрағыңыз бар?",
      thanks: "Оқасы жоқ! Басқа сұрақ болса, жазыңыз.",
      bye: "Сау болыңыз!",
      identity: "Мен Jana Group компаниясының HR көмекшісі Al Jana-мын.",
      noAnswer: "HR білім базасынан сенімді жауап табылмады. Сұрақты HR қызметкеріне жібере аламын.",
      empty: "Сұрақ енгізіңіз немесе төмендегі үлгілердің бірін таңдаңыз.",
      injection: "Мен HR білім базасы бойынша жауап беремін. Бұл сұрақты HR қызметкеріне жібере аламын.",
    },
    bot: "БОТ",
    helpful: "Жауап көмектесті ме?",
    yes: "Иә",
    no: "Жоқ",
    thanks: "Бағалағаныңызға рахмет.",
    sorry: "Өкінішті. Сұрақты HR маманына жібере аламын.",
    canHelp: "Мен мына тақырыптар бойынша көмектесемін:",
    toHuman: "HR маманынан сұрау",
    restart: "Жаңа диалог",
    openDraft: "Жобаны ашу",
    balanceLine: "Сізге {n} күн қолжетімді.",
    starters: [
      "Жылына неше күн демалыс беріледі?",
      "Жалақы авансын қалай сұраймын?",
      "Ауырып қалсам не істеуім керек?",
      "Үйден жұмыс істей аламын ба?",
      "Жалақы қай күні төленеді?",
    ],
    knowledgeEditor: "Білім базасының редакторы",
    history: "Чаттар тарихы",
    noHistory: "Сақталған чаттар жоқ.",
    newChat: "Жаңа чат",
    deleteChat: "Чатты жою",
    clearHistory: "Тарихты тазалау",
    restoreHistoryError: "Чат тарихын оқу мүмкін болмады.",
    saveHistoryError: "Тарихты осы құрылғыда сақтау мүмкін болмады.",
  },
};

export const DICT: Record<Locale, Dict> = { ru, kk };
