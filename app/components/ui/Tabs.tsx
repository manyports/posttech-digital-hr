"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";

interface Tab {
  key: string;
  label: string;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className = "" }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key ?? "");
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const measurePill = (key: string) => {
    const btn = btnRefs.current[key];
    const list = listRef.current;
    if (!btn || !list) return;
    const lr = list.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setPill({ left: br.left - lr.left, width: br.width, ready: true });
  };

  useLayoutEffect(() => { measurePill(active); }, []);
  useEffect(() => { measurePill(active); }, [active]);

  useEffect(() => {
    const ro = new ResizeObserver(() => measurePill(active));
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [active]);

  const handleSelect = (key: string) => {
    const prevIndex = tabs.findIndex((t) => t.key === active);
    const nextIndex = tabs.findIndex((t) => t.key === key);
    setDirection(nextIndex > prevIndex ? "right" : "left");
    setActive(key);
    onChange?.(key);
  };

  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div className={["flex flex-col gap-4", className].join(" ")}>
      <div
        ref={listRef}
        role="tablist"
        className="relative flex w-full sm:inline-flex sm:w-auto items-center bg-hero-cell-bg rounded-xl p-1"
        style={{
          boxShadow:
            "inset 0 1px 2px rgba(17,17,17,0.06), inset 0 0 0 1px rgba(17,17,17,0.04)",
        }}
      >
        {pill.ready && (
          <span
            aria-hidden
            className="absolute top-1 bottom-1 rounded-lg bg-hero-elevated pointer-events-none"
            style={{
              left: pill.left,
              width: pill.width,
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.06), 0 2px 6px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(17,17,17,0.04)",
              transition: "left 280ms cubic-bezier(0.34,1.4,0.64,1), width 280ms cubic-bezier(0.34,1.4,0.64,1)",
            }}
          />
        )}

        {tabs.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => { btnRefs.current[tab.key] = el; }}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => handleSelect(tab.key)}
            className={[
              "relative z-10 flex-1 sm:flex-none px-3 py-2 rounded-lg text-[13px] font-medium text-center whitespace-nowrap cursor-pointer transition-colors duration-150",
              active === tab.key ? "text-hero-foreground" : "text-tertiary hover:text-hero-muted",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab?.content && (
        <div
          key={active}
          role="tabpanel"
          className={[
            "text-[13px] text-hero-muted leading-relaxed",
            direction === "right" ? "animate-tab-slide-right" : "animate-tab-slide-left",
          ].join(" ")}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
