"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AssignmentDetailView, LessonView, TestResultView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { fmtDate, fmtDateTime } from "@/lib/client/format";
import { useApi } from "@/lib/client/hooks";
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
      toast({ title: "Урок завершен", description: l.title, variant: "success", duration: 2500 });
    } catch (e) {
      toast({ title: "Не удалось сохранить прогресс", description: e instanceof ApiError ? e.message : undefined, variant: "error" });
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
              {a.course.mandatory && <Badge variant="accent">Обязательный</Badge>}
              <CourseStatusBadge status={a.status} overdue={a.overdue} />
            </div>
            <h1 className="text-[24px] font-semibold tracking-[-0.025em] leading-tight">{a.course.title}</h1>
            <p className="text-[13.5px] text-neutral-500 mt-1.5 max-w-2xl leading-relaxed">{a.course.description}</p>
            <p className="text-[12px] text-neutral-400 mt-2">
              Назначил(а) {a.assignedBy.fullName} · срок до {fmtDate(a.dueDate)} · проходной балл {a.course.passScore}%
            </p>
          </div>
          <div className="w-full sm:w-60">
            <Progress value={a.progress} showValue label="Общий прогресс" />
            <p className="text-[11.5px] text-neutral-400 mt-1.5">
              {a.completedLessons} из {a.course.lessonCount} уроков{a.status === "completed" ? " · тест сдан" : " · затем тест"}
            </p>
          </div>
        </div>
        {!isLearner && (
          <p className="px-5 sm:px-6 py-2.5 text-[12.5px] bg-neutral-50 border-t border-neutral-100 text-neutral-500">
            Вы просматриваете этот курс как руководитель/HR. Проходить уроки может только назначенный сотрудник.
          </p>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
        <Panel padding="p-1.5" as="div">
          <ol className="flex flex-col gap-0.5" aria-label="Содержание курса">
            {a.lessons.map((l, i) => {
              const active = view.kind === "lesson" && view.id === l.id;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => setView({ kind: "lesson", id: l.id })}
                    aria-current={active ? "step" : undefined}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer",
                      active ? "bg-neutral-900 text-white" : "hover:bg-neutral-100 text-neutral-700",
                    ].join(" ")}
                  >
                    <StepDot done={l.completed} active={active} n={i + 1} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium leading-snug">{l.title}</span>
                      <span className={["block text-[11px] mt-0.5", active ? "text-white/60" : "text-neutral-400"].join(" ")}>{l.durationMin} мин.</span>
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
                  view.kind === "test" ? "bg-neutral-900 text-white" : "hover:bg-neutral-100 text-neutral-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    a.status === "completed" ? "bg-emerald-600 text-white" : view.kind === "test" ? "bg-white/15" : "bg-neutral-100 text-neutral-500",
                  ].join(" ")}
                >
                  {a.status === "completed" ? <CheckIcon size={12} /> : a.testUnlocked ? <span className="text-[11px] font-semibold">?</span> : <LockIcon size={12} />}
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-medium">Итоговый тест</span>
                  <span className={["block text-[11px] mt-0.5", view.kind === "test" ? "text-white/60" : "text-neutral-400"].join(" ")}>
                    {a.course.questionCount} вопросов
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
  return (
    <Link href="/academy" className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors w-fit">
      <ArrowLeftIcon size={13} /> Jana Academy
    </Link>
  );
}

function StepDot({ done, active, n }: { done: boolean; active: boolean; n: number }) {
  return (
    <span
      className={[
        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold",
        done ? "bg-emerald-600 text-white" : active ? "bg-white/15 text-white" : "bg-neutral-100 text-neutral-500",
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
  return (
    <Panel padding="p-0" as="div">
      <article>
        <header className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Урок {index + 1} из {total} · <ClockIcon size={11} className="inline -mt-0.5" /> {lesson.durationMin} мин.
          </p>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] mt-1.5">{lesson.title}</h2>
          <p className="text-[14px] text-neutral-500 mt-1.5 leading-relaxed">{lesson.summary}</p>
        </header>

        <div className="px-6 py-5 flex flex-col gap-4 max-w-2xl">
          {lesson.body.map((para, i) => (
            <p key={i} className="text-[14.5px] leading-[1.75] text-neutral-700">
              {para}
            </p>
          ))}
        </div>

        <div className="mx-6 mb-6 rounded-xl bg-neutral-50 p-4 ring-1 ring-inset ring-neutral-900/5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Ключевые моменты</p>
          <ul className="flex flex-col gap-1.5">
            {lesson.keyPoints.map((k) => (
              <li key={k} className="flex items-start gap-2.5 text-[13.5px] text-neutral-700 leading-snug">
                <CheckIcon size={14} className="mt-0.5 text-neutral-400 shrink-0" />
                {k}
              </li>
            ))}
          </ul>
        </div>

        <footer className="px-6 py-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          {lesson.completed ? <Pill tone="good">Завершено</Pill> : <span className="text-[12.5px] text-neutral-400">Отметьте урок завершенным, чтобы сохранить прогресс.</span>}
          <div className="flex items-center gap-2">
            {canProgress && !lesson.completed && (
              <Button variant="primary" size="sm" disabled={busy} onClick={onComplete}>
                {index + 1 < total ? "Завершить и продолжить" : "Завершить и перейти к тесту"} <ArrowRightIcon size={13} />
              </Button>
            )}
            {(lesson.completed || !canProgress) && (
              <Button variant="secondary" size="sm" onClick={onNext}>
                {index + 1 < total ? "Следующий урок" : "Перейти к тесту"} <ArrowRightIcon size={13} />
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
          ? { title: "Курс завершен 🎉", description: `Вы набрали ${r.score}%.`, variant: "success" }
          : { title: "Тест пока не сдан", description: `Вы набрали ${r.score}%; проходной балл: ${r.passScore}%.`, variant: "warning" },
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось отправить тест.");
    } finally {
      setBusy(false);
    }
  }

  const history = a.attempts.length > 0 && (
    <Panel title="Попытки" description="История всех попыток сохраняется" padding="p-0" as="div">
      <ul className="divide-y divide-neutral-100">
        {[...a.attempts].reverse().map((t, i) => (
          <li key={t.at} className="flex items-center justify-between gap-3 px-5 py-3 text-[13px]">
            <span className="text-neutral-500">
              Попытка {a.attempts.length - i} · {fmtDateTime(t.at)}
            </span>
            <span className="flex items-center gap-3">
              <span className="tabular-nums font-medium">
                {t.correct}/{t.total} · {t.score}%
              </span>
              <Pill tone={t.passed ? "good" : "bad"}>{t.passed ? "Сдано" : "Не сдано"}</Pill>
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
          <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-4">
            <LockIcon size={20} />
          </div>
          <p className="text-[15px] font-semibold">Тест заблокирован</p>
          <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">
            Пройдите все {a.course.lessonCount} уроков, чтобы открыть тест. Пройдено: {a.completedLessons}.
          </p>
        </div>
      </Panel>
    );
  }

  if (result) {
    return (
      <>
        <Panel padding="p-0" as="div">
          <div className="p-6 flex flex-wrap items-center gap-5 border-b border-neutral-100">
            <div
              className={[
                "w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shrink-0",
                result.passed ? "bg-emerald-600" : "bg-neutral-900",
              ].join(" ")}
            >
              <span className="text-[26px] font-semibold tabular-nums leading-none">{result.score}%</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{result.passed ? "Вы сдали тест! Курс завершен." : "В этот раз тест не сдан"}</h2>
              <p className="text-[13.5px] text-neutral-500 mt-1">
                {result.correct} из {result.total} верно · проходной балл {result.passScore}%. Ваш результат сохранен.
              </p>
            </div>
          </div>
          <ul className="divide-y divide-neutral-100">
            {a.questions.map((q, i) => {
              const ok = result.review.find((r) => r.questionId === q.id)?.correct;
              return (
                <li key={q.id} className="flex items-start gap-3 px-6 py-3.5">
                  <span className={["mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white", ok ? "bg-emerald-600" : "bg-red-600"].join(" ")}>
                    {ok ? <CheckIcon size={11} /> : <XIcon size={10} />}
                  </span>
                  <p className="text-[13.5px] text-neutral-700 leading-snug">
                    <span className="text-neutral-400 mr-1.5">{i + 1}.</span>
                    {q.text}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
            {!result.passed && (
              <Button variant="primary" size="sm" onClick={() => { setResult(null); setAnswers({}); }}>
                Пройти тест повторно
              </Button>
            )}
            <Link href="/academy">
              <Button variant={result.passed ? "primary" : "secondary"} size="sm">
                Вернуться в Академию
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
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4">
              <CheckIcon size={20} />
            </div>
            <p className="text-[15px] font-semibold">Тест сдан с результатом {a.bestScore}%</p>
            <p className="text-[13px] text-neutral-500 mt-1.5">Завершено {a.completedAt ? fmtDateTime(a.completedAt) : ""}.</p>
          </div>
        </Panel>
        {history}
      </>
    );
  }

  return (
    <>
      <Panel title="Итоговый тест" description={`${a.questions.length} вопросов · проходной балл ${a.course.passScore}% · количество попыток не ограничено`} padding="p-0" as="div">
        <ol className="divide-y divide-neutral-100">
          {a.questions.map((q, i) => (
            <li key={q.id} className="px-6 py-5">
              <fieldset disabled={!isLearner}>
                <legend className="text-[14px] font-semibold text-neutral-900 leading-snug mb-3.5">
                  <span className="text-neutral-400 mr-1.5">{i + 1}.</span>
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
        <div className="px-6 py-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12.5px] text-neutral-500">
            {isLearner ? `Отвечено на ${answered} из ${a.questions.length}` : "Проходить тест может только назначенный сотрудник."}
          </span>
          <div className="flex items-center gap-3">
            {error && <span role="alert" className="text-[12.5px] text-red-600 font-medium">{error}</span>}
            <Button variant="primary" size="sm" disabled={!isLearner || busy || answered < a.questions.length} onClick={() => void submit()}>
              {busy ? "Проверка…" : "Сдать тест"}
            </Button>
          </div>
        </div>
      </Panel>
      {history}
    </>
  );
}
