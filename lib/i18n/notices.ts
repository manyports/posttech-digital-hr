import type { Locale } from "./locale";

const EXACT: Record<string, { ru: string; kk: string }> = {
  "Request submitted": { ru: "Заявка отправлена", kk: "Өтінім жіберілді" },
  "Request cancelled": { ru: "Заявка отменена", kk: "Өтінім болдырылмады" },
  "Your request is in review": { ru: "Заявка на рассмотрении", kk: "Өтінім қаралуда" },
  "Question sent to HR": { ru: "Вопрос передан в HR", kk: "Сұрақ HR-ға жіберілді" },
  "New question from Al Jana": { ru: "Новый вопрос от Al Jana", kk: "Al Jana-дан жаңа сұрақ" },
  "HR replied to your question": { ru: "HR ответил на ваш вопрос", kk: "HR сұрағыңызға жауап берді" },
  "Course completed": { ru: "Курс завершен", kk: "Курс аяқталды" },
  "Team member completed a course": { ru: "Сотрудник завершил курс", kk: "Қызметкер курс аяқтады" },
  "New course assigned": { ru: "Назначен новый курс", kk: "Жаңа курс тағайындалды" },
  "Vacation request approved": { ru: "Заявка на отпуск одобрена", kk: "Демалыс өтінімі мақұлданды" },
  "Salary advance rejected": { ru: "Заявка на аванс отклонена", kk: "Аванс өтінімі қабылданбады" },
  "Salary advance awaiting decision": { ru: "Аванс ожидает решения", kk: "Аванс шешім күтуде" },
  "Welcome to Digital HR": { ru: "Добро пожаловать в Digital HR", kk: "Digital HR-ға қош келдіңіз" },
  "New vacation request": { ru: "Новая заявка на отпуск", kk: "Жаңа демалыс өтінімі" },
  "New salary advance request": { ru: "Новая заявка на аванс", kk: "Жаңа аванс өтінімі" },
  "Your vacation request was approved": { ru: "Заявка на отпуск одобрена", kk: "Демалыс өтінімі мақұлданды" },
  "Your vacation request was rejected": { ru: "Заявка на отпуск отклонена", kk: "Демалыс өтінімі қабылданбады" },
  "Your salary advance request was approved": { ru: "Заявка на аванс одобрена", kk: "Аванс өтінімі мақұлданды" },
  "Your salary advance request was rejected": { ru: "Заявка на аванс отклонена", kk: "Аванс өтінімі қабылданбады" },
};

export function localizeTitle(title: string, locale: Locale): string {
  return EXACT[title]?.[locale] ?? title;
}
