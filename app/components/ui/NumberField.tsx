"use client";

import React, { useId } from "react";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const group = (n: number) => n.toLocaleString("ru-RU");

/**
 * Whole-number field that always shows its allowed range: a track from `min`
 * to `max` under the input, -/+ steppers, and a live warning when the typed
 * value leaves the range. Out-of-range values snap back into range on blur.
 *
 * `value` is the raw digit string ("" when empty) so callers can tell
 * "nothing typed" from 0.
 */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  rangeText,
  overText,
  underText,
  decLabel,
  incLabel,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (digits: string) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  /** Already formatted, e.g. "От 10 000 до 250 000 ₸". */
  rangeText: string;
  overText: string;
  underText: string;
  decLabel: string;
  incLabel: string;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const n = value === "" ? null : Number(value);
  const live = n === null ? null : n > max ? overText : n < min ? underText : null;
  const message = error ?? live;
  const pct = max > min && n !== null ? ((clamp(n, min, max) - min) / (max - min)) * 100 : 0;

  const set = (next: number) => onChange(String(clamp(next, min, max)));

  const stepBtn =
    "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[16px] leading-none text-hero-muted hover:text-hero-foreground hover:bg-hero-elevated transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-default disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="app-form-label">
        {label}
      </label>

      <div
        className="flex items-center gap-1 rounded-xl bg-hero-cell-bg px-1.5 py-1.5 transition-shadow [box-shadow:var(--shadow)] hover:[box-shadow:var(--shadow-hover)] focus-within:[box-shadow:var(--shadow-focus)] focus-within:hover:[box-shadow:var(--shadow-focus)]"
        style={
          {
            "--shadow": message ? "var(--field-error-shadow)" : "var(--field-rest-shadow)",
            "--shadow-hover": message ? "var(--field-error-hover-shadow)" : "var(--field-hover-shadow)",
            "--shadow-focus": message ? "var(--field-error-focus-shadow)" : "var(--field-focus-shadow)",
          } as React.CSSProperties
        }
      >
        <button type="button" className={stepBtn} aria-label={decLabel} disabled={n === null || n <= min} onClick={() => set((n ?? min) - step)}>
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={group(min)}
          value={n === null ? "" : group(n)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, String(max).length + 1))}
          onBlur={() => n !== null && set(n)}
          aria-invalid={Boolean(message)}
          aria-describedby={`${id}-range`}
          className="flex-1 min-w-0 bg-transparent text-center text-[16px] font-semibold tabular-nums tracking-[-0.02em] text-hero-foreground placeholder:text-hero-border placeholder:font-normal outline-none"
        />
        {suffix && <span className="shrink-0 -ml-1 mr-1 text-[14px] text-tertiary">{suffix}</span>}
        <button type="button" className={stepBtn} aria-label={incLabel} disabled={n !== null && n >= max} onClick={() => set(n === null ? min : n + step)}>
          +
        </button>
      </div>

      <div className="relative h-5 mt-0.5">
        <div className="absolute inset-x-1.5 inset-y-0">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-hero-border/70">
            <div className="h-full rounded-full bg-hero-foreground transition-[width] duration-150" style={{ width: `${pct}%` }} />
          </div>
          {n !== null && (
            <span
              aria-hidden
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-hero-elevated transition-[left] duration-150"
              style={{ left: `${pct}%`, boxShadow: "0 0 0 1px rgba(17,17,17,0.12), 0 1px 3px rgba(0,0,0,0.15)" }}
            />
          )}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={n === null ? min : clamp(n, min, max)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          tabIndex={-1}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-[11.5px] text-tertiary tabular-nums">
        <span>{group(min)}</span>
        <span>
          {group(max)}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <p id={`${id}-range`} className={message ? "text-[11.5px] text-error font-medium" : "sr-only"} aria-live="polite">
        {message ?? rangeText}
      </p>
      {hint && <p className="text-[11.5px] text-tertiary">{hint}</p>}
    </div>
  );
}
