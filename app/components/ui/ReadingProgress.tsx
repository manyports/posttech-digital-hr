"use client";

import React, { useState, useEffect } from "react";

interface ReadingProgressProps {
  className?: string;
}

export function ReadingProgress({ className = "" }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className={["fixed top-0 left-0 right-0 z-[80] h-[2px] bg-transparent", className].join(" ")}
    >
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #0a0a0a 0%, #262626 100%)",
          boxShadow: "0 0 8px rgba(17,17,17,0.3)",
        }}
      />
    </div>
  );
}
