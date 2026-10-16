import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Навигация" className={["flex items-center gap-1.5", className].join(" ")}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="text-neutral-300 shrink-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast || !item.href ? (
              <span
                className={[
                  "text-[12px] shrink-0",
                  isLast
                    ? "font-medium text-neutral-900"
                    : "text-neutral-400",
                ].join(" ")}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
