"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestView } from "@/lib/domain/types";
import { workingDays, isValidDate } from "@/lib/domain/dates";
import { ApiError, api, post } from "@/lib/client/api";
import { fmtKzt, pluralDays } from "@/lib/client/format";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Tabs } from "../ui/Tabs";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../ui/Toast";

interface FormInfo {
  today: string;
  vacation: { remaining: number; pending: number; available: number };
  advance: { limit: number; minAmount: number; currency: "KZT"; alreadyRequestedThisMonth: boolean };
}

type Kind = "vacation" | "salary_advance";

export function NewRequestModal({
  open,
  initialType = "vacation",
  onClose,
}: {
  open: boolean;
  initialType?: Kind;
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [info, setInfo] = useState<FormInfo | null>(null);
  const [kind, setKind] = useState<Kind>(initialType);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comment, setComment] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Fresh balance/limits every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    api<FormInfo>("/api/requests/form-info")
      .then((d) => !cancelled && setInfo(d))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open]);

  const days =
    isValidDate(startDate) && isValidDate(endDate) && endDate >= startDate ? workingDays(startDate, endDate) : null;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const body =
        kind === "vacation"
          ? { type: kind, startDate, endDate, comment: comment || undefined }
          : { type: kind, amount: amount === "" ? undefined : Number(amount), reason };
      const { request } = await post<{ request: RequestView }>("/api/requests", body);
      toast({
        title: "Заявка отправлена",
        description: `Заявка ${request.id} направлена: ${request.approver.fullName}.`,
        variant: "success",
      });
      onClose();
      setStartDate("");
      setEndDate("");
      setComment("");
      setAmount("");
      setReason("");
      router.push(`/requests/${request.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, "network", "Ошибка сети."));
    } finally {
      setBusy(false);
    }
  }

  const f = error?.fields ?? {};
  const generalError = error && Object.keys(f).length === 0 ? error.message : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новая заявка"
      description="Заявка сначала поступает вашему руководителю. Вы сможете отслеживать каждый этап на странице заявки."
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" onClick={() => void submit()} disabled={busy}>
            {busy ? "Отправка…" : "Отправить заявку"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Tabs
          key={initialType}
          defaultTab={initialType}
          tabs={[
            { key: "vacation", label: "Отпуск" },
            { key: "salary_advance", label: "Аванс" },
          ]}
          onChange={(k) => {
            setKind(k as Kind);
            setError(null);
          }}
        />

        {kind === "vacation" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Дата начала"
                type="date"
                min={info?.today}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
                }}
                error={f.startDate}
                fullWidth
              />
              <Input label="Дата окончания" type="date" min={startDate || info?.today} value={endDate} onChange={(e) => setEndDate(e.target.value)} error={f.endDate} fullWidth />
            </div>
            <div
              className="rounded-xl bg-neutral-50 px-4 py-3 text-[12.5px] text-neutral-600 flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
              aria-live="polite"
            >
              <span>
                {days === null ? (
                  "Выберите даты, чтобы рассчитать рабочие дни."
                ) : (
                  <>
                    <strong className="text-neutral-900 tabular-nums">{pluralDays(days)}</strong> (без учета выходных)
                  </>
                )}
              </span>
              {info && (
                <span className={days !== null && days > info.vacation.available ? "text-red-600 font-medium" : "text-neutral-500"}>
                  {info.vacation.available} доступно
                  {info.vacation.pending > 0 && ` (${info.vacation.pending} на рассмотрении)`}
                </span>
              )}
            </div>
            <Textarea label="Комментарий (необязательно)" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={300} fullWidth />
          </>
        ) : (
          <>
            <Input
              label="Сумма (тенге)"
              type="number"
              inputMode="numeric"
              min={info?.advance.minAmount}
              max={info?.advance.limit}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={f.amount}
              hint={info ? `До ${fmtKzt(info.advance.limit)} (50% от месячного оклада). Не более одного аванса в месяц.` : undefined}
              fullWidth
            />
            {info?.advance.alreadyRequestedThisMonth && (
              <p className="text-[12.5px] text-amber-700 bg-amber-50 rounded-xl px-4 py-2.5">
                В этом месяце вы уже запрашивали аванс, повторный запрос недоступен.
              </p>
            )}
            <Textarea label="Причина" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={300} error={f.reason} fullWidth />
          </>
        )}

        {generalError && (
          <p role="alert" className="text-[12.5px] text-red-600 font-medium">
            {generalError}
          </p>
        )}
      </div>
    </Modal>
  );
}
