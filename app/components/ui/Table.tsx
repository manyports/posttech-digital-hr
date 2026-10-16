import React from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  title?: string;
  description?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  title,
  description,
  className = "",
  onRowClick,
}: TableProps<T>) {
  return (
    <div
      className={["w-full rounded-2xl bg-white overflow-hidden", className].join(" ")}
      style={{
        boxShadow:
          "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {(title || description) && (
        <div
          className="px-5 py-4 border-b border-neutral-100"
          style={{
            background:
              "linear-gradient(180deg, rgba(252,252,252,1) 0%, rgba(249,249,249,1) 100%)",
          }}
        >
          {title && <p className="text-[13px] font-semibold text-neutral-900 tracking-[-0.01em]">{title}</p>}
          {description && <p className="text-[12px] text-neutral-400 mt-0.5">{description}</p>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={col.width ? { width: col.width } : undefined}
                  className={[
                    "px-5 py-3 bg-neutral-50 text-[11px] font-semibold text-neutral-400 uppercase tracking-wide whitespace-nowrap",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                  ].join(" ")}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                onClick={() => onRowClick?.(row)}
                className={[
                  "border-b border-neutral-100 last:border-0",
                  "transition-colors duration-100",
                  onRowClick ? "cursor-pointer hover:bg-neutral-50" : "",
                ].join(" ")}
              >
                {columns.map((col, ci) => {
                  const val = row[col.key as keyof T] as unknown;
                  return (
                    <td
                      key={String(col.key)}
                      className={[
                        "px-5 py-3.5 text-[13px]",
                        ci === 0
                          ? "font-medium text-neutral-900"
                          : "text-neutral-500 tabular-nums",
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                      ].join(" ")}
                    >
                      {col.render ? col.render(val, row) : String(val ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <p className="text-[13px] font-medium text-neutral-400">No results</p>
                  <p className="text-[12px] text-neutral-300 mt-0.5">Nothing to show here yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
