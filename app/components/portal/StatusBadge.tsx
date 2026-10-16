import React from "react";
import type { AssignmentStatus, RequestStatus } from "@/lib/domain/types";
import { STATUS_LABEL } from "@/lib/client/format";

interface Tone {
  chip: string;
  dot: string;
  ring: string;
}

const tones: Record<string, Tone> = {
  neutral: { chip: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400", ring: "rgba(17,17,17,0.10)" },
  info: { chip: "bg-sky-50 text-sky-700", dot: "bg-sky-500", ring: "rgba(14,165,233,0.25)" },
  warn: { chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500", ring: "rgba(245,158,11,0.28)" },
  good: { chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", ring: "rgba(16,185,129,0.25)" },
  bad: { chip: "bg-red-50 text-red-700", dot: "bg-red-500", ring: "rgba(239,68,68,0.25)" },
  dark: { chip: "bg-neutral-900 text-white", dot: "bg-white/70", ring: "rgba(255,255,255,0.08)" },
};

export function Pill({
  tone = "neutral",
  children,
  pulse = false,
  className = "",
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide whitespace-nowrap",
        t.chip,
        className,
      ].join(" ")}
      style={{ boxShadow: `inset 0 0 0 1px ${t.ring}` }}
    >
      <span className={["w-1.5 h-1.5 rounded-full", t.dot, pulse ? "animate-pulse" : ""].join(" ")} />
      {children}
    </span>
  );
}

const requestTone: Record<RequestStatus, keyof typeof tones> = {
  submitted: "info",
  in_review: "warn",
  approved: "good",
  rejected: "bad",
  cancelled: "neutral",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Pill tone={requestTone[status]} pulse={status === "in_review"}>
      {STATUS_LABEL[status]}
    </Pill>
  );
}

const courseLabel: Record<AssignmentStatus, string> = {
  assigned: "Не начато",
  in_progress: "В процессе",
  completed: "Завершено",
};
const courseTone: Record<AssignmentStatus, keyof typeof tones> = {
  assigned: "neutral",
  in_progress: "warn",
  completed: "good",
};

export function CourseStatusBadge({ status, overdue }: { status: AssignmentStatus; overdue?: boolean }) {
  if (overdue) return <Pill tone="bad">Просрочено</Pill>;
  return <Pill tone={courseTone[status]}>{courseLabel[status]}</Pill>;
}
