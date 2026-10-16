"use client";

import { useState } from "react";
import type { EscalationView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { fmtRelative } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { Button } from "../../components/ui/Button";
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
  const esc = useApi<{ escalations: EscalationView[] }>("/api/assistant/escalations", { interval: 6000 });
  const insights = useApi<Insights>("/api/hr/assistant-insights", { interval: 10000 });
  const [tab, setTab] = useState<"open" | "answered">("open");
  const [replyFor, setReplyFor] = useState<EscalationView | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  if (user.role !== "hr" || insights.error?.status === 403) {
    return (
      <>
        <PageHeader title="Входящие HR" />
        <AccessDenied message="Только HR / Администратор может открывать входящие HR." />
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
      toast({ title: "Ответ отправлен", description: `${replyFor.employee.fullName} получил(а) уведомление.`, variant: "success" });
      setReplyFor(null);
      setReply("");
      esc.reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось отправить ответ.");
    } finally {
      setBusy(false);
    }
  }

  async function resetDemo() {
    setBusy(true);
    try {
      await post("/api/admin/reset");
      toast({ title: "Демо-данные восстановлены", description: "Все демонстрационные данные возвращены к исходному состоянию.", variant: "success" });
      setResetOpen(false);
      esc.reload();
      insights.reload();
    } catch (e) {
      toast({ title: "Сброс не удался", description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Входящие HR" description="Вопросы, на которые не смогла ответить Al Jana, пробелы в базе знаний и управление демо-данными." />

      {esc.loading && !esc.data && <LoadingBlock rows={2} />}
      {esc.error && !esc.data && <ErrorBlock message={esc.error.message} onRetry={esc.reload} />}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <section className="flex flex-col gap-4 min-w-0" aria-labelledby="esc-h">
          <h2 id="esc-h" className="sr-only">Переданные вопросы</h2>
          <Tabs
            tabs={[
              { key: "open", label: `Открытые · ${open.length}` },
              { key: "answered", label: `С ответом · ${answered.length}` },
            ]}
            onChange={(k) => setTab(k as "open" | "answered")}
          />

          {esc.data && shown.length === 0 && (
            <Panel padding="p-10" as="div">
              <div className="text-center">
                <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-3">
                  <InboxIcon size={20} />
                </div>
                <p className="text-[14px] font-semibold">{tab === "open" ? "Нет открытых вопросов" : "Ответов пока нет"}</p>
                <p className="text-[13px] text-neutral-500 mt-1">
                  {tab === "open" ? "Когда Al Jana не может найти ответ и сотрудник передает вопрос в HR, он появляется здесь." : "Отправленные вами ответы отображаются здесь."}
                </p>
              </div>
            </Panel>
          )}

          {shown.map((e) => (
            <Panel key={e.id} padding="p-5" as="div">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] text-neutral-400 tabular-nums">
                  {e.id} · {e.employee.fullName} · {fmtRelative(e.createdAt)}
                </span>
                <Pill tone={e.status === "answered" ? "good" : "warn"}>{e.status === "answered" ? "Отвечено" : "Ожидает ответа"}</Pill>
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] mt-2 leading-snug">{e.question}</p>
              {e.answer && (
                <p className="mt-3 text-[13.5px] text-neutral-600 leading-relaxed bg-neutral-50 rounded-xl px-4 py-3">
                  <span className="block text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Ваш ответ</span>
                  {e.answer}
                </p>
              )}
              {e.status === "open" && (
                <div className="mt-4">
                  <Button variant="primary" size="sm" onClick={() => { setReplyFor(e); setReply(""); setError(null); }}>
                    Ответить
                  </Button>
                </div>
              )}
            </Panel>
          ))}
        </section>

        <div className="flex flex-col gap-6 min-w-0">
          <Panel title="Аналитика Al Jana" description="Помогает улучшать базу знаний" padding="p-0">
            <dl className="grid grid-cols-2 border-b border-neutral-100 [&>div+div]:border-l [&>div]:border-neutral-100">
              <div className="px-5 py-4">
                <dt className="text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400">Вопросов задано</dt>
                <dd className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em]">{insights.data?.total ?? "-"}</dd>
              </div>
              <div className="px-5 py-4">
                <dt className="text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400">Ответов из базы</dt>
                <dd className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em]">{rate === null ? "-" : `${rate}%`}</dd>
              </div>
            </dl>
            <div className="px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Без ответа, последние</p>
              {insights.data && insights.data.unanswered.length === 0 && (
                <p className="text-[13px] text-neutral-500 py-1">Нет. База знаний покрыла все заданные вопросы.</p>
              )}
              <ul className="flex flex-col gap-2">
                {insights.data?.unanswered.slice(0, 8).map((u) => (
                  <li key={u.question} className="flex items-start justify-between gap-3 text-[13px]">
                    <span className="text-neutral-700 leading-snug">{u.question}</span>
                    <span className="text-[11.5px] text-neutral-400 tabular-nums shrink-0">×{u.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel title="Управление демо" description="Только для прототипа">
            <p className="text-[13px] text-neutral-500 leading-relaxed">
              Сбросьте все заявки, курсы, уведомления и вопросы до исходного состояния демо-данных, чтобы пройти сценарии заново.
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
                <RefreshIcon size={14} /> Сбросить демо-данные
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={replyFor !== null}
        onClose={() => !busy && setReplyFor(null)}
        title="Ответить сотруднику"
        description={replyFor ? `${replyFor.employee.fullName} спросил(а): «${replyFor.question}»` : undefined}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReplyFor(null)} disabled={busy}>Отмена</Button>
            <Button variant="primary" size="sm" disabled={busy || reply.trim().length < 3} onClick={() => void sendReply()}>
              {busy ? "Отправка…" : "Отправить ответ"}
            </Button>
          </>
        }
      >
        <Textarea label="Ваш ответ" value={reply} onChange={(e) => setReply(e.target.value)} rows={4} maxLength={1000} fullWidth />
        {error && <p role="alert" className="text-[12.5px] text-red-600 font-medium mt-2">{error}</p>}
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => !busy && setResetOpen(false)}
        title="Сбросить демо-данные?"
        description="Это удалит все созданные во время демонстрации данные (новые заявки, назначения, уведомления, вопросы в HR) и восстановит исходные данные. Текущие сессии останутся активными."
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(false)} disabled={busy}>Отмена</Button>
            <Button variant="primary" size="sm" disabled={busy} onClick={() => void resetDemo()}>
              {busy ? "Сброс…" : "Сбросить"}
            </Button>
          </>
        }
      />
    </>
  );
}
