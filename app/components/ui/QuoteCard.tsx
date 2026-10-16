import React from "react";

interface QuoteCardProps {
  quote: string;
  author: string;
  role?: string;
  avatarSrc?: string;
  theme?: "light" | "dark";
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

export function QuoteCard({
  quote,
  author,
  role,
  avatarSrc,
  theme = "light",
  className = "",
}: QuoteCardProps) {
  const dark = theme === "dark";

  return (
    <div
      className={[
        "relative rounded-[24px] overflow-hidden p-8",
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

      <div className="relative flex flex-col gap-8">
        <p
          className={[
            "text-[18px] leading-[1.65] tracking-[-0.012em] font-normal",
            dark ? "text-neutral-50" : "text-neutral-900",
          ].join(" ")}
        >
          {quote}
        </p>

        <div
          className={[
            "h-[1.5px] w-10 rounded-full",
            dark ? "bg-white/12" : "bg-neutral-900/12",
          ].join(" ")}
        />

        <div className="flex items-center gap-3.5">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt={author}
              className="w-10 h-10 rounded-full object-cover"
              style={{
                boxShadow: dark
                  ? "inset 0 0 0 1px rgba(255,255,255,0.14), 0 2px 6px rgba(0,0,0,0.5)"
                  : "inset 0 0 0 1px rgba(17,17,17,0.10), 0 2px 4px rgba(17,17,17,0.08)",
              }}
            />
          ) : (
            <div
              className={[
                "w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0",
                dark
                  ? "bg-white/12 text-white"
                  : "bg-neutral-100 text-neutral-700",
              ].join(" ")}
              style={{
                boxShadow: dark
                  ? "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 1.5px 0 rgba(255,255,255,0.10)"
                  : "inset 0 0 0 1px rgba(17,17,17,0.08), inset 0 1.5px 0 rgba(255,255,255,0.95)",
              }}
            >
              {author.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <p
              className={[
                "text-[14.5px] font-semibold tracking-[-0.008em] truncate",
                dark ? "text-white" : "text-neutral-900",
              ].join(" ")}
            >
              {author}
            </p>
            {role && (
              <p
                className={[
                  "text-[12.5px] truncate",
                  dark ? "text-neutral-500" : "text-neutral-600",
                ].join(" ")}
              >
                {role}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
