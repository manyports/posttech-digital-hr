"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const REST_SHADOW = "var(--field-rest-shadow)";
const HOVER_SHADOW = "var(--field-hover-shadow)";
const OPEN_SHADOW = "var(--field-focus-shadow)";
const REST_BG = "var(--field-rest-bg)";
const HOVER_BG = "var(--field-hover-bg)";

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  label,
  hint,
  disabled = false,
  fullWidth = false,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div className={["flex flex-col gap-1.5", fullWidth ? "w-full" : ""].join(" ")}>
      {label && (
        <label className="app-form-label">
          {label}
        </label>
      )}

      <div
        ref={ref}
        className={["relative", fullWidth ? "w-full" : "inline-block", className].join(" ")}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={[
            "group/select relative isolate inline-flex items-center justify-between gap-3 w-full",
            "rounded-xl px-4 py-3 text-[13.5px] font-medium text-hero-foreground",
            "transition-[box-shadow,background] duration-200 ease-out cursor-pointer select-none",
            "focus:outline-none",
            "disabled:opacity-40 disabled:pointer-events-none",
            !open ? "hover:[background:var(--hover-bg)] hover:[box-shadow:var(--hover-shadow)]" : "",
          ].join(" ")}
          style={{
            background: open ? "var(--color-hero-elevated)" : REST_BG,
            boxShadow: open ? OPEN_SHADOW : REST_SHADOW,
            ["--hover-bg" as string]: HOVER_BG,
            ["--hover-shadow" as string]: HOVER_SHADOW,
          } as React.CSSProperties}
        >
          <span
            className={[
              "relative z-10 truncate",
              selected ? "text-hero-foreground" : "text-tertiary font-normal",
            ].join(" ")}
          >
            {selected ? selected.label : placeholder}
          </span>
          <span
            className={[
              "relative z-10 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
              open
                ? "text-hero-foreground scale-110"
                : "text-tertiary group-hover/select:text-hero-foreground",
            ].join(" ")}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className={["transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]", open ? "rotate-180" : ""].join(" ")}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>

          {open && (
            <span
              key={`shimmer-${open}`}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-5 rounded-xl overflow-hidden"
            >
              <span
                className="block absolute inset-y-0 w-[30%] -left-[30%] animate-input-shimmer"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                }}
              />
            </span>
          )}
        </button>

        {open && (
          <div
            className="absolute left-0 z-50 mt-1.5 p-1 rounded-xl"
            style={{
              minWidth: "100%",
              maxWidth: "min(420px, calc(100vw - 2rem))",
              width: "max-content",
              animation: "select-in 180ms cubic-bezier(0.16,1,0.3,1) both",
              background:
                "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
              boxShadow:
                "0 4px 16px -4px rgba(17,17,17,0.12), 0 16px 40px -12px rgba(17,17,17,0.18), 0 0 0 1px rgba(17,17,17,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
          >
            <style>{`
              @keyframes select-in {
                from { opacity: 0; transform: scale(0.97) translateY(-4px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
            <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
              {options.map((opt, i) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange?.(opt.value);
                      setOpen(false);
                    }}
                    className={[
                      "group/item relative flex items-center justify-between gap-3 w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors duration-150",
                      isSelected
                        ? "font-medium text-hero-foreground bg-hero-elevated"
                        : "text-hero-muted hover:text-hero-foreground hover:bg-hero-elevated/70",
                    ].join(" ")}
                    style={{
                      animation: `select-option-in 320ms cubic-bezier(0.16,1,0.3,1) ${i * 28}ms both`,
                      boxShadow: isSelected
                        ? "inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(17,17,17,0.05), 0 1px 2px -1px rgba(17,17,17,0.04)"
                        : undefined,
                    }}
                  >
                    <span className="whitespace-nowrap">{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="shrink-0 text-hero-foreground"
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {hint && <p className="text-[11.5px] text-tertiary mt-0.5">{hint}</p>}
    </div>
  );
}
