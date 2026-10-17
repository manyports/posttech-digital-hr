"use client";

import Link from "next/link";
import type { DashboardView } from "@/lib/server/services/dashboard";
import { fmtDate, payloadSummary } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/Progress";
import { ArrowRightIcon, PlusIcon, ChatIcon } from "../../components/portal/icons";
import { ErrorBlock, LoadingBlock, PageHeader, Panel } from "../../components/portal/Panel";
import { CourseStatusBadge, StatusBadge } from "../../components/portal/StatusBadge";
import { useUser } from "../../components/portal/UserContext";

export default function DashboardPage() {
  const user = useUser();
  const { m, locale } = useI18n();
  const { data, error, loading, reload } = useApi<DashboardView>("/api/dashboard", { interval: 8000 });
  const first = user.fullName.split(" ")[0];

  // Only things the user can act on, most urgent first.
  const todos: { key: string; text: string; meta?: string; href: string; warn?: boolean }[] = [];
  if (data) {
    const awaiting = data.manager?.awaitingDecision ?? data.hr?.awaitingDecision ?? 0;
    if (awaiting) todos.push({ key: "approve", text: tx(m.dashboard.todoApprove, { n: awaiting }), href: "/approvals", warn: true });
    if (data.hr?.openEscalations) todos.push({ key: "esc", text: tx(m.dashboard.todoEsc, { n: data.hr.openEscalations }), href: "/hr", warn: true });
    const next = data.training.next;
    if (next) {
      const copy = next.overdue ? m.dashboard.todoOverdue : next.status === "assigned" ? m.dashboard.todoCourseStart : m.dashboard.todoCourse;
      todos.push({
        key: "course",
        text: tx(copy, { title: next.course.title }),
        meta: tx(m.dashboard.due, { date: fmtDate(next.dueDate, locale) }),
        href: `/academy/${next.id}`,
        warn: next.overdue,
      });
    }
    if (data.unread) todos.push({ key: "unread", text: tx(m.dashboard.todoUnread, { n: data.unread }), href: "/notifications" });
  }

  return (
    <>
      <PageHeader
        title={tx(m.dashboard.welcome, { name: first })}
        description={`${user.position} · ${user.department}`}
        actions={
          <>
            <Link href="/assistant">
              <Button variant="secondary" size="sm">
                <ChatIcon size={14} /> {m.dashboard.ask}
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
          <Panel title={m.dashboard.attention} padding="p-0">
            {todos.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-hero-muted">{m.dashboard.allClear}</p>
            ) : (
              <ul className="divide-y divide-hero-border">
                {todos.map((t) => (
                  <li key={t.key}>
                    <Link href={t.href} className="group/td flex items-center gap-3 px-5 py-3.5 hover:bg-hero-cell-bg/60 transition-colors">
                      <span aria-hidden className={["w-1.5 h-1.5 rounded-full shrink-0", t.warn ? "bg-warning" : "bg-hero-foreground/25"].join(" ")} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13.5px] font-medium text-hero-foreground truncate">{t.text}</span>
                        {t.meta && <span className="block text-[12px] text-tertiary mt-0.5">{t.meta}</span>}
                      </span>
                      <span className="shrink-0 flex items-center gap-1 text-[12px] font-medium text-hero-muted group-hover/td:text-hero-foreground transition-colors">
                        {m.dashboard.open}
                        <ArrowRightIcon size={12} className="transition-transform group-hover/td:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel padding="p-0" as="div">
            <dl aria-label={m.dashboard.summary} className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hero-border">
              <Stat
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
              <Stat label={m.dashboard.openRequests} value={data.openRequests} hint={data.openRequests ? m.dashboard.waiting : m.dashboard.noOpen} href="/requests" />
              <Stat
                label={m.dashboard.training}
                value={`${data.training.completed}/${data.training.total}`}
                hint={data.training.overdue ? tx(m.dashboard.overdueN, { n: data.training.overdue }) : m.dashboard.coursesDone}
                href="/academy"
              />
              <Stat label={m.dashboard.unread} value={data.unread} hint={data.unread ? m.dashboard.needsAttention : m.dashboard.allRead} href="/notifications" />
            </dl>
          </Panel>

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

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <Panel
              title={m.dashboard.recent}
              padding="p-0"
              actions={
                <Link href="/requests" className="text-[12px] text-hero-muted hover:text-hero-foreground link-slide">
                  {m.dashboard.allRequests}
                </Link>
              }
            >
              {data.recentRequests.length === 0 ? (
                <p className="px-5 py-4 text-[13px] text-hero-muted">
                  {m.dashboard.empty}{" "}
                  <Link href="/requests?new=vacation" className="font-medium text-hero-foreground underline underline-offset-2">
                    {m.dashboard.first}
                  </Link>
                  .
                </p>
              ) : (
                <ul className="divide-y divide-hero-border">
                  {data.recentRequests.map((r) => (
                    <li key={r.id}>
                      <Link href={`/requests/${r.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-hero-cell-bg/60 transition-colors">
                        <span className="flex-1 min-w-0">
                          <span className="flex items-baseline gap-2">
                            <span className="text-[13.5px] font-medium text-hero-foreground">{m.requestType[r.type]}</span>
                            <span className="text-[11.5px] text-tertiary tabular-nums">{r.id}</span>
                          </span>
                          <span className="block text-[12.5px] text-hero-muted truncate mt-0.5">{payloadSummary(r.payload, locale)}</span>
                        </span>
                        <span className="hidden sm:block text-[11.5px] text-tertiary whitespace-nowrap">{fmtDate(r.createdAt, locale)}</span>
                        <StatusBadge status={r.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

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
                  <Link href={`/academy/${data.training.next.id}`} className="self-start">
                    <Button variant="secondary" size="sm">
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

function Stat({ label, value, hint, href }: { label: string; value: React.ReactNode; hint: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="block bg-hero-elevated px-5 py-4 hover:bg-hero-cell-bg/60 transition-colors">
      <dt className="app-tab">{label}</dt>
      <dd className="mt-1.5 text-[24px] leading-none font-semibold tabular-nums tracking-[-0.03em] text-hero-foreground">{value}</dd>
      <dd className="mt-1.5 text-[12px] text-tertiary truncate">{hint}</dd>
    </Link>
  );
}
