"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestView } from "@/lib/domain/types";
import { workingDays, isValidDate } from "@/lib/domain/dates";
import { ApiError, api, post } from "@/lib/client/api";
import { fmtKzt } from "@/lib/client/format";
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
        title: "Request submitted",
        description: `${request.id} was sent to ${request.approver.fullName}.`,
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
      setError(e instanceof ApiError ? e : new ApiError(0, "network", "Network error."));
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
      title="New request"
      description="It goes to your manager first. You can follow every step on the request page."
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => void submit()} disabled={busy}>
            {busy ? "Submitting…" : "Submit request"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Tabs
          key={initialType}
          defaultTab={initialType}
          tabs={[
            { key: "vacation", label: "Vacation" },
            { key: "salary_advance", label: "Salary advance" },
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
                label="First day"
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
              <Input label="Last day" type="date" min={startDate || info?.today} value={endDate} onChange={(e) => setEndDate(e.target.value)} error={f.endDate} fullWidth />
            </div>
            <div
              className="rounded-xl bg-neutral-50 px-4 py-3 text-[12.5px] text-neutral-600 flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
              aria-live="polite"
            >
              <span>
                {days === null ? (
                  "Pick your dates to see the working days."
                ) : (
                  <>
                    <strong className="text-neutral-900 tabular-nums">{days}</strong> working day{days === 1 ? "" : "s"} (weekends excluded)
                  </>
                )}
              </span>
              {info && (
                <span className={days !== null && days > info.vacation.available ? "text-red-600 font-medium" : "text-neutral-500"}>
                  {info.vacation.available} available
                  {info.vacation.pending > 0 && ` (${info.vacation.pending} pending)`}
                </span>
              )}
            </div>
            <Textarea label="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={300} fullWidth />
          </>
        ) : (
          <>
            <Input
              label="Amount (KZT)"
              type="number"
              inputMode="numeric"
              min={info?.advance.minAmount}
              max={info?.advance.limit}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={f.amount}
              hint={info ? `Up to ${fmtKzt(info.advance.limit)} (50% of your monthly salary). One advance per month.` : undefined}
              fullWidth
            />
            {info?.advance.alreadyRequestedThisMonth && (
              <p className="text-[12.5px] text-amber-700 bg-amber-50 rounded-xl px-4 py-2.5">
                You already have an advance request this month, so a new one will be refused.
              </p>
            )}
            <Textarea label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={300} error={f.reason} fullWidth />
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
