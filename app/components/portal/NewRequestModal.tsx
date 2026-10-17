"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestView } from "@/lib/domain/types";
import { addDays, workingDays, isValidDate } from "@/lib/domain/dates";
import { ApiError, api, post } from "@/lib/client/api";
import { fmtDate, fmtKzt, pluralDays } from "@/lib/client/format";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { NumberField } from "../ui/NumberField";
import { Tabs } from "../ui/Tabs";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../ui/Toast";
import { DateRangePicker } from "./DateRangePicker";

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

  async function save(intent: "draft" | "submit") {
    setBusy(true);
    setError(null);
    try {
      const payload =
        kind === "vacation"
          ? { type: kind, startDate, endDate, comment: comment || undefined }
          : { type: kind, amount: amount === "" ? undefined : Number(amount), reason };
      const { request } = await post<{ request: RequestView }>("/api/requests", { ...payload, intent });
      toast(intent === "draft"
        ? { title: m.modal.draftSaved, description: tx(m.modal.draftSavedHint, { id: request.id }), variant: "success" }
        : {
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
          <Button variant="outline" size="sm" onClick={() => void save("draft")} disabled={busy}>
            {busy ? m.modal.savingDraft : m.modal.saveDraft}
          </Button>
          <Button variant="primary" size="sm" onClick={() => void save("submit")} disabled={busy}>
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
            <div className="flex flex-col gap-1.5">
              <span className="app-form-label">{m.modal.dates}</span>
              {info ? (
                <DateRangePicker
                  start={startDate}
                  end={endDate}
                  onChange={(s, e) => {
                    setStartDate(s);
                    setEndDate(e);
                  }}
                  min={info.today}
                  max={addDays(info.today, 365)}
                  cap={info.vacation.available}
                  locale={locale}
                  labels={{
                    pickStart: m.modal.pickStart,
                    pickEnd: m.modal.pickEnd,
                    prevMonth: m.modal.prevMonth,
                    nextMonth: m.modal.nextMonth,
                    noDays: m.modal.noDays,
                    cap: tx(m.modal.capHint, { n: pluralDays(info.vacation.available, locale) }),
                  }}
                  error={f.startDate ?? f.endDate}
                />
              ) : (
                <div className="h-[332px] rounded-xl bg-hero-cell-bg animate-skeleton-pulse" />
              )}
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
                    <span className="text-hero-foreground">
                      {fmtDate(startDate, locale)} – {fmtDate(endDate, locale)}
                    </span>{" "}
                    · <strong className="text-hero-foreground tabular-nums">{pluralDays(days, locale)}</strong> {m.modal.weekends}
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
            {info ? (
              <NumberField
                label={m.modal.amount}
                value={amount}
                onChange={setAmount}
                min={info.advance.minAmount}
                max={info.advance.limit}
                step={5000}
                suffix="₸"
                rangeText={tx(m.modal.range, { min: fmtKzt(info.advance.minAmount), max: fmtKzt(info.advance.limit) })}
                overText={tx(m.modal.tooMuch, { max: fmtKzt(info.advance.limit) })}
                underText={tx(m.modal.tooLittle, { min: fmtKzt(info.advance.minAmount) })}
                decLabel={m.modal.less}
                incLabel={m.modal.more}
                hint={tx(m.modal.amountHint, { limit: fmtKzt(info.advance.limit) })}
                error={f.amount}
              />
            ) : (
              <div className="h-[118px] rounded-xl bg-hero-cell-bg animate-skeleton-pulse" />
            )}
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
