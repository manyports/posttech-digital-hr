"use client";

import React, { useState } from "react";
import type { RequestAction, RequestView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../ui/Toast";

/**
 * Buttons for the actions the SERVER says the caller may take right now
 * (`request.allowedActions`). The server re-validates every click.
 */
export function RequestActions({
  request,
  onDone,
  compact = false,
}: {
  request: RequestView;
  onDone: (updated: RequestView) => void;
  compact?: boolean;
}) {
  const { toast } = useToast();
  const { m } = useI18n();
  const COPY: Record<RequestAction, { label: string; title: string; done: string; needsComment: boolean; askComment: boolean }> = {
    submit: { label: m.actions.submit, title: m.actions.submitTitle, done: m.actions.submitDone, needsComment: false, askComment: false },
    start_review: { label: m.actions.start, title: m.actions.startTitle, done: m.actions.startDone, needsComment: false, askComment: false },
    approve: { label: m.actions.approve, title: m.actions.approveTitle, done: m.actions.approveDone, needsComment: false, askComment: true },
    reject: { label: m.actions.reject, title: m.actions.rejectTitle, done: m.actions.rejectDone, needsComment: true, askComment: true },
    cancel: { label: m.actions.cancel, title: m.actions.cancelTitle, done: m.actions.cancelDone, needsComment: false, askComment: false },
  };
  const [pending, setPending] = useState<RequestAction | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (request.allowedActions.length === 0) return null;

  async function run(action: RequestAction, text?: string) {
    setBusy(true);
    setError(null);
    try {
      const { request: updated } = await post<{ request: RequestView }>(`/api/requests/${request.id}/actions`, {
        action,
        comment: text?.trim() || undefined,
      });
      toast({ title: COPY[action].done, variant: action === "reject" ? "warning" : "success" });
      setPending(null);
      setComment("");
      onDone(updated);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : m.common.failed;
      setError(msg);
      toast({ title: m.actions.fail, description: msg, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  function click(action: RequestAction) {
    // Submission and review start are single-click actions; decisions confirm in a dialog.
    if (action === "start_review" || action === "submit") void run(action);
    else {
      setError(null);
      setPending(action);
    }
  }

  const size = compact ? "sm" : "md";
  const copy = pending ? COPY[pending] : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {request.allowedActions.map((a) => (
          <Button
            key={a}
            size={size}
            variant={a === "submit" || a === "approve" || a === "start_review" ? "primary" : "outline"}
            disabled={busy}
            onClick={() => click(a)}
          >
            {COPY[a].label}
          </Button>
        ))}
      </div>

      <Modal
        open={pending !== null}
        onClose={() => !busy && setPending(null)}
        title={copy?.title}
        description={`${m.requestType[request.type]} · ${request.id} · ${request.employee.fullName}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPending(null)} disabled={busy}>
              {m.common.back}
            </Button>
            <Button
              variant={pending === "reject" || pending === "cancel" ? "outline" : "primary"}
              size="sm"
              disabled={busy || (copy?.needsComment === true && comment.trim().length < 3)}
              onClick={() => pending && void run(pending, comment)}
            >
              {busy ? m.common.working : copy?.label}
            </Button>
          </>
        }
      >
        {copy?.askComment && (
          <Textarea
            label={copy.needsComment ? m.actions.reason : m.actions.note}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={300}
            fullWidth
          />
        )}
        {error && (
          <p role="alert" className="text-[12.5px] text-error font-medium mt-2">
            {error}
          </p>
        )}
      </Modal>
    </>
  );
}
