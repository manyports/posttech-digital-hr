"use client";

import Link from "next/link";
import type { AssignmentView } from "@/lib/domain/types";
import { fmtDate } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Progress } from "../../components/ui/Progress";
import { ArrowRightIcon, BookIcon, ClockIcon } from "../../components/portal/icons";
import { ErrorBlock, LoadingBlock, PageHeader } from "../../components/portal/Panel";
import { CourseStatusBadge } from "../../components/portal/StatusBadge";

const SHADOW =
  "0 1px 3px rgba(17,17,17,0.02), 0 4px 12px -2px rgba(17,17,17,0.05), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)";

export default function AcademyPage() {
  const { data, error, loading, reload } = useApi<{ assignments: AssignmentView[] }>("/api/academy", { interval: 10000 });
  const list = data?.assignments ?? [];
  const todo = list.filter((a) => a.status !== "completed");
  const done = list.filter((a) => a.status === "completed");

  return (
    <>
      <PageHeader
        title="Jana Academy"
        description="Courses assigned to you. Open the materials, track your progress, and pass the test to complete a course."
      />

      {loading && !data && <LoadingBlock rows={2} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      {data && list.length === 0 && (
        <EmptyState icon={<BookIcon size={20} />} title="No courses assigned" description="When a manager or HR assigns you a course, it will show up here and in your notifications." />
      )}

      {todo.length > 0 && <Section title="To do" count={todo.length} items={todo} />}
      {done.length > 0 && <Section title="Completed" count={done.length} items={done} />}
    </>
  );
}

function Section({ title, count, items }: { title: string; count: number; items: AssignmentView[] }) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <h2 className="text-[14px] font-semibold">
        {title} <span className="text-neutral-400 font-normal ml-1">{count}</span>
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
  const cta = a.status === "completed" ? "Review" : a.status === "assigned" ? "Start course" : "Continue";
  return (
    <article className="h-full rounded-[22px] bg-white p-6 flex flex-col gap-4" style={{ boxShadow: SHADOW }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="muted">{a.course.category}</Badge>
          {a.course.mandatory && <Badge variant="accent">Mandatory</Badge>}
        </div>
        <CourseStatusBadge status={a.status} overdue={a.overdue} />
      </div>

      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold tracking-[-0.015em] leading-snug">{a.course.title}</h3>
        <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">{a.course.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-neutral-400">
        <span className="inline-flex items-center gap-1.5"><ClockIcon size={13} /> {a.course.durationMin} min</span>
        <span>{a.course.lessonCount} lessons + test</span>
        {a.status === "completed" ? <span>Score {a.bestScore}%</span> : <span>Due {fmtDate(a.dueDate)}</span>}
      </div>

      <Progress value={a.progress} showValue label={`${a.completedLessons}/${a.course.lessonCount} lessons`} />

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
