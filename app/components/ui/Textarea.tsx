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
          className="text-[12.5px] font-medium text-neutral-700 tracking-[-0.005em]"
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
          "rounded-xl px-4 py-3 text-[13.5px] text-neutral-900 placeholder:text-neutral-400",
          "transition-[box-shadow,background] duration-200 ease-out resize-none",
          "focus:outline-none focus:[background:#ffffff]",
          "focus:[box-shadow:var(--shadow-focus)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: "linear-gradient(180deg, #f7f7f7 0%, #fbfbfb 100%)",
          boxShadow: error
            ? "inset 0 0 0 1px rgba(239,68,68,0.5), inset 0 1px 2px rgba(239,68,68,0.06), 0 1px 2px -1px rgba(239,68,68,0.08)"
            : "inset 0 0 0 1px rgba(17,17,17,0.12), inset 0 1px 2px rgba(17,17,17,0.03), 0 1px 2px -1px rgba(17,17,17,0.04)",
          ["--shadow-focus" as string]: error
            ? "inset 0 0 0 1px rgb(239,68,68), 0 0 0 4px rgba(239,68,68,0.12), 0 1px 2px -1px rgba(239,68,68,0.08)"
            : "inset 0 0 0 1px rgba(17,17,17,0.92), 0 0 0 4px rgba(17,17,17,0.08), 0 1px 2px -1px rgba(17,17,17,0.04)",
        } as React.CSSProperties}
        {...rest}
      />
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
