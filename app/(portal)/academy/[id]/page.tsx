"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AssignmentDetailView, LessonView, TestResultView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { fmtDate, fmtDateTime } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Progress } from "../../../components/ui/Progress";
import { RadioGroup } from "../../../components/ui/Radio";
import { useToast } from "../../../components/ui/Toast";
import { AccessDenied, ErrorBlock, LoadingBlock, Panel } from "../../../components/portal/Panel";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ClockIcon, LockIcon, XIcon } from "../../../components/portal/icons";
import { CourseStatusBadge, Pill } from "../../../components/portal/StatusBadge";
import { useUser } from "../../../components/portal/UserContext";

type View = { kind: "lesson"; id: string } | { kind: "test" };

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useUser();
  const { toast } = useToast();
  const { m, locale } = useI18n();
  const { data, error, loading, reload } = useApi<{ assignment: AssignmentDetailView }>(`/api/academy/${id}`);
  const [picked, setView] = useState<View | null>(null);
  const [busy, setBusy] = useState(false);
  const opened = useRef<string | null>(null);

  const a = data?.assignment;
  const isLearner = a?.userId === user.id;

  // Until the learner picks something, resume where they left off (or the
  // first unfinished lesson, or the test once every lesson is done).
  let view: View | null = picked;
  if (!view && a) {
    const target =
      a.lessons.find((l) => l.id === a.lastLessonId && !l.completed) ?? a.lessons.find((l) => !l.completed);
    view = target
      ? { kind: "lesson", id: target.id }
      : a.status === "completed"
        ? { kind: "lesson", id: a.lessons[0].id }
        : { kind: "test" };
  }

  // Opening a lesson records progress on the server (learner only).
  useEffect(() => {
    if (!a || !isLearner || !view || view.kind !== "lesson" || a.status === "completed") return;
    const key = `${a.id}:${view.id}`;
    if (opened.current === key) return;
    opened.current = key;
    post(`/api/academy/${a.id}/lessons/${view.id}`, { action: "open" })
      .then(reload)
      .catch(() => undefined);
  }, [a, isLearner, view, reload]);

  if (error && !data) {
    return (
      <>
        <Back />
        {error.status === 403 ? <AccessDenied message={error.message} /> : <ErrorBlock message={error.message} onRetry={reload} />}
      </>
    );
  }
  if (loading || !a || !view) return <LoadingBlock rows={3} />;

  const lesson = view.kind === "lesson" ? a.lessons.find((l) => l.id === view.id) : undefined;
  const lessonIndex = lesson ? a.lessons.findIndex((l) => l.id === lesson.id) : -1;

  async function complete(l: LessonView) {
    if (!a) return;
    setBusy(true);
    try {
      await post(`/api/academy/${a.id}/lessons/${l.id}`, { action: "complete" });
      reload();
      const next = a.lessons[lessonIndex + 1];
      if (next) setView({ kind: "lesson", id: next.id });
      else setView({ kind: "test" });
      toast({ title: m.lesson.saved, description: l.title, variant: "success", duration: 2500 });
    } catch (e) {
      toast({ title: m.lesson.saveFail, description: e instanceof ApiError ? e.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Back />

      <Panel padding="p-0">
        <div className="p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="muted">{a.course.category}</Badge>
              {a.course.mandatory && <Badge variant="accent">{m.common.mandatory}</Badge>}
              <CourseStatusBadge status={a.status} overdue={a.overdue} />
            </div>
            <h1 className="text-[24px] font-semibold tracking-[-0.025em] leading-tight">{a.course.title}</h1>
            <p className="text-[13.5px] text-hero-muted mt-1.5 max-w-2xl leading-relaxed">{a.course.description}</p>
            <p className="text-[12px] text-tertiary mt-2">
              {tx(m.lesson.assignedBy, { name: a.assignedBy.fullName, date: fmtDate(a.dueDate, locale), score: a.course.passScore })}
            </p>
          </div>
          <div className="w-full sm:w-60">
            <Progress value={a.progress} showValue label={m.lesson.overall} />
            <p className="text-[11.5px] text-tertiary mt-1.5">
              {tx(m.lesson.countLine, { done: a.completedLessons, total: a.course.lessonCount })}
              {a.status === "completed" ? m.lesson.testDone : m.lesson.thenTest}
            </p>
          </div>
        </div>
        {!isLearner && (
          <p className="px-5 sm:px-6 py-2.5 text-[12.5px] bg-hero-cell-bg border-t border-hero-border text-hero-muted">
            {m.lesson.viewer}
          </p>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
        <Panel padding="p-1.5" as="div">
          <ol className="flex flex-col gap-0.5" aria-label={m.lesson.contents}>
            {a.lessons.map((l, i) => {
              const active = view.kind === "lesson" && view.id === l.id;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => setView({ kind: "lesson", id: l.id })}
                    aria-current={active ? "step" : undefined}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer",
                      active ? "bg-hero-foreground text-hero-on-foreground" : "hover-wipe text-hero-foreground",
                    ].join(" ")}
                  >
                    <StepDot done={l.completed} active={active} n={i + 1} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium leading-snug">{l.title}</span>
                      <span className={["block text-[11px] mt-0.5", active ? "text-hero-on-foreground/60" : "text-tertiary"].join(" ")}>{l.durationMin} мин.</span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li>
              <button
                onClick={() => setView({ kind: "test" })}
                aria-current={view.kind === "test" ? "step" : undefined}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer",
                  view.kind === "test" ? "bg-hero-foreground text-hero-on-foreground" : "hover-wipe text-hero-foreground",
                ].join(" ")}
              >
                <span
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    a.status === "completed" ? "bg-primary text-hero-on-foreground" : view.kind === "test" ? "bg-hero-on-foreground/15" : "bg-hero-cell-bg text-hero-muted",
                  ].join(" ")}
                >
                  {a.status === "completed" ? <CheckIcon size={12} /> : a.testUnlocked ? <span className="text-[11px] font-semibold">?</span> : <LockIcon size={12} />}
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-medium">{m.lesson.quiz}</span>
                  <span className={["block text-[11px] mt-0.5", view.kind === "test" ? "text-hero-on-foreground/60" : "text-tertiary"].join(" ")}>
                    {tx(m.lesson.questionsN, { n: a.course.questionCount })}
                  </span>
                </span>
              </button>
            </li>
          </ol>
        </Panel>

        <div className="min-w-0 flex flex-col gap-6">
          {lesson && (
            <LessonPanel
              lesson={lesson}
              index={lessonIndex}
              total={a.lessons.length}
              canProgress={isLearner && a.status !== "completed"}
              busy={busy}
              onComplete={() => void complete(lesson)}
              onNext={() => {
                const next = a.lessons[lessonIndex + 1];
                setView(next ? { kind: "lesson", id: next.id } : { kind: "test" });
              }}
            />
          )}
          {view.kind === "test" && <TestPanel a={a} isLearner={isLearner} onChange={reload} />}
        </div>
      </div>
    </>
  );
}

function Back() {
  const { m } = useI18n();
  return (
    <Link href="/academy" className="inline-flex items-center gap-1.5 text-[13px] text-hero-muted hover:text-hero-foreground transition-colors w-fit">
      <ArrowLeftIcon size={13} /> {m.lesson.back}
    </Link>
  );
}

function StepDot({ done, active, n }: { done: boolean; active: boolean; n: number }) {
  return (
    <span
      className={[
        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold",
        done ? "bg-primary text-hero-on-foreground" : active ? "bg-hero-on-foreground/15 text-hero-on-foreground" : "bg-hero-cell-bg text-hero-muted",
      ].join(" ")}
    >
      {done ? <CheckIcon size={12} /> : n}
    </span>
  );
}

function LessonPanel({
  lesson,
  index,
  total,
  canProgress,
  busy,
  onComplete,
  onNext,
}: {
  lesson: LessonView;
  index: number;
  total: number;
  canProgress: boolean;
  busy: boolean;
  onComplete: () => void;
  onNext: () => void;
}) {
  const { m } = useI18n();
  return (
    <Panel padding="p-0" as="div">
      <article>
        <header className="px-6 pt-6 pb-4 border-b border-hero-border">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-tertiary">
            {tx(m.lesson.countLine, { done: index + 1, total })} · <ClockIcon size={11} className="inline -mt-0.5" /> {tx(m.academy.minutes, { n: lesson.durationMin })}
          </p>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] mt-1.5">{lesson.title}</h2>
          <p className="text-[14px] text-hero-muted mt-1.5 leading-relaxed">{lesson.summary}</p>
        </header>

        <div className="px-6 py-5 flex flex-col gap-4 max-w-2xl">
          {lesson.body.map((para, i) => (
            <p key={i} className="text-[14.5px] leading-[1.75] text-hero-foreground">
              {para}
            </p>
          ))}
        </div>

        <div className="mx-6 mb-6 rounded-xl bg-hero-cell-bg p-4 ring-1 ring-inset ring-hero-foreground/5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-tertiary mb-2">{m.lesson.points}</p>
          <ul className="flex flex-col gap-1.5">
            {lesson.keyPoints.map((k) => (
              <li key={k} className="flex items-start gap-2.5 text-[13.5px] text-hero-foreground leading-snug">
                <CheckIcon size={14} className="mt-0.5 text-tertiary shrink-0" />
                {k}
              </li>
            ))}
          </ul>
        </div>

        <footer className="px-6 py-4 border-t border-hero-border flex flex-wrap items-center justify-between gap-3">
          {lesson.completed ? <Pill tone="good">{m.courseStatus.completed}</Pill> : <span className="text-[12.5px] text-tertiary">{m.lesson.markDone}</span>}
          <div className="flex items-center gap-2">
            {canProgress && !lesson.completed && (
              <Button variant="primary" size="sm" disabled={busy} onClick={onComplete}>
                {index + 1 < total ? m.lesson.finishNext : m.lesson.finishTest} <ArrowRightIcon size={13} />
              </Button>
            )}
            {(lesson.completed || !canProgress) && (
              <Button variant="secondary" size="sm" onClick={onNext}>
                {index + 1 < total ? m.lesson.next : m.lesson.toTest} <ArrowRightIcon size={13} />
              </Button>
            )}
          </div>
        </footer>
      </article>
    </Panel>
  );
}

function TestPanel({ a, isLearner, onChange }: { a: AssignmentDetailView; isLearner: boolean; onChange: () => void }) {
  const { toast } = useToast();
  const { m, locale } = useI18n();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResultView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = a.questions.filter((q) => answers[q.id] !== undefined).length;
  const completed = a.status === "completed";

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const { result: r } = await post<{ result: TestResultView }>(`/api/academy/${a.id}/test`, {
        answers: a.questions.map((q) => answers[q.id] ?? -1),
      });
      setResult(r);
      onChange();
      toast(
        r.passed
          ? { title: m.lesson.passedTitle, description: tx(m.lesson.passedBody, { n: r.score }), variant: "success" }
          : { title: m.lesson.failedTitle, description: tx(m.lesson.failedBody, { n: r.score, pass: r.passScore }), variant: "warning" },
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : m.lesson.submitFail);
    } finally {
      setBusy(false);
    }
  }

  const history = a.attempts.length > 0 && (
    <Panel title={m.lesson.attempts} description={m.lesson.attemptsHint} padding="p-0" as="div">
      <ul className="divide-y divide-hero-border">
        {[...a.attempts].reverse().map((t, i) => (
          <li key={t.at} className="flex items-center justify-between gap-3 px-5 py-3 text-[13px]">
            <span className="text-hero-muted">
              {tx(m.lesson.attempt, { n: a.attempts.length - i, date: fmtDateTime(t.at, locale) })}
            </span>
            <span className="flex items-center gap-3">
              <span className="tabular-nums font-medium">
                {t.correct}/{t.total} · {t.score}%
              </span>
              <Pill tone={t.passed ? "good" : "bad"}>{t.passed ? m.lesson.passed : m.lesson.failed}</Pill>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );

  if (!a.testUnlocked) {
    return (
      <Panel padding="p-10" as="div">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-11 h-11 rounded-xl bg-hero-cell-bg text-hero-muted flex items-center justify-center mx-auto mb-4">
            <LockIcon size={20} />
          </div>
          <p className="text-[15px] font-semibold">{m.lesson.locked}</p>
          <p className="text-[13px] text-hero-muted mt-1.5 leading-relaxed">
            {tx(m.lesson.lockedHint, { total: a.course.lessonCount, done: a.completedLessons })}
          </p>
        </div>
      </Panel>
    );
  }

  if (result) {
    return (
      <>
        <Panel padding="p-0" as="div">
          <div className="p-6 flex flex-wrap items-center gap-5 border-b border-hero-border">
            <div
              className={[
                "w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-hero-on-foreground shrink-0",
                result.passed ? "bg-primary" : "bg-hero-foreground",
              ].join(" ")}
            >
              <span className="text-[26px] font-semibold tabular-nums leading-none">{result.score}%</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{result.passed ? m.lesson.youPassed : m.lesson.youFailed}</h2>
              <p className="text-[13.5px] text-hero-muted mt-1">
                {tx(m.lesson.resultLine, { correct: result.correct, total: result.total, pass: result.passScore })}
              </p>
            </div>
          </div>
          <ul className="divide-y divide-hero-border">
            {a.questions.map((q, i) => {
              const ok = result.review.find((r) => r.questionId === q.id)?.correct;
              return (
                <li key={q.id} className="flex items-start gap-3 px-6 py-3.5">
                  <span className={["mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-hero-on-foreground", ok ? "bg-primary" : "bg-error"].join(" ")}>
                    {ok ? <CheckIcon size={11} /> : <XIcon size={10} />}
                  </span>
                  <p className="text-[13.5px] text-hero-foreground leading-snug">
                    <span className="text-tertiary mr-1.5">{i + 1}.</span>
                    {q.text}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="px-6 py-4 border-t border-hero-border flex justify-end gap-2">
            {!result.passed && (
              <Button variant="primary" size="sm" onClick={() => { setResult(null); setAnswers({}); }}>
                {m.lesson.retry}
              </Button>
            )}
            <Link href="/academy">
              <Button variant={result.passed ? "primary" : "secondary"} size="sm">
                {m.lesson.backAcademy}
              </Button>
            </Link>
          </div>
        </Panel>
        {history}
      </>
    );
  }

  if (completed) {
    return (
      <>
        <Panel padding="p-8" as="div">
          <div className="text-center max-w-sm mx-auto">
            <div className="w-11 h-11 rounded-xl bg-primary text-hero-on-foreground flex items-center justify-center mx-auto mb-4">
              <CheckIcon size={20} />
            </div>
            <p className="text-[15px] font-semibold">{tx(m.lesson.passedScore, { n: a.bestScore ?? 0 })}</p>
            <p className="text-[13px] text-hero-muted mt-1.5">{tx(m.lesson.completedAt, { date: a.completedAt ? fmtDateTime(a.completedAt, locale) : "" })}</p>
          </div>
        </Panel>
        {history}
      </>
    );
  }

  return (
    <>
      <Panel title={m.lesson.quiz} description={tx(m.lesson.quizHint, { n: a.questions.length, score: a.course.passScore })} padding="p-0" as="div">
        <ol className="divide-y divide-hero-border">
          {a.questions.map((q, i) => (
            <li key={q.id} className="px-6 py-5">
              <fieldset disabled={!isLearner}>
                <legend className="text-[14px] font-semibold text-hero-foreground leading-snug mb-3.5">
                  <span className="text-tertiary mr-1.5">{i + 1}.</span>
                  {q.text}
                </legend>
                <RadioGroup
                  name={q.id}
                  value={answers[q.id] === undefined ? "" : String(answers[q.id])}
                  onChange={(v) => setAnswers((s) => ({ ...s, [q.id]: Number(v) }))}
                  options={q.options.map((o, oi) => ({ value: String(oi), label: o }))}
                />
              </fieldset>
            </li>
          ))}
        </ol>
        <div className="px-6 py-4 border-t border-hero-border flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12.5px] text-hero-muted">
            {isLearner ? tx(m.lesson.answered, { done: answered, total: a.questions.length }) : m.lesson.learnerOnly}
          </span>
          <div className="flex items-center gap-3">
            {error && <span role="alert" className="text-[12.5px] text-error font-medium">{error}</span>}
            <Button variant="primary" size="sm" disabled={!isLearner || busy || answered < a.questions.length} onClick={() => void submit()}>
              {busy ? m.lesson.checking : m.lesson.submit}
            </Button>
          </div>
        </div>
      </Panel>
      {history}
    </>
  );
}
