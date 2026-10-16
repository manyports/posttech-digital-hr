"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./Button";

interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

interface Slot {
  itemIndex: number;
  key: string;
  role: "current" | "prev";
}

export function Carousel({
  items,
  autoPlay = false,
  interval = 4000,
  className = "",
}: CarouselProps) {
  const [slots, setSlots] = useState<Slot[]>([
    { itemIndex: 0, key: "s-0-0", role: "current" },
  ]);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentIdxRef = useRef(0);
  const lockedRef     = useRef(false);
  const tcRef         = useRef(0);
  const cleanupRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (nextIdx: number, dir: "left" | "right") => {
    if (lockedRef.current || nextIdx === currentIdxRef.current) return;

    const prevIdx = currentIdxRef.current;
    const tc      = ++tcRef.current;

    lockedRef.current  = true;
    currentIdxRef.current = nextIdx;

    setDirection(dir);
    setCurrentIdx(nextIdx);
    setSlots([
      { itemIndex: nextIdx, key: `c-${nextIdx}-${tc}`, role: "current" },
      { itemIndex: prevIdx, key: `p-${prevIdx}-${tc}`, role: "prev"    },
    ]);

    if (cleanupRef.current) clearTimeout(cleanupRef.current);
    cleanupRef.current = setTimeout(() => {
      setSlots([{ itemIndex: nextIdx, key: `c-${nextIdx}-${tc}`, role: "current" }]);
      lockedRef.current = false;
    }, 480);
  };

  const goNext = () => go((currentIdxRef.current + 1) % items.length, "right");
  const goPrev = () => go((currentIdxRef.current - 1 + items.length) % items.length, "left");

  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => goNextRef.current(), interval);
    return () => clearInterval(id);
  }, [autoPlay, interval]);

  useEffect(() => () => { if (cleanupRef.current) clearTimeout(cleanupRef.current); }, []);

  // ── Swipe / pointer drag ──────────────────────────────────────────
  const dragRef   = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const THRESHOLD = 48;

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.active = false;
    if (Math.abs(dx) > THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? goNextRef.current() : goPrev();
    }
  };

  const onPointerCancel = () => { dragRef.current.active = false; };

  const enterClass = direction === "right" ? "carousel-enter-right" : "carousel-enter-left";
  const exitClass  = direction === "right" ? "carousel-exit-left"   : "carousel-exit-right";

  return (
    <div
      className={["bg-white rounded-2xl p-3 flex flex-col gap-3", className].join(" ")}
      style={{
        boxShadow:
          "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* Track — inset, slides don't touch outer border */}
      <div
        className="relative w-full overflow-hidden rounded-xl cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ minHeight: 300 }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {slots.map((slot) => (
          <div
            key={slot.key}
            className={["absolute inset-0", slot.role === "current" ? enterClass : exitClass].join(" ")}
          >
            {items[slot.itemIndex]}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > currentIdxRef.current ? "right" : "left")}
              className={[
                "relative h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer",
                i === currentIdx
                  ? "w-6 bg-neutral-900"
                  : "w-1.5 bg-neutral-300 hover:bg-neutral-500",
              ].join(" ")}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentIdx}
            />
          ))}
          <span className="ml-2 text-[11.5px] font-medium text-neutral-400 tabular-nums tracking-[-0.005em]">
            {currentIdx + 1}
            <span className="text-neutral-300"> / {items.length}</span>
          </span>
        </div>

        <div className="flex gap-1.5">
          <Button variant="secondary" size="icon" onClick={goPrev} aria-label="Предыдущий слайд">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button variant="secondary" size="icon" onClick={goNext} aria-label="Следующий слайд">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
