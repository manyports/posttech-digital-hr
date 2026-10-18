"use client";

import { useState } from "react";
import type { EscalationView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { fmtRelative } from "@/lib/client/format";
import { clearApiCache, useApi, useNow } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { Textarea } from "../../components/ui/Textarea";
import { useToast } from "../../components/ui/Toast";
import { InboxIcon, RefreshIcon } from "../../components/portal/icons";
import { AccessDenied, ErrorBlock, LoadingBlock, PageHeader, Panel } from "../../components/portal/Panel";
import { Pill } from "../../components/portal/StatusBadge";
import { useUser } from "../../components/portal/UserContext";


interface Insights {
  total: number;
  answered: number;
  unanswered: { question: string; count: number; lastAskedAt: string }[];
}

export default function HrPage() {
  const user = useUser();
  const { toast } = useToast();
  const { m, locale } = useI18n();
  const now = useNow();
  const esc = useApi<{ escalations: EscalationView[] }>("/api/assistant/escalations", { interval: 6000 });
  const insights = useApi<Insights>("/api/hr/assistant-insights", { interval: 10000 });
  const [tab, setTab] = useState<"open" | "answered">("open");
  const [replyFor, setReplyFor] = useState<EscalationView | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  if (user.role !== "hr" || insights.error?.status === 403) {
    return (
      <>
        <PageHeader title={m.hr.title} />
        <AccessDenied message={m.hr.denied} />
      </>
    );
  }

  const list = esc.data?.escalations ?? [];
  const open = list.filter((e) => e.status === "open");
  const answered = list.filter((e) => e.status === "answered");
  const shown = tab === "open" ? open : answered;
  const rate = insights.data && insights.data.total > 0 ? Math.round((insights.data.answered / insights.data.total) * 100) : null;

  async function sendReply() {
    if (!replyFor) return;
    setBusy(true);
    setError(null);
    try {
      await post(`/api/assistant/escalations/${replyFor.id}/reply`, { answer: reply });
      toast({ title: m.hr.sent, description: tx(m.hr.sentHint, { name: replyFor.employee.fullName }), variant: "success" });
      setReplyFor(null);
      setReply("");
      esc.reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : m.hr.sendFail);
    } finally {
      setBusy(false);
    }
  }

  async function resetDemo() {
    setBusy(true);
    setResetError(null);
    try {
      await post("/api/admin/reset", { password: resetPassword });
      clearApiCache();
      toast({ title: m.hr.resetOk, description: m.hr.resetOkHint, variant: "success" });
      setResetOpen(false);
      esc.reload();
      insights.reload();
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setResetError(m.hr.resetBadPassword);
        return;
      }
      toast({ title: m.hr.resetFail, description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title={m.hr.title} />

      {esc.loading && !esc.data && <LoadingBlock rows={2} />}
      {esc.error && !esc.data && <ErrorBlock message={esc.error.message} onRetry={esc.reload} />}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <section className="flex flex-col gap-4 min-w-0" aria-labelledby="esc-h">
          <h2 id="esc-h" className="sr-only">{m.hr.queue}</h2>
          <Tabs
            tabs={[
              { key: "open", label: tx(m.hr.open, { n: open.length }) },
              { key: "answered", label: tx(m.hr.answered, { n: answered.length }) },
            ]}
            onChange={(k) => setTab(k as "open" | "answered")}
          />

          {esc.data && shown.length === 0 && (
            <Panel padding="p-10" as="div">
              <div className="text-center">
                <div className="w-11 h-11 rounded-xl bg-hero-cell-bg text-hero-muted flex items-center justify-center mx-auto mb-3">
                  <InboxIcon size={20} />
                </div>
                <p className="text-[14px] font-semibold">{tab === "open" ? m.hr.noneOpen : m.hr.noneDone}</p>
                <p className="text-[13px] text-hero-muted mt-1">
                  {tab === "open" ? m.hr.noneOpenHint : m.hr.noneDoneHint}
                </p>
              </div>
            </Panel>
          )}

          {shown.map((e) => (
            <Panel key={e.id} padding="p-5" as="div">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] text-tertiary tabular-nums">
                  {e.id} · {e.employee.fullName} · {fmtRelative(e.createdAt, now, locale)}
                </span>
                <Pill tone={e.status === "answered" ? "good" : "warn"}>{e.status === "answered" ? m.hr.replied : m.hr.waiting}</Pill>
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] mt-2 leading-snug">{e.question}</p>
              {e.answer && (
                <p className="mt-3 text-[13.5px] text-hero-muted leading-relaxed bg-hero-cell-bg rounded-xl px-4 py-3">
                  <span className="block text-[10.5px] font-semibold uppercase tracking-widest text-tertiary mb-1">{m.hr.yourReply}</span>
                  {e.answer}
                </p>
              )}
              {e.status === "open" && (
                <div className="mt-4">
                  <Button variant="primary" size="sm" onClick={() => { setReplyFor(e); setReply(""); setError(null); }}>
                    {m.hr.reply}
                  </Button>
                </div>
              )}
            </Panel>
          ))}
        </section>

        <div className="flex flex-col gap-6 min-w-0">
          <Panel title={m.hr.insights} padding="p-0">
            <dl className="grid grid-cols-2 border-b border-hero-border [&>div+div]:border-l [&>div]:border-hero-border">
              <div className="px-5 py-4">
                <dt className="text-[10.5px] font-semibold uppercase tracking-widest text-tertiary">{m.hr.asked}</dt>
                <dd className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em]">{insights.data?.total ?? "-"}</dd>
              </div>
              <div className="px-5 py-4">
                <dt className="text-[10.5px] font-semibold uppercase tracking-widest text-tertiary">{m.hr.fromKb}</dt>
                <dd className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em]">{rate === null ? "-" : `${rate}%`}</dd>
              </div>
            </dl>
            <div className="px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-tertiary mb-2">{m.hr.gaps}</p>
              {insights.data && insights.data.unanswered.length === 0 && (
                <p className="text-[13px] text-hero-muted py-1">{m.hr.noGaps}</p>
              )}
              <ul className="flex flex-col gap-2">
                {insights.data?.unanswered.slice(0, 8).map((u) => (
                  <li key={u.question} className="flex items-start justify-between gap-3 text-[13px]">
                    <span className="text-hero-foreground leading-snug">{u.question}</span>
                    <span className="text-[11.5px] text-tertiary tabular-nums shrink-0">×{u.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel title={m.hr.demo}>
            <p className="text-[13px] text-hero-muted leading-relaxed">{m.hr.demoBody}</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => { setResetOpen(true); setResetPassword(""); setResetError(null); }}>
                <RefreshIcon size={14} /> {m.hr.reset}
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={replyFor !== null}
        onClose={() => !busy && setReplyFor(null)}
        title={m.hr.replyTitle}
        description={replyFor ? tx(m.hr.askedBy, { name: replyFor.employee.fullName, question: replyFor.question }) : undefined}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReplyFor(null)} disabled={busy}>{m.common.cancel}</Button>
            <Button variant="primary" size="sm" disabled={busy || reply.trim().length < 3} onClick={() => void sendReply()}>
              {busy ? m.hr.sending : m.hr.send}
            </Button>
          </>
        }
      >
        <Textarea label={m.hr.yourAnswer} value={reply} onChange={(e) => setReply(e.target.value)} rows={4} maxLength={1000} fullWidth />
        {error && <p role="alert" className="text-[12.5px] text-error font-medium mt-2">{error}</p>}
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => !busy && setResetOpen(false)}
        title={m.hr.resetTitle}
        description={m.hr.resetBody}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(false)} disabled={busy}>{m.common.cancel}</Button>
            <Button variant="primary" size="sm" disabled={busy || !resetPassword} onClick={() => void resetDemo()}>
              {busy ? m.hr.resetting : m.hr.reset}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); if (!busy && resetPassword) void resetDemo(); }}>
          <Input
            label={m.hr.resetPassword}
            type="password"
            autoComplete="current-password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            autoFocus
            fullWidth
          />
        </form>
        {resetError && <p role="alert" className="text-[12.5px] text-error font-medium mt-2">{resetError}</p>}
      </Modal>
    </>
  );
}
