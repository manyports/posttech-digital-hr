"use client";

import Link from "next/link";
import type { AssignmentView } from "@/lib/domain/types";
import { fmtDate, pluralLessons } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Progress } from "../../components/ui/Progress";
import { ArrowRightIcon, BookIcon, ClockIcon } from "../../components/portal/icons";
import { ErrorBlock, LoadingBlock, PageHeader } from "../../components/portal/Panel";
import { CourseStatusBadge } from "../../components/portal/StatusBadge";

export default function AcademyPage() {
  const { m } = useI18n();
  const { data, error, loading, reload } = useApi<{ assignments: AssignmentView[] }>("/api/academy", { interval: 10000 });
  const list = data?.assignments ?? [];
  const todo = list.filter((a) => a.status !== "completed");
  const done = list.filter((a) => a.status === "completed");

  return (
    <>
      <PageHeader
        title="Jana Academy"
      />

      {loading && !data && <LoadingBlock rows={2} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      {data && list.length === 0 && (
        <EmptyState icon={<BookIcon size={20} />} title={m.academy.empty} description={m.academy.emptyHint} />
      )}

      {todo.length > 0 && <Section title={m.academy.todo} count={todo.length} items={todo} />}
      {done.length > 0 && <Section title={m.academy.done} count={done.length} items={done} />}
    </>
  );
}

function Section({ title, count, items }: { title: string; count: number; items: AssignmentView[] }) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <h2 className="text-[14px] font-semibold">
        {title} <span className="text-tertiary font-normal ml-1">{count}</span>
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((a) => (
          <li key={a.id}>
            <CourseCard a={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CourseCard({ a }: { a: AssignmentView }) {
  const { m, locale } = useI18n();
  const cta = a.status === "completed" ? m.academy.review : a.status === "assigned" ? m.academy.start : m.academy.continue;
  return (
    <article className="h-full rounded-2xl bg-hero-elevated p-5 flex flex-col gap-4 [box-shadow:var(--surface-shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="muted">{a.course.category}</Badge>
          {a.course.mandatory && <Badge variant="accent">{m.common.mandatory}</Badge>}
        </div>
        <CourseStatusBadge status={a.status} overdue={a.overdue} />
      </div>

      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold tracking-[-0.015em] leading-snug">{a.course.title}</h3>
        <p className="text-[13px] text-hero-muted mt-1.5 leading-relaxed line-clamp-2">{a.course.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-tertiary">
        <span className="inline-flex items-center gap-1.5"><ClockIcon size={13} /> {tx(m.academy.minutes, { n: a.course.durationMin })}</span>
        <span>{tx(m.academy.plusTest, { lessons: pluralLessons(a.course.lessonCount, locale) })}</span>
        {a.status === "completed" ? <span>{tx(m.academy.result, { n: a.bestScore ?? 0 })}</span> : <span>{tx(m.academy.due, { date: fmtDate(a.dueDate, locale) })}</span>}
      </div>

      <Progress value={a.progress} showValue label={tx(m.academy.lessonsOf, { done: a.completedLessons, total: a.course.lessonCount })} />

      <div className="mt-auto pt-1">
        <Link href={`/academy/${a.id}`}>
          <Button variant={a.status === "completed" ? "secondary" : "primary"} size="sm" fullWidth>
            {cta} <ArrowRightIcon size={13} />
          </Button>
        </Link>
      </div>
    </article>
  );
}
