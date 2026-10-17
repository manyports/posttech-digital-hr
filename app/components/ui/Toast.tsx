"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";

type ToastVariant = "default" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (opts: {
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const variantConfig: Record<
  ToastVariant,
  { tileBg: string; tileText: string; icon: React.ReactNode }
> = {
  default: {
    tileBg: "bg-hero-foreground",
    tileText: "text-hero-on-foreground",
    icon: (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
      </svg>
    ),
  },
  success: {
    tileBg: "bg-primary",
    tileText: "text-hero-on-foreground",
    icon: (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  warning: {
    tileBg: "bg-warning",
    tileText: "text-hero-foreground",
    icon: (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  error: {
    tileBg: "bg-error",
    tileText: "text-hero-on-foreground",
    icon: (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

const TOAST_WIDTH = 340;
const VISIBLE_STACK = 3;
const STACK_OFFSET = 10;
const STACK_SCALE_STEP = 0.05;
const GAP = 10;
const ENTER_MS = 320;
const EXIT_MS = 220;
const SHIFT_MS = 420;

interface ToastCardProps {
  item: ToastItem;
  index: number;
  total: number;
  expanded: boolean;
  expandedOffset: number;
  exiting: boolean;
  entering: boolean;
  paused: boolean;
  onDismiss: (id: string) => void;
  onMeasure: (id: string, height: number) => void;
}

function ToastCard({
  item,
  index,
  total,
  expanded,
  expandedOffset,
  exiting,
  entering,
  paused,
  onDismiss,
  onMeasure,
}: ToastCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef(item.duration);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (!innerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (innerRef.current) onMeasure(item.id, innerRef.current.offsetHeight);
    });
    ro.observe(innerRef.current);
    onMeasure(item.id, innerRef.current.offsetHeight);
    return () => ro.disconnect();
  }, [item.id, onMeasure]);

  useEffect(() => {
    if (exiting) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    if (paused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        if (startRef.current !== null) {
          remainingRef.current = Math.max(
            0,
            remainingRef.current - (Date.now() - startRef.current),
          );
        }
      }
      return;
    }
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, remainingRef.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, exiting, item.id, onDismiss]);

  const { tileBg, tileText, icon } = variantConfig[item.variant];

  const hidden = !expanded && index >= VISIBLE_STACK;

  const collapsedTransform = `translateX(-50%) translateY(${
    index * STACK_OFFSET
  }px) scale(${1 - index * STACK_SCALE_STEP})`;

  const expandedTransform = `translateX(-50%) translateY(${expandedOffset}px) scale(1)`;

  let transform = expanded ? expandedTransform : collapsedTransform;
  let opacity = hidden ? 0 : 1;

  if (entering) {
    transform = `translateX(-50%) translateY(-14px) scale(0.96)`;
    opacity = 0;
  }
  if (exiting) {
    transform = expanded
      ? `translateX(-50%) translateY(${expandedOffset - 12}px) scale(0.96)`
      : `translateX(-50%) translateY(${
          index * STACK_OFFSET - 12
        }px) scale(${1 - index * STACK_SCALE_STEP - 0.02})`;
    opacity = 0;
  }

  return (
    <div
      ref={ref}
      className="absolute top-0 left-1/2 pointer-events-auto"
      style={{
        width: TOAST_WIDTH,
        transform,
        opacity,
        zIndex: total - index,
        transformOrigin: "top center",
        transition: `transform ${SHIFT_MS}ms cubic-bezier(0.32,0.72,0,1), opacity ${
          exiting ? EXIT_MS : ENTER_MS
        }ms ease`,
      }}
    >
      <div
        ref={innerRef}
        className="rounded-2xl p-1.5"
        style={{
          background:
            "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
          boxShadow:
            "0 4px 16px -4px rgba(17,17,17,0.10), 0 16px 48px -12px rgba(17,17,17,0.18), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        <div className="bg-hero-elevated rounded-xl px-3.5 py-3 flex items-start gap-3">
          <div
            className={[
              "shrink-0 w-6 h-6 rounded-md flex items-center justify-center",
              tileBg,
              tileText,
            ].join(" ")}
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0 pt-px">
            <p className="text-[13px] font-semibold text-hero-foreground leading-tight tracking-[-0.01em]">
              {item.title}
            </p>
            {item.description && (
              <p className="text-[12px] text-tertiary mt-0.5 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(item.id)}
            aria-label="Закрыть"
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-tertiary hover:text-hero-muted hover-wipe transition-colors cursor-pointer"
          >
            <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const [entering, setEntering] = useState<Set<string>>(new Set());
  const counter = useRef(0);

  const reportHeight = useCallback((id: string, h: number) => {
    setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);

  const dismiss = useCallback((id: string) => {
    setExiting((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setHeights((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, EXIT_MS);
  }, []);

  const toast = useCallback(
    (opts: {
      title: string;
      description?: string;
      variant?: ToastVariant;
      duration?: number;
    }) => {
      const id = `toast-${++counter.current}`;
      const item: ToastItem = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? "default",
        duration: opts.duration ?? 4000,
      };
      setToasts((prev) => [...prev, item]);
      setEntering((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEntering((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
      });
    },
    [],
  );

  const list = [...toasts].reverse();

  const expandedOffsets: number[] = [];
  let cum = 0;
  for (let i = 0; i < list.length; i++) {
    expandedOffsets.push(cum);
    cum += (heights[list[i].id] ?? 72) + GAP;
  }
  const expandedHeight = Math.max(0, cum - GAP);

  const topH = heights[list[0]?.id] ?? 72;
  const visibleCount = Math.min(list.length, VISIBLE_STACK);
  const collapsedHeight =
    list.length === 0
      ? 0
      : topH + Math.max(0, visibleCount - 1) * STACK_OFFSET;

  const containerHeight = expanded ? expandedHeight : collapsedHeight;

  const showCount = list.length - VISIBLE_STACK;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-[72px] left-1/2 z-50 pointer-events-none"
        style={{
          width: TOAST_WIDTH,
          transform: "translateX(-50%)",
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div
          className={list.length > 0 ? "relative pointer-events-auto" : "relative"}
          style={{
            width: TOAST_WIDTH,
            height: containerHeight,
            transition: `height ${SHIFT_MS}ms cubic-bezier(0.32,0.72,0,1)`,
          }}
        >
          {list.map((t, i) => (
            <ToastCard
              key={t.id}
              item={t}
              index={i}
              total={list.length}
              expanded={expanded}
              expandedOffset={expandedOffsets[i]}
              exiting={exiting.has(t.id)}
              entering={entering.has(t.id)}
              paused={expanded}
              onDismiss={dismiss}
              onMeasure={reportHeight}
            />
          ))}

          {!expanded && showCount > 0 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                top: collapsedHeight + 6,
                transition: `opacity ${ENTER_MS}ms ease`,
              }}
            >
              <span className="text-[10px] font-medium text-tertiary bg-hero-elevated/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-hero-border/70">
                +{showCount} more
              </span>
            </div>
          )}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
