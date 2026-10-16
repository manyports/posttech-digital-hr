"use client";

import { use } from "react";
import Link from "next/link";
import type { RequestEvent, RequestView } from "@/lib/domain/types";
import { fmtDate, fmtDateTime, fmtKzt, TYPE_LABEL } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { Timeline } from "../../../components/ui/Timeline";
import { AccessDenied, ErrorBlock, LoadingBlock, Panel } from "../../../components/portal/Panel";
import { ArrowLeftIcon, LinkIcon } from "../../../components/portal/icons";
import { RequestActions } from "../../../components/portal/RequestActions";
import { RequestTracker } from "../../../components/portal/RequestTracker";
import { Pill, StatusBadge } from "../../../components/portal/StatusBadge";
import { useUser } from "../../../components/portal/UserContext";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3 border-b border-neutral-100 last:border-0">
      <dt className="text-[12px] font-semibold uppercase tracking-widest text-neutral-400 pt-0.5 shrink-0">{label}</dt>
      <dd className="text-[13.5px] font-medium text-neutral-900 text-right min-w-0 break-words">{children}</dd>
    </div>
  );
}

const variantFor = (s: RequestEvent["status"]) =>
  s === "approved" ? "success" : s === "rejected" ? "warning" : "default";

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useUser();
  // Live status: poll every 4s (works on serverless; no websockets needed).
  const { data, error, loading, reload } = useApi<{ request: RequestView }>(`/api/requests/${id}`, { interval: 4000 });

  if (error && !data) {
    return (
      <>
        <BackLink to="/requests" label="My requests" />
        {error.status === 403 ? <AccessDenied message={error.message} /> : <ErrorBlock message={error.message} onRetry={reload} />}
      </>
    );
  }
  if (loading || !data) return <LoadingBlock rows={3} />;

  const r = data.request;
  const mine = r.employee.id === user.id;
  const p = r.payload;

  return (
    <>
      <BackLink to={mine ? "/requests" : "/approvals"} label={mine ? "My requests" : "Approvals"} />

      <Panel padding="p-0">
        <div className="p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-semibold tracking-[-0.025em]">{TYPE_LABEL[r.type]} request</h1>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-[13px] text-neutral-500 mt-1">
              {r.id} · {mine ? "Submitted by you" : r.employee.fullName} · {fmtDateTime(r.createdAt)}
            </p>
          </div>
          <Pill tone="dark" pulse>
            Live
          </Pill>
        </div>

        <div className="px-4 sm:px-8 py-7">
          <RequestTracker status={r.status} history={r.history} />
        </div>

        {r.allowedActions.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-t border-neutral-100 bg-neutral-50/60 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-neutral-500">
              {mine ? "You can withdraw this request while it is open." : "This request is waiting for your decision."}
            </p>
            <RequestActions request={r} onDone={reload} />
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        <Panel title="Details" padding="p-0">
          <dl>
            <Row label="Employee">{r.employee.fullName}</Row>
            <Row label="Approver">{r.approver.fullName}</Row>
            {p.kind === "vacation" ? (
              <>
                <Row label="Dates">
                  {fmtDate(p.startDate)} – {fmtDate(p.endDate)}
                </Row>
                <Row label="Working days">{p.days}</Row>
                {p.comment && <Row label="Comment">{p.comment}</Row>}
              </>
            ) : (
              <>
                <Row label="Amount">{fmtKzt(p.amount)}</Row>
                <Row label="Reason">{p.reason}</Row>
              </>
            )}
            <Row label="Last update">{fmtDateTime(r.updatedAt)}</Row>
          </dl>
        </Panel>

        <Panel
          title="Connected systems"
          description="Mock adapters today; see the architecture notes"
          padding="p-0"
        >
          <dl>
            <Row label="Documentolog">
              {r.integration.documentolog ? (
                <span className="inline-flex flex-col items-end gap-0.5">
                  <span className="inline-flex items-center gap-1.5"><LinkIcon size={13} className="text-neutral-400" />{r.integration.documentolog.ref}</span>
                  <span className="text-[11.5px] font-normal text-neutral-400">{r.integration.documentolog.state}</span>
                </span>
              ) : (
                <span className="text-neutral-400 font-normal">Not started</span>
              )}
            </Row>
            <Row label="1C:ZUP">
              {r.integration.zup ? (
                <span className="inline-flex flex-col items-end gap-0.5">
                  <span className="inline-flex items-center gap-1.5"><LinkIcon size={13} className="text-neutral-400" />{r.integration.zup.ref}</span>
                  <span className="text-[11.5px] font-normal text-neutral-400">{r.integration.zup.state}</span>
                </span>
              ) : (
                <span className="text-neutral-400 font-normal">{r.status === "approved" ? "-" : "Registered after approval"}</span>
              )}
            </Row>
          </dl>
        </Panel>
      </div>

      <Panel title="History" description="Every status change, who made it, and when">
        <Timeline
          items={[...r.history].reverse().map((h, i) => ({
            key: `${h.at}-${i}`,
            title: h.note,
            description: h.comment ? `“${h.comment}”` : undefined,
            date: fmtDateTime(h.at),
            variant: variantFor(h.status),
          }))}
        />
      </Panel>
    </>
  );
}

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link href={to} className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors w-fit">
      <ArrowLeftIcon size={13} /> {label}
    </Link>
  );
}
