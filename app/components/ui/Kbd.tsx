import { ReactNode } from "react";

export function Kbd({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md text-[11px] font-semibold text-hero-muted bg-hero-cell-bg border border-hero-border/80 ${className}`}
      style={{
        boxShadow:
          "0 1px 0 rgba(17,17,17,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {children}
    </kbd>
  );
}
