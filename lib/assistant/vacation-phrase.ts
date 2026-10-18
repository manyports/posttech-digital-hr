import { addDays, isValidDate, todayISO } from "../domain/dates";

const RU_MONTHS: Record<string, number> = {
  января: 1, янв: 1,
  февраля: 2, фев: 2,
  марта: 3, мар: 3,
  апреля: 4, апр: 4,
  мая: 5, май: 5,
  июня: 6, июн: 6,
  июля: 7, июл: 7,
  августа: 8, авг: 8,
  сентября: 9, сен: 9,
  октября: 10, окт: 10,
  ноября: 11, ноя: 11,
  декабря: 12, дек: 12,
};

const KK_MONTHS: Record<string, number> = {
  қаңтар: 1, ақпан: 2, наурыз: 3, сәуір: 4, мамыр: 5, маусым: 6,
  шілде: 7, тамыз: 8, қыркүйек: 9, қазан: 10, қараша: 11, желтоқсан: 12,
};

const MONTHS: Record<string, number> = { ...RU_MONTHS, ...KK_MONTHS };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function rollForward(month: number, day: number, now: string = todayISO()): string | null {
  const year = Number(now.slice(0, 4));
  const iso = `${year}-${pad(month)}-${pad(day)}`;
  if (!isValidDate(iso)) return null;
  return iso < now ? `${year + 1}-${pad(month)}-${pad(day)}` : iso;
}

export function parseVacationRange(raw: string, now: string = todayISO()): { startDate: string; endDate: string } | null {
  const text = raw.toLowerCase().replace(/ё/g, "е");

  const iso = text.match(/(20\d{2}-\d{2}-\d{2})\s*(?:по|–|—|-|to)\s*(20\d{2}-\d{2}-\d{2})/);
  if (iso && isValidDate(iso[1]) && isValidDate(iso[2]) && iso[1] <= iso[2] && iso[1] >= now) {
    return { startDate: iso[1], endDate: iso[2] };
  }

  const monthNames = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");
  const both = new RegExp(
    `(\\d{1,2})\\s*(${monthNames})[а-яәғқңөұүһі]*\\s*(?:по|–|—|-|дан|ден|тан|тен|нан|нен)\\s*(\\d{1,2})\\s*(${monthNames})`,
    "i",
  );
  const paired = text.match(both);
  if (paired) {
    const startMonth = MONTHS[paired[2]];
    const endMonth = MONTHS[paired[4]];
    const start = rollForward(startMonth, Number(paired[1]), now);
    let end = rollForward(endMonth, Number(paired[3]), now);
    if (start && end && end < start) end = addDays(end, 365);
    if (start && end && start <= end) return { startDate: start, endDate: end };
  }

  const shared = new RegExp(`(\\d{1,2})\\s*(?:по|–|—|-)\\s*(\\d{1,2})\\s*(${monthNames})[а-яәғқңөұүһі]*`, "i");
  const oneMonth = text.match(shared);
  if (oneMonth) {
    const month = MONTHS[oneMonth[3]];
    const start = rollForward(month, Number(oneMonth[1]), now);
    const end = rollForward(month, Number(oneMonth[2]), now);
    if (start && end && start <= end) return { startDate: start, endDate: end };
  }

  return null;
}
