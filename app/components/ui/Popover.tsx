"use client";

import React, { useState, useRef, useEffect } from "react";

type PopoverPosition = "top" | "bottom" | "left" | "right";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: PopoverPosition;
  className?: string;
}

const positionStyles: Record<PopoverPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const enterFrom: Record<PopoverPosition, string> = {
  top: "translate-y-1.5",
  bottom: "-translate-y-1.5",
  left: "translate-x-1.5",
  right: "-translate-x-1.5",
};

export function Popover({
  trigger,
  children,
  position = "bottom",
  className = "",
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className={["relative inline-flex", className].join(" ")}>
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>
      {mounted && (
        <div
          className={[
            "absolute z-50 min-w-[220px] rounded-2xl p-1.5 overflow-hidden",
            "transition-all duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
            visible
              ? "opacity-100 scale-100 translate-x-0 translate-y-0"
              : ["opacity-0 scale-[0.96]", enterFrom[position]].join(" "),
            positionStyles[position],
          ].join(" ")}
          style={{
            background:
              "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
            boxShadow:
              "0 4px 16px -4px rgba(17,17,17,0.12), 0 16px 40px -12px rgba(17,17,17,0.18), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          }}
        >
          <div className="bg-hero-elevated rounded-xl p-3.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
