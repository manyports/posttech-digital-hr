"use client";

import React, { useState, useCallback } from "react";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  className?: string;
}

const btnShadow =
  "0 1px 2px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.08)";

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function ShareButtons({
  url,
  title,
  className = "",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title ?? "";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silently
    }
  }, [shareUrl]);

  const handleTwitter = useCallback(() => {
    const params = new URLSearchParams({
      text: shareTitle,
      url: shareUrl,
    });
    window.open(
      `https://x.com/intent/tweet?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [shareUrl, shareTitle]);

  const handleLinkedIn = useCallback(() => {
    const params = new URLSearchParams({
      url: shareUrl,
    });
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [shareUrl]);

  const buttons = [
    {
      label: "Copy link",
      icon: copied ? <CheckIcon /> : <LinkIcon />,
      onClick: handleCopy,
    },
    {
      label: "X / Twitter",
      icon: <XIcon />,
      onClick: handleTwitter,
    },
    {
      label: "LinkedIn",
      icon: <LinkedInIcon />,
      onClick: handleLinkedIn,
    },
  ];

  return (
    <div className={className}>
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2.5">
        Share
      </p>
      <div className="flex items-center gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            aria-label={btn.label}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 bg-white hover:bg-neutral-50 transition-all duration-150 cursor-pointer active:scale-95"
            style={{ boxShadow: btnShadow }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
