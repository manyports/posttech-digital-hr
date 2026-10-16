"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { CourseSummary } from "@/lib/domain/types";
import type { TeamMemberDetail } from "@/lib/server/services/team";
import { ApiError, api, post } from "@/lib/client/api";
import { fmtDate, ROLE_LABEL } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { Avatar } from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Progress } from "../../../components/ui/Progress";
import { Select } from "../../../components/ui/Select";
import { useToast } from "../../../components/ui/Toast";
import { AccessDenied, ErrorBlock, LoadingBlock, Panel } from "../../../components/portal/Panel";
import { ArrowLeftIcon, PlusIcon } from "../../../components/portal/icons";
import { RequestCard } from "../../../components/portal/RequestCard";
import { RequestActions } from "../../../components/portal/RequestActions";
import { CourseStatusBadge } from "../../../components/portal/StatusBadge";

export default function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, reload } = useApi<TeamMemberDetail>(`/api/team/${id}`, { interval: 6000 });
  const [assignOpen, setAssignOpen] = useState(false);

  const back = (
    <Link href="/team" className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors w-fit">
      <ArrowLeftIcon size={13} /> Team
    </Link>
  );

  if (error && !data) {
    return (
      <>
        {back}
        {error.status === 403 ? <AccessDenied message={error.message} /> : <ErrorBlock message={error.message} onRetry={reload} />}
      </>
    );
  }
  if (loading || !data) return <LoadingBlock rows={3} />;

  const { profile: p, requests, training } = data;

  return (
    <>
      {back}

      <Panel padding="p-0">
        <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar name={p.fullName} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-semibold tracking-[-0.025em]">{p.fullName}</h1>
                <Badge variant="muted">{ROLE_LABEL[p.role]}</Badge>
              </div>
              <p className="text-[13.5px] text-neutral-500 mt-0.5">
                {p.position} · {p.department} · hired {fmtDate(p.hireDate)}
              </p>
              <p className="text-[12.5px] text-neutral-400 mt-0.5">{p.email}</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setAssignOpen(true)}>
            <PlusIcon size={14} /> Assign course
          </Button>
        </div>
        <dl className="grid grid-cols-3 border-t border-neutral-100 [&>div+div]:border-l [&>div]:border-neutral-100">
          <Stat label="Vacation remaining" value={`${p.vacation.remaining} d`} />
          <Stat label="Pending" value={`${p.vacation.pending} d`} />
          <Stat label="Entitlement" value={`${p.vacation.entitlement} d`} />
        </dl>
      </Panel>

      <section aria-labelledby="req" className="flex flex-col gap-3">
        <h2 id="req" className="text-[14px] font-semibold">Requests <span className="text-neutral-400 font-normal ml-1">{requests.length}</span></h2>
        {requests.length === 0 ? (
          <Panel padding="p-6"><p className="text-[13px] text-neutral-500">No requests.</p></Panel>
        ) : (
          requests.map((r) => (
            <RequestCard key={r.id} request={r} footer={r.allowedActions.length > 0 ? <RequestActions request={r} onDone={reload} compact /> : undefined} />
          ))
        )}
      </section>

      <Panel title="Training" description={`${training.filter((t) => t.status === "completed").length} of ${training.length} completed`} padding="p-0">
        {training.length === 0 ? (
          <p className="p-5 text-[13px] text-neutral-500">No courses assigned.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {training.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium truncate">{t.course.title}</p>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <div className="w-28"><Progress value={t.progress} /></div>
                    <span className="text-[11.5px] text-neutral-400 tabular-nums">{t.progress}%</span>
                    <span className="text-[11.5px] text-neutral-400">
                      {t.status === "completed" ? `score ${t.bestScore}%` : `due ${fmtDate(t.dueDate)}`}
                    </span>
                  </div>
                </div>
                <CourseStatusBadge status={t.status} overdue={t.overdue} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AssignModal open={assignOpen} employeeId={p.id} employeeName={p.fullName} onClose={() => { setAssignOpen(false); reload(); }} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <dt className="text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400">{label}</dt>
      <dd className="mt-1 text-[20px] font-semibold tabular-nums tracking-[-0.03em]">{value}</dd>
    </div>
  );
}

function AssignModal({ open, employeeId, employeeName, onClose }: { open: boolean; employeeId: string; employeeName: string; onClose: () => void }) {
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    api<{ courses: CourseSummary[] }>("/api/academy/courses")
      .then((d) => !cancelled && setCourses(d.courses))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const { assignment } = await post<{ assignment: { course: { title: string } } }>("/api/academy/assign", {
        userId: employeeId,
        courseId,
        dueDate: dueDate || undefined,
      });
      toast({ title: "Course assigned", description: `${assignment.course.title} → ${employeeName}`, variant: "success" });
      setCourseId("");
      setDueDate("");
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not assign the course.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign a course"
      description={`${employeeName} will be notified and the course appears in their Academy.`}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={busy || !courseId} onClick={() => void submit()}>
            {busy ? "Assigning…" : "Assign"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Course"
          fullWidth
          placeholder="Choose a course…"
          value={courseId}
          onChange={setCourseId}
          options={courses.map((c) => ({ value: c.id, label: `${c.title}${c.mandatory ? " (mandatory)" : ""}` }))}
        />
        <Input label="Due date (optional, default 30 days)" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} fullWidth />
        {error && <p role="alert" className="text-[12.5px] text-red-600 font-medium">{error}</p>}
      </div>
    </Modal>
  );
}
