"use client";

import Link from "next/link";
import type { TeamMemberView } from "@/lib/server/services/employees";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { ArrowRightIcon } from "../../components/portal/icons";
import { AccessDenied, ErrorBlock, LoadingBlock, PageHeader } from "../../components/portal/Panel";
import { Pill } from "../../components/portal/StatusBadge";
import { useUser } from "../../components/portal/UserContext";

const SHADOW =
  "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)";

export default function TeamPage() {
  const user = useUser();
  const { m } = useI18n();
  const { data, error, loading, reload } = useApi<{ team: TeamMemberView[] }>("/api/team", { interval: 10000 });
  const isHr = user.role === "hr";

  if (error?.status === 403) {
    return (
      <>
        <PageHeader title={m.team.title} />
        <AccessDenied message={error.message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isHr ? m.team.employees : m.nav.myTeam}
        description={
          isHr
            ? m.team.all
            : tx(m.team.reports, { count: data ? ` (${data.team.length})` : "" })
        }
      />

      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.team.map((person) => (
          <li key={person.id}>
            <Link
              href={`/team/${person.id}`}
              className="group/t block bg-hero-elevated rounded-2xl p-5 transition-shadow duration-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              style={{ boxShadow: SHADOW }}
            >
              <div className="flex items-start gap-3.5">
                <Avatar name={person.fullName} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold tracking-[-0.01em] truncate">{person.fullName}</p>
                    {person.role !== "employee" && <Badge variant={person.role === "hr" ? "default" : "accent"}>{person.role === "hr" ? "HR" : m.roles.manager}</Badge>}
                  </div>
                  <p className="text-[12.5px] text-hero-muted truncate">{person.position}</p>
                  {isHr && <p className="text-[11.5px] text-tertiary truncate">{person.department}{person.managerName ? ` · ${tx(m.team.managerOf, { name: person.managerName })}` : ""}</p>}
                </div>
                <ArrowRightIcon size={14} className="text-tertiary mt-1 transition-all duration-200 group-hover/t:text-hero-foreground group-hover/t:translate-x-0.5" />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-hero-border">
                <Metric label={m.team.vacation} value={tx(m.common.daysShort, { n: person.vacationRemaining })} />
                <Metric label={m.team.open} value={person.openRequests} />
                <Metric label={m.team.training} value={`${person.coursesCompleted}/${person.coursesAssigned}`} />
              </dl>
              {person.coursesOverdue > 0 && (
                <div className="mt-3">
                  <Pill tone="bad">{person.coursesOverdue} {person.coursesOverdue === 1 ? m.team.overdueOne : m.team.overdueMany}</Pill>
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-widest text-tertiary">{label}</dt>
      <dd className="mt-0.5 text-[16px] font-semibold tabular-nums tracking-[-0.02em]">{value}</dd>
    </div>
  );
}
