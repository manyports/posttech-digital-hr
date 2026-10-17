"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AssistantReply, EscalationView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { fmtRelative } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Kbd } from "../../components/ui/Kbd";
import { useToast } from "../../components/ui/Toast";
import { ArrowRightIcon, DocIcon, InboxIcon, RefreshIcon, SendIcon } from "../../components/portal/icons";
import { SectionSidebar } from "../../components/portal/PortalShell";
import { Pill } from "../../components/portal/StatusBadge";
import { useUser } from "../../components/portal/UserContext";
import { RU_QUESTIONS, MESSAGES_RU } from "@/lib/assistant/translations";
import { sourceHref } from "@/lib/assistant/source-links";

type BotMsg = {
  id: number;
  at: number;
  role: "bot";
  reply: AssistantReply;
  escalation?: EscalationView;
  escalating?: boolean;
  feedback?: "up" | "down";
};
type Msg = { id: number; at: number; role: "user"; text: string } | BotMsg;

type Copy = ReturnType<typeof useI18n>["m"];

const clock = (at: number) => {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function AssistantPage() {
  const { toast } = useToast();
  const { m, locale } = useI18n();
  const user = useUser();
  const agent = m.nav.assistant;
  const starters = m.assistant.starters;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [escOpen, setEscOpen] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const { data: esc, reload: reloadEsc } = useApi<{ escalations: EscalationView[] }>("/api/assistant/escalations", { interval: 8000 });

  useEffect(() => {
    if (messages.length === 0 && !thinking) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  // Grow the composer with its content, up to the CSS max-height.
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const patchBot = (id: number, patch: Partial<BotMsg>) =>
    setMessages((prev) => prev.map((x) => (x.id === id && x.role === "bot" ? { ...x, ...patch } : x)));

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    setDraft("");
    setMessages((prev) => [...prev, { id: nextId.current++, at: Date.now(), role: "user", text: q }]);
    setThinking(true);
    try {
      const { reply } = await post<{ reply: AssistantReply }>("/api/assistant/ask", { question: q });
      setMessages((prev) => [...prev, { id: nextId.current++, at: Date.now(), role: "bot", reply }]);
    } catch (e) {
      toast({ title: m.assistant.fail, description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    } finally {
      setThinking(false);
      fieldRef.current?.focus();
    }
  }

  async function escalate(msg: BotMsg) {
    patchBot(msg.id, { escalating: true });
    try {
      const { escalation } = await post<{ escalation: EscalationView }>("/api/assistant/escalate", { question: msg.reply.question });
      patchBot(msg.id, { escalating: false, escalation });
      toast({ title: m.assistant.escalated, description: tx(m.assistant.escalatedHint, { id: escalation.id }), variant: "success" });
      reloadEsc();
    } catch (e) {
      patchBot(msg.id, { escalating: false });
      toast({ title: m.assistant.escalateFail, description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    }
  }

  function restart() {
    setMessages([]);
    setDraft("");
    fieldRef.current?.focus();
  }

  const empty = messages.length === 0;
  const escalations = esc?.escalations ?? [];
  const lastBot = [...messages].reverse().find((x): x is BotMsg => x.role === "bot");
  const relative = (iso: string) => fmtRelative(iso, Date.now(), locale);

  return (
    <>
      <SectionSidebar
        mobile="none"
        title={m.assistant.mine}
        actions={<span className="pr-1.5 text-[11px] text-tertiary tabular-nums">{escalations.length}</span>}
      >
        <Escalations items={escalations} copy={m} relative={relative} />
      </SectionSidebar>

      <div className="surface-matte rounded-2xl p-1.5 h-[calc(100dvh-104px)] min-h-[520px]">
        <section className="h-full bg-hero-elevated rounded-xl overflow-hidden flex flex-col">
          {/* Channel bar */}
          <div className="h-12 shrink-0 flex items-center gap-2.5 px-5 border-b border-hero-border">
            <JanaMark size="sm" />
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-hero-foreground">{agent}</span>
            <BotTag label={m.assistant.bot} />
            <span className="hidden sm:block w-px h-4 bg-hero-border mx-0.5" />
            <span className="hidden sm:block text-[12px] text-tertiary truncate">{m.assistant.kbOnly}</span>
            <div className="ml-auto flex items-center gap-1 -mr-2">
              {user.role === "hr" && (
                <Link
                  href="/hr/knowledge"
                  aria-label="Открыть редактор базы знаний"
                  className="h-8 inline-flex items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-hero-muted hover:text-hero-foreground hover:bg-hero-cell-bg transition-colors"
                >
                  <DocIcon size={14} />
                  <span className="hidden md:inline">Редактор базы знаний</span>
                  <span className="md:hidden">База знаний</span>
                </Link>
              )}
              <button
                onClick={() => setEscOpen((v) => !v)}
                aria-pressed={escOpen}
                aria-label={m.assistant.mine}
                className={[
                  "lg:hidden h-8 flex items-center gap-1.5 px-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer",
                  escOpen ? "bg-hero-cell-bg text-hero-foreground" : "text-hero-muted hover:text-hero-foreground hover:bg-hero-cell-bg",
                ].join(" ")}
              >
                <InboxIcon size={14} />
                {escalations.length > 0 && <span className="tabular-nums">{escalations.length}</span>}
              </button>
              {!empty && (
                <button
                  onClick={restart}
                  className="h-8 flex items-center gap-1.5 px-2 rounded-lg text-[12px] font-medium text-hero-muted hover:text-hero-foreground hover:bg-hero-cell-bg transition-colors cursor-pointer"
                >
                  <RefreshIcon size={13} />
                  <span className="hidden sm:inline">{m.assistant.restart}</span>
                </button>
              )}
            </div>
          </div>

          {escOpen && (
            <div className="lg:hidden max-h-[40%] overflow-y-auto border-b border-hero-border px-3 py-2 animate-chat-in">
              <Escalations items={escalations} copy={m} relative={relative} />
            </div>
          )}

          {/* Log */}
          <div role="log" aria-live="polite" aria-label={m.assistant.dialog} className="chat-scrollbar flex-1 overflow-y-auto flex flex-col">
            <div className="mt-auto pt-6 pb-3">
              <Row avatar={<JanaMark size="md" />} name={agent} tag={m.assistant.bot}>
                <p className="text-[14px] leading-relaxed text-hero-foreground">{tx(m.assistant.greet, { name: user.fullName.split(" ")[0] })}</p>
                <p className="-mt-2 text-[12.5px] text-tertiary">{m.assistant.botNotice}</p>
                {empty && <QuickReplies items={starters} onPick={ask} disabled={thinking} />}
              </Row>

              {messages.map((item) =>
                item.role === "user" ? (
                  <Row key={item.id} avatar={<Avatar name={user.fullName} size="md" />} name={m.assistant.you} at={item.at}>
                    <p className="text-[14px] leading-relaxed text-hero-foreground whitespace-pre-wrap break-words">{item.text}</p>
                  </Row>
                ) : (
                  <Row key={item.id} avatar={<JanaMark size="md" />} name={agent} tag={m.assistant.bot} at={item.at}>
                    <BotBody
                      msg={item}
                      onAsk={ask}
                      onEscalate={() => void escalate(item)}
                      onFeedback={(f) => patchBot(item.id, { feedback: f })}
                      disabled={thinking}
                      copy={m}
                      starters={starters}
                    />
                  </Row>
                ),
              )}
            </div>
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            className="shrink-0 px-5 pb-2"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(draft);
            }}
          >
            <div className="flex items-end gap-2 rounded-xl bg-hero-cell-bg pl-3.5 pr-1.5 py-1.5 transition-shadow [box-shadow:var(--field-rest-shadow)] hover:[box-shadow:var(--field-hover-shadow)] focus-within:[box-shadow:var(--field-focus-shadow)] focus-within:hover:[box-shadow:var(--field-focus-shadow)]">
              <textarea
                ref={fieldRef}
                rows={1}
                aria-label={m.assistant.askLabel}
                placeholder={m.assistant.placeholder}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void ask(draft);
                  }
                }}
                maxLength={500}
                autoComplete="off"
                className="flex-1 min-w-0 resize-none bg-transparent py-1.5 max-h-40 text-[14px] leading-[1.45] text-hero-foreground placeholder:text-tertiary outline-none"
              />
              <button
                type="submit"
                aria-label={m.assistant.ask}
                disabled={thinking || !draft.trim()}
                className="shrink-0 w-8 h-8 rounded-lg bg-hero-foreground text-hero-on-foreground flex items-center justify-center transition-[opacity,transform] active:scale-95 disabled:opacity-15 disabled:active:scale-100 cursor-pointer disabled:cursor-default"
              >
                <SendIcon size={15} />
              </button>
            </div>
            <div className="h-8 flex items-center justify-between gap-3 text-[11.5px] text-tertiary">
              <span aria-live="polite" className="flex items-center gap-2 min-w-0">
                {thinking ? (
                  <>
                    <span className="flex gap-[3px]" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-hero-muted animate-typing" style={{ animationDelay: `${i * 160}ms` }} />
                      ))}
                    </span>
                    <span className="truncate">{m.assistant.thinking}…</span>
                  </>
                ) : (
                  lastBot && !lastBot.escalation && (
                    <button
                      type="button"
                      onClick={() => void escalate(lastBot)}
                      disabled={lastBot.escalating}
                      className="font-medium text-hero-muted hover:text-hero-foreground underline decoration-hero-border underline-offset-[3px] hover:decoration-hero-foreground transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {lastBot.escalating ? m.assistant.escalating : m.assistant.toHuman}
                    </button>
                  )
                )}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 shrink-0">
                <Kbd className="!h-[18px] !min-w-0 !text-[10px] !px-1">Enter</Kbd> {m.assistant.send}
                <span className="mx-1">·</span>
                <Kbd className="!h-[18px] !min-w-0 !text-[10px] !px-1">Shift + Enter</Kbd> {m.assistant.newline}
              </span>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────── */

/** The assistant's identity mark: a monogram with a presence dot. */
function JanaMark({ size }: { size: "sm" | "md" }) {
  const box = { sm: "w-6 h-6 text-[11px]", md: "w-9 h-9 text-[14px]" }[size];
  const dot = { sm: "w-2 h-2 -right-px -bottom-px", md: "w-2.5 h-2.5 right-0 bottom-0" }[size];
  return (
    <span className="relative shrink-0 inline-flex">
      <span
        className={["rounded-full bg-hero-foreground text-hero-on-foreground font-semibold tracking-[-0.04em] flex items-center justify-center select-none", box].join(" ")}
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.2)" }}
        aria-hidden
      >
        J
      </span>
      <span className={["absolute rounded-full bg-primary ring-2 ring-hero-elevated", dot].join(" ")} aria-hidden />
    </span>
  );
}

/** Says plainly that this is a bot, next to its name, on every turn. */
function BotTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center h-[15px] px-1 rounded-[4px] bg-hero-foreground text-hero-on-foreground text-[9px] font-semibold tracking-[0.06em] leading-none">
      {label}
    </span>
  );
}

function Row({ avatar, name, tag, at, children }: { avatar: React.ReactNode; name: string; tag?: string; at?: number; children: React.ReactNode }) {
  return (
    <article className="animate-chat-in flex gap-3.5 px-5 py-2.5 hover:bg-hero-cell-bg/50 transition-colors">
      <div className="pt-0.5">{avatar}</div>
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-2 h-5">
          <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-hero-foreground">{name}</span>
          {tag && <BotTag label={tag} />}
          {at !== undefined && <time className="text-[11px] text-tertiary tabular-nums">{clock(at)}</time>}
        </header>
        <div className="mt-1 flex flex-col gap-3">{children}</div>
      </div>
    </article>
  );
}

/** Reply buttons: the low-effort way into a conversation. */
function QuickReplies({ label, items, onPick, disabled }: { label?: string; items: string[]; onPick: (q: string) => void; disabled: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      {label && <p className="mb-1.5 text-[12px] text-hero-muted">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {items.map((q) => (
          <button
            key={q}
            disabled={disabled}
            onClick={() => onPick(q)}
            className="text-left text-[12.5px] rounded-full px-3 py-1.5 text-hero-foreground bg-hero-elevated border border-hero-border hover:border-hero-foreground/30 hover:bg-hero-cell-bg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function Handoff({ msg, onEscalate, copy, quiet }: { msg: BotMsg; onEscalate: () => void; copy: Copy; quiet?: boolean }) {
  if (msg.escalation) {
    return (
      <div className="rounded-lg border border-hero-border px-3 py-2.5 text-[12.5px] leading-snug">
        <p className="font-semibold text-hero-foreground">{tx(copy.assistant.sent, { id: msg.escalation.id })}</p>
        <p className="mt-0.5 text-hero-muted">{copy.assistant.sentHint}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Button variant={quiet ? "secondary" : "primary"} size="sm" disabled={msg.escalating} onClick={onEscalate}>
        {msg.escalating ? copy.assistant.escalating : copy.assistant.escalate}
      </Button>
      <span className="text-[12px] text-tertiary">{copy.assistant.hrWill}</span>
    </div>
  );
}

function Feedback({ msg, onFeedback, onEscalate, copy }: { msg: BotMsg; onFeedback: (f: "up" | "down") => void; onEscalate: () => void; copy: Copy }) {
  if (msg.feedback === "up") return <p className="text-[12px] text-tertiary">{copy.assistant.thanks}</p>;
  if (msg.feedback === "down") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[13px] text-hero-muted">{copy.assistant.sorry}</p>
        <Handoff msg={msg} onEscalate={onEscalate} copy={copy} quiet />
      </div>
    );
  }
  const btn =
    "h-6 px-2 rounded-md text-[12px] font-medium text-hero-muted border border-hero-border hover:text-hero-foreground hover:border-hero-foreground/30 transition-colors cursor-pointer";
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-tertiary">
      <span className="mr-1">{copy.assistant.helpful}</span>
      <button className={btn} onClick={() => onFeedback("up")}>{copy.assistant.yes}</button>
      <button className={btn} onClick={() => onFeedback("down")}>{copy.assistant.no}</button>
    </div>
  );
}

function BotBody({
  msg,
  onAsk,
  onEscalate,
  onFeedback,
  disabled,
  copy,
  starters,
}: {
  msg: BotMsg;
  onAsk: (q: string) => void;
  onEscalate: () => void;
  onFeedback: (f: "up" | "down") => void;
  disabled: boolean;
  copy: Copy;
  starters: string[];
}) {
  const r = msg.reply;

  if (r.kind === "answer") {
    const text = r.answer;
    const relatedItems = r.related.map((x) => RU_QUESTIONS[x.entryId] ?? x.question);
    return (
      <>
        <p className="text-[14px] leading-[1.7] text-hero-foreground">{text}</p>
        {r.personalBalance && (
          <p className="text-[13px] text-hero-muted">{tx(copy.assistant.balanceLine, { n: r.personalBalance.available })}</p>
        )}

        <Link
          href={sourceHref(r.source)}
          aria-label={`${copy.assistant.source}: ${r.source.docTitle}, ${r.source.section}`}
          className="self-start max-w-full flex items-start gap-2.5 rounded-lg border border-hero-border px-3 py-2 hover:bg-hero-cell-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-foreground transition-colors"
        >
          <DocIcon size={14} className="mt-0.5 shrink-0 text-tertiary" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-hero-foreground leading-snug">
              {r.source.docTitle} <span className="font-normal text-tertiary">· {r.source.docId}</span>
            </p>
            <p className="text-[11.5px] text-tertiary leading-snug mt-0.5">
              {r.source.section} · {r.source.revision} · {r.source.owner}
            </p>
          </div>
        </Link>

        {r.action && (
          <div>
            <Link href={r.action.href}>
              <Button variant="secondary" size="sm">
                {r.action.label === "draft" ? copy.assistant.openDraft : r.action.label} <ArrowRightIcon size={13} />
              </Button>
            </Link>
          </div>
        )}

        <Feedback msg={msg} onFeedback={onFeedback} onEscalate={onEscalate} copy={copy} />
        <QuickReplies label={copy.assistant.related} items={relatedItems} onPick={onAsk} disabled={disabled} />
      </>
    );
  }

  if (r.kind === "no_answer") {
    return (
      <>
        <div>
          <p className="text-[14px] font-semibold text-hero-foreground">{copy.assistant.noAnswer}</p>
          <p className="mt-0.5 text-[14px] leading-relaxed text-hero-muted">{MESSAGES_RU.noAnswer}</p>
        </div>
        <Handoff msg={msg} onEscalate={onEscalate} copy={copy} />
        <QuickReplies label={copy.assistant.canHelp} items={starters} onPick={onAsk} disabled={disabled} />
      </>
    );
  }

  const smalltalk = MESSAGES_RU[r.kind as keyof typeof MESSAGES_RU] ?? MESSAGES_RU.greeting;
  return (
    <>
      <p className="text-[14px] leading-relaxed text-hero-foreground">{smalltalk}</p>
      <QuickReplies label={copy.assistant.canHelp} items={starters} onPick={onAsk} disabled={disabled} />
    </>
  );
}

function Escalations({ items, copy, relative }: { items: EscalationView[]; copy: Copy; relative: (iso: string) => string }) {
  if (items.length === 0) {
    return <p className="px-2.5 pt-1 pb-2 text-[12.5px] leading-relaxed text-tertiary">{copy.assistant.none}</p>;
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((e) => (
        <li key={e.id} className="rounded-xl px-2.5 py-2.5 hover:bg-hero-cell-bg/60 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-tertiary tabular-nums truncate">{e.id} · {relative(e.createdAt)}</span>
            <Pill tone={e.status === "answered" ? "good" : "warn"}>{e.status === "answered" ? copy.assistant.answered : copy.assistant.waiting}</Pill>
          </div>
          <p className="mt-1.5 text-[13px] font-medium leading-snug text-hero-foreground">{e.question}</p>
          {e.answer && (
            <div className="mt-2 rounded-lg bg-hero-cell-bg px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tertiary">{copy.assistant.hrSaid}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-hero-muted">{e.answer}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
