"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AssistantReply, EscalationView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { fmtRelative } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { ArrowRightIcon, BookIcon, CheckIcon, SendIcon, SparkleIcon } from "../../components/portal/icons";
import { PageHeader, Panel } from "../../components/portal/Panel";
import { Pill } from "../../components/portal/StatusBadge";
import { KB_ANSWERS_RU, RU_QUESTIONS, MESSAGES_RU } from "@/lib/assistant/translations";

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "bot"; reply: AssistantReply; escalation?: EscalationView; escalating?: boolean };

const STARTERS = [
  "Сколько дней отпуска мне положено?",
  "Как запросить аванс по зарплате?",
  "Что делать, если я заболел?",
  "Могу ли я работать из дома?",
  "В какой день выплачивается зарплата?",
];
const OUTSIDE_KB = ["Есть ли у нас опционы на акции?"];

export default function AssistantPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const { data: esc, reload: reloadEsc } = useApi<{ escalations: EscalationView[] }>("/api/assistant/escalations", { interval: 8000 });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    setDraft("");
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text: q }]);
    setThinking(true);
    try {
      const { reply } = await post<{ reply: AssistantReply }>("/api/assistant/ask", { question: q });
      // A short beat so the reply doesn't feel like a page jump.
      await new Promise((r) => setTimeout(r, 350));
      setMessages((m) => [...m, { id: nextId.current++, role: "bot", reply }]);
    } catch (e) {
      toast({ title: "Al Jana не смогла ответить", description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    } finally {
      setThinking(false);
    }
  }

  async function escalate(msgId: number, question: string) {
    setMessages((m) => m.map((x) => (x.id === msgId && x.role === "bot" ? { ...x, escalating: true } : x)));
    try {
      const { escalation } = await post<{ escalation: EscalationView }>("/api/assistant/escalate", { question });
      setMessages((m) => m.map((x) => (x.id === msgId && x.role === "bot" ? { ...x, escalating: false, escalation } : x)));
      toast({ title: "Вопрос передан в HR", description: `Обращение ${escalation.id}. Вы получите уведомление, когда HR ответит.`, variant: "success" });
      reloadEsc();
    } catch (e) {
      setMessages((m) => m.map((x) => (x.id === msgId && x.role === "bot" ? { ...x, escalating: false } : x)));
      toast({ title: "Не удалось связаться с HR", description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    }
  }

  return (
    <>
      <PageHeader
        title="Al Jana"
        description="Ваш HR-ассистент. Отвечает строго по корпоративной базе знаний HR, всегда указывает источник и не выдумывает факты."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <Panel padding="p-0" as="div" className="min-w-0">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-hero-border">
            <span className="w-9 h-9 rounded-xl bg-hero-foreground text-hero-on-foreground flex items-center justify-center shrink-0">
              <SparkleIcon size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[-0.01em] leading-tight">Al Jana</p>
              <p className="text-[12px] text-tertiary">Ответы только из базы знаний HR</p>
            </div>
          </div>

          <div role="log" aria-live="polite" aria-label="Диалог" className="px-4 sm:px-5 py-5 flex flex-col gap-5 min-h-[380px] max-h-[62vh] overflow-y-auto">
            <BotBubble>
              <p className="text-[14px] leading-relaxed text-hero-foreground">
                Здравствуйте! Спросите меня об отпуске, авансе, больничных, рабочем времени, льготах или обучении. Я отвечаю только по нашей базе знаний HR и всегда показываю источник. Если точного ответа нет, я честно сообщу об этом и предложу передать вопрос в HR.
              </p>
              <Chips label="Попробуйте спросить" items={STARTERS} onPick={ask} disabled={thinking} />
              <Chips label="Вне базы знаний (пример передачи в HR)" items={OUTSIDE_KB} onPick={ask} disabled={thinking} subtle />
            </BotBubble>

            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} text={m.text} />
              ) : (
                <BotMessage key={m.id} msg={m} onAsk={ask} onEscalate={() => void escalate(m.id, m.reply.question)} disabled={thinking} />
              ),
            )}

            {thinking && (
              <BotBubble>
                <span className="inline-flex gap-1 py-1" aria-label="Al Jana ищет ответ в базе знаний">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-additional animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </span>
              </BotBubble>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="flex items-start gap-2 px-4 sm:px-5 py-4 border-t border-hero-border bg-hero-cell-bg/60"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(draft);
            }}
          >
            <div className="flex-1">
              <Input
                aria-label="Задать вопрос HR"
                placeholder="Задайте вопрос HR…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                fullWidth
                autoComplete="off"
              />
            </div>
            <Button type="submit" variant="primary" size="md" disabled={thinking || !draft.trim()}>
              <SendIcon size={15} /> Спросить
            </Button>
          </form>
        </Panel>

        <div className="flex flex-col gap-6 min-w-0">
          <Panel title="Как работает Al Jana" padding="p-5">
            <ul className="flex flex-col gap-3 text-[13px] text-hero-muted leading-snug">
              <Point>Ответы составлены HR и отображаются <strong className="text-hero-foreground">слово в слово</strong>. Ничего не генерируется и не додумывается.</Point>
              <Point>Каждый ответ содержит ссылку на <strong className="text-hero-foreground">исходный документ и раздел</strong>.</Point>
              <Point>Нет надежного совпадения? Ассистент скажет об этом и предложит <strong className="text-hero-foreground">передать вопрос в HR</strong>.</Point>
            </ul>
          </Panel>

          <Panel title="Мои вопросы в HR" description="Передано из Al Jana" padding="p-0">
            {!esc || esc.escalations.length === 0 ? (
              <p className="p-5 text-[13px] text-hero-muted">Пока вопросов нет. Если Al Jana не сможет ответить, вы сможете отправить вопрос в HR.</p>
            ) : (
              <ul className="divide-y divide-hero-border">
                {esc.escalations.map((e) => (
                  <li key={e.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] text-tertiary tabular-nums">{e.id} · {fmtRelative(e.createdAt)}</span>
                      <Pill tone={e.status === "answered" ? "good" : "warn"}>{e.status === "answered" ? "Отвечено" : "Ожидает HR"}</Pill>
                    </div>
                    <p className="text-[13px] font-medium text-hero-foreground mt-1.5 leading-snug">{e.question}</p>
                    {e.answer && (
                      <p className="mt-2 text-[13px] text-hero-muted leading-relaxed bg-hero-cell-bg rounded-lg px-3 py-2.5">
                        <span className="block text-[10.5px] font-semibold uppercase tracking-widest text-tertiary mb-1">HR ответил(а)</span>
                        {e.answer}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function Point({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 w-4 h-4 rounded-full bg-hero-foreground text-hero-on-foreground flex items-center justify-center shrink-0">
        <CheckIcon size={10} />
      </span>
      <span>{children}</span>
    </li>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p
        className="max-w-[85%] bg-hero-foreground text-hero-on-foreground rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] leading-relaxed"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        {text}
      </p>
    </div>
  );
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-7 h-7 rounded-lg bg-hero-foreground text-hero-on-foreground flex items-center justify-center shrink-0 mt-0.5">
        <SparkleIcon size={14} />
      </span>
      <div
        className="max-w-[92%] min-w-0 flex flex-col gap-3 bg-hero-elevated rounded-2xl rounded-tl-md px-4 py-3"
        style={{ boxShadow: "0 1px 2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.07), inset 0 1px 0 rgba(255,255,255,0.9)" }}
      >
        {children}
      </div>
    </div>
  );
}

function Chips({ label, items, onPick, disabled, subtle }: { label: string; items: string[]; onPick: (q: string) => void; disabled?: boolean; subtle?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-tertiary mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((q) => (
          <button
            key={q}
            disabled={disabled}
            onClick={() => onPick(q)}
            className={[
              "text-left text-[12.5px] font-medium rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors disabled:opacity-40",
              subtle ? "bg-hero-elevated text-hero-muted hover:text-hero-foreground border border-dashed border-neutral-300" : "bg-hero-cell-bg text-hero-foreground hover:bg-hero-border",
            ].join(" ")}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function BotMessage({
  msg,
  onAsk,
  onEscalate,
  disabled,
}: {
  msg: Extract<Msg, { role: "bot" }>;
  onAsk: (q: string) => void;
  onEscalate: () => void;
  disabled: boolean;
}) {
  const r = msg.reply;

  if (r.kind === "answer") {
    const text = KB_ANSWERS_RU[r.entryId] ?? r.answer;
    const relatedItems = r.related.map((x) => RU_QUESTIONS[x.entryId] ?? x.question);
    return (
      <BotBubble>
        <p className="text-[14.5px] leading-[1.7] text-hero-foreground">{text}</p>

        <aside
          aria-label="Источник"
          className="rounded-xl bg-hero-cell-bg px-3.5 py-3 flex items-start gap-3 ring-1 ring-inset ring-hero-foreground/5"
        >
          <span className="w-7 h-7 rounded-lg bg-hero-elevated text-hero-foreground flex items-center justify-center shrink-0 ring-1 ring-inset ring-hero-foreground/8">
            <BookIcon size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-tertiary">Источник</p>
            <p className="text-[13px] font-semibold text-hero-foreground leading-snug mt-0.5">
              {r.source.docTitle} <span className="text-tertiary font-medium">· {r.source.docId}</span>
            </p>
            <p className="text-[12px] text-hero-muted leading-snug mt-0.5">
              {r.source.section} · {r.source.revision} · {r.source.owner}
            </p>
          </div>
        </aside>

        {r.action && (
          <div>
            <Link href={r.action.href}>
              <Button variant="secondary" size="sm">
                {r.action.label} <ArrowRightIcon size={13} />
              </Button>
            </Link>
          </div>
        )}

        <Chips label="Похожие вопросы" items={relatedItems} onPick={onAsk} disabled={disabled} />
      </BotBubble>
    );
  }

  if (r.kind === "no_answer") {
    const message = MESSAGES_RU.noAnswer;
    return (
      <BotBubble>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-md bg-warning text-hero-foreground flex items-center justify-center shrink-0 text-[13px] font-semibold mt-0.5">?</span>
          <div>
            <p className="text-[14px] font-semibold text-hero-foreground leading-snug">Надежный ответ не найден</p>
            <p className="text-[13.5px] leading-relaxed text-hero-muted mt-1">{message}</p>
          </div>
        </div>

        {msg.escalation ? (
          <div className="rounded-xl bg-pr-bg text-hero-foreground px-3.5 py-3 text-[13px] leading-snug border border-hero-border">
            <p className="font-semibold">Передано в HR · {msg.escalation.id}</p>
            <p className="mt-0.5 text-hero-muted">Вы получите уведомление, когда HR ответит. Отслеживать можно в разделе «Мои вопросы в HR».</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" disabled={msg.escalating} onClick={onEscalate}>
              {msg.escalating ? "Отправка…" : "Передать этот вопрос в HR"}
            </Button>
            <span className="text-[12px] text-tertiary">Сотрудник HR подготовит ответ.</span>
          </div>
        )}

        <Chips label="Или попробуйте один из этих вопросов" items={STARTERS.slice(0, 4)} onPick={onAsk} disabled={disabled} />
      </BotBubble>
    );
  }

  const smalltalkMessage = MESSAGES_RU[r.kind as keyof typeof MESSAGES_RU] ?? MESSAGES_RU.greeting;
  return (
    <BotBubble>
      <p className="text-[14px] leading-relaxed text-hero-foreground">{smalltalkMessage}</p>
      <Chips label="Попробуйте спросить" items={STARTERS.slice(0, 4)} onPick={onAsk} disabled={disabled} />
    </BotBubble>
  );
}
