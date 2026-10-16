"use client";

import Link from "next/link";
import type { DashboardView } from "@/lib/server/services/dashboard";
import { fmtDate } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
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
  const { data, error, loading, reload } = useApi<DashboardView>("/api/dashboard", { interval: 8000 });
  const first = user.fullName.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${first}`}
        description={`${user.position} · ${user.department}`}
        actions={
          <>
            <Link href="/assistant">
              <Button variant="secondary" size="sm">
                <SparkleIcon size={14} /> Ask Al Jana
              </Button>
            </Link>
            <Link href="/requests?new=vacation">
              <Button variant="primary" size="sm">
                <PlusIcon size={14} /> New request
              </Button>
            </Link>
          </>
        }
      />

      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      {data && (
        <>
          <section aria-label="Summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatTile
              tone="dark"
              label="Vacation days"
              value={data.vacation.available}
              hint={
                <>
                  available of {data.vacation.remaining} remaining
                  {data.vacation.pending > 0 && ` · ${data.vacation.pending} pending`}
                </>
              }
              href="/profile"
            />
            <StatTile
              label="Open requests"
              value={data.openRequests}
              hint={data.openRequests ? "waiting for a decision" : "nothing pending"}
              href="/requests"
            />
            <StatTile
              label="Training"
              value={`${data.training.completed}/${data.training.total}`}
              hint={data.training.overdue ? `${data.training.overdue} overdue` : "courses completed"}
              href="/academy"
            />
            <StatTile
              label="Unread alerts"
              value={data.unread}
              hint={data.unread ? "need your attention" : "all caught up"}
              href="/notifications"
            />
          </section>

          {data.manager && (
            <Panel
              title="My team"
              description="Your direct reports only"
              actions={
                <Link href="/team">
                  <Button variant="ghost" size="sm">
                    Open team <ArrowRightIcon size={13} />
                  </Button>
                </Link>
              }
            >
              <dl className="grid grid-cols-3 gap-4">
                <Kpi label="Team members" value={data.manager.teamSize} />
                <Kpi label="Awaiting decision" value={data.manager.awaitingDecision} href="/approvals" />
                <Kpi label="Overdue training" value={data.manager.teamOverdueTraining} warn={data.manager.teamOverdueTraining > 0} />
              </dl>
            </Panel>
          )}

          {data.hr && (
            <Panel
              title="Company overview"
              description="HR / Admin view"
              actions={
                <Link href="/hr">
                  <Button variant="ghost" size="sm">
                    HR inbox <ArrowRightIcon size={13} />
                  </Button>
                </Link>
              }
            >
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Kpi label="Employees" value={data.hr.employees} />
                <Kpi label="Awaiting decision" value={data.hr.awaitingDecision} href="/approvals" />
                <Kpi label="Open HR questions" value={data.hr.openEscalations} href="/hr" warn={data.hr.openEscalations > 0} />
                <Kpi label="Mandatory training" value={`${data.hr.mandatoryCompletionPct}%`} />
              </dl>
            </Panel>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
            <section aria-labelledby="recent" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 id="recent" className="text-[14px] font-semibold">
                  Recent requests
                </h2>
                <Link href="/requests" className="text-[12.5px] text-neutral-500 hover:text-neutral-900 link-slide">
                  View all
                </Link>
              </div>
              {data.recentRequests.length === 0 ? (
                <Panel padding="p-8">
                  <p className="text-[13px] text-neutral-500 text-center">
                    No requests yet.{" "}
                    <Link href="/requests?new=vacation" className="font-medium text-neutral-900 underline underline-offset-2">
                      Submit your first one
                    </Link>
                    .
                  </p>
                </Panel>
              ) : (
                data.recentRequests.map((r) => <RequestCard key={r.id} request={r} />)
              )}
            </section>

            <Panel title="Up next in Jana Academy" description={data.training.next ? undefined : "No pending courses"}>
              {data.training.next ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold tracking-[-0.01em]">{data.training.next.course.title}</p>
                      <p className="text-[12px] text-neutral-400 mt-0.5">Due {fmtDate(data.training.next.dueDate)}</p>
                    </div>
                    <CourseStatusBadge status={data.training.next.status} overdue={data.training.next.overdue} />
                  </div>
                  <Progress value={data.training.next.progress} showValue label="Progress" />
                  <Link href={`/academy/${data.training.next.id}`}>
                    <Button variant="primary" size="sm" fullWidth>
                      {data.training.next.status === "assigned" ? "Start course" : "Continue"} <ArrowRightIcon size={13} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-[13px] text-neutral-500">You&apos;re all caught up. Nice work.</p>
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
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{label}</dt>
      <dd className={["mt-1 text-[24px] font-semibold tabular-nums tracking-[-0.03em]", warn ? "text-amber-600" : "text-neutral-900"].join(" ")}>{value}</dd>
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
