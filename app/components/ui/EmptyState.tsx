import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "rounded-2xl p-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background:
          "linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(248,248,248,1) 100%)",
        boxShadow:
          "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="bg-white rounded-xl flex flex-col items-center justify-center text-center py-14 px-6">
        {icon && (
          <div
            className="w-11 h-11 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 mb-4 ring-1 ring-inset ring-neutral-900/5"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {icon}
          </div>
        )}
        <p className="text-[14px] font-semibold text-neutral-900 tracking-[-0.01em]">{title}</p>
        {description && (
          <p className="text-[13px] text-neutral-400 mt-1.5 max-w-xs leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
