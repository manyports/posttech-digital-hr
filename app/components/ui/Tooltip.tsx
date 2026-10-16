"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: React.ReactNode;
  className?: string;
}

const enterTranslate: Record<TooltipPosition, string> = {
  top: "translate-y-1",
  bottom: "-translate-y-1",
  left: "translate-x-1",
  right: "-translate-x-1",
};

export function Tooltip({
  content,
  position = "top",
  children,
  className = "",
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchActiveRef = useRef(false);

  const show = useCallback((fromTouch = false) => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    enterTimer.current = setTimeout(() => setOpen(true), fromTouch ? 0 : 80);
    if (fromTouch) {
      autoHideTimer.current = setTimeout(() => {
        touchActiveRef.current = false;
        hide();
      }, 2400);
    }
  }, []);

  const hide = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    setVisible(false);
    exitTimer.current = setTimeout(() => {
      setMounted(false);
      setOpen(false);
    }, 150);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }
  }, [open]);

  const measure = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const tr = triggerRef.current.getBoundingClientRect();
    const tp = tooltipRef.current.getBoundingClientRect();
    const gap = 7;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = -(tp.height + gap);
        left = (tr.width - tp.width) / 2;
        break;
      case "bottom":
        top = tr.height + gap;
        left = (tr.width - tp.width) / 2;
        break;
      case "left":
        top = (tr.height - tp.height) / 2;
        left = -(tp.width + gap);
        break;
      case "right":
        top = (tr.height - tp.height) / 2;
        left = tr.width + gap;
        break;
    }

    const viewportPadding = 8;
    const absLeft = triggerRef.current.getBoundingClientRect().left + left;
    const overflowRight = absLeft + tp.width - (window.innerWidth - viewportPadding);
    const overflowLeft = viewportPadding - absLeft;
    if (overflowRight > 0) left -= overflowRight;
    if (overflowLeft > 0) left += overflowLeft;

    setCoords({ top, left });
  }, [position]);

  useEffect(() => {
    if (mounted) measure();
  }, [mounted, measure]);

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) {
        touchActiveRef.current = false;
        hide();
      }
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [open, hide]);

  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    };
  }, []);

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    show(false);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (touchActiveRef.current) return;
    hide();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    touchActiveRef.current = true;
    if (open) {
      hide();
    } else {
      show(true);
    }
  };

  return (
    <div
      ref={triggerRef}
      className={["relative inline-flex", className].join(" ")}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onFocus={() => show(false)}
      onBlur={() => {
        if (!touchActiveRef.current) hide();
      }}
    >
      {children}
      {mounted && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={[
            "absolute z-50 px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] font-medium whitespace-nowrap pointer-events-none",
            "transition-all duration-150 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
            visible
              ? "opacity-100 scale-100 translate-x-0 translate-y-0"
              : ["opacity-0 scale-95", enterTranslate[position]].join(" "),
          ].join(" ")}
          style={{
            top: coords.top,
            left: coords.left,
            boxShadow:
              "0 2px 6px rgba(0,0,0,0.25), 0 8px 24px -4px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
