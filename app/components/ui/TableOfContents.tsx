"use client";

import React, { useState } from "react";

export interface TocItem {
  key: string;
  label: string;
  level: 1 | 2 | 3;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  className?: string;
}

const restShadow =
  "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)";

const indentByLevel: Record<1 | 2 | 3, string> = {
  1: "",
  2: "pl-4",
  3: "pl-8",
};

export function TableOfContents({
  items,
  activeKey,
  onSelect,
  className = "",
}: TableOfContentsProps) {
  const [internal, setInternal] = useState(items[0]?.key ?? "");
  const current = activeKey !== undefined ? activeKey : internal;

  const handleSelect = (key: string) => {
    setInternal(key);
    onSelect?.(key);
  };

  return (
    <div
      className={["rounded-2xl p-1.5", className].filter(Boolean).join(" ")}
      style={{
        background:
          "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
        boxShadow: restShadow,
      }}
    >
      <div className="relative bg-white rounded-xl overflow-hidden px-5 py-4">
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
          On this page
        </p>

        <div className="relative border-l border-neutral-200">
          {items.map((item) => {
            const isActive = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className={[
                  "relative w-full text-left text-[13px] py-1.5 cursor-pointer transition-colors duration-200 block",
                  indentByLevel[item.level],
                  isActive
                    ? "text-neutral-900 font-semibold"
                    : "text-neutral-500 hover:text-neutral-700",
                ].join(" ")}
                style={{
                  paddingLeft:
                    item.level === 1
                      ? "16px"
                      : item.level === 2
                        ? "32px"
                        : "48px",
                }}
              >
                {/* Active indicator */}
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full transition-all duration-250"
                  style={{
                    background: isActive ? "#171717" : "transparent",
                    transform: `translateY(-50%) scaleY(${isActive ? 1 : 0.4})`,
                    opacity: isActive ? 1 : 0,
                    marginLeft: "-1px",
                    transition:
                      "transform 280ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 200ms ease, background 200ms ease",
                  }}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
