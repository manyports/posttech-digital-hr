"use client";

import React, { useState, useCallback, useMemo } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
  className?: string;
}

const KEYWORDS = new Set([
  "import", "from", "export", "default", "function", "return",
  "const", "let", "var", "if", "else", "for", "while", "do",
  "class", "extends", "new", "typeof", "instanceof",
  "null", "undefined", "true", "false",
  "async", "await", "try", "catch", "throw", "finally",
  "interface", "type", "enum", "as", "in", "of",
  "switch", "case", "break", "continue",
  "void", "never", "any", "string", "number", "boolean",
  "public", "private", "protected", "static", "abstract", "readonly",
]);

const TOKEN_RE = /(\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|<\/?\s*[A-Z][a-zA-Z0-9.]*|<\/?\s*[a-z][a-zA-Z0-9-]*|=>|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)/;

const TOKEN_STYLES: Record<string, string> = {
  keyword: "text-violet-500",
  string:  "text-emerald-600",
  comment: "text-neutral-400 italic",
  tag:     "text-sky-600",
  number:  "text-amber-600",
};

function classifyToken(val: string): string {
  if (val.startsWith("//")) return "comment";
  if (val[0] === '"' || val[0] === "'" || val[0] === "`") return "string";
  if (val[0] === "<") return "tag";
  if (val === "=>") return "keyword";
  if (/^\d/.test(val)) return "number";
  if (KEYWORDS.has(val)) return "keyword";
  return "plain";
}

function tokenizeLine(line: string): { type: string; value: string }[] {
  const tokens: { type: string; value: string }[] = [];
  const re = new RegExp(TOKEN_RE.source, "g");
  let lastIndex = 0;
  let match;

  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", value: line.slice(lastIndex, match.index) });
    }
    tokens.push({ type: classifyToken(match[0]), value: match[0] });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: "plain", value: line.slice(lastIndex) });
  }

  return tokens;
}

const HIGHLIGHTABLE = new Set(["js", "jsx", "ts", "tsx", "javascript", "typescript"]);

export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  title,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const lines = code.split("\n");
  const highlight = language ? HIGHLIGHTABLE.has(language.toLowerCase()) : false;

  const tokenized = useMemo(() => {
    if (!highlight) return null;
    return lines.map((line) => tokenizeLine(line));
  }, [code, highlight]);

  return (
    <div
      className={[
        "rounded-2xl bg-white overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        boxShadow:
          "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100"
        style={{
          background:
            "linear-gradient(180deg, rgba(252,252,252,1) 0%, rgba(248,248,248,1) 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-[12px] font-medium text-neutral-600">{title}</span>
          )}
          {language && !title && (
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">{language}</span>
          )}
          {language && title && (
            <span className="text-[11px] text-neutral-300 uppercase tracking-wide">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="group/copy relative overflow-hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-neutral-900/5 transition-transform duration-300 ease-out group-hover/copy:scale-y-100" />
          <span className="relative z-10 inline-flex items-center gap-1.5">
            {copied ? (
              <>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Скопировано
              </>
            ) : (
              <>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Копировать
              </>
            )}
          </span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-[13px] leading-relaxed font-mono text-neutral-800">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="select-none w-8 shrink-0 text-right pr-4 text-neutral-300 tabular-nums">
                    {i + 1}
                  </span>
                )}
                <span className="flex-1">
                  {tokenized
                    ? tokenized[i].map((tok, j) => (
                        <span key={j} className={TOKEN_STYLES[tok.type] || ""}>
                          {tok.value}
                        </span>
                      ))
                    : (line || "\n")}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
