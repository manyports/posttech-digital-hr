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

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "bot"; reply: AssistantReply; escalation?: EscalationView; escalating?: boolean };

const STARTERS = [
  "How many vacation days do I get?",
  "How do I request a salary advance?",
  "What should I do if I am sick?",
  "Can I work from home?",
  "When is salary paid?",
];
const OUTSIDE_KB = ["Do we have stock options?"];

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
      toast({ title: "Al Jana couldn't answer", description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    } finally {
      setThinking(false);
    }
  }

  async function escalate(msgId: number, question: string) {
    setMessages((m) => m.map((x) => (x.id === msgId && x.role === "bot" ? { ...x, escalating: true } : x)));
    try {
      const { escalation } = await post<{ escalation: EscalationView }>("/api/assistant/escalate", { question });
      setMessages((m) => m.map((x) => (x.id === msgId && x.role === "bot" ? { ...x, escalating: false, escalation } : x)));
      toast({ title: "Question sent to HR", description: `Ticket ${escalation.id}. You'll get a notification when HR replies.`, variant: "success" });
      reloadEsc();
    } catch (e) {
      setMessages((m) => m.map((x) => (x.id === msgId && x.role === "bot" ? { ...x, escalating: false } : x)));
      toast({ title: "Could not contact HR", description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    }
  }

  return (
    <>
      <PageHeader
        title="Al Jana"
        description="Your HR assistant. It answers only from the HR knowledge base, always shows its source, and never guesses."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <Panel padding="p-0" as="div" className="min-w-0">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-neutral-100">
            <span className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <SparkleIcon size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[-0.01em] leading-tight">Al Jana</p>
              <p className="text-[12px] text-neutral-400">Answers from the HR knowledge base only</p>
            </div>
          </div>

          <div role="log" aria-live="polite" aria-label="Conversation" className="px-4 sm:px-5 py-5 flex flex-col gap-5 min-h-[380px] max-h-[62vh] overflow-y-auto">
            <BotBubble>
              <p className="text-[14px] leading-relaxed text-neutral-800">
                Hi! Ask me about vacation, salary advances, sick leave, working hours, benefits or training. I answer only from our HR knowledge
                base and always show where the answer comes from. If I can&apos;t find a reliable answer, I&apos;ll say so and offer to pass it to HR.
              </p>
              <Chips label="Try asking" items={STARTERS} onPick={ask} disabled={thinking} />
              <Chips label="Outside the knowledge base (see escalation)" items={OUTSIDE_KB} onPick={ask} disabled={thinking} subtle />
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
                <span className="inline-flex gap-1 py-1" aria-label="Al Jana is searching the knowledge base">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </span>
              </BotBubble>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="flex items-start gap-2 px-4 sm:px-5 py-4 border-t border-neutral-100 bg-neutral-50/60"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(draft);
            }}
          >
            <div className="flex-1">
              <Input
                aria-label="Ask an HR question"
                placeholder="Ask an HR question…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                fullWidth
                autoComplete="off"
              />
            </div>
            <Button type="submit" variant="primary" size="md" disabled={thinking || !draft.trim()}>
              <SendIcon size={15} /> Ask
            </Button>
          </form>
        </Panel>

        <div className="flex flex-col gap-6 min-w-0">
          <Panel title="How Al Jana works" padding="p-5">
            <ul className="flex flex-col gap-3 text-[13px] text-neutral-600 leading-snug">
              <Point>Answers are written by HR and shown <strong className="text-neutral-900">word for word</strong>. Nothing is generated or guessed.</Point>
              <Point>Every answer cites its <strong className="text-neutral-900">source document and section</strong>.</Point>
              <Point>No reliable match? It says so and offers to <strong className="text-neutral-900">escalate to HR</strong>.</Point>
            </ul>
          </Panel>

          <Panel title="My questions to HR" description="Escalated from Al Jana" padding="p-0">
            {!esc || esc.escalations.length === 0 ? (
              <p className="p-5 text-[13px] text-neutral-500">Nothing yet. If Al Jana can&apos;t answer, you can send the question to HR.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {esc.escalations.map((e) => (
                  <li key={e.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] text-neutral-400 tabular-nums">{e.id} · {fmtRelative(e.createdAt)}</span>
                      <Pill tone={e.status === "answered" ? "good" : "warn"}>{e.status === "answered" ? "Answered" : "Waiting for HR"}</Pill>
                    </div>
                    <p className="text-[13px] font-medium text-neutral-900 mt-1.5 leading-snug">{e.question}</p>
                    {e.answer && (
                      <p className="mt-2 text-[13px] text-neutral-600 leading-relaxed bg-neutral-50 rounded-lg px-3 py-2.5">
                        <span className="block text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">HR replied</span>
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
      <span className="mt-0.5 w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
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
        className="max-w-[85%] bg-neutral-900 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] leading-relaxed"
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
      <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
        <SparkleIcon size={14} />
      </span>
      <div
        className="max-w-[92%] min-w-0 flex flex-col gap-3 bg-white rounded-2xl rounded-tl-md px-4 py-3"
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
      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((q) => (
          <button
            key={q}
            disabled={disabled}
            onClick={() => onPick(q)}
            className={[
              "text-left text-[12.5px] font-medium rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors disabled:opacity-40",
              subtle ? "bg-white text-neutral-500 hover:text-neutral-900 border border-dashed border-neutral-300" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
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
    return (
      <BotBubble>
        <p className="text-[14.5px] leading-[1.7] text-neutral-900">{r.answer}</p>

        <aside
          aria-label="Source"
          className="rounded-xl bg-neutral-50 px-3.5 py-3 flex items-start gap-3 ring-1 ring-inset ring-neutral-900/5"
        >
          <span className="w-7 h-7 rounded-lg bg-white text-neutral-700 flex items-center justify-center shrink-0 ring-1 ring-inset ring-neutral-900/8">
            <BookIcon size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400">Source</p>
            <p className="text-[13px] font-semibold text-neutral-900 leading-snug mt-0.5">
              {r.source.docTitle} <span className="text-neutral-400 font-medium">· {r.source.docId}</span>
            </p>
            <p className="text-[12px] text-neutral-500 leading-snug mt-0.5">
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

        <Chips label="Related" items={r.related.map((x) => x.question)} onPick={onAsk} disabled={disabled} />
      </BotBubble>
    );
  }

  if (r.kind === "no_answer") {
    return (
      <BotBubble>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 text-[13px] font-semibold mt-0.5">?</span>
          <div>
            <p className="text-[14px] font-semibold text-neutral-900 leading-snug">No reliable answer found</p>
            <p className="text-[13.5px] leading-relaxed text-neutral-600 mt-1">{r.message}</p>
          </div>
        </div>

        {msg.escalation ? (
          <div className="rounded-xl bg-emerald-50 text-emerald-800 px-3.5 py-3 text-[13px] leading-snug ring-1 ring-inset ring-emerald-600/15">
            <p className="font-semibold">Sent to HR · {msg.escalation.id}</p>
            <p className="mt-0.5 text-emerald-700">You&apos;ll get a notification when HR replies. Track it under &ldquo;My questions to HR&rdquo;.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" disabled={msg.escalating} onClick={onEscalate}>
              {msg.escalating ? "Sending…" : "Send this question to HR"}
            </Button>
            <span className="text-[12px] text-neutral-400">A person from HR will reply.</span>
          </div>
        )}

        <Chips label="Or try one of these" items={r.suggestions} onPick={onAsk} disabled={disabled} />
      </BotBubble>
    );
  }

  return (
    <BotBubble>
      <p className="text-[14px] leading-relaxed text-neutral-800">{r.message}</p>
      <Chips label="Try asking" items={r.suggestions} onPick={onAsk} disabled={disabled} />
    </BotBubble>
  );
}
