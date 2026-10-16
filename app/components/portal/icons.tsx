import React from "react";

type P = { size?: number; className?: string };

function Svg({ size = 15, className, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: P) => (
  <Svg {...p}><path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" /></Svg>
);
export const UserIcon = (p: P) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.6-3.8 3.7-6 7.5-6s6.9 2.2 7.5 6" /></Svg>
);
export const DocIcon = (p: P) => (
  <Svg {...p}><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5z" /><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5" /></Svg>
);
export const CheckCircleIcon = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.3 2.4 2.4 4.6-5" /></Svg>
);
export const UsersIcon = (p: P) => (
  <Svg {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M2.8 19.5c.5-3.2 3-5 6.2-5s5.7 1.8 6.2 5M16 5.6a3.2 3.2 0 0 1 0 5.8M18.2 14.9c1.7.6 2.8 2.1 3.1 4.6" /></Svg>
);
export const BookIcon = (p: P) => (
  <Svg {...p}><path d="M12 6.2A8.5 8.5 0 0 0 6 4c-1 0-2 .2-3 .5v14A8.5 8.5 0 0 1 6 18c2.2 0 4.2.8 6 2.2m0-14A8.5 8.5 0 0 1 18 4c1 0 2 .2 3 .5v14a8.5 8.5 0 0 0-3-.5c-2.2 0-4.2.8-6 2.2m0-14v14" /></Svg>
);
export const SparkleIcon = (p: P) => (
  <Svg {...p}><path d="M9.8 15.9 9 18.75l-.8-2.85a4.5 4.5 0 0 0-3.1-3.1L2.25 12l2.85-.8a4.5 4.5 0 0 0 3.1-3.1L9 5.25l.8 2.85a4.5 4.5 0 0 0 3.1 3.1L15.75 12l-2.85.8a4.5 4.5 0 0 0-3.1 3.1zM18 4v3m-1.5-1.5h3M18 17v3m-1.5-1.5h3" /></Svg>
);
export const BellIcon = (p: P) => (
  <Svg {...p}><path d="M6 9.5a6 6 0 1 1 12 0c0 4.5 1.8 5.8 2 6.5H4c.2-.7 2-2 2-6.5zM10 19a2 2 0 0 0 4 0" /></Svg>
);
export const ShieldIcon = (p: P) => (
  <Svg {...p}><path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-2.5z" /><path d="m9 12 2.2 2.2L15.2 10" /></Svg>
);
export const LogoutIcon = (p: P) => (
  <Svg {...p}><path d="M14 4.5h-7a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h7M10 12h10m0 0-3-3m3 3-3 3" /></Svg>
);
export const MenuIcon = (p: P) => (
  <Svg {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Svg>
);
export const PlusIcon = (p: P) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const ArrowRightIcon = (p: P) => (
  <Svg {...p}><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></Svg>
);
export const ArrowLeftIcon = (p: P) => (
  <Svg {...p}><path d="M10.5 4.5 3 12m0 0 7.5 7.5M3 12h18" /></Svg>
);
export const CheckIcon = (p: P) => (
  <Svg {...p}><path d="m5 13 4 4L19 7" /></Svg>
);
export const XIcon = (p: P) => (
  <Svg {...p}><path d="M6 18 18 6M6 6l12 12" /></Svg>
);
export const LockIcon = (p: P) => (
  <Svg {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Svg>
);
export const SendIcon = (p: P) => (
  <Svg {...p}><path d="M5 12 20 4.5 15 20l-3.2-6.3L5 12zM11.8 13.7 20 4.5" /></Svg>
);
export const ClockIcon = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
);
export const LinkIcon = (p: P) => (
  <Svg {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></Svg>
);
export const RefreshIcon = (p: P) => (
  <Svg {...p}><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5" /></Svg>
);
export const InboxIcon = (p: P) => (
  <Svg {...p}><path d="M3.5 13.5 6 5.5h12l2.5 8M3.5 13.5V19a.5.5 0 0 0 .5.5h16a.5.5 0 0 0 .5-.5v-5.5m-17 0h5l1 2.5h5l1-2.5h5" /></Svg>
);
