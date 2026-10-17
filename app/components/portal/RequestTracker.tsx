import React from "react";
import type { RequestEvent, RequestStatus } from "@/lib/domain/types";
import { fmtDateTime } from "@/lib/client/format";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CheckIcon, XIcon } from "./icons";

const TERMINAL: RequestStatus[] = ["approved", "rejected", "cancelled"];

function stageIndex(status: RequestStatus): number {
  if (status === "draft") return 0;
  if (status === "submitted") return 1;
  if (status === "in_review") return 2;
  return 3;
}

/** Time the request first reached a status (for the small captions). */
function at(history: RequestEvent[], ...statuses: RequestStatus[]) {
  return history.find((h) => statuses.includes(h.status))?.at;
}

/**
 * Four-stage progress: Draft -> Submitted -> In review -> Decision. Completed
 * stages are filled, the current one pulses.
 */
export function RequestTracker({
  status,
  history,
}: {
  status: RequestStatus;
  history: RequestEvent[];
}) {
  const { m, locale } = useI18n();
  const privateCancelledDraft = status === "cancelled" && !history.some((event) => event.status === "submitted");
  const current = privateCancelledDraft ? 0 : stageIndex(status);
  const terminal = TERMINAL.includes(status);

  const decisionLabel =
    status === "approved" ? m.requestStatus.approved : status === "rejected" ? m.requestStatus.rejected : status === "cancelled" ? m.requestStatus.cancelled : m.requestStatus.decision;

  const stages = privateCancelledDraft
    ? [{ label: m.requestStatus.cancelled, time: at(history, "cancelled") }]
    : [
        { label: m.requestStatus.draft, time: at(history, "draft") },
        { label: m.requestStatus.filed, time: at(history, "submitted") },
        { label: m.requestStatus.in_review, time: at(history, "in_review") },
        { label: decisionLabel, time: at(history, "approved", "rejected", "cancelled") },
      ];

  return (
    <ol className={privateCancelledDraft ? "grid grid-cols-1" : "grid grid-cols-4"} aria-label={m.request.progress}>
      {stages.map((s, i) => {
        const done = i < current || (i === current && terminal);
        const isCurrent = i === current && !terminal;
        const last = i === stages.length - 1;

        let node = "bg-hero-cell-bg text-tertiary";
        let icon: React.ReactNode = <span className="text-[12px] font-semibold">{i + 1}</span>;
        if (done || isCurrent) node = "bg-hero-foreground text-hero-on-foreground";
        if (done) icon = <CheckIcon size={14} />;
        if (last && terminal) {
          if (status === "approved") node = "bg-primary text-hero-on-foreground";
          if (status === "rejected") node = "bg-error text-hero-on-foreground";
          if (status === "cancelled") node = "bg-hero-cell-bg0 text-hero-on-foreground";
          icon = status === "approved" ? <CheckIcon size={14} /> : <XIcon size={13} />;
        }

        const lineDone = i < current || terminal;
        return (
          <li key={s.label} className="relative flex flex-col items-center text-center px-1">
            {i > 0 && (
              <span
                aria-hidden
                className={[
                  "absolute top-4 right-1/2 w-full h-px -translate-y-1/2 transition-colors duration-500",
                  i <= current || terminal ? "bg-hero-foreground" : "bg-hero-border",
                ].join(" ")}
              />
            )}
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={[
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                node,
                isCurrent ? "ring-4 ring-hero-foreground/10" : "",
              ].join(" ")}
              style={{
                boxShadow:
                  done || isCurrent
                    ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.15)"
                    : "inset 0 1px 2px rgba(17,17,17,0.06), 0 0 0 1px rgba(17,17,17,0.04)",
              }}
            >
              {isCurrent && (
                <span aria-hidden className="absolute inset-0 rounded-full bg-hero-foreground/30 animate-ping" />
              )}
              <span className="relative">{icon}</span>
            </span>
            <span
              className={[
                "mt-2 text-[12px] font-medium leading-tight",
                done || isCurrent ? "text-hero-foreground" : "text-tertiary",
              ].join(" ")}
            >
              {s.label}
            </span>
            <span className="mt-0.5 text-[10.5px] text-tertiary tabular-nums min-h-[14px]">
              {s.time && (done || isCurrent) ? fmtDateTime(s.time, locale) : ""}
            </span>
            <span className="sr-only">{lineDone ? m.request.stepDone : ""}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Slim four-segment bar for list rows. */
export function MiniTracker({ status, history }: { status: RequestStatus; history: RequestEvent[] }) {
  const privateCancelledDraft = status === "cancelled" && !history.some((event) => event.status === "submitted");
  if (privateCancelledDraft) {
    return <div className="h-1 w-full max-w-[140px] rounded-full bg-additional" aria-hidden />;
  }
  const current = stageIndex(status);
  const terminal = TERMINAL.includes(status);
  const finalColor =
    status === "approved" ? "bg-primary" : status === "rejected" ? "bg-error" : status === "cancelled" ? "bg-additional" : "bg-hero-foreground";
  return (
    <div className="flex gap-1 w-full max-w-[140px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => {
        const filled = i < current || (i === current && (terminal || i < 3));
        const color = i === 3 && terminal ? finalColor : "bg-hero-foreground";
        return (
          <span
            key={i}
            className={["h-1 flex-1 rounded-full", filled ? color : "bg-hero-border", i === current && !terminal ? "animate-pulse" : ""].join(" ")}
          />
        );
      })}
    </div>
  );
}
