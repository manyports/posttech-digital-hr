import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const REST_SHADOW =
  "inset 0 0 0 1px rgba(17,17,17,0.12), inset 0 1px 2px rgba(17,17,17,0.03), 0 1px 2px -1px rgba(17,17,17,0.04)";
const FOCUS_SHADOW =
  "inset 0 0 0 1px rgba(17,17,17,0.92), 0 0 0 4px rgba(17,17,17,0.08), 0 2px 6px -2px rgba(17,17,17,0.08)";
const ERROR_SHADOW =
  "inset 0 0 0 1px rgba(239,68,68,0.5), inset 0 1px 2px rgba(239,68,68,0.06), 0 1px 2px -1px rgba(239,68,68,0.08)";
const ERROR_FOCUS_SHADOW =
  "inset 0 0 0 1px rgb(239,68,68), 0 0 0 4px rgba(239,68,68,0.12), 0 2px 6px -2px rgba(239,68,68,0.10)";
const HOVER_SHADOW =
  "inset 0 0 0 1px rgba(17,17,17,0.20), inset 0 1px 2px rgba(17,17,17,0.04), 0 1px 3px -1px rgba(17,17,17,0.06)";
const ERROR_HOVER_SHADOW =
  "inset 0 0 0 1px rgba(239,68,68,0.65), inset 0 1px 2px rgba(239,68,68,0.08), 0 1px 3px -1px rgba(239,68,68,0.10)";

const REST_BG = "linear-gradient(180deg, #f7f7f7 0%, #fbfbfb 100%)";
const HOVER_BG = "linear-gradient(180deg, #f2f2f2 0%, #f7f7f7 100%)";

export function Input({
  label,
  hint,
  error,
  fullWidth = false,
  iconLeft,
  iconRight,
  className = "",
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={["flex flex-col gap-1.5", fullWidth ? "w-full" : ""].join(" ")}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12.5px] font-medium text-neutral-700 tracking-[-0.005em]"
        >
          {label}
        </label>
      )}
      <div className="relative group/input isolate">
        {iconLeft && (
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-focus-within/input:text-neutral-800 group-focus-within/input:scale-110 pointer-events-none z-20 flex items-center justify-center"
          >
            {iconLeft}
          </span>
        )}
        <input
          id={inputId}
          className={[
            "relative z-10 w-full rounded-xl py-3 text-[13.5px] text-neutral-900 caret-neutral-900 placeholder:text-neutral-400",
            "transition-[box-shadow,background] duration-200 ease-out",
            "hover:[background:var(--hover-bg)] hover:[box-shadow:var(--hover-shadow)]",
            "focus:outline-none focus:[background:#ffffff] focus:[box-shadow:var(--shadow-focus)]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            iconLeft ? "pl-10" : "pl-4",
            iconRight ? "pr-10" : "pr-4",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            background: REST_BG,
            boxShadow: error ? ERROR_SHADOW : REST_SHADOW,
            ["--hover-bg" as string]: HOVER_BG,
            ["--hover-shadow" as string]: error ? ERROR_HOVER_SHADOW : HOVER_SHADOW,
            ["--shadow-focus" as string]: error ? ERROR_FOCUS_SHADOW : FOCUS_SHADOW,
          } as React.CSSProperties}
          {...rest}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-15 rounded-xl overflow-hidden"
        >
          <span
            className="block absolute inset-y-0 w-[30%] -left-[30%] opacity-0 group-focus-within/input:animate-input-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
            }}
          />
        </span>
        {iconRight && (
          <span
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-focus-within/input:text-neutral-800 group-focus-within/input:scale-110 pointer-events-none z-20 flex items-center justify-center"
          >
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <p className="text-[11.5px] text-red-500 font-medium flex items-center gap-1 mt-0.5">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11.5px] text-neutral-400 mt-0.5">{hint}</p>
      )}
    </div>
  );
}
