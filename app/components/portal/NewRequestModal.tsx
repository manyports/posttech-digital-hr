"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestView } from "@/lib/domain/types";
import { workingDays, isValidDate } from "@/lib/domain/dates";
import { ApiError, api, post } from "@/lib/client/api";
import { fmtKzt, pluralDays } from "@/lib/client/format";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
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
  const { m, locale } = useI18n();
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
        title: m.modal.sent,
        description: tx(m.modal.sentTo, { id: request.id, name: request.approver.fullName }),
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
      setError(e instanceof ApiError ? e : new ApiError(0, "network", m.modal.network));
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
      title={m.modal.title}
      description={m.modal.description}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {m.common.cancel}
          </Button>
          <Button variant="primary" size="sm" onClick={() => void submit()} disabled={busy}>
            {busy ? m.modal.sending : m.modal.send}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Tabs
          key={initialType}
          defaultTab={initialType}
          tabs={[
            { key: "vacation", label: m.requestType.vacation },
            { key: "salary_advance", label: m.requestType.salary_advance },
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
                label={m.modal.start}
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
              <Input label={m.modal.end} type="date" min={startDate || info?.today} value={endDate} onChange={(e) => setEndDate(e.target.value)} error={f.endDate} fullWidth />
            </div>
            <div
              className="rounded-xl bg-hero-cell-bg px-4 py-3 text-[12.5px] text-hero-muted flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
              aria-live="polite"
            >
              <span>
                {days === null ? (
                  m.modal.pickDates
                ) : (
                  <>
                    <strong className="text-hero-foreground tabular-nums">{pluralDays(days, locale)}</strong> {m.modal.weekends}
                  </>
                )}
              </span>
              {info && (
                <span className={days !== null && days > info.vacation.available ? "text-error font-medium" : "text-hero-muted"}>
                  {tx(m.modal.available, { n: info.vacation.available })}
                  {info.vacation.pending > 0 && tx(m.modal.pending, { n: info.vacation.pending })}
                </span>
              )}
            </div>
            <Textarea label={m.modal.comment} value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={300} fullWidth />
          </>
        ) : (
          <>
            <Input
              label={m.modal.amount}
              type="number"
              inputMode="numeric"
              min={info?.advance.minAmount}
              max={info?.advance.limit}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={f.amount}
              hint={info ? tx(m.modal.amountHint, { limit: fmtKzt(info.advance.limit) }) : undefined}
              fullWidth
            />
            {info?.advance.alreadyRequestedThisMonth && (
              <p className="text-[12.5px] text-hero-foreground bg-hero-cell-bg border border-hero-border rounded-xl px-4 py-2.5">
                {m.modal.already}
              </p>
            )}
            <Textarea label={m.modal.reason} value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={300} error={f.reason} fullWidth />
          </>
        )}

        {generalError && (
          <p role="alert" className="text-[12.5px] text-error font-medium">
            {generalError}
          </p>
        )}
      </div>
    </Modal>
  );
}
