import React from "react";

const SHELL_SHADOW =
  "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)";
const SHELL_BG = "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)";

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
      className={["rounded-2xl p-1.5", className].filter(Boolean).join(" ")}
      style={{ background: SHELL_BG, boxShadow: SHELL_SHADOW }}
    >
      <div className="bg-white rounded-xl overflow-hidden">
        {(title || actions) && (
          <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-neutral-100">
            <div className="min-w-0">
              {title && (
                <h2 className="text-[13px] font-semibold text-neutral-900 tracking-[-0.01em]">{title}</h2>
              )}
              {description && <p className="text-[12px] text-neutral-400 mt-0.5">{description}</p>}
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
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight">{title}</h1>
        {description && <p className="text-[14px] text-neutral-500 mt-1.5 max-w-xl leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Загрузка"
      className={["inline-block w-4 h-4 rounded-full border-2 border-neutral-200 border-t-neutral-700 animate-spin", className].join(" ")}
    />
  );
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-skeleton-pulse bg-white/70 rounded-2xl h-24" />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Panel padding="p-6">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 text-[13px] font-semibold">!</div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-neutral-900">Что-то пошло не так</p>
          <p className="text-[13px] text-neutral-500 mt-0.5">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 text-[13px] font-medium text-neutral-900 underline underline-offset-2 cursor-pointer">
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function AccessDenied({
  message = "У вас нет доступа к этой странице.",
}: {
  message?: string;
}) {
  return (
    <Panel padding="p-10">
      <div className="text-center max-w-sm mx-auto">
        <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-4 text-[15px] font-semibold">403</div>
        <p className="text-[15px] font-semibold tracking-[-0.01em]">Доступ запрещен</p>
        <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">{message}</p>
        <p className="text-[11.5px] text-neutral-400 mt-3">Ограничение действует на уровне сервера, а не только скрыто в интерфейсе.</p>
      </div>
    </Panel>
  );
}
