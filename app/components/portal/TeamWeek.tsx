"use client";

import type { TeamWeekPerson } from "@/lib/server/services/employees";
import { fmtDate } from "@/lib/client/format";
import { useI18n } from "@/lib/i18n/I18nProvider";
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

export function TeamWeek({ people }: { people: TeamWeekPerson[] }) {
  const { m, locale } = useI18n();
  return (
    <Panel title={m.team.week} description={m.team.weekHint} padding="p-0">
      <ul className="divide-y divide-hero-border">
        {people.map((person) => {
          const marked = person.days.filter((day) => day.state !== "clear");
          return (
            <li key={person.id} className="px-5 py-3">
              <p className="text-[13.5px] font-medium text-hero-foreground">{person.fullName}</p>
              {marked.length === 0 ? (
                <p className="mt-1 text-[12px] text-hero-muted">{m.team.onSite}</p>
              ) : (
                <ul className="mt-1.5 flex flex-col gap-1">
                  {marked.map((day) => (
                    <li key={day.date} className="flex items-center gap-2 text-[12px] text-hero-muted">
                      <span
                        aria-hidden
                        className={["size-1.5 rounded-full shrink-0", day.state === "approved" ? "bg-primary" : "bg-warning"].join(" ")}
                      />
                      <span>{fmtDate(day.date, locale)}</span>
                      <span className="text-tertiary">{day.state === "approved" ? m.team.away : m.team.pendingAway}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
