"use client";

import React, { useEffect, useRef, useState } from "react";

type StatTheme = "light" | "dark";
type DeltaDirection = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: { value: string; direction: DeltaDirection };
  hint?: string;
  sparkline?: number[];
  icon?: React.ReactNode;
  theme?: StatTheme;
  className?: string;
}

const lightSurface =
  "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(254,254,254,1) 40%, rgba(250,250,250,1) 100%)";
const darkSurface =
  "radial-gradient(140% 100% at 30% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%), linear-gradient(180deg, #121212 0%, #0a0a0a 100%)";

const lightShadow =
  "0 1px 3px rgba(17,17,17,0.02), 0 4px 12px -2px rgba(17,17,17,0.05), 0 8px 24px -4px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)";
const darkShadow =
  "0 2px 8px rgba(0,0,0,0.4), 0 8px 32px -4px rgba(0,0,0,0.5), 0 16px 48px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1.5px 0 rgba(255,255,255,0.10)";

function useAnimatedNumber(target: number, duration: number) {
  const [v, setV] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const delta = target - from;
    if (delta === 0) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + delta * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return v;
}

function Sparkline({ data, dark }: { data: number[]; dark?: boolean }) {
  if (data.length < 2) return null;
  const W = 120;
  const H = 30;
  const P = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (W - P * 2) / (data.length - 1);

  const pts = data.map((d, i) => {
    const x = P + i * step;
    const y = H - P - ((d - min) / range) * (H - P * 2);
    return [x, y] as const;
  });

  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - P} L${pts[0][0].toFixed(1)},${H - P} Z`;

  const stroke = dark ? "#ffffff" : "#171717";
  const gradId = `spark-fade-${dark ? "d" : "l"}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-[30px]">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={dark ? 0.25 : 0.14} />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeOpacity={dark ? 0.85 : 1}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const deltaConfig: Record<
  DeltaDirection,
  (dark: boolean) => { arrow: string; color: string; bg: string; ring: string }
> = {
  up: (dark) => ({
    arrow: "↑",
    color: dark ? "text-primary" : "text-primary",
    bg: dark ? "bg-primary/12" : "bg-pr-bg",
    ring: dark ? "ring-primary/30" : "ring-primary/20",
  }),
  down: (dark) => ({
    arrow: "↓",
    color: dark ? "text-error" : "text-error",
    bg: dark ? "bg-error/12" : "bg-error/10",
    ring: dark ? "ring-error/30" : "ring-error/20",
  }),
  neutral: (dark) => ({
    arrow: "→",
    color: dark ? "text-tertiary" : "text-hero-muted",
    bg: dark ? "bg-hero-elevated/8" : "bg-hero-cell-bg",
    ring: dark ? "ring-hero-elevated/12" : "ring-hero-foreground/8",
  }),
};

export function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  delta,
  hint,
  sparkline,
  icon,
  theme = "light",
  className = "",
}: StatCardProps) {
  const animated = useAnimatedNumber(value, 900);
  const dark = theme === "dark";

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const formatted = `${prefix}${formatter.format(animated)}${suffix}`;

  const dc = delta ? deltaConfig[delta.direction](dark) : null;

  return (
    <div
      className={["relative rounded-[24px] overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: dark ? darkSurface : lightSurface,
        boxShadow: dark ? darkShadow : lightShadow,
      }}
    >
      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,0.08), transparent 75%)",
          }}
        />
      )}

      <div className="relative p-7 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div
                className={[
                  "w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0",
                  dark
                    ? "bg-hero-elevated/8 text-neutral-100 ring-1 ring-inset ring-hero-elevated/10"
                    : "bg-hero-foreground/5 text-hero-foreground ring-1 ring-inset ring-hero-foreground/8",
                ].join(" ")}
                style={{
                  boxShadow: dark
                    ? "inset 0 1.5px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.3)"
                    : "inset 0 1.5px 0 rgba(255,255,255,0.95), 0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {icon}
              </div>
            )}
            <p
              className={[
                "text-[12px] font-semibold uppercase tracking-[0.08em] truncate",
                dark ? "text-tertiary" : "text-hero-muted",
              ].join(" ")}
            >
              {label}
            </p>
          </div>

          {delta && dc && (
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11.5px] font-semibold ring-1 ring-inset shrink-0",
                dc.color,
                dc.bg,
                dc.ring,
              ].join(" ")}
            >
              <span className="text-[11px] leading-none">{dc.arrow}</span>
              {delta.value}
            </span>
          )}
        </div>

        <p
          className={[
            "text-[52px] font-semibold tabular-nums tracking-[-0.04em] leading-none",
            dark ? "text-hero-on-foreground" : "text-hero-foreground",
          ].join(" ")}
        >
          {formatted}
        </p>

        {sparkline && sparkline.length > 1 && (
          <div className="-mx-2 -mb-1">
            <Sparkline data={sparkline} dark={dark} />
          </div>
        )}

        {hint && (
          <p
            className={[
              "text-[13px] leading-relaxed -mt-1.5",
              dark ? "text-hero-muted" : "text-hero-muted",
            ].join(" ")}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
