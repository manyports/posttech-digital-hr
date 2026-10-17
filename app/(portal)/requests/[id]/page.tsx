"use client";

import { use } from "react";
import Link from "next/link";
import type { RequestEvent, RequestView } from "@/lib/domain/types";
import { fmtDate, fmtDateTime, fmtKzt } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { localizeHistoryNote } from "@/lib/i18n/notices";
import { Timeline } from "../../../components/ui/Timeline";
import { AccessDenied, ErrorBlock, LoadingBlock, Panel } from "../../../components/portal/Panel";
import { ArrowLeftIcon, LinkIcon } from "../../../components/portal/icons";
import { RequestActions } from "../../../components/portal/RequestActions";
import { RequestTracker } from "../../../components/portal/RequestTracker";
import { Pill, StatusBadge } from "../../../components/portal/StatusBadge";
import { useUser } from "../../../components/portal/UserContext";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3 border-b border-hero-border last:border-0">
      <dt className="text-[12px] font-semibold uppercase tracking-widest text-tertiary pt-0.5 shrink-0">{label}</dt>
      <dd className="text-[13.5px] font-medium text-hero-foreground text-right min-w-0 break-words">{children}</dd>
    </div>
  );
}

const variantFor = (s: RequestEvent["status"]) =>
  s === "approved" ? "success" : s === "rejected" ? "warning" : "default";

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useUser();
  const { m, locale } = useI18n();
  // Live status: poll every 4s (works on serverless; no websockets needed).
  const { data, error, loading, reload } = useApi<{ request: RequestView }>(`/api/requests/${id}`, { interval: 4000 });

  if (error && !data) {
    return (
      <>
        <BackLink to="/requests" label={m.request.mine} />
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
      <BackLink to={mine ? "/requests" : "/approvals"} label={mine ? m.request.mine : m.request.approvals} />

      <Panel padding="p-0">
        <div className="p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4 border-b border-hero-border">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-semibold tracking-[-0.025em]">{tx(m.request.heading, { type: m.requestType[r.type] })}</h1>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-[13px] text-hero-muted mt-1">
              {r.id} · {mine ? (r.status === "draft" ? m.request.savedByYou : m.request.byYou) : r.employee.fullName} · {fmtDateTime(r.createdAt, locale)}
            </p>
          </div>
          <Pill tone="dark" pulse>
            {m.request.live}
          </Pill>
        </div>

        <div className="px-4 sm:px-8 py-7">
          <RequestTracker status={r.status} history={r.history} />
        </div>

        {r.allowedActions.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-t border-hero-border bg-hero-cell-bg/60 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-hero-muted">
              {mine ? (r.status === "draft" ? m.request.draftActions : m.request.canCancel) : m.request.awaitsYou}
            </p>
            <RequestActions request={r} onDone={reload} />
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        <Panel title={m.request.details} padding="p-0">
          <dl>
            <Row label={m.request.employee}>{r.employee.fullName}</Row>
            <Row label={m.request.approver}>{r.approver.fullName}</Row>
            {p.kind === "vacation" ? (
              <>
                <Row label={m.request.dates}>
                  {fmtDate(p.startDate, locale)} – {fmtDate(p.endDate, locale)}
                </Row>
                <Row label={m.request.workDays}>{p.days}</Row>
                {p.comment && <Row label={m.request.comment}>{p.comment}</Row>}
              </>
            ) : (
              <>
                <Row label={m.request.amount}>{fmtKzt(p.amount)}</Row>
                <Row label={m.request.reason}>{p.reason}</Row>
              </>
            )}
            <Row label={m.request.updated}>{fmtDateTime(r.updatedAt, locale)}</Row>
          </dl>
        </Panel>

        <Panel
          title={m.request.systems}
          description={m.request.systemsHint}
          padding="p-0"
        >
          <dl>
            <Row label="Documentolog">
              {r.integration.documentolog ? (
                <span className="inline-flex flex-col items-end gap-0.5">
                  <span className="inline-flex items-center gap-1.5"><LinkIcon size={13} className="text-tertiary" />{r.integration.documentolog.ref}</span>
                  <span className="text-[11.5px] font-normal text-tertiary">{r.integration.documentolog.state}</span>
                </span>
              ) : (
                <span className="text-tertiary font-normal">{m.request.notStarted}</span>
              )}
            </Row>
            <Row label="1C:ЗУП">
              {r.integration.zup ? (
                <span className="inline-flex flex-col items-end gap-0.5">
                  <span className="inline-flex items-center gap-1.5"><LinkIcon size={13} className="text-tertiary" />{r.integration.zup.ref}</span>
                  <span className="text-[11.5px] font-normal text-tertiary">{r.integration.zup.state}</span>
                </span>
              ) : (
                <span className="text-tertiary font-normal">{r.status === "approved" ? "-" : m.request.afterApprove}</span>
              )}
            </Row>
          </dl>
        </Panel>
      </div>

      <Panel title={m.request.history} description={m.request.historyHint}>
        <Timeline
          items={[...r.history].reverse().map((h, i) => ({
            key: `${h.at}-${i}`,
            title: localizeHistoryNote(h.note, locale),
            description: h.comment ? `“${h.comment}”` : undefined,
            date: fmtDateTime(h.at, locale),
            variant: variantFor(h.status),
          }))}
        />
      </Panel>
    </>
  );
}

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link href={to} className="inline-flex items-center gap-1.5 text-[13px] text-hero-muted hover:text-hero-foreground transition-colors w-fit">
      <ArrowLeftIcon size={13} /> {label}
    </Link>
  );
}
