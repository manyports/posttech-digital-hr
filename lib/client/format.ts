import type { RequestPayload, RequestStatus, RequestType } from "../domain/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-03-09" -> "9 Mar 2026" (no timezone math: dates are calendar dates). */
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
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} d ago`;
  return fmtDate(iso);
}

export const fmtKzt = (n: number) => `${n.toLocaleString("en-US")} ₸`;

export const TYPE_LABEL: Record<RequestType, string> = {
  vacation: "Vacation",
  salary_advance: "Salary advance",
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  submitted: "Submitted",
  in_review: "In review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function payloadSummary(p: RequestPayload): string {
  return p.kind === "vacation"
    ? `${fmtDate(p.startDate)} – ${fmtDate(p.endDate)} · ${p.days} working day${p.days === 1 ? "" : "s"}`
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

export const ROLE_LABEL = { employee: "Employee", manager: "Manager", hr: "HR / Admin" } as const;
