import React from "react";

interface DataListItem {
  label: string;
  value: React.ReactNode;
}

interface DataListProps {
  items: DataListItem[];
  columns?: 1 | 2;
  className?: string;
}

const lightSurface =
  "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(253,253,253,1) 60%, rgba(248,248,248,1) 100%)";

const lightShadow =
  "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.04), inset 0 1px 0 rgba(255,255,255,0.9)";

export function DataList({ items, columns = 1, className = "" }: DataListProps) {
  return (
    <div
      className={["rounded-2xl p-1.5", className].filter(Boolean).join(" ")}
      style={{
        background: lightSurface,
        boxShadow: lightShadow,
      }}
    >
      <div className="bg-white rounded-xl overflow-hidden">
        <div
          className={[
            "grid",
            columns === 2 ? "grid-cols-2" : "grid-cols-1",
          ].join(" ")}
        >
          {items.map((item, i) => {
            const isLastRow =
              columns === 2
                ? i >= items.length - (items.length % 2 === 0 ? 2 : 1)
                : i === items.length - 1;

            return (
              <div
                key={i}
                className={[
                  "flex flex-col gap-1 px-4 py-3",
                  !isLastRow ? "border-b border-neutral-100" : "",
                  columns === 2 && i % 2 === 0 ? "border-r border-neutral-100" : "",
                ].join(" ")}
              >
                <dt className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
                  {item.label}
                </dt>
                <dd className="text-[13px] font-medium text-neutral-900">
                  {item.value}
                </dd>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
