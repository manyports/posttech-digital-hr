import React from "react";

interface ReadingTimeProps {
  minutes: number;
  className?: string;
}

export function ReadingTime({ minutes, className = "" }: ReadingTimeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 text-[12px] font-medium text-hero-muted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-tertiary"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {minutes} min read
    </span>
  );
}
