"use client";

import React, { useState } from "react";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
}

export function RadioGroup({
  options,
  value,
  defaultValue = "",
  onChange,
  name,
  className = "",
}: RadioGroupProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value !== undefined ? value : internal;

  const select = (val: string, disabled?: boolean) => {
    if (disabled) return;
    setInternal(val);
    onChange?.(val);
  };

  return (
    <div role="radiogroup" className={["flex flex-col gap-3", className].join(" ")}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <div
            key={opt.value}
            onClick={() => select(opt.value, opt.disabled)}
            className={[
              "flex items-center justify-between gap-4 select-none",
              opt.disabled ? "opacity-40 pointer-events-none" : "cursor-pointer",
            ].join(" ")}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] font-medium text-hero-foreground leading-snug">{opt.label}</span>
              {opt.description && (
                <span className="text-[12px] text-tertiary leading-relaxed">{opt.description}</span>
              )}
            </div>

            <div
              role="radio"
              aria-checked={active}
              className={[
                "shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                "transition-[background-color,box-shadow] duration-150",
                active ? "bg-hero-foreground" : "bg-hero-cell-bg",
              ].join(" ")}
              style={{
                boxShadow: active
                  ? "0 1px 3px rgba(0,0,0,0.25), 0 2px 6px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12)"
                  : "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(17,17,17,0.12), 0 1px 2px -1px rgba(17,17,17,0.04)",
              }}
            >
              {active && (
                <span className="animate-checkbox-in w-[7px] h-[7px] rounded-full bg-hero-elevated block" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
