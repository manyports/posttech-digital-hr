"use client";

import React, { useRef, useCallback, useEffect } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  autoResize?: boolean;
}

export function Textarea({
  label,
  hint,
  error,
  fullWidth = false,
  autoResize = false,
  className = "",
  id,
  rows = 3,
  onChange,
  ...rest
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    if (!autoResize || !ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [autoResize]);

  useEffect(() => { resize(); }, [resize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    onChange?.(e);
  };

  return (
    <div className={["flex flex-col gap-1.5", fullWidth ? "w-full" : ""].join(" ")}>
      {label && (
        <label
          htmlFor={textareaId}
          className="app-form-label"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        onChange={handleChange}
        className={[
          "rounded-xl px-4 py-3 text-[13.5px] text-hero-foreground placeholder:text-tertiary",
          "transition-[box-shadow,background] duration-200 ease-out resize-none",
          "focus:outline-none focus:[background:var(--color-hero-elevated)]",
          "focus:[box-shadow:var(--shadow-focus)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: "var(--field-rest-bg)",
          boxShadow: error ? "var(--field-error-shadow)" : "var(--field-rest-shadow)",
          ["--shadow-focus" as string]: error ? "var(--field-error-focus-shadow)" : "var(--field-focus-shadow)",
        } as React.CSSProperties}
        {...rest}
      />
      {error && (
        <p className="text-[11.5px] text-error font-medium flex items-center gap-1 mt-0.5">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11.5px] text-tertiary mt-0.5">{hint}</p>
      )}
    </div>
  );
}
