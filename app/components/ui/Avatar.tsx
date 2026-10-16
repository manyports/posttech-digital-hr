import React from "react";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-[12px]",
  lg: "w-12 h-12 text-[14px]",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = name ? getInitials(name) : "?";

  return (
    <div
      className={[
        "relative shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-neutral-100 font-medium text-neutral-500 select-none",
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {src ? (
        <img src={src} alt={alt || name || ""} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(17,17,17,0.05)",
        }}
      />
    </div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

const overlapStyles: Record<AvatarSize, string> = {
  sm: "-ml-2",
  md: "-ml-2.5",
  lg: "-ml-3",
};

export function AvatarGroup({
  children,
  max = 5,
  size = "md",
  className = "",
}: AvatarGroupProps) {
  const items = React.Children.toArray(children);
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div className={["flex items-center", className].join(" ")}>
      {visible.map((child, i) => (
        <div
          key={i}
          className={[
            "ring-2 ring-white rounded-full",
            i > 0 ? overlapStyles[size] : "",
          ].join(" ")}
        >
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={[
            "ring-2 ring-white rounded-full flex items-center justify-center bg-neutral-200 font-medium text-neutral-500 select-none",
            overlapStyles[size],
            sizeStyles[size],
          ].join(" ")}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
