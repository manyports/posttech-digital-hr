/**
 * Date helpers. Calendar dates travel as "YYYY-MM-DD" strings and all math is
 * done in UTC so results never depend on the server's or browser's timezone.
 */

const DAY_MS = 86_400_000;

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** True for strings that are well-formed AND real calendar dates (no 2026-02-30). */
export function isValidDate(s: unknown): s is string {
  if (typeof s !== "string" || !ISO_DATE.test(s)) return false;
  return toISODate(parseDate(s)) === s;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function addDays(s: string, n: number): string {
  return toISODate(new Date(parseDate(s).getTime() + n * DAY_MS));
}

export function isWeekend(s: string): boolean {
  const day = parseDate(s).getUTCDay();
  return day === 0 || day === 6;
}

/** Working days (Mon-Fri) in the inclusive range [start, end]. */
export function workingDays(start: string, end: string): number {
  const startTime = parseDate(start).getTime();
  const days = Math.floor((parseDate(end).getTime() - startTime) / DAY_MS) + 1;
  if (days <= 0) return 0;
  const fullWeeks = Math.floor(days / 7);
  let weekdays = fullWeeks * 5;
  const firstDay = new Date(startTime).getUTCDay();
  for (let i = 0; i < days % 7; i++) {
    const day = (firstDay + i) % 7;
    if (day !== 0 && day !== 6) weekdays++;
  }
  return weekdays;
}

/**
 * Last day a range starting on `start` may end on and still hold at most `cap`
 * working days (trailing weekend days are free). Null when even `start` alone
 * would go over.
 */
export function lastAllowedEnd(start: string, cap: number): string | null {
  let used = isWeekend(start) ? 0 : 1;
  if (used > cap) return null;
  let end = start;
  for (let i = 0; i < 400; i++) {
    const next = addDays(end, 1);
    if (!isWeekend(next)) {
      if (used + 1 > cap) break;
      used++;
    }
    end = next;
  }
  return end;
}

/** Do the inclusive ranges [aStart,aEnd] and [bStart,bEnd] share any day? */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/** Next Monday strictly after `s` (used by the seed to build realistic dates). */
export function nextWeekday(s: string, weekday: number): string {
  let cur = addDays(s, 1);
  while (parseDate(cur).getUTCDay() !== weekday) cur = addDays(cur, 1);
  return cur;
}
