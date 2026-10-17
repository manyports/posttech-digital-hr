"use client";

import Link from "next/link";
import type { TeamMemberView } from "@/lib/server/services/employees";
import { useApi } from "@/lib/client/hooks";
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
  const { data, error, loading, reload } = useApi<{ team: TeamMemberView[] }>("/api/team", { interval: 10000 });
  const isHr = user.role === "hr";

  if (error?.status === 403) {
    return (
      <>
        <PageHeader title="Команда" />
        <AccessDenied message={error.message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isHr ? "Сотрудники" : "Моя команда"}
        description={
          isHr
            ? "Все сотрудники Jana Group."
            : `Ваши прямые подчиненные${data ? ` (${data.team.length})` : ""}. Доступ к сотрудникам вне вашей команды ограничен.`
        }
      />

      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.team.map((m) => (
          <li key={m.id}>
            <Link
              href={`/team/${m.id}`}
              className="group/t block bg-hero-elevated rounded-2xl p-5 transition-shadow duration-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              style={{ boxShadow: SHADOW }}
            >
              <div className="flex items-start gap-3.5">
                <Avatar name={m.fullName} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold tracking-[-0.01em] truncate">{m.fullName}</p>
                    {m.role !== "employee" && <Badge variant={m.role === "hr" ? "default" : "accent"}>{m.role === "hr" ? "HR" : "Руководитель"}</Badge>}
                  </div>
                  <p className="text-[12.5px] text-hero-muted truncate">{m.position}</p>
                  {isHr && <p className="text-[11.5px] text-tertiary truncate">{m.department}{m.managerName ? ` · руководитель: ${m.managerName}` : ""}</p>}
                </div>
                <ArrowRightIcon size={14} className="text-tertiary mt-1 transition-all duration-200 group-hover/t:text-hero-foreground group-hover/t:translate-x-0.5" />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-hero-border">
                <Metric label="Остаток отпуска" value={`${m.vacationRemaining} дн.`} />
                <Metric label="Открытые заявки" value={m.openRequests} />
                <Metric label="Обучение" value={`${m.coursesCompleted}/${m.coursesAssigned}`} />
              </dl>
              {m.coursesOverdue > 0 && (
                <div className="mt-3">
                  <Pill tone="bad">{m.coursesOverdue} {m.coursesOverdue === 1 ? "курс просрочен" : "курса(-ов) просрочено"}</Pill>
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
