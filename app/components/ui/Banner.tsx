"use client";

import { ReactNode } from "react";

const variantStyles: Record<
  "default" | "accent" | "warning",
  { background: string; className: string; shadow: string }
> = {
  default: {
    background: "linear-gradient(180deg, #171717 0%, #0a0a0a 100%)",
    className: "text-white",
    shadow:
      "0 1px 3px rgba(0,0,0,0.4), 0 4px 12px -3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  accent: {
    background: "linear-gradient(135deg, #171717 0%, #2a2a2a 100%)",
    className: "text-white",
    shadow:
      "0 1px 3px rgba(0,0,0,0.4), 0 4px 12px -3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  warning: {
    background: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
    className: "text-white",
    shadow:
      "0 1px 3px rgba(245,158,11,0.4), 0 4px 12px -3px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
  },
};

export function Banner({
  variant = "default",
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  className = "",
}: {
  variant?: "default" | "accent" | "warning";
  children: ReactNode;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: ReactNode;
  className?: string;
}) {
  const style = variantStyles[variant];

  return (
    <div
      className={`w-full rounded-2xl px-5 py-3.5 flex items-center ${style.className} ${className}`}
      style={{
        background: style.background,
        boxShadow: style.shadow,
      }}
    >
      {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}

      <span className="text-[13px] font-medium flex-1 text-center leading-relaxed">
        {children}
      </span>

      {action && <span className="ml-3 flex-shrink-0">{action}</span>}

      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-150"
          aria-label="Dismiss"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
