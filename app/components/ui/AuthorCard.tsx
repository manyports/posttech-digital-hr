import React from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

interface AuthorCardProps {
  name: string;
  bio?: string;
  avatarSrc?: string;
  onFollow?: () => void;
  className?: string;
}

const restShadow =
  "0 1px 3px rgba(17,17,17,0.02), 0 4px 12px -2px rgba(17,17,17,0.05), 0 8px 24px -4px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)";

const hoverShadow =
  "0 2px 6px rgba(17,17,17,0.03), 0 8px 24px -4px rgba(17,17,17,0.08), 0 16px 48px -8px rgba(17,17,17,0.10), 0 32px 96px -16px rgba(17,17,17,0.08), 0 0 0 1px rgba(17,17,17,0.08), inset 0 2px 0 rgba(255,255,255,1)";

export function AuthorCard({
  name,
  bio,
  avatarSrc,
  onFollow,
  className = "",
}: AuthorCardProps) {
  return (
    <div
      className={[
        "group/card relative rounded-[20px] p-2 transition-all duration-500 ease-out",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(254,254,254,1) 40%, rgba(250,250,250,1) 100%)",
        boxShadow: restShadow,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-500 ease-out group-hover/card:opacity-100"
        style={{ boxShadow: hoverShadow }}
      />
      <div className="relative bg-white rounded-[14px] overflow-hidden">
        <div
          className="h-20 rounded-t-[14px] relative overflow-hidden"
          style={{
            background:
              "radial-gradient(130% 90% at 25% 0%, rgba(0,0,0,0.08), transparent 60%), linear-gradient(180deg, #f5f5f4 0%, #ebebea 100%)",
          }}
        />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4">
            <Avatar
              src={avatarSrc}
              name={name}
              size="lg"
              className="ring-[3.5px] ring-white shadow-[0_3px_12px_-2px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)]"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-neutral-900 leading-snug truncate tracking-[-0.01em]">{name}</p>
              {bio && (
                <p className="text-[13px] text-neutral-500 leading-relaxed mt-1 line-clamp-2">{bio}</p>
              )}
            </div>
            {onFollow && (
              <Button variant="primary" size="sm" onClick={onFollow} className="shrink-0">
                Follow
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
