"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const CLOSE_MS = 240;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  className = "",
}: ModalProps) {
  const { m } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), CLOSE_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  useLayoutEffect(() => {
    if (!mounted || !open || visible) return;

    const el = dialogRef.current;
    if (el) {
      void el.getBoundingClientRect();
    }

    const id = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, [mounted, open, visible]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !mounted || !visible) return;
    const el = dialogRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [open, mounted, visible]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto p-4">
      <div
        className={[
          "absolute inset-0 bg-hero-foreground/40 backdrop-blur-sm",
          "transition-opacity ease-out",
          visible ? "opacity-100 duration-300" : "opacity-0 duration-200",
        ].join(" ")}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={[
          "relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col rounded-2xl p-1.5 overflow-hidden",
          "transition-all ease-[cubic-bezier(0.34,1.4,0.64,1)]",
          visible
            ? "opacity-100 scale-100 translate-y-0 duration-300"
            : "opacity-0 scale-[0.94] translate-y-3 duration-200",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background:
            "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
          boxShadow:
            "0 8px 24px -8px rgba(17,17,17,0.18), 0 32px 80px -16px rgba(17,17,17,0.28), 0 0 0 1px rgba(17,17,17,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col bg-hero-elevated rounded-xl overflow-hidden">
          <div className="shrink-0 px-6 pt-6 pb-4 flex items-start gap-4">
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              {title && (
                <p className="text-[16px] font-semibold text-hero-foreground tracking-tight leading-snug">
                  {title}
                </p>
              )}
              {description && (
                <p className="text-[13px] text-tertiary leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label={m.common.close}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-tertiary hover:text-hero-muted hover-wipe cursor-pointer transition-colors duration-150"
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {children && <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4">{children}</div>}

          {actions && (
            <div className="shrink-0 px-6 py-4 border-t border-hero-border flex items-center justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
