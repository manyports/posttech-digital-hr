import React from "react";

/**
 * Portal glyph set. Drawn on a 16px grid: objects (home, doc, bell…) are solid
 * shapes with cut-outs, directional/utility marks (arrows, check, close) are
 * 1.75 strokes. Keep new icons on the same grid and in one of those two modes.
 */

type P = { size?: number; className?: string };

function Glyph({ size = 15, className, children }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      {children}
    </svg>
  );
}

/** Stroke group for line-mode glyphs. */
function Line({ children }: { children: React.ReactNode }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  );
}

const glyph = (body: React.ReactNode) =>
  function Icon({ size, className }: P) {
    return <Glyph size={size} className={className}>{body}</Glyph>;
  };

export const HomeIcon = glyph(
  <path d="M7.36 1.73a1 1 0 0 1 1.28 0l5.5 4.6c.23.19.36.47.36.77v6.4A1.5 1.5 0 0 1 13 15h-2.5v-4a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v4H3a1.5 1.5 0 0 1-1.5-1.5V7.1c0-.3.13-.58.36-.77l5.5-4.6Z" />,
);

export const UserIcon = glyph(
  <>
    <circle cx="8" cy="4.75" r="3" />
    <path d="M2 13.6c0-2.5 2.7-4.1 6-4.1s6 1.6 6 4.1c0 .77-.63 1.4-1.4 1.4H3.4c-.77 0-1.4-.63-1.4-1.4Z" />
  </>,
);

export const UsersIcon = glyph(
  <>
    <circle cx="6" cy="5" r="2.75" />
    <path d="M1 13.5c0-2.3 2.2-3.75 5-3.75s5 1.45 5 3.75c0 .83-.67 1.5-1.5 1.5h-7A1.5 1.5 0 0 1 1 13.5Z" />
    <circle cx="11.75" cy="5.5" r="2.1" />
    <path d="M12.4 9.85c1.6.3 2.6 1.4 2.6 2.9 0 .69-.56 1.25-1.25 1.25H12.3c.13-.31.2-.66.2-1.05 0-1.2-.5-2.25-1.35-3.05.4-.07.82-.08 1.25-.05Z" />
  </>,
);

export const DocIcon = glyph(
  <path
    fillRule="evenodd"
    d="M3 2.5A1.5 1.5 0 0 1 4.5 1h4.88c.4 0 .78.16 1.06.44l2.62 2.62c.28.28.44.66.44 1.06v8.38A1.5 1.5 0 0 1 12 15H4.5A1.5 1.5 0 0 1 3 13.5v-11Zm2.5 5.75h5v1.5h-5v-1.5Zm0 2.75H9v1.5H5.5V11Z"
  />,
);

export const BookIcon = glyph(
  <path d="M3 2.75A1.75 1.75 0 0 1 4.75 1H13v10.5H4.75a.75.75 0 0 0 0 1.5H13V15H4.75A1.75 1.75 0 0 1 3 13.25V2.75Z" />,
);

export const ChatIcon = glyph(
  <path d="M1.5 4.5A2.5 2.5 0 0 1 4 2h8a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 12 12H8.2l-3.4 2.55a.5.5 0 0 1-.8-.4V12a2.5 2.5 0 0 1-2.5-2.5v-5Z" />,
);

export const BellIcon = glyph(
  <>
    <path d="M8 1.25A4.25 4.25 0 0 0 3.75 5.5v2.6L2.3 10.6a.9.9 0 0 0 .78 1.4h9.84a.9.9 0 0 0 .78-1.4l-1.45-2.5V5.5A4.25 4.25 0 0 0 8 1.25Z" />
    <path d="M6 13.25h4a2 2 0 0 1-4 0Z" />
  </>,
);

export const InboxIcon = glyph(
  <path
    fillRule="evenodd"
    d="M1 8.25 2.9 3.2a1.5 1.5 0 0 1 1.4-.95h7.4a1.5 1.5 0 0 1 1.4.95L15 8.25v4.25a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5V8.25ZM2.9 8h3.35L7 9.5h2L9.75 8h3.35L11.7 3.75H4.3L2.9 8Z"
  />,
);

export const CheckCircleIcon = glyph(
  <path
    fillRule="evenodd"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.97 4.47a.75.75 0 0 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L7 9.44l3.97-3.97Z"
  />,
);

export const ClockIcon = glyph(
  <path
    fillRule="evenodd"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 3.5a.75.75 0 0 0-1.5 0V8c0 .2.08.39.22.53l2 2a.75.75 0 1 0 1.06-1.06L8.75 7.69V4.5Z"
  />,
);

export const LockIcon = glyph(
  <>
    <rect x="2.75" y="7" width="10.5" height="8" rx="2" />
    <Line>
      <path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2" />
    </Line>
  </>,
);

/** Composer send: an up-arrow, not a paper plane. */
export const SendIcon = glyph(
  <path d="M8 2.5c.2 0 .39.08.53.22l4.25 4.25a.75.75 0 1 1-1.06 1.06L8.75 5.06v8.19a.75.75 0 0 1-1.5 0V5.06L4.28 8.03a.75.75 0 0 1-1.06-1.06l4.25-4.25A.75.75 0 0 1 8 2.5Z" />,
);

export const LogoutIcon = glyph(
  <>
    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2H8v1.5H3.5v9H8V14H3.5A1.5 1.5 0 0 1 2 12.5v-9Z" />
    <Line>
      <path d="M6.5 8h7M11 5.5 13.5 8 11 10.5" />
    </Line>
  </>,
);

/** Sidebar toggle: a window with its left pane filled. */
export const SidebarIcon = glyph(
  <path
    fillRule="evenodd"
    d="M1.5 4.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-7Zm5.5-.5v8h5.5a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H7Z"
  />,
);

export const MenuIcon = glyph(<Line><path d="M2.5 5.5h11M2.5 10.5h11" /></Line>);
export const PlusIcon = glyph(<Line><path d="M8 3v10M3 8h10" /></Line>);
export const CheckIcon = glyph(<Line><path d="M3.5 8.5l3 3 6-7" /></Line>);
export const XIcon = glyph(<Line><path d="M4 4l8 8M12 4l-8 8" /></Line>);
export const ArrowRightIcon = glyph(<Line><path d="M3 8h9.5M9 4.5 12.5 8 9 11.5" /></Line>);
export const ArrowLeftIcon = glyph(<Line><path d="M13 8H3.5M7 4.5 3.5 8 7 11.5" /></Line>);
export const RefreshIcon = glyph(<Line><path d="M13.25 8a5.25 5.25 0 1 1-1.54-3.71M13.25 2.5v3h-3" /></Line>);
export const LinkIcon = glyph(
  <Line>
    <path d="M6.5 9.5l3-3M7.25 4.25l.9-.9a2.83 2.83 0 0 1 4 4l-.9.9M8.75 11.75l-.9.9a2.83 2.83 0 0 1-4-4l.9-.9" />
  </Line>,
);

export const LogoMark = ({ size = 16, className }: P) => (
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
    <path d="M12 3.5 5 6.5v5.2c0 3.8 2.6 6.6 7 8.1 4.4-1.5 7-4.3 7-8.1V6.5L12 3.5z" />
    <path d="m9 12 2 2 4-4.5" />
  </svg>
);
