"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ENTER_MS = 340;
const EXIT_MS = 240;

const sizeMap = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  side = "right",
  size = "md",
  className = "",
}: DrawerProps) {
  const { m } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── mount / unmount ────────────────────────────────── */
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  /* ── trigger enter animation after mount ────────────── */
  useLayoutEffect(() => {
    if (!mounted || !open || visible) return;

    const el = panelRef.current;
    if (el) {
      void el.getBoundingClientRect();
    }

    const id = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, [mounted, open, visible]);

  /* ── escape to close ───────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ── focus trap ────────────────────────────────────── */
  useEffect(() => {
    if (!open || !mounted || !visible) return;
    const el = panelRef.current;
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

  /* ── lock body scroll ──────────────────────────────── */
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  const isRight = side === "right";

  return (
    <div className="fixed inset-0 z-90">
      {/* backdrop */}
      <div
        className={[
          "absolute inset-0 bg-hero-foreground/40 backdrop-blur-sm",
          "transition-opacity ease-out",
          visible ? `opacity-100 duration-[${ENTER_MS}ms]` : `opacity-0 duration-[${EXIT_MS}ms]`,
        ].join(" ")}
        onClick={onClose}
      />

      {/* panel wrapper – anchored to the chosen side */}
      <div
        className={[
          "absolute inset-y-0",
          isRight ? "right-0" : "left-0",
          "flex",
          isRight ? "justify-end" : "justify-start",
        ].join(" ")}
        style={{ width: "100%" }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          className={[
            "relative h-full w-full",
            sizeMap[size],
            "flex flex-col",
            "transition-transform",
            "ease-[cubic-bezier(0.34,1.4,0.64,1)]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            transitionDuration: visible ? `${ENTER_MS}ms` : `${EXIT_MS}ms`,
            transform: visible
              ? "translateX(0)"
              : isRight
                ? "translateX(100%)"
                : "translateX(-100%)",
          }}
        >
          {/* outer gradient border layer */}
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
              boxShadow:
                "0 8px 24px -8px rgba(17,17,17,0.18), 0 32px 80px -16px rgba(17,17,17,0.28), 0 0 0 1px rgba(17,17,17,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
          >
            {/* inner white surface */}
            <div
              className={[
                "flex flex-col h-full bg-hero-elevated overflow-hidden",
                isRight ? "ml-1.5 rounded-l-xl" : "mr-1.5 rounded-r-xl",
              ].join(" ")}
            >
              {/* ── header ──────────────────────────── */}
              <div className="px-6 pt-6 pb-4 flex items-start gap-4 shrink-0">
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

              {/* ── body ────────────────────────────── */}
              {children && (
                <div className="flex-1 overflow-y-auto px-6 pb-4">
                  {children}
                </div>
              )}

              {/* ── footer actions ──────────────────── */}
              {actions && (
                <div className="px-6 py-4 border-t border-hero-border flex items-center justify-end gap-2 shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
