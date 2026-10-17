import React from "react";

type BadgeVariant = "default" | "muted" | "accent";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-hero-elevated text-hero-foreground border border-hero-border",
  muted: "bg-hero-elevated text-hero-muted border border-hero-border",
  accent: "bg-hero-elevated text-hero-foreground border border-hero-border",
};

const dots: Record<BadgeVariant, string> = {
  default: "bg-hero-foreground",
  muted: "bg-additional",
  accent: "bg-primary",
};

export function Badge({
  variant = "muted",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={["w-1.5 h-1.5 rounded-full", dots[variant]].join(" ")} />
      {children}
    </span>
  );
}
