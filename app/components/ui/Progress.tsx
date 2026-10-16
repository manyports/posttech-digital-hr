"use client";

import React, { useEffect, useRef, useState } from "react";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  className = "",
}: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const [displayed, setDisplayed] = useState(0);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    t.current = setTimeout(() => setDisplayed(pct), 80);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [pct]);

  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-4">
          {label && (
            <span className="text-[13px] font-medium text-neutral-700 truncate">{label}</span>
          )}
          {showValue && (
            <span className="text-[12px] tabular-nums text-neutral-400 shrink-0">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full h-[6px] rounded-full bg-neutral-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{
          boxShadow:
            "inset 0 1px 2px rgba(17,17,17,0.08), inset 0 0 0 1px rgba(17,17,17,0.04)",
        }}
      >
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: `${displayed}%`,
            background: "linear-gradient(180deg, #262626 0%, #0a0a0a 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.2)",
            transition: "width 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
