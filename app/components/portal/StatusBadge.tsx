import React from "react";
import type { AssignmentStatus, RequestStatus } from "@/lib/domain/types";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Tone {
  chip: string;
  dot: string;
  ring: string;
}

const chip = "bg-hero-elevated text-hero-foreground border border-hero-border";

const tones: Record<string, Tone> = {
  neutral: { chip, dot: "bg-additional", ring: "transparent" },
  info: { chip, dot: "bg-additional", ring: "transparent" },
  warn: { chip, dot: "bg-warning", ring: "transparent" },
  good: { chip, dot: "bg-primary", ring: "transparent" },
  bad: { chip, dot: "bg-error", ring: "transparent" },
  dark: { chip: "bg-hero-foreground text-hero-on-foreground border border-hero-foreground", dot: "bg-hero-on-foreground", ring: "transparent" },
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
  const { m } = useI18n();
  return (
    <Pill tone={requestTone[status]} pulse={status === "in_review"}>
      {m.requestStatus[status]}
    </Pill>
  );
}

const courseTone: Record<AssignmentStatus, keyof typeof tones> = {
  assigned: "neutral",
  in_progress: "warn",
  completed: "good",
};

export function CourseStatusBadge({ status, overdue }: { status: AssignmentStatus; overdue?: boolean }) {
  const { m } = useI18n();
  if (overdue) return <Pill tone="bad">{m.courseStatus.overdue}</Pill>;
  return <Pill tone={courseTone[status]}>{m.courseStatus[status]}</Pill>;
}
