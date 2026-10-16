"use client";

import React, { useState, useRef, useEffect } from "react";

interface TagInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  maxTags?: number;
  fullWidth?: boolean;
  className?: string;
}

interface AnimatedTag {
  text: string;
  state: "entering" | "visible" | "exiting";
}

export function TagInput({
  value,
  defaultValue = [],
  onChange,
  placeholder = "Добавить тег…",
  label,
  hint,
  maxTags,
  fullWidth = false,
  className = "",
}: TagInputProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const [input, setInput] = useState("");
  const [animTags, setAnimTags] = useState<AnimatedTag[]>(() =>
    (value ?? defaultValue).map((t) => ({ text: t, state: "visible" as const }))
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef<string[]>(value ?? defaultValue);

  const tags = value !== undefined ? value : internal;

  useEffect(() => {
    const prev = prevValueRef.current;
    const next = tags;

    const added = next.filter((t) => !prev.includes(t));
    const removed = prev.filter((t) => !next.includes(t));

    if (added.length === 0 && removed.length === 0) return;

    setAnimTags((current) => {
      let updated = current.map((at) =>
        removed.includes(at.text) ? { ...at, state: "exiting" as const } : at
      );
      added.forEach((t) => {
        if (!updated.find((at) => at.text === t)) {
          updated.push({ text: t, state: "entering" });
        }
      });
      return updated;
    });

    if (added.length > 0) {
      requestAnimationFrame(() => {
        setAnimTags((current) =>
          current.map((at) =>
            at.state === "entering" ? { ...at, state: "visible" } : at
          )
        );
      });
    }

    if (removed.length > 0) {
      setTimeout(() => {
        setAnimTags((current) => current.filter((at) => at.state !== "exiting"));
      }, 180);
    }

    prevValueRef.current = next;
  }, [tags]);

  const update = (next: string[]) => {
    setInternal(next);
    onChange?.(next);
  };

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    if (maxTags && tags.length >= maxTags) return;
    update([...tags, tag]);
    setInput("");
  };

  const removeTag = (index: number) => {
    const tagText = tags[index];
    if (!tagText) return;
    setAnimTags((current) =>
      current.map((at) =>
        at.text === tagText ? { ...at, state: "exiting" as const } : at
      )
    );
    setTimeout(() => {
      update(tags.filter((_, i) => i !== index));
    }, 180);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className={["flex flex-col gap-1.5", fullWidth ? "w-full" : ""].join(" ")}>
      {label && (
        <label className="text-[12.5px] font-medium text-neutral-700 tracking-[-0.005em]">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={[
          "flex flex-wrap items-center gap-1.5 rounded-xl px-3 py-2.5",
          "transition-[box-shadow,background] duration-200 ease-out cursor-text",
          "focus-within:[background:#ffffff]",
          "focus-within:[box-shadow:var(--shadow-focus)]",
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: "linear-gradient(180deg, #f7f7f7 0%, #fbfbfb 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(17,17,17,0.12), inset 0 1px 2px rgba(17,17,17,0.03), 0 1px 2px -1px rgba(17,17,17,0.04)",
          ["--shadow-focus" as string]:
            "inset 0 0 0 1px rgba(17,17,17,0.92), 0 0 0 4px rgba(17,17,17,0.08), 0 1px 2px -1px rgba(17,17,17,0.04)",
        } as React.CSSProperties}
      >
        {animTags.map((at, i) => (
          <span
            key={at.text}
            className={[
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white text-[11px] font-medium text-neutral-600 select-none",
              "transition-all duration-180 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
              at.state === "entering" ? "opacity-0 scale-75" : "",
              at.state === "visible" ? "opacity-100 scale-100" : "",
              at.state === "exiting" ? "opacity-0 scale-75" : "",
            ].join(" ")}
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(17,17,17,0.10), 0 1px 2px -1px rgba(17,17,17,0.04)",
            }}
          >
            {at.text}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const idx = tags.indexOf(at.text);
                if (idx !== -1) removeTag(idx);
              }}
              className="ml-0.5 text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors"
            >
              <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input); }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] bg-transparent text-[13.5px] text-neutral-900 placeholder:text-neutral-400 outline-none py-0.5"
        />
      </div>
      {hint && <p className="text-[11.5px] text-neutral-400 mt-0.5">{hint}</p>}
    </div>
  );
}
