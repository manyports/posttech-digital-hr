import type { RequestPayload, RequestStatus, RequestType } from "../domain/types";

const MONTHS = ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."];

/** "2026-03-09" -> "9 мар. 2026" (no timezone math: dates are calendar dates). */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export function fmtRelative(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин. назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч. назад`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} дн. назад`;
  return fmtDate(iso);
}

export const fmtKzt = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

export const TYPE_LABEL: Record<RequestType, string> = {
  vacation: "Отпуск",
  salary_advance: "Аванс",
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  submitted: "Отправлено",
  in_review: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено",
  cancelled: "Отменено",
};

export function pluralDays(n: number): string {
  const abs = Math.abs(n) % 100;
  const rem = abs % 10;
  if (abs > 10 && abs < 20) return `${n} рабочих дней`;
  if (rem > 1 && rem < 5) return `${n} рабочих дня`;
  if (rem === 1) return `${n} рабочий день`;
  return `${n} рабочих дней`;
}

export function payloadSummary(p: RequestPayload): string {
  return p.kind === "vacation"
    ? `${fmtDate(p.startDate)} – ${fmtDate(p.endDate)} · ${pluralDays(p.days)}`
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
