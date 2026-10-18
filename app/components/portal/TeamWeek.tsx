"use client";

import Link from "next/link";
import type { TeamCalendarView } from "@/lib/server/services/employees";
import { parseDate, todayISO } from "@/lib/domain/dates";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Button } from "../ui/Button";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { Panel } from "./Panel";

export function CoverageNote({
  coverage,
}: {
  coverage?: { remainingOnSite: number; december: boolean };
}) {
  const { m } = useI18n();
  if (!coverage || coverage.remainingOnSite !== 0) return null;
  return (
    <p className="text-[12.5px] text-hero-muted">
      <span
        aria-hidden
        className={[
          "mr-1.5 inline-block size-1.5 rounded-full align-middle",
          coverage.december ? "bg-warning" : "bg-hero-foreground/40",
        ].join(" ")}
      />
      {coverage.december ? m.request.coverageDecember : m.request.coverageEmpty}
    </p>
  );
}

export function TeamCalendar({
  calendar,
  month,
  onPrevious,
  onNext,
  onToday,
}: {
  calendar: TeamCalendarView;
  month: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const { m, locale } = useI18n();
  const dates = calendar.people[0]?.days.map((day) => day.date) ?? [];
  const weeks = Array.from({ length: Math.ceil(dates.length / 7) }, (_, index) => dates.slice(index * 7, index * 7 + 7));
  const localeCode = locale === "kk" ? "kk-KZ" : "ru-RU";
  const monthTitle = new Intl.DateTimeFormat(localeCode, { month: "long", year: "numeric", timeZone: "UTC" }).format(parseDate(`${month}-01`));
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(localeCode, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + index))),
  );
  const today = todayISO();
  const monthConflicts = calendar.conflicts.filter((conflict) => conflict.date.startsWith(month));

  return (
    <Panel
      title={m.team.calendar}
      description={m.team.calendarHint}
      padding="p-0"
      actions={
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={onPrevious} aria-label={m.team.previousMonth} title={m.team.previousMonth}>
            <ArrowLeftIcon size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday}>{m.team.today}</Button>
          <Button variant="ghost" size="icon" onClick={onNext} aria-label={m.team.nextMonth} title={m.team.nextMonth}>
            <ArrowRightIcon size={14} />
          </Button>
        </div>
      }
    >
      <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hero-border">
        <p className="text-[15px] font-semibold capitalize text-hero-foreground">{monthTitle}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-hero-muted">
          <Legend dot="bg-primary" label={m.team.approvedLeave} />
          <Legend dot="bg-warning" label={m.team.pendingLeave} />
          <Legend dot="ring-2 ring-warning/50 bg-hero-elevated" label={m.team.conflicts} />
        </div>
      </div>

      {monthConflicts.length > 0 ? (
        <div className="mx-5 mt-4 rounded-xl bg-warning/8 ring-1 ring-inset ring-warning/30 px-4 py-3">
          <p className="text-[12px] font-semibold text-hero-foreground">
            {tx(m.team.conflictCount, { n: monthConflicts.length })}
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {monthConflicts.map((conflict) => (
              <li key={`${conflict.date}-${conflict.groupLabel}`} className="text-[12px] text-hero-muted">
                {tx(m.team.coverageConflict, {
                  date: formatShortDate(conflict.date, localeCode),
                  group: conflict.groupLabel,
                  n: conflict.absent,
                })}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="px-5 pt-4 text-[12px] text-hero-muted">{m.team.noConflicts}</p>
      )}

      <div className="overflow-x-auto px-5 py-4">
        <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-1" aria-label={m.team.calendar}>
          <thead>
            <tr>
              {weekdays.map((weekday) => (
                <th key={weekday} scope="col" className="pb-1.5 text-left text-[10.5px] font-semibold uppercase tracking-wider text-tertiary">
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]}>
                {week.map((date) => {
                  const absences = calendar.people.flatMap((person) => {
                    const day = person.days.find((item) => item.date === date);
                    return day && day.state !== "clear" ? [{ person, day }] : [];
                  });
                  const conflict = calendar.conflicts.some((item) => item.date === date);
                  const outside = date.slice(0, 7) !== month;
                  return (
                    <td key={date} className="align-top p-0">
                      <div
                        className={[
                          "min-h-28 rounded-xl border border-hero-border p-2.5",
                          outside ? "bg-hero-cell-bg/40 opacity-55" : "bg-hero-elevated",
                          conflict ? "ring-2 ring-warning/50" : "",
                          date === today ? "border-hero-foreground/35" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <time dateTime={date} className={date === today ? "text-[12px] font-bold text-hero-foreground" : "text-[12px] font-medium text-tertiary"}>
                            {Number(date.slice(8, 10))}
                          </time>
                          {conflict && <span className="size-1.5 rounded-full bg-warning" title={m.team.conflicts} />}
                        </div>
                        {absences.length === 0 ? (
                          <p className="mt-3 text-[10.5px] text-tertiary">{m.team.noAbsences}</p>
                        ) : (
                          <ul className="mt-2 space-y-1">
                            {absences.slice(0, 3).map(({ person, day }) => (
                              <li key={person.id}>
                                <Link
                                  href={day.requestId ? `/requests/${day.requestId}` : `/team/${person.id}`}
                                  className="group flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[10.5px] text-hero-muted hover:bg-hero-cell-bg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-900"
                                  title={`${person.fullName} · ${day.state === "approved" ? m.team.approvedLeave : m.team.pendingLeave}`}
                                >
                                  <span aria-hidden className={["size-1.5 shrink-0 rounded-full", day.state === "approved" ? "bg-primary" : "bg-warning"].join(" ")} />
                                  <span className="truncate group-hover:text-hero-foreground">{person.fullName}</span>
                                </Link>
                              </li>
                            ))}
                            {absences.length > 3 && <li className="px-1 text-[10.5px] text-tertiary">{tx(m.team.more, { n: absences.length - 3 })}</li>}
                          </ul>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span aria-hidden className={`size-2 rounded-full ${dot}`} />{label}</span>;
}

function formatShortDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(parseDate(date));
}
