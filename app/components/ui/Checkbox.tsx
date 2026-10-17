"use client";

import React, { useState } from "react";

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  label,
  description,
  disabled = false,
  indeterminate = false,
  className = "",
}: CheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    setInternal(next);
    onChange?.(next);
  };

  const active = isChecked || indeterminate;

  return (
    <div
      className={[
        "flex items-center justify-between gap-4 select-none",
        disabled ? "opacity-40 pointer-events-none" : "cursor-pointer",
        className,
      ].join(" ")}
      onClick={toggle}
    >
      {(label || description) && (
        <div className="flex flex-col gap-0.5 min-w-0">
          {label && (
            <span className="text-[13px] font-medium text-hero-foreground leading-snug">{label}</span>
          )}
          {description && (
            <span className="text-[12px] text-tertiary leading-relaxed">{description}</span>
          )}
        </div>
      )}

      <div
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : isChecked}
        className={[
          "shrink-0 w-6 h-6 rounded-[7px] flex items-center justify-center",
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
          indeterminate ? (
            <span className="animate-checkbox-in">
              <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                <rect width="10" height="2" rx="1" fill="white" />
              </svg>
            </span>
          ) : (
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path
                d="M1.5 5l3.5 3.5L11.5 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-check"
              />
            </svg>
          )
        )}
      </div>
    </div>
  );
}
