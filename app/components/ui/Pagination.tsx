"use client";

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const slots = buildSlots(currentPage, totalPages);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const [squash, setSquash] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const prevPageRef = useRef(currentPage);
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const squashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentPage > prevPageRef.current) setDirection("next");
    else if (currentPage < prevPageRef.current) setDirection("prev");
    prevPageRef.current = currentPage;
  }, [currentPage]);

  const measurePill = () => {
    const btn = btnRefs.current[String(currentPage)];
    const container = containerRef.current;
    if (!btn || !container) return;
    const cr = container.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setPill({ left: br.left - cr.left, width: br.width, ready: true });
  };

  useLayoutEffect(() => {
    measurePill();
  }, []);

  useEffect(() => {
    measurePill();
    setSquash(true);
    if (squashTimerRef.current) clearTimeout(squashTimerRef.current);
    squashTimerRef.current = setTimeout(() => setSquash(false), 280);
    return () => {
      if (squashTimerRef.current) clearTimeout(squashTimerRef.current);
    };
  }, [currentPage]);

  useEffect(() => {
    const ro = new ResizeObserver(() => measurePill());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [currentPage]);

  return (
    <div
      className={[
        "inline-flex items-center gap-0.5 bg-neutral-100 rounded-xl p-1",
        className,
      ].join(" ")}
      style={{
        boxShadow:
          "inset 0 1px 2px rgba(17,17,17,0.06), inset 0 0 0 1px rgba(17,17,17,0.04)",
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="group/nav relative overflow-hidden h-8 px-3 rounded-lg flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-white transition-transform duration-300 ease-out group-hover/nav:scale-y-100 rounded-lg" />
        <svg className="relative z-10" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="relative z-10 hidden sm:inline">Prev</span>
      </button>

      <div ref={containerRef} className="relative flex items-center">
        {pill.ready && (
          <span
            aria-hidden
            className="absolute top-0 bottom-0 rounded-lg bg-white pointer-events-none z-0"
            style={{
              left: pill.left,
              width: pill.width,
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.08), 0 3px 8px -2px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(17,17,17,0.05)",
              transform: squash ? "scaleY(0.88)" : "scaleY(1)",
              transformOrigin: "center",
              transition:
                "left 320ms cubic-bezier(0.34,1.4,0.64,1), width 320ms cubic-bezier(0.34,1.4,0.64,1), transform 200ms cubic-bezier(0.34,1.6,0.64,1)",
            }}
          />
        )}

        {slots.map((slot, i) =>
          slot === "..." ? (
            <span
              key={`dot-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[11px] text-neutral-300 select-none relative z-10"
            >
              ···
            </span>
          ) : (
            <button
              key={`slot-${i}`}
              ref={(el) => {
                btnRefs.current[String(slot)] = el;
              }}
              onClick={() => onPageChange(slot as number)}
              className={[
                "relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-[13px] transition-colors duration-200 cursor-pointer tabular-nums overflow-hidden",
                slot === currentPage
                  ? "text-neutral-900 font-semibold"
                  : "text-neutral-400 hover:text-neutral-900 font-medium",
              ].join(" ")}
            >
              <span
                key={`${i}-${slot}`}
                className={[
                  "inline-block",
                  direction === "next" ? "animate-page-in-up" : "animate-page-in-down",
                ].join(" ")}
              >
                {slot}
              </span>
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="group/nav relative overflow-hidden h-8 px-3 rounded-lg flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-white transition-transform duration-300 ease-out group-hover/nav:scale-y-100 rounded-lg" />
        <span className="relative z-10 hidden sm:inline">Next</span>
        <svg className="relative z-10" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function buildSlots(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    const pages = Array.from({ length: total }, (_, i) => i + 1) as (number | "...")[];
    while (pages.length < 7) pages.push("...");
    return pages;
  }

  const slots: (number | "...")[] = new Array(7);

  slots[0] = 1;
  slots[6] = total;

  if (current <= 3) {
    slots[1] = 2;
    slots[2] = 3;
    slots[3] = 4;
    slots[4] = 5;
    slots[5] = "...";
  } else if (current >= total - 2) {
    slots[1] = "...";
    slots[2] = total - 4;
    slots[3] = total - 3;
    slots[4] = total - 2;
    slots[5] = total - 1;
  } else {
    slots[1] = "...";
    slots[2] = current - 1;
    slots[3] = current;
    slots[4] = current + 1;
    slots[5] = "...";
  }

  return slots;
}
