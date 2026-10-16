import React from "react";

type BadgeVariant = "default" | "muted" | "accent";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-900 text-white",
  muted: "bg-neutral-100 text-neutral-500",
  accent: "bg-violet-100 text-violet-700",
};

const variantShadows: Record<BadgeVariant, string> = {
  default:
    "inset 0 0 0 1px rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.18)",
  muted:
    "inset 0 0 0 1px rgba(17,17,17,0.10), 0 1px 2px -1px rgba(17,17,17,0.06)",
  accent:
    "inset 0 0 0 1px rgba(124,58,237,0.22), 0 1px 2px -1px rgba(124,58,237,0.10)",
};

export function Badge({
  variant = "muted",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ boxShadow: variantShadows[variant] }}
    >
      {children}
    </span>
  );
}
