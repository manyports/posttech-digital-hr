"use client";

import React, { useState } from "react";
import type { RequestAction, RequestView } from "@/lib/domain/types";
import { ApiError, post } from "@/lib/client/api";
import { TYPE_LABEL } from "@/lib/client/format";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../ui/Toast";

const COPY: Record<RequestAction, { label: string; title: string; done: string; needsComment: boolean; askComment: boolean }> = {
  start_review: { label: "Start review", title: "Start reviewing this request?", done: "Review started. The employee was notified.", needsComment: false, askComment: false },
  approve: { label: "Approve", title: "Approve this request", done: "Request approved. The employee was notified.", needsComment: false, askComment: true },
  reject: { label: "Reject", title: "Reject this request", done: "Request rejected. The employee was notified.", needsComment: true, askComment: true },
  cancel: { label: "Cancel request", title: "Cancel this request?", done: "Request cancelled.", needsComment: false, askComment: false },
};

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
      const msg = e instanceof ApiError ? e.message : "Something went wrong.";
      setError(msg);
      toast({ title: "Action failed", description: msg, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  function click(action: RequestAction) {
    // Review start is a single click; the rest confirm in a dialog.
    if (action === "start_review") void run(action);
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
            variant={a === "approve" || a === "start_review" ? "primary" : "outline"}
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
        description={`${TYPE_LABEL[request.type]} · ${request.id} · ${request.employee.fullName}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPending(null)} disabled={busy}>
              Back
            </Button>
            <Button
              variant={pending === "reject" || pending === "cancel" ? "outline" : "primary"}
              size="sm"
              disabled={busy || (copy?.needsComment === true && comment.trim().length < 3)}
              onClick={() => pending && void run(pending, comment)}
            >
              {busy ? "Working…" : copy?.label}
            </Button>
          </>
        }
      >
        {copy?.askComment && (
          <Textarea
            label={copy.needsComment ? "Reason (shown to the employee)" : "Comment (optional)"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={300}
            fullWidth
          />
        )}
        {error && (
          <p role="alert" className="text-[12.5px] text-red-600 font-medium mt-2">
            {error}
          </p>
        )}
      </Modal>
    </>
  );
}
