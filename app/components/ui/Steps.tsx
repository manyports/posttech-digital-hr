import React from "react";

interface StepItem {
  label: string;
  description?: string;
}

interface StepsProps {
  steps: StepItem[];
  current: number;
  className?: string;
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Steps({ steps, current, className = "" }: StepsProps) {
  return (
    <div className={["flex flex-col gap-0", className].filter(Boolean).join(" ")}>
      {/* Circles & lines row */}
      <div className="flex items-center">
        {steps.map((_, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;

          return (
            <React.Fragment key={i}>
              {/* Circle */}
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 relative transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
                  isCompleted
                    ? "bg-hero-foreground text-hero-on-foreground"
                    : isCurrent
                      ? "bg-hero-foreground text-hero-on-foreground ring-4 ring-hero-foreground/10"
                      : "bg-hero-cell-bg text-tertiary",
                ].join(" ")}
                style={{
                  boxShadow: isCompleted || isCurrent
                    ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.15)"
                    : "inset 0 1px 2px rgba(17,17,17,0.06), 0 0 0 1px rgba(17,17,17,0.04)",
                }}
              >
                {isCompleted ? <CheckIcon /> : i + 1}
              </div>

              {/* Connecting line (not after last step) */}
              {i < steps.length - 1 && (
                <div className="flex-1 mx-3 h-px relative">
                  <div className="absolute inset-0 bg-hero-border rounded-full" />
                  <div
                    className="absolute inset-0 bg-hero-foreground rounded-full transition-all duration-500 ease-out origin-left"
                    style={{
                      transform: i < current ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Labels row */}
      <div className="flex items-start mt-3">
        {steps.map((step, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;

          return (
            <React.Fragment key={i}>
              <div
                className="flex flex-col items-center shrink-0"
                style={{ width: 32 }}
              >
                <span
                  className={[
                    "text-[12px] font-medium text-center leading-tight transition-colors duration-200",
                    isCompleted || isCurrent
                      ? "text-hero-foreground"
                      : "text-tertiary",
                  ].join(" ")}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[11px] text-tertiary text-center leading-tight mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>

              {/* Spacer matching connecting line */}
              {i < steps.length - 1 && (
                <div className="flex-1 mx-3" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
