"use client";

import React, { useState } from "react";
import { isWeekend, lastAllowedEnd, parseDate } from "@/lib/domain/dates";
import type { Locale } from "@/lib/i18n/locale";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

const MONTHS: Record<Locale, string[]> = {
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  kk: ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"],
};
const WEEKDAYS: Record<Locale, string[]> = {
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  kk: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"],
};

const monthOf = (iso: string) => iso.slice(0, 7);
function shiftMonth(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export interface DateRangeLabels {
  pickStart: string;
  pickEnd: string;
  prevMonth: string;
  nextMonth: string;
  noDays: string;
  /** Already formatted, e.g. "Можно выбрать до 15 рабочих дней". */
  cap: string;
}

/**
 * Inline range calendar. Click a first day, then a last day. While the last
 * day is being picked, every day that would take the range past `cap` working
 * days is disabled, so an over-long range can't be selected at all.
 */
export function DateRangePicker({
  start,
  end,
  onChange,
  min,
  max,
  cap,
  locale,
  labels,
  error,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  min: string;
  max: string;
  cap: number;
  locale: Locale;
  labels: DateRangeLabels;
  error?: string;
}) {
  const [view, setView] = useState(() => monthOf(start || min));
  const [hover, setHover] = useState<string | null>(null);

  const picking = start !== "" && end === "";
  const limit = picking ? lastAllowedEnd(start, cap) : null;
  const previewEnd = picking ? (hover && limit && hover >= start && hover <= limit ? hover : null) : end || null;

  const first = parseDate(`${view}-01`);
  const lead = (first.getUTCDay() + 6) % 7; // Monday-first grid
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${view}-${String(i + 1).padStart(2, "0")}`),
  ];

  function disabled(d: string): boolean {
    if (cap <= 0 || d < min || d > max) return true;
    if (picking && d >= start) return !limit || d > limit;
    return false;
  }

  function pick(d: string) {
    if (picking && d >= start) onChange(start, d);
    else onChange(d, "");
  }

  const navBtn =
    "w-7 h-7 rounded-lg flex items-center justify-center text-hero-muted hover:text-hero-foreground hover:bg-hero-cell-bg transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-default disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="rounded-xl bg-hero-elevated p-3"
        style={{ boxShadow: error ? "var(--field-error-shadow)" : "var(--field-rest-shadow)" }}
        onMouseLeave={() => setHover(null)}
      >
        <div className="flex items-center justify-between mb-2 pl-1.5">
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-hero-foreground" aria-live="polite">
            {MONTHS[locale][first.getUTCMonth()]} {first.getUTCFullYear()}
          </p>
          <div className="flex items-center gap-0.5">
            <button type="button" className={navBtn} aria-label={labels.prevMonth} disabled={view <= monthOf(min)} onClick={() => setView(shiftMonth(view, -1))}>
              <ArrowLeftIcon size={13} />
            </button>
            <button type="button" className={navBtn} aria-label={labels.nextMonth} disabled={view >= monthOf(max)} onClick={() => setView(shiftMonth(view, 1))}>
              <ArrowRightIcon size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7" role="grid">
          {WEEKDAYS[locale].map((w, i) => (
            <span key={w} className={["h-7 flex items-center justify-center text-[10.5px] font-semibold uppercase tracking-wide", i >= 5 ? "text-hero-border" : "text-tertiary"].join(" ")}>
              {w}
            </span>
          ))}
          {cells.map((d, i) => {
            if (!d) return <span key={`b${i}`} />;
            const off = disabled(d);
            const isStart = d === start;
            const isEnd = d === (previewEnd ?? "");
            const inRange = start !== "" && previewEnd !== null && d > start && d < previewEnd;
            const edge = isStart || isEnd;
            return (
              <div
                key={d}
                className={[
                  "py-0.5",
                  inRange || (edge && previewEnd && previewEnd !== start) ? "bg-hero-foreground/[0.06]" : "",
                  isStart && previewEnd && previewEnd !== start ? "rounded-l-lg" : "",
                  isEnd && previewEnd !== start ? "rounded-r-lg" : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  disabled={off}
                  onClick={() => pick(d)}
                  onMouseEnter={() => setHover(d)}
                  aria-label={d}
                  aria-pressed={edge}
                  className={[
                    "relative w-full h-8 rounded-lg text-[13px] tabular-nums transition-colors",
                    edge
                      ? "bg-hero-foreground text-hero-on-foreground font-semibold"
                      : off
                        ? "text-hero-border cursor-not-allowed"
                        : [isWeekend(d) ? "text-tertiary" : "text-hero-foreground", "hover:bg-hero-cell-bg cursor-pointer"].join(" "),
                  ].join(" ")}
                >
                  {Number(d.slice(8))}
                  {d === min && !edge && <span aria-hidden className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-2 pl-1.5 text-[11.5px] text-tertiary" aria-live="polite">
          {cap <= 0 ? labels.noDays : `${picking ? labels.pickEnd : labels.pickStart} · ${labels.cap}`}
        </p>
      </div>
      {error && <p className="text-[11.5px] text-error font-medium">{error}</p>}
    </div>
  );
}
