"use client";

import React, { useEffect, useRef, useState } from "react";

interface StatProps {
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: string;
  className?: string;
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const step = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return count;
}

export function Stat({ value, label, prefix = "", suffix = "", trend, className = "" }: StatProps) {
  const isNum = typeof value === "number";
  const counted = useCountUp(isNum ? (value as number) : 0);
  const displayed = isNum ? counted : value;

  return (
    <div className={["flex flex-col gap-0.5", className].join(" ")}>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[32px] font-semibold text-hero-foreground leading-none tabular-nums"
          style={{ letterSpacing: "-0.03em" }}
        >
          {prefix}{displayed}{suffix}
        </span>
        {trend && (
          <span className="text-[12px] text-tertiary font-medium">{trend}</span>
        )}
      </div>
      <span className="text-[12px] text-tertiary">{label}</span>
    </div>
  );
}

interface StatRowProps {
  children: React.ReactNode;
  className?: string;
}

export function StatRow({ children, className = "" }: StatRowProps) {
  const arr = React.Children.toArray(children);
  return (
    <div className={["grid grid-cols-2 gap-6 sm:flex sm:divide-x sm:divide-neutral-200 sm:gap-0", className].join(" ")}>
      {arr.map((child, i) => (
        <div
          key={i}
          className={[
            "min-w-0",
            i === 0 ? "sm:pr-6" : i === arr.length - 1 ? "sm:pl-6" : "sm:px-6",
          ].join(" ")}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
