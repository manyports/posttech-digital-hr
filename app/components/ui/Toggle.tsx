"use client";

import React, { useState } from "react";

interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked !== undefined ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !isOn;
    setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      className={[
        "flex items-center justify-between gap-4 select-none",
        disabled ? "opacity-35 pointer-events-none" : "cursor-pointer",
      ].join(" ")}
      onClick={toggle}
    >
      {(label || description) && (
        <div className="flex flex-col gap-0.5 min-w-0">
          {label && (
            <span className="text-[13px] font-medium text-neutral-900 leading-snug">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[12px] text-neutral-400 leading-relaxed">
              {description}
            </span>
          )}
        </div>
      )}

      <div
        role="switch"
        aria-checked={isOn}
        className={[
          "relative shrink-0 w-[46px] h-[26px] rounded-xl",
          "transition-[background-color,box-shadow] duration-200 ease-out",
          isOn ? "bg-neutral-900" : "bg-neutral-100",
        ].join(" ")}
        style={{
          boxShadow: isOn
            ? "0 1px 3px rgba(0,0,0,0.25), 0 2px 6px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "inset 0 1px 2px rgba(17,17,17,0.08), inset 0 0 0 1px rgba(17,17,17,0.08)",
        }}
      >
        <span
          className="absolute top-1/2 w-5 h-5 rounded-lg bg-white"
          style={{
            left: 3,
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.12), 0 2px 6px -1px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.04)",
            transform: isOn
              ? "translateX(20px) translateY(-50%)"
              : "translateX(0px) translateY(-50%)",
            transition: "transform 220ms cubic-bezier(0.34,1.5,0.64,1)",
          }}
        />
      </div>
    </div>
  );
}
