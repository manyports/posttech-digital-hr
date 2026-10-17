"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

interface CommandItem {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect?: () => void;
}

interface CommandSection {
  title: string;
  items: CommandItem[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  sections: CommandSection[];
  placeholder?: string;
  className?: string;
}

const CLOSE_MS = 240;

export function CommandPalette({
  open,
  onClose,
  sections,
  placeholder = "Поиск команд…",
  className = "",
}: CommandPaletteProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter sections based on query
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, query]);

  // Flat list of all visible items for keyboard nav
  const flatItems = useMemo(
    () => filtered.flatMap((s) => s.items),
    [filtered],
  );

  // Mount / unmount lifecycle (matches Modal pattern)
  useEffect(() => {
    if (open) {
      setMounted(true);
      setQuery("");
      setActiveIndex(0);
      return;
    }
    if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), CLOSE_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  // Enter animation (matches Modal pattern)
  useLayoutEffect(() => {
    if (!mounted || !open || visible) return;

    const el = dialogRef.current;
    if (el) {
      void el.getBoundingClientRect();
    }

    const id = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, [mounted, open, visible]);

  // Focus input when visible
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-command-index="${activeIndex}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Handle selection
  const handleSelect = useCallback(
    (item: CommandItem) => {
      item.onSelect?.();
      onClose();
    },
    [onClose],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => (i + 1 >= flatItems.length ? 0 : i + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) =>
            i - 1 < 0 ? Math.max(flatItems.length - 1, 0) : i - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatItems[activeIndex]) {
            handleSelect(flatItems[activeIndex]);
          }
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, flatItems, activeIndex, handleSelect]);

  // Focus trap
  useEffect(() => {
    if (!open || !mounted || !visible) return;
    const el = dialogRef.current;
    if (!el) return;

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [open, mounted, visible]);

  if (!mounted) return null;

  let itemIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[min(20vh,140px)] px-4">
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-hero-foreground/40 backdrop-blur-sm",
          "transition-opacity ease-out",
          visible ? "opacity-100 duration-300" : "opacity-0 duration-200",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Palette panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={[
          "relative z-10 w-full max-w-lg rounded-2xl p-1.5 overflow-hidden",
          "transition-all ease-[cubic-bezier(0.34,1.4,0.64,1)]",
          visible
            ? "opacity-100 scale-100 translate-y-0 duration-300"
            : "opacity-0 scale-[0.94] translate-y-3 duration-200",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background:
            "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
          boxShadow:
            "0 8px 24px -8px rgba(17,17,17,0.18), 0 32px 80px -16px rgba(17,17,17,0.28), 0 0 0 1px rgba(17,17,17,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        <div className="bg-hero-elevated rounded-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3">
            <svg
              className="shrink-0 text-tertiary"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-w-0 text-[14px] font-medium text-hero-foreground placeholder:text-tertiary bg-transparent border-none outline-none"
            />
            <kbd className="shrink-0 px-1.5 py-0.5 rounded-md bg-hero-cell-bg text-[11px] font-semibold text-tertiary border border-hero-border select-none">
              esc
            </kbd>
          </div>

          {/* Separator */}
          <div className="border-b border-hero-border" />

          {/* Results */}
          <div
            ref={listRef}
            className="max-h-[320px] overflow-y-auto py-2 px-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-hero-border [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-tertiary">
                Ничего не найдено
              </div>
            ) : (
              filtered.map((section, si) => (
                <div key={section.title} className={si > 0 ? "mt-3" : ""}>
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-tertiary uppercase tracking-widest select-none">
                    {section.title}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const currentIndex = itemIndex++;
                      const isActive = currentIndex === activeIndex;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          data-command-index={currentIndex}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                          className={[
                            "group/cmd flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors duration-100 cursor-pointer outline-none",
                            isActive ? "bg-hero-cell-bg" : "",
                          ].join(" ")}
                        >
                          {item.icon && (
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center text-hero-muted">
                              {item.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-[13px] font-semibold text-hero-foreground truncate">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="text-[12px] text-hero-muted truncate">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.shortcut && (
                            <kbd className="shrink-0 px-1.5 py-0.5 rounded-md bg-hero-cell-bg text-[11px] font-semibold text-tertiary border border-hero-border select-none">
                              {item.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
