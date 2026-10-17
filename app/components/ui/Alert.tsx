import React from "react";

type AlertVariant = "default" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<AlertVariant, {
  tileBg: string;
  tileText: string;
  icon: React.ReactNode;
}> = {
  default: {
    tileBg: "bg-hero-foreground",
    tileText: "text-hero-on-foreground",
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
      </svg>
    ),
  },
  success: {
    tileBg: "bg-primary",
    tileText: "text-hero-on-foreground",
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  warning: {
    tileBg: "bg-warning",
    tileText: "text-hero-on-foreground",
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  error: {
    tileBg: "bg-error",
    tileText: "text-hero-on-foreground",
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

export function Alert({ variant = "default", title, description, onDismiss, className = "" }: AlertProps) {
  const { tileBg, tileText, icon } = variantConfig[variant];

  return (
    <div
      role="alert"
      className={[
        "rounded-2xl p-1.5",
        className,
      ].join(" ")}
      style={{
        background:
          "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
        boxShadow:
          "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="bg-hero-elevated rounded-xl px-4 py-3.5 flex items-start gap-3">
        <div
          className={["shrink-0 w-7 h-7 rounded-lg flex items-center justify-center", tileBg, tileText].join(" ")}
          style={{
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[13px] font-semibold text-hero-foreground leading-tight">{title}</p>
          {description && (
            <p className="text-[12px] text-tertiary mt-1 leading-relaxed">{description}</p>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-tertiary hover:text-hero-muted hover-wipe transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
