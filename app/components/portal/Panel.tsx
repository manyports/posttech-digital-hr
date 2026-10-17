import React from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const SHELL_SHADOW = "var(--surface-shadow)";
const SHELL_BG = "var(--surface-bg)";

interface PanelProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Tailwind padding for the white inner area. `""` = flush (for lists/tables). */
  padding?: string;
  as?: "section" | "div";
}

/**
 * The design system's card shell (gradient outer ring + white inner), used by
 * Alert / EmptyState / DataList, as a general-purpose container.
 */
export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
  padding = "p-5",
  as: Tag = "section",
}: PanelProps) {
  return (
    <Tag
      className={["surface-matte rounded-2xl p-1.5", className].filter(Boolean).join(" ")}
      style={{ background: SHELL_BG, boxShadow: SHELL_SHADOW }}
    >
      <div className="bg-hero-elevated rounded-xl overflow-hidden">
        {(title || actions) && (
          <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-hero-border">
            <div className="min-w-0">
              {title && (
                <h2 className="app-tab text-hero-foreground">{title}</h2>
              )}
              {description && <p className="text-[12px] text-tertiary mt-0.5">{description}</p>}
            </div>
            {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className={padding}>{children}</div>
      </div>
    </Tag>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="app-page-title text-hero-foreground">{title}</h1>
        {description && <p className="app-body text-hero-muted mt-1.5 max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  const { m } = useI18n();
  return (
    <span
      role="status"
      aria-label={m.common.loading}
      className={["inline-block w-4 h-4 rounded-full border-2 border-hero-border border-t-neutral-700 animate-spin", className].join(" ")}
    />
  );
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-skeleton-pulse bg-hero-elevated/70 rounded-2xl h-24" />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { m } = useI18n();
  return (
    <Panel padding="p-6">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-error text-hero-on-foreground flex items-center justify-center shrink-0 text-[13px] font-semibold">!</div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-hero-foreground">{m.common.errorTitle}</p>
          <p className="text-[13px] text-hero-muted mt-0.5">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 text-[13px] font-medium text-hero-foreground underline underline-offset-2 cursor-pointer">
              {m.common.retry}
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function AccessDenied({ message }: { message?: string }) {
  const { m } = useI18n();
  return (
    <Panel padding="p-10">
      <div className="text-center max-w-sm mx-auto">
        <div className="w-11 h-11 rounded-xl bg-hero-foreground text-hero-on-foreground flex items-center justify-center mx-auto mb-4 text-[15px] font-semibold">403</div>
        <p className="text-[15px] font-semibold tracking-[-0.01em]">{m.common.deniedTitle}</p>
        <p className="text-[13px] text-hero-muted mt-1.5 leading-relaxed">{message ?? m.common.deniedBody}</p>
        <p className="text-[11.5px] text-tertiary mt-3">{m.common.deniedNote}</p>
      </div>
    </Panel>
  );
}
