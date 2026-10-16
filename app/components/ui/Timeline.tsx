import React from "react";

type TimelineVariant = "default" | "success" | "warning" | "accent";

interface TimelineItem {
  key: string;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  variant?: TimelineVariant;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const dotColors: Record<TimelineVariant, { bg: string; ring: string }> = {
  default: { bg: "bg-neutral-900", ring: "ring-neutral-900/20" },
  success: { bg: "bg-emerald-600", ring: "ring-emerald-600/20" },
  warning: { bg: "bg-amber-500", ring: "ring-amber-500/20" },
  accent: { bg: "bg-neutral-900", ring: "ring-neutral-900/20" },
};

const iconBgColors: Record<TimelineVariant, { bg: string; text: string }> = {
  default: { bg: "bg-neutral-100", text: "text-neutral-600" },
  success: { bg: "bg-emerald-50", text: "text-emerald-600" },
  warning: { bg: "bg-amber-50", text: "text-amber-600" },
  accent: { bg: "bg-neutral-100", text: "text-neutral-900" },
};

export function Timeline({ items, className = "" }: TimelineProps) {
  return (
    <div className={["flex flex-col", className].join(" ")}>
      {items.map((item, index) => {
        const variant = item.variant ?? "default";
        const isLast = index === items.length - 1;
        const hasIcon = !!item.icon;
        const { bg, ring } = dotColors[variant];
        const { bg: iconBg, text: iconText } = iconBgColors[variant];

        return (
          <div key={item.key} className="flex gap-3.5 relative">
            {/* Left column: dot/icon + line */}
            <div className="flex flex-col items-center shrink-0">
              {hasIcon ? (
                <div
                  className={[
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    iconBg,
                    iconText,
                  ].join(" ")}
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                  }}
                >
                  {item.icon}
                </div>
              ) : (
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <div
                    className={[
                      "w-2.5 h-2.5 rounded-full ring-4",
                      bg,
                      ring,
                    ].join(" ")}
                    style={{
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                  />
                </div>
              )}

              {/* Vertical connector line */}
              {!isLast && (
                <div className="w-px flex-1 bg-neutral-200 min-h-4 my-1" />
              )}
            </div>

            {/* Right column: content */}
            <div className={["flex-1 min-w-0", isLast ? "" : "pb-6"].join(" ")}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-semibold text-neutral-900 leading-snug pt-0.5">
                  {item.title}
                </p>
                {item.date && (
                  <span className="text-[11px] font-medium text-neutral-400 tabular-nums shrink-0 pt-1">
                    {item.date}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-[13px] text-neutral-500 leading-relaxed mt-1.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
