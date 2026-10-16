"use client";

import { useState, useCallback, ReactNode } from "react";

interface AccordionItem {
  key: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    for (const item of items) {
      if (item.defaultOpen) {
        defaults.add(item.key);
      }
    }
    return defaults;
  });

  const toggle = useCallback(
    (key: string) => {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          if (allowMultiple) {
            next.add(key);
          } else {
            next.clear();
            next.add(key);
          }
        }
        return next;
      });
    },
    [allowMultiple]
  );

  return (
    <div
      className={className}
      style={{
        borderRadius: 16,
        padding: 6,
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(253,253,253,1) 60%, rgba(248,248,248,1) 100%)",
        boxShadow:
          "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="bg-white rounded-xl overflow-hidden">
        {items.map((item, index) => {
          const isOpen = openKeys.has(item.key);
          const isLast = index === items.length - 1;

          return (
            <div
              key={item.key}
              className={isLast ? "" : "border-b border-neutral-100"}
            >
              <button
                type="button"
                onClick={() => toggle(item.key)}
                className="w-full flex items-center justify-between py-3.5 px-4 text-[13px] font-semibold text-neutral-900 cursor-pointer hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <span>{item.title}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-400 shrink-0 ml-2"
                  style={{
                    transition:
                      "transform 300ms cubic-bezier(0.34, 1.4, 0.64, 1)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 text-[13px] text-neutral-500 leading-relaxed">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
