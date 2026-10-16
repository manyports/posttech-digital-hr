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
        background: dark
          ? "radial-gradient(140% 100% at 30% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%), linear-gradient(180deg, #121212 0%, #0a0a0a 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(254,254,254,1) 40%, rgba(250,250,250,1) 100%)",
        boxShadow: dark
          ? "0 2px 8px rgba(0,0,0,0.4), 0 8px 32px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1.5px 0 rgba(255,255,255,0.10)"
          : "0 1px 3px rgba(17,17,17,0.02), 0 4px 12px -2px rgba(17,17,17,0.05), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)",
      }}
    >
      <p className={["text-[11px] font-semibold uppercase tracking-[0.08em]", dark ? "text-neutral-400" : "text-neutral-500"].join(" ")}>
        {label}
      </p>
      <p className={["mt-3 text-[38px] font-semibold tabular-nums tracking-[-0.04em] leading-none", dark ? "text-white" : "text-neutral-900"].join(" ")}>
        {value}
      </p>
      {hint && <p className={["mt-2.5 text-[12.5px] leading-snug", dark ? "text-neutral-400" : "text-neutral-500"].join(" ")}>{hint}</p>}
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
