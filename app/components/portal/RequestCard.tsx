import React from "react";
import Link from "next/link";
import type { RequestView } from "@/lib/domain/types";
import { fmtDate, payloadSummary, TYPE_LABEL } from "@/lib/client/format";
import { DocIcon, ArrowRightIcon } from "./icons";
import { MiniTracker } from "./RequestTracker";
import { StatusBadge } from "./StatusBadge";

const SHADOW =
  "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)";

/** One request in a list. The whole card links to the detail page. */
export function RequestCard({
  request,
  showEmployee = false,
  footer,
}: {
  request: RequestView;
  showEmployee?: boolean;
  footer?: React.ReactNode;
}) {
  const href = `/requests/${request.id}`;
  return (
    <article className="group/rc bg-white rounded-2xl transition-shadow duration-300 hover:shadow-md" style={{ boxShadow: SHADOW }}>
      <Link
        href={href}
        className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      >
        <div
          className="hidden sm:flex w-10 h-10 rounded-xl bg-neutral-900/5 text-neutral-700 items-center justify-center shrink-0 ring-1 ring-inset ring-neutral-900/8"
          style={{ boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.95), 0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <DocIcon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <p className="text-[14px] font-semibold tracking-[-0.01em] text-neutral-900">
              {showEmployee ? `${request.employee.fullName} · ` : ""}
              {TYPE_LABEL[request.type]}
            </p>
            <span className="text-[11.5px] text-neutral-400 tabular-nums">{request.id}</span>
          </div>
          <p className="text-[13px] text-neutral-500 mt-0.5 truncate">{payloadSummary(request.payload)}</p>
          <div className="mt-2.5 flex items-center gap-3">
            <MiniTracker status={request.status} />
            <span className="text-[11.5px] text-neutral-400 hidden sm:inline">Submitted {fmtDate(request.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={request.status} />
          <ArrowRightIcon size={14} className="text-neutral-300 transition-all duration-200 group-hover/rc:text-neutral-700 group-hover/rc:translate-x-0.5" />
        </div>
      </Link>
      {footer && <div className="px-4 sm:px-5 pb-4 pt-0 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">{footer}</div>}
    </article>
  );
}
