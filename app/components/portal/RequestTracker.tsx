import React from "react";
import type { RequestEvent, RequestStatus } from "@/lib/domain/types";
import { fmtDateTime } from "@/lib/client/format";
import { CheckIcon, XIcon } from "./icons";

const TERMINAL: RequestStatus[] = ["approved", "rejected", "cancelled"];

function stageIndex(status: RequestStatus): number {
  if (status === "submitted") return 0;
  if (status === "in_review") return 1;
  return 2;
}

/** Time the request first reached a status (for the small captions). */
function at(history: RequestEvent[], ...statuses: RequestStatus[]) {
  return history.find((h) => statuses.includes(h.status))?.at;
}

/**
 * Three-stage progress: Submitted -> In review -> Decision (approved / rejected /
 * cancelled). Completed stages are filled, the current one pulses.
 */
export function RequestTracker({
  status,
  history,
}: {
  status: RequestStatus;
  history: RequestEvent[];
}) {
  const current = stageIndex(status);
  const terminal = TERMINAL.includes(status);

  const decisionLabel =
    status === "approved" ? "Одобрено" : status === "rejected" ? "Отклонено" : status === "cancelled" ? "Отменено" : "Решение";

  const stages = [
    { label: "Подано", time: at(history, "submitted") },
    { label: "На рассмотрении", time: at(history, "in_review") },
    { label: decisionLabel, time: at(history, "approved", "rejected", "cancelled") },
  ];

  return (
    <ol className="grid grid-cols-3" aria-label="Прогресс заявки">
      {stages.map((s, i) => {
        const done = i < current || (i === current && terminal);
        const isCurrent = i === current && !terminal;
        const last = i === stages.length - 1;

        let node = "bg-neutral-100 text-neutral-400";
        let icon: React.ReactNode = <span className="text-[12px] font-semibold">{i + 1}</span>;
        if (done || isCurrent) node = "bg-neutral-900 text-white";
        if (done) icon = <CheckIcon size={14} />;
        if (last && terminal) {
          if (status === "approved") node = "bg-emerald-600 text-white";
          if (status === "rejected") node = "bg-red-600 text-white";
          if (status === "cancelled") node = "bg-neutral-500 text-white";
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
                  i <= current || terminal ? "bg-neutral-900" : "bg-neutral-200",
                ].join(" ")}
              />
            )}
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={[
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                node,
                isCurrent ? "ring-4 ring-neutral-900/10" : "",
              ].join(" ")}
              style={{
                boxShadow:
                  done || isCurrent
                    ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.15)"
                    : "inset 0 1px 2px rgba(17,17,17,0.06), 0 0 0 1px rgba(17,17,17,0.04)",
              }}
            >
              {isCurrent && (
                <span aria-hidden className="absolute inset-0 rounded-full bg-neutral-900/30 animate-ping" />
              )}
              <span className="relative">{icon}</span>
            </span>
            <span
              className={[
                "mt-2 text-[12px] font-medium leading-tight",
                done || isCurrent ? "text-neutral-900" : "text-neutral-400",
              ].join(" ")}
            >
              {s.label}
            </span>
            <span className="mt-0.5 text-[10.5px] text-neutral-400 tabular-nums min-h-[14px]">
              {s.time && (done || isCurrent) ? fmtDateTime(s.time) : ""}
            </span>
            <span className="sr-only">{lineDone ? "завершено" : ""}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Slim 3-segment bar for list rows. */
export function MiniTracker({ status }: { status: RequestStatus }) {
  const current = stageIndex(status);
  const terminal = TERMINAL.includes(status);
  const finalColor =
    status === "approved" ? "bg-emerald-500" : status === "rejected" ? "bg-red-500" : status === "cancelled" ? "bg-neutral-400" : "bg-neutral-900";
  return (
    <div className="flex gap-1 w-full max-w-[140px]" aria-hidden>
      {[0, 1, 2].map((i) => {
        const filled = i < current || (i === current && (terminal || i < 2));
        const color = i === 2 && terminal ? finalColor : "bg-neutral-900";
        return (
          <span
            key={i}
            className={["h-1 flex-1 rounded-full", filled ? color : "bg-neutral-200", i === current && !terminal ? "animate-pulse" : ""].join(" ")}
          />
        );
      })}
    </div>
  );
}
