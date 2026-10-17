import React from "react";

type SkeletonVariant = "text" | "circle" | "rect" | "card";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  className = "",
}: SkeletonProps) {
  const base = "animate-skeleton-pulse bg-hero-cell-bg rounded-xl";

  if (variant === "circle") {
    return (
      <div
        className={[base, "rounded-full", className].join(" ")}
        style={{ width: width ?? 40, height: height ?? 40 }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={["rounded-2xl bg-hero-elevated overflow-hidden", className].join(" ")}
        style={{
          boxShadow:
            "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div className={["w-full", base].join(" ")} style={{ height: height ?? 160 }} />
        <div className="p-5 flex flex-col gap-3">
          <div className={[base, "h-4 w-3/5"].join(" ")} />
          <div className={[base, "h-3 w-full"].join(" ")} />
          <div className={[base, "h-3 w-4/5"].join(" ")} />
        </div>
      </div>
    );
  }

  if (variant === "rect") {
    return (
      <div
        className={[base, className].join(" ")}
        style={{ width: width ?? "100%", height: height ?? 80 }}
      />
    );
  }

  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={[base, "h-3"].join(" ")}
          style={{
            width: width ?? (i === lines - 1 && lines > 1 ? "60%" : "100%"),
          }}
        />
      ))}
    </div>
  );
}
