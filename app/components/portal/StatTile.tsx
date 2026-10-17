import React from "react";
import Link from "next/link";

/** Compact KPI tile in the design system's card language. */
export function StatTile({
  label,
  value,
  hint,
  href,
  tone = "light",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const body = (
    <div
      className="relative rounded-[20px] overflow-hidden p-5 h-full transition-shadow duration-300 hover:shadow-md"
      style={{
        background: dark ? "var(--color-hero-foreground)" : "var(--color-hero-elevated)",
        boxShadow: dark
          ? "0 2px 8px rgba(0,0,0,0.4), 0 8px 32px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1.5px 0 rgba(255,255,255,0.10)"
          : "0 1px 3px rgba(17,17,17,0.02), 0 4px 12px -2px rgba(17,17,17,0.05), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)",
      }}
    >
      <p className={["text-[11px] font-semibold uppercase tracking-[0.08em]", dark ? "text-hero-border" : "text-hero-muted"].join(" ")}>
        {label}
      </p>
      <p className={["mt-3 text-[38px] font-semibold tabular-nums tracking-[-0.04em] leading-none", dark ? "text-hero-on-foreground" : "text-hero-foreground"].join(" ")}>
        {value}
      </p>
      {hint && <p className={["mt-2.5 text-[12.5px] leading-snug", dark ? "text-tertiary" : "text-hero-muted"].join(" ")}>{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900">
      {body}
    </Link>
  ) : (
    body
  );
}
