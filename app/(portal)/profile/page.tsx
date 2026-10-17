"use client";

import Link from "next/link";
import type { ProfileBundle } from "@/lib/server/services/dashboard";
import { fmtDate, fmtRelative } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeBody, localizeTitle } from "@/lib/i18n/notices";
import { tx } from "@/lib/i18n/locale";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { ArrowRightIcon } from "../../components/portal/icons";
import { ErrorBlock, LoadingBlock, PageHeader, Panel } from "../../components/portal/Panel";
import { CourseStatusBadge } from "../../components/portal/StatusBadge";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-3.5">
      <dt className="text-[11px] font-semibold text-tertiary uppercase tracking-widest">{label}</dt>
      <dd className="text-[13.5px] font-medium text-hero-foreground">{children}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { data, error, loading, reload } = useApi<ProfileBundle>("/api/profile", { interval: 10000 });
  const { m } = useI18n();

  return (
    <>
      <PageHeader title={m.profile.title} description={m.profile.description} />
      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}
      {data && <ProfileBody bundle={data} />}
    </>
  );
}

function ProfileBody({ bundle }: { bundle: ProfileBundle }) {
  const { profile: p, training, notifications, unread } = bundle;
  const { m, locale } = useI18n();
  const used = p.vacation.entitlement - p.vacation.remaining;

  return (
    <>
      <Panel padding="p-0">
        <div className="p-5 sm:p-6 flex items-center gap-4 border-b border-hero-border">
          <Avatar name={p.fullName} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{p.fullName}</h2>
              <Badge variant={p.role === "employee" ? "muted" : p.role === "manager" ? "accent" : "default"}>
                {m.roles[p.role]}
              </Badge>
            </div>
            <p className="text-[13.5px] text-hero-muted mt-0.5">
              {p.position} · {p.department}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 sm:[&>div:nth-child(odd)]:border-r sm:[&>div]:border-b [&>div]:border-hero-border [&>div:nth-last-child(-n+2)]:sm:border-b-0">
          <Field label={m.profile.name}>{p.fullName}</Field>
          <Field label={m.profile.company}>{p.company}</Field>
          <Field label={m.profile.position}>{p.position}</Field>
          <Field label={m.profile.department}>{p.department}</Field>
          <Field label={m.profile.manager}>{p.managerName ?? <span className="text-tertiary font-normal">{m.common.noManager}</span>}</Field>
          <Field label={m.profile.hired}>{fmtDate(p.hireDate, locale)}</Field>
          <Field label={m.profile.number}>{p.employeeNumber}</Field>
          <Field label={m.profile.city}>{p.location}</Field>
        </dl>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Panel title={m.profile.vacation} description={tx(m.profile.entitlement, { n: p.vacation.entitlement })}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[44px] font-semibold tabular-nums tracking-[-0.04em] leading-none">{p.vacation.remaining}</p>
              <p className="text-[12.5px] text-hero-muted mt-1.5">{m.profile.left}</p>
            </div>
            <dl className="text-right text-[12.5px] text-hero-muted leading-relaxed">
              <div>
                <dt className="inline">{m.profile.used}</dt>
                <dd className="inline font-medium text-hero-foreground tabular-nums">{used}</dd>
              </div>
              <div>
                <dt className="inline">{m.profile.pending}</dt>
                <dd className="inline font-medium text-hero-foreground tabular-nums">{p.vacation.pending}</dd>
              </div>
              <div>
                <dt className="inline">{m.profile.available}</dt>
                <dd className="inline font-medium text-hero-foreground tabular-nums">{p.vacation.available}</dd>
              </div>
            </dl>
          </div>
          <Progress className="mt-5" value={p.vacation.remaining} max={p.vacation.entitlement} label={m.profile.remainingOf} />
          <div className="mt-5">
            <Link href="/requests?new=vacation" className="text-[13px] font-medium text-hero-foreground inline-flex items-center gap-1.5 link-slide">
              {m.profile.request} <ArrowRightIcon size={13} />
            </Link>
          </div>
        </Panel>

        <Panel
          title={m.profile.training}
          description={tx(m.profile.finished, { done: training.filter((t) => t.status === "completed").length, total: training.length })}
          padding="p-0"
          actions={
            <Link href="/academy" className="text-[12.5px] text-hero-muted hover:text-hero-foreground link-slide">
              {m.profile.academy}
            </Link>
          }
        >
          {training.length === 0 ? (
            <p className="p-5 text-[13px] text-hero-muted">{m.profile.noCourses}</p>
          ) : (
            <ul className="divide-y divide-hero-border">
              {training.map((t) => (
                <li key={t.id}>
                  <Link href={`/academy/${t.id}`} className="flex items-center gap-3 px-5 py-3.5 hover-wipe transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-hero-foreground truncate">{t.course.title}</p>
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <div className="w-24"><Progress value={t.progress} /></div>
                        <span className="text-[11.5px] text-tertiary tabular-nums">{t.progress}%</span>
                        {t.status !== "completed" && <span className="text-[11.5px] text-tertiary">{tx(m.common.due, { date: fmtDate(t.dueDate, locale) })}</span>}
                      </div>
                    </div>
                    <CourseStatusBadge status={t.status} overdue={t.overdue} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title={m.profile.notices}
        description={unread ? tx(m.profile.unreadN, { n: unread }) : m.profile.allRead}
        padding="p-0"
        actions={
          <Link href="/notifications" className="text-[12.5px] text-hero-muted hover:text-hero-foreground link-slide">
            {m.profile.allNotices}
          </Link>
        }
      >
        {notifications.length === 0 ? (
          <p className="p-5 text-[13px] text-hero-muted">{m.profile.noNotices}</p>
        ) : (
          <ul className="divide-y divide-hero-border">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link href={n.href ?? "/notifications"} className="flex items-start gap-3 px-5 py-3.5 hover-wipe transition-colors">
                  <span className={["mt-1.5 w-2 h-2 rounded-full shrink-0", n.readAt ? "bg-hero-border" : "bg-hero-foreground"].join(" ")} aria-label={n.readAt ? m.common.read : m.common.unread} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-hero-foreground">{localizeTitle(n.title, locale)}</p>
                    <p className="text-[12.5px] text-hero-muted mt-0.5 line-clamp-2">{localizeBody(n.body, locale)}</p>
                  </div>
                  <span className="text-[11px] text-tertiary shrink-0 mt-0.5">{fmtRelative(n.createdAt, Date.now(), locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
