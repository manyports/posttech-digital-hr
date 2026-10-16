import React from "react";

interface SpotlightCardProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const lightSurface =
  "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(254,254,254,1) 40%, rgba(250,250,250,1) 100%)";
const darkSurface =
  "radial-gradient(140% 100% at 30% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%), linear-gradient(180deg, #121212 0%, #0a0a0a 100%)";

const lightShadow =
  "0 1px 3px rgba(17,17,17,0.02), 0 4px 12px -2px rgba(17,17,17,0.05), 0 8px 24px -4px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)";
const darkShadow =
  "0 2px 8px rgba(0,0,0,0.4), 0 8px 32px -4px rgba(0,0,0,0.5), 0 16px 48px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1.5px 0 rgba(255,255,255,0.10)";

const paddingBySize: Record<NonNullable<SpotlightCardProps["size"]>, string> = {
  sm: "p-6",
  md: "p-8",
  lg: "p-10",
};

const titleSizeBySize: Record<
  NonNullable<SpotlightCardProps["size"]>,
  string
> = {
  sm: "text-[20px]",
  md: "text-[26px]",
  lg: "text-[34px]",
};

export function SpotlightCard({
  title,
  subtitle,
  eyebrow,
  icon,
  actions,
  children,
  theme = "dark",
  size = "md",
  className = "",
}: SpotlightCardProps) {
  const dark = theme === "dark";

  return (
    <div
      className={[
        "relative rounded-[24px] overflow-hidden",
        paddingBySize[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: dark ? darkSurface : lightSurface,
        boxShadow: dark ? darkShadow : lightShadow,
      }}
    >
      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,0.08), transparent 75%)",
          }}
        />
      )}

      <div className="relative flex flex-col gap-4">
        {icon && (
          <div
            className={[
              "w-11 h-11 rounded-[12px] flex items-center justify-center mb-2",
              dark
                ? "bg-white/8 text-white ring-1 ring-inset ring-white/12"
                : "bg-neutral-900/5 text-neutral-800 ring-1 ring-inset ring-neutral-900/10",
            ].join(" ")}
            style={{
              boxShadow: dark
                ? "inset 0 1.5px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.3)"
                : "inset 0 1.5px 0 rgba(255,255,255,0.95), 0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {icon}
          </div>
        )}

        {eyebrow && (
          <p
            className={[
              "text-[11.5px] font-bold uppercase tracking-[0.12em]",
              dark ? "text-neutral-400" : "text-neutral-600",
            ].join(" ")}
          >
            {eyebrow}
          </p>
        )}

        <p
          className={[
            titleSizeBySize[size],
            "leading-[1.15] tracking-[-0.02em]",
            dark ? "text-white" : "text-neutral-900",
          ].join(" ")}
        >
          {title}
        </p>

        {subtitle && (
          <p
            className={[
              "text-[15px] leading-[1.6] max-w-lg",
              dark ? "text-neutral-400" : "text-neutral-600",
            ].join(" ")}
          >
            {subtitle}
          </p>
        )}

        {children}

        {actions && (
          <div className="flex items-center gap-2.5 mt-4">{actions}</div>
        )}
      </div>
    </div>
  );
}
