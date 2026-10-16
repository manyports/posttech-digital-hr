import React from "react";

type CardTheme = "light" | "dark";

interface SplitCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  actions?: React.ReactNode;
  theme?: CardTheme;
  className?: string;
  children?: React.ReactNode;
  layout?: "split";
}

interface StackCardProps {
  title?: string;
  badge?: React.ReactNode;
  subtitle?: string;
  note?: string;
  image?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageBg?: string;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  layout: "stack";
}

type CardProps = SplitCardProps | StackCardProps;

const shadows = {
  light:
    "0 1px 3px rgba(17,17,17,0.02), 0 4px 12px -2px rgba(17,17,17,0.05), 0 8px 24px -4px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)",
  lightHover:
    "0 2px 6px rgba(17,17,17,0.03), 0 8px 24px -4px rgba(17,17,17,0.08), 0 16px 48px -8px rgba(17,17,17,0.10), 0 32px 96px -16px rgba(17,17,17,0.08), 0 0 0 1px rgba(17,17,17,0.08), inset 0 2px 0 rgba(255,255,255,1)",
  dark:
    "0 2px 8px rgba(0,0,0,0.4), 0 8px 32px -4px rgba(0,0,0,0.5), 0 16px 48px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1.5px 0 rgba(255,255,255,0.10)",
  darkHover:
    "0 4px 12px rgba(0,0,0,0.5), 0 12px 40px -4px rgba(0,0,0,0.6), 0 24px 64px -8px rgba(0,0,0,0.5), 0 48px 128px -16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.12), inset 0 2px 0 rgba(255,255,255,0.14)",
};

const lightSurface =
  "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(254,254,254,1) 40%, rgba(250,250,250,1) 100%)";

const darkSurface =
  "radial-gradient(140% 100% at 30% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%), linear-gradient(180deg, #121212 0%, #0a0a0a 100%)";

function SplitImagePlaceholder({ dark }: { dark?: boolean }) {
  return (
    <div
      className={[
        "relative w-full h-full overflow-hidden",
        dark ? "bg-neutral-900" : "bg-neutral-50",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(100% 70% at 90% 100%, rgba(255,255,255,0.04), transparent 60%)"
            : "radial-gradient(120% 80% at 20% 0%, rgba(0,0,0,0.05), transparent 55%), radial-gradient(100% 70% at 90% 100%, rgba(0,0,0,0.025), transparent 60%)",
        }}
      />
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          className={["w-8 h-8", dark ? "text-white/25" : "text-neutral-300"].join(" ")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}

function StackImagePlaceholder({ bg }: { bg?: string }) {
  return (
    <div
      className={[
        "relative w-full h-full overflow-hidden flex items-center justify-center",
        bg ?? "bg-neutral-200",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 10%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(100% 70% at 80% 100%, rgba(0,0,0,0.12), transparent 60%)",
        }}
      />
      <svg
        className="relative w-12 h-12 text-white/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

export function Card(props: CardProps) {
  if (props.layout === "stack") {
    const {
      title,
      badge,
      subtitle,
      note,
      image,
      imageSrc,
      imageAlt = "",
      imageBg,
      actions,
      className = "",
      children,
    } = props;

    const imageSlot = image ? (
      image
    ) : imageSrc ? (
      <img
        src={imageSrc}
        alt={imageAlt}
        className="w-full h-full object-cover"
      />
    ) : (
      <StackImagePlaceholder bg={imageBg} />
    );

    return (
      <div
        className={[
          "group/card relative rounded-[24px] overflow-hidden",
          "transition-all duration-500 ease-out",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: lightSurface,
          boxShadow: shadows.light,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 ease-out group-hover/card:opacity-100"
          style={{ boxShadow: shadows.lightHover }}
        />

        <div className="relative p-4 pb-0">
          <div className="h-56 rounded-[18px] overflow-hidden relative">
            {imageSlot}
          </div>
        </div>

        <div className="relative flex flex-col items-center text-center gap-3 px-9 py-8">
          {(title || badge) && (
            <div className="flex items-center justify-center gap-2.5">
              {title && (
                <p className="text-[17px] font-semibold text-neutral-900 tracking-[-0.015em]">
                  {title}
                </p>
              )}
              {badge && badge}
            </div>
          )}
          {subtitle && (
            <p className="text-[14px] text-neutral-600 leading-[1.6] max-w-[280px] whitespace-pre-line">
              {subtitle}
            </p>
          )}
          {children}
          {actions && (
            <div className="flex items-center justify-center gap-2.5 mt-2">
              {actions}
            </div>
          )}
          {note && (
            <p className="text-[11.5px] text-neutral-400 leading-relaxed max-w-xs mt-2">
              {note}
            </p>
          )}
        </div>
      </div>
    );
  }

  const {
    title,
    subtitle,
    icon,
    image,
    imageSrc,
    imageAlt = "",
    actions,
    theme = "light",
    className = "",
    children,
  } = props as SplitCardProps;
  const dark = theme === "dark";

  const imageSlot = image ? (
    image
  ) : imageSrc ? (
    <img
      src={imageSrc}
      alt={imageAlt}
      className="w-full h-full object-cover"
    />
  ) : (
    <SplitImagePlaceholder dark={dark} />
  );

  return (
    <div
      className={[
        "group/card relative rounded-[24px] overflow-hidden flex min-h-[200px]",
        "transition-all duration-500 ease-out",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: dark ? darkSurface : lightSurface,
        boxShadow: dark ? shadows.dark : shadows.light,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 ease-out group-hover/card:opacity-100"
        style={{ boxShadow: dark ? shadows.darkHover : shadows.lightHover }}
      />

      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[24px] opacity-70"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,0.08), transparent 75%)",
          }}
        />
      )}

      <div className="relative flex flex-col justify-between p-6 flex-1 min-w-0">
        {icon && (
          <div
            className={[
              "w-9 h-9 rounded-[11px] flex items-center justify-center",
              dark
                ? "bg-white/8 text-neutral-100 ring-1 ring-inset ring-white/10"
                : "bg-neutral-900/5 text-neutral-700 ring-1 ring-inset ring-neutral-900/8",
            ].join(" ")}
            style={{
              boxShadow: dark
                ? "inset 0 1.5px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.3)"
                : "inset 0 1.5px 0 rgba(255,255,255,0.95), 0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-1 mt-auto">
          {title && (
            <p
              className={[
                "text-[16px] font-semibold leading-snug tracking-[-0.015em]",
                dark ? "text-white" : "text-neutral-900",
              ].join(" ")}
            >
              {title}
            </p>
          )}
          {subtitle && (
            <p
              className={[
                "text-[13.5px] leading-[1.5]",
                dark ? "text-neutral-400" : "text-neutral-600",
              ].join(" ")}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {actions && <div className="flex gap-2.5 mt-4">{actions}</div>}
      </div>
      <div className="relative w-[45%] shrink-0 p-4 pl-0">
        <div className="h-full rounded-[18px] overflow-hidden relative">
          {imageSlot}
        </div>
      </div>
    </div>
  );
}

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function CardGrid({ children, className = "" }: CardGridProps) {
  return (
    <div
      className={[
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
