"use client";

import Link from "next/link";
import type { DashboardView } from "@/lib/server/services/dashboard";
import { fmtDate } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/Progress";
import { ArrowRightIcon, PlusIcon, SparkleIcon } from "../../components/portal/icons";
import { ErrorBlock, LoadingBlock, PageHeader, Panel } from "../../components/portal/Panel";
import { RequestCard } from "../../components/portal/RequestCard";
import { StatTile } from "../../components/portal/StatTile";
import { CourseStatusBadge } from "../../components/portal/StatusBadge";
import { useUser } from "../../components/portal/UserContext";

export default function DashboardPage() {
  const user = useUser();
  const { m, locale } = useI18n();
  const { data, error, loading, reload } = useApi<DashboardView>("/api/dashboard", { interval: 8000 });
  const first = user.fullName.split(" ")[0];

  return (
    <>
      <PageHeader
        title={tx(m.dashboard.welcome, { name: first })}
        description={`${user.position} · ${user.department}`}
        actions={
          <>
            <Link href="/assistant">
              <Button variant="secondary" size="sm">
                <SparkleIcon size={14} /> {m.dashboard.ask}
              </Button>
            </Link>
            <Link href="/requests?new=vacation">
              <Button variant="primary" size="sm">
                <PlusIcon size={14} /> {m.dashboard.newRequest}
              </Button>
            </Link>
          </>
        }
      />

      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      {data && (
        <>
          <section aria-label={m.dashboard.summary} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatTile
              tone="dark"
              label={m.dashboard.vacationDays}
              value={data.vacation.available}
              hint={
                <>
                  {tx(m.dashboard.availableOf, { n: data.vacation.remaining })}
                  {data.vacation.pending > 0 && tx(m.dashboard.pendingBit, { n: data.vacation.pending })}
                </>
              }
              href="/profile"
            />
            <StatTile
              label={m.dashboard.openRequests}
              value={data.openRequests}
              hint={data.openRequests ? m.dashboard.waiting : m.dashboard.noOpen}
              href="/requests"
            />
            <StatTile
              label={m.dashboard.training}
              value={`${data.training.completed}/${data.training.total}`}
              hint={data.training.overdue ? tx(m.dashboard.overdueN, { n: data.training.overdue }) : m.dashboard.coursesDone}
              href="/academy"
            />
            <StatTile
              label={m.dashboard.unread}
              value={data.unread}
              hint={data.unread ? m.dashboard.needsAttention : m.dashboard.allRead}
              href="/notifications"
            />
          </section>

          {data.manager && (
            <Panel
              title={m.dashboard.team}
              description={m.dashboard.teamHint}
              actions={
                <Link href="/team">
                  <Button variant="ghost" size="sm">
                    {m.dashboard.goTeam} <ArrowRightIcon size={13} />
                  </Button>
                </Link>
              }
            >
              <dl className="grid grid-cols-3 gap-4">
                <Kpi label={m.dashboard.people} value={data.manager.teamSize} />
                <Kpi label={m.dashboard.awaiting} value={data.manager.awaitingDecision} href="/approvals" />
                <Kpi label={m.dashboard.overdueTraining} value={data.manager.teamOverdueTraining} warn={data.manager.teamOverdueTraining > 0} />
              </dl>
            </Panel>
          )}

          {data.hr && (
            <Panel
              title={m.dashboard.company}
              description={m.dashboard.companyHint}
              actions={
                <Link href="/hr">
                  <Button variant="ghost" size="sm">
                    {m.dashboard.hrInbox} <ArrowRightIcon size={13} />
                  </Button>
                </Link>
              }
            >
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Kpi label={m.dashboard.people} value={data.hr.employees} />
                <Kpi label={m.dashboard.awaiting} value={data.hr.awaitingDecision} href="/approvals" />
                <Kpi label={m.dashboard.questions} value={data.hr.openEscalations} href="/hr" warn={data.hr.openEscalations > 0} />
                <Kpi label={m.dashboard.mandatory} value={`${data.hr.mandatoryCompletionPct}%`} />
              </dl>
            </Panel>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
            <section aria-labelledby="recent" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 id="recent" className="text-[14px] font-semibold">
                  {m.dashboard.recent}
                </h2>
                <Link href="/requests" className="text-[12.5px] text-hero-muted hover:text-hero-foreground link-slide">
                  {m.dashboard.allRequests}
                </Link>
              </div>
              {data.recentRequests.length === 0 ? (
                <Panel padding="p-8">
                  <p className="text-[13px] text-hero-muted text-center">
                    {m.dashboard.empty}{" "}
                    <Link href="/requests?new=vacation" className="font-medium text-hero-foreground underline underline-offset-2">
                      {m.dashboard.first}
                    </Link>
                    .
                  </p>
                </Panel>
              ) : (
                data.recentRequests.map((r) => <RequestCard key={r.id} request={r} />)
              )}
            </section>

            <Panel title={m.dashboard.academy} description={data.training.next ? undefined : m.dashboard.noCourse}>
              {data.training.next ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold tracking-[-0.01em]">{data.training.next.course.title}</p>
                      <p className="text-[12px] text-tertiary mt-0.5">{tx(m.dashboard.due, { date: fmtDate(data.training.next.dueDate, locale) })}</p>
                    </div>
                    <CourseStatusBadge status={data.training.next.status} overdue={data.training.next.overdue} />
                  </div>
                  <Progress value={data.training.next.progress} showValue label={m.dashboard.progress} />
                  <Link href={`/academy/${data.training.next.id}`}>
                    <Button variant="primary" size="sm" fullWidth>
                      {data.training.next.status === "assigned" ? m.dashboard.start : m.dashboard.continue} <ArrowRightIcon size={13} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-[13px] text-hero-muted">{m.dashboard.allDone}</p>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}

function Kpi({ label, value, href, warn }: { label: string; value: React.ReactNode; href?: string; warn?: boolean }) {
  const inner = (
    <>
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-tertiary">{label}</dt>
      <dd className={["mt-1 text-[24px] font-semibold tabular-nums tracking-[-0.03em]", warn ? "text-error" : "text-hero-foreground"].join(" ")}>{value}</dd>
    </>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-70 transition-opacity">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}
