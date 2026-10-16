"use client";

import React, { useState, useCallback, useRef } from "react";

export interface ReactionItem {
  emoji: string;
  label: string;
  count: number;
  active?: boolean;
}

interface ReactionBarProps {
  reactions?: ReactionItem[];
  className?: string;
}

const defaultReactions: ReactionItem[] = [
  { emoji: "👏", label: "Аплодисменты", count: 0 },
  { emoji: "❤️", label: "Нравится", count: 0 },
  { emoji: "🔥", label: "Огонь", count: 0 },
  { emoji: "💡", label: "Полезно", count: 0 },
  { emoji: "🎉", label: "Празднуем", count: 0 },
];

export function ReactionBar({
  reactions: initialReactions,
  className = "",
}: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionItem[]>(
    initialReactions ?? defaultReactions
  );
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(
    (index: number) => {
      setReactions((prev) =>
        prev.map((r, i) => {
          if (i !== index) return r;
          return {
            ...r,
            active: !r.active,
            count: r.active ? r.count - 1 : r.count + 1,
          };
        })
      );

      const key = reactions[index].label;
      setAnimatingKey(key);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setAnimatingKey(null), 300);
    },
    [reactions]
  );

  return (
    <div
      className={["flex flex-wrap gap-2", className].filter(Boolean).join(" ")}
    >
      {reactions.map((reaction, index) => {
        const isAnimating = animatingKey === reaction.label;
        return (
          <button
            key={reaction.label}
            onClick={() => handleClick(index)}
            aria-label={`${reaction.label} (${reaction.count})`}
            className={[
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200",
              reaction.active
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-50",
            ].join(" ")}
            style={{
              transform: isAnimating ? "scale(1.08)" : "scale(1)",
              boxShadow: reaction.active
                ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.15)"
                : "0 1px 2px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.06)",
              transition:
                "transform 250ms cubic-bezier(0.34, 1.4, 0.64, 1), background-color 200ms ease, color 200ms ease, box-shadow 200ms ease",
            }}
          >
            <span className="text-[15px] leading-none">{reaction.emoji}</span>
            <span
              className="tabular-nums leading-none"
              style={{
                transform: isAnimating ? "scale(1.15)" : "scale(1)",
                display: "inline-block",
                transition:
                  "transform 250ms cubic-bezier(0.34, 1.4, 0.64, 1)",
              }}
            >
              {reaction.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
