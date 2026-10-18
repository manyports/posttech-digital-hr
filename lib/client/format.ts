import type { RequestPayload, RequestStatus, RequestType } from "../domain/types";
import type { Locale } from "../i18n/locale";

const MONTHS: Record<Locale, string[]> = {
  ru: ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."],
  kk: ["қаң.", "ақп.", "нау.", "сәу.", "мам.", "мау.", "шіл.", "там.", "қыр.", "қаз.", "қар.", "жел."],
};

/** "2026-03-09" -> "9 мар. 2026" (no timezone math: dates are calendar dates). */
export function fmtDate(iso: string, locale: Locale = "ru"): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[locale][m - 1]} ${y}`;
}

export function fmtDateTime(iso: string, locale: Locale = "ru"): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[locale][d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export function fmtRelative(iso: string, now: number = Date.now(), locale: Locale = "ru"): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (locale === "kk") {
    if (min < 1) return "жаңа ғана";
    if (min < 60) return `${min} мин. бұрын`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} сағ. бұрын`;
    const days = Math.floor(h / 24);
    if (days < 30) return `${days} күн бұрын`;
    return fmtDate(iso, locale);
  }
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин. назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч. назад`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} дн. назад`;
  return fmtDate(iso, locale);
}

export const fmtKzt = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

export const TYPE_LABEL: Record<RequestType, string> = {
  vacation: "Отпуск",
  salary_advance: "Аванс",
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  draft: "Черновик",
  submitted: "Отправлено",
  in_review: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено",
  cancelled: "Отменено",
};

export function pluralDays(n: number, locale: Locale = "ru"): string {
  if (locale === "kk") return `${n} жұмыс күні`;
  const abs = Math.abs(n) % 100;
  const rem = abs % 10;
  if (abs > 10 && abs < 20) return `${n} рабочих дней`;
  if (rem > 1 && rem < 5) return `${n} рабочих дня`;
  if (rem === 1) return `${n} рабочий день`;
  return `${n} рабочих дней`;
}

export function pluralLessons(n: number, locale: Locale = "ru"): string {
  if (locale === "kk") return `${n} сабақ`;
  const abs = Math.abs(n) % 100;
  const rem = abs % 10;
  if (abs > 10 && abs < 20) return `${n} уроков`;
  if (rem > 1 && rem < 5) return `${n} урока`;
  if (rem === 1) return `${n} урок`;
  return `${n} уроков`;
}

export function payloadSummary(p: RequestPayload, locale: Locale = "ru"): string {
  return p.kind === "vacation"
    ? `${fmtDate(p.startDate, locale)} – ${fmtDate(p.endDate, locale)} · ${pluralDays(p.days, locale)}`
    : `${fmtKzt(p.amount)} · ${p.reason}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const ROLE_LABEL = { employee: "Сотрудник", manager: "Руководитель", hr: "HR / Админ" } as const;
