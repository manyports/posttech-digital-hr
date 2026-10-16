"use client";

import Link from "next/link";
import type { ProfileBundle } from "@/lib/server/services/dashboard";
import { fmtDate, fmtRelative, ROLE_LABEL } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { ArrowRightIcon } from "../../components/portal/icons";
import { ErrorBlock, LoadingBlock, PageHeader, Panel } from "../../components/portal/Panel";
import { CourseStatusBadge } from "../../components/portal/StatusBadge";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-3.5">
      <dt className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">{label}</dt>
      <dd className="text-[13.5px] font-medium text-neutral-900">{children}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { data, error, loading, reload } = useApi<ProfileBundle>("/api/profile", { interval: 10000 });

  return (
    <>
      <PageHeader title="Мой профиль" description="Данные сотрудника, баланс отпуска, обучение и последние уведомления." />
      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}
      {data && <ProfileBody bundle={data} />}
    </>
  );
}

function ProfileBody({ bundle }: { bundle: ProfileBundle }) {
  const { profile: p, training, notifications, unread } = bundle;
  const used = p.vacation.entitlement - p.vacation.remaining;

  return (
    <>
      <Panel padding="p-0">
        <div className="p-5 sm:p-6 flex items-center gap-4 border-b border-neutral-100">
          <Avatar name={p.fullName} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{p.fullName}</h2>
              <Badge variant={p.role === "employee" ? "muted" : p.role === "manager" ? "accent" : "default"}>
                {ROLE_LABEL[p.role]}
              </Badge>
            </div>
            <p className="text-[13.5px] text-neutral-500 mt-0.5">
              {p.position} · {p.department}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 sm:[&>div:nth-child(odd)]:border-r sm:[&>div]:border-b [&>div]:border-neutral-100 [&>div:nth-last-child(-n+2)]:sm:border-b-0">
          <Field label="ФИО">{p.fullName}</Field>
          <Field label="Компания">{p.company}</Field>
          <Field label="Должность">{p.position}</Field>
          <Field label="Отдел">{p.department}</Field>
          <Field label="Руководитель">{p.managerName ?? <span className="text-neutral-400 font-normal">Нет руководителя (высшее руководство)</span>}</Field>
          <Field label="Дата приема">{fmtDate(p.hireDate)}</Field>
          <Field label="Табельный номер">{p.employeeNumber}</Field>
          <Field label="Город">{p.location}</Field>
        </dl>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Panel title="Отпуск" description={`Годовой отпуск: ${p.vacation.entitlement} рабочих дней`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[44px] font-semibold tabular-nums tracking-[-0.04em] leading-none">{p.vacation.remaining}</p>
              <p className="text-[12.5px] text-neutral-500 mt-1.5">дней осталось</p>
            </div>
            <dl className="text-right text-[12.5px] text-neutral-500 leading-relaxed">
              <div>
                <dt className="inline">Использовано: </dt>
                <dd className="inline font-medium text-neutral-900 tabular-nums">{used}</dd>
              </div>
              <div>
                <dt className="inline">На рассмотрении: </dt>
                <dd className="inline font-medium text-neutral-900 tabular-nums">{p.vacation.pending}</dd>
              </div>
              <div>
                <dt className="inline">Доступно для заявки: </dt>
                <dd className="inline font-medium text-neutral-900 tabular-nums">{p.vacation.available}</dd>
              </div>
            </dl>
          </div>
          <Progress className="mt-5" value={p.vacation.remaining} max={p.vacation.entitlement} label="Остаток от годового отпуска" />
          <div className="mt-5">
            <Link href="/requests?new=vacation" className="text-[13px] font-medium text-neutral-900 inline-flex items-center gap-1.5 link-slide">
              Запросить отпуск <ArrowRightIcon size={13} />
            </Link>
          </div>
        </Panel>

        <Panel
          title="Назначенное обучение"
          description={`${training.filter((t) => t.status === "completed").length} из ${training.length} завершено`}
          padding="p-0"
          actions={
            <Link href="/academy" className="text-[12.5px] text-neutral-500 hover:text-neutral-900 link-slide">
              В Академию
            </Link>
          }
        >
          {training.length === 0 ? (
            <p className="p-5 text-[13px] text-neutral-500">Нет назначенных курсов.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {training.map((t) => (
                <li key={t.id}>
                  <Link href={`/academy/${t.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-neutral-900 truncate">{t.course.title}</p>
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <div className="w-24"><Progress value={t.progress} /></div>
                        <span className="text-[11.5px] text-neutral-400 tabular-nums">{t.progress}%</span>
                        {t.status !== "completed" && <span className="text-[11.5px] text-neutral-400">срок: {fmtDate(t.dueDate)}</span>}
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
        title="Уведомления"
        description={unread ? `${unread} непрочитанных` : "Все прочитано"}
        padding="p-0"
        actions={
          <Link href="/notifications" className="text-[12.5px] text-neutral-500 hover:text-neutral-900 link-slide">
            Все уведомления
          </Link>
        }
      >
        {notifications.length === 0 ? (
          <p className="p-5 text-[13px] text-neutral-500">Уведомлений пока нет.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link href={n.href ?? "/notifications"} className="flex items-start gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                  <span className={["mt-1.5 w-2 h-2 rounded-full shrink-0", n.readAt ? "bg-neutral-200" : "bg-neutral-900"].join(" ")} aria-label={n.readAt ? "прочитано" : "не прочитано"} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-neutral-900">{n.title}</p>
                    <p className="text-[12.5px] text-neutral-500 mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                  <span className="text-[11px] text-neutral-400 shrink-0 mt-0.5">{fmtRelative(n.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
