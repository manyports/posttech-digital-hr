"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";

interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarHeader {
  logo?: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface SidebarProps {
  sections: SidebarSection[];
  header?: SidebarHeader;
  defaultActive?: string;
  active?: string;
  onSelect?: (key: string) => void;
  className?: string;
}

export function Sidebar({
  sections,
  header,
  defaultActive = "",
  active,
  onSelect,
  className = "",
}: SidebarProps) {
  const [internal, setInternal] = useState(defaultActive);
  const current = active !== undefined ? active : internal;
  const [pill, setPill] = useState({ top: 0, height: 0, ready: false });
  const navRef = useRef<HTMLElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const measurePill = (key: string) => {
    const btn = btnRefs.current[key];
    const nav = navRef.current;
    if (!btn || !nav) return;
    const nr = nav.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setPill({ top: br.top - nr.top, height: br.height, ready: true });
  };

  useLayoutEffect(() => { measurePill(current); }, []);
  useEffect(() => { measurePill(current); }, [current]);

  useEffect(() => {
    const ro = new ResizeObserver(() => measurePill(current));
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [current]);

  const handleSelect = (key: string, disabled?: boolean) => {
    if (disabled) return;
    setInternal(key);
    onSelect?.(key);
  };

  return (
    <div
      className={["bg-hero-elevated rounded-2xl overflow-hidden", className].join(" ")}
      style={{
        boxShadow:
          "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {header && (
        <div className="px-3 py-3 border-b border-hero-border flex items-center gap-2.5">
          {header.logo && (
            <div className="w-7 h-7 rounded-lg bg-hero-foreground flex items-center justify-center shrink-0 text-hero-on-foreground">
              {header.logo}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-hero-foreground leading-none truncate">{header.title}</p>
            {header.subtitle && (
              <p className="text-[11px] text-tertiary mt-0.5 leading-none truncate">{header.subtitle}</p>
            )}
          </div>
          <button className="shrink-0 w-5 h-5 flex items-center justify-center text-tertiary hover:text-hero-muted transition-colors cursor-pointer rounded-md hover-wipe">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
            </svg>
          </button>
        </div>
      )}

      <nav ref={navRef} className="relative p-2 flex flex-col gap-4">
        {pill.ready && (
          <span
            aria-hidden
            className="absolute left-2 right-2 rounded-xl bg-hero-foreground pointer-events-none z-0"
            style={{
              top: pill.top,
              height: pill.height,
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.35), 0 4px 12px -3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition:
                "top 280ms cubic-bezier(0.34,1.4,0.64,1), height 280ms cubic-bezier(0.34,1.4,0.64,1)",
            }}
          />
        )}

        {sections.map((section, si) => (
          <div key={si} className="flex flex-col gap-0.5">
            {section.title && (
              <p className="relative z-10 px-2 pt-1 pb-1.5 text-[10px] font-semibold text-tertiary uppercase tracking-widest">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = current === item.key;
              return (
                <button
                  key={item.key}
                  ref={(el) => { btnRefs.current[item.key] = el; }}
                  onClick={() => handleSelect(item.key, item.disabled)}
                  disabled={item.disabled}
                  className={[
                    "relative z-10 w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-left",
                    "transition-colors duration-200 cursor-pointer",
                    "disabled:opacity-35 disabled:pointer-events-none",
                    isActive
                      ? "text-hero-on-foreground"
                      : "text-hero-muted hover:text-hero-foreground hover-wipe",
                  ].join(" ")}
                >
                  {item.icon && (
                    <span
                      className={[
                        "shrink-0 w-[22px] h-[22px] rounded-md flex items-center justify-center transition-colors duration-200",
                        isActive ? "bg-hero-on-foreground/15" : "bg-hero-cell-bg text-hero-muted",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>
                  )}

                  <span className="flex-1 truncate">{item.label}</span>

                  {item.badge !== undefined && (
                    <span
                      className={[
                        "shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded-md tabular-nums leading-none transition-colors duration-200",
                        isActive
                          ? "bg-hero-elevated/20 text-hero-on-foreground/80"
                          : "bg-hero-cell-bg text-tertiary",
                      ].join(" ")}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
