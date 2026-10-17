import React from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBell,
  FiBook,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiHome,
  FiInbox,
  FiLink,
  FiLock,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

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

const fi = (Icon: React.ComponentType<{ size?: number; className?: string }>) =>
  function FiIcon({ size = 15, className }: P) {
    return <Icon size={size} className={className} aria-hidden />;
  };

export const HomeIcon = fi(FiHome);
export const UserIcon = fi(FiUser);
export const DocIcon = fi(FiFileText);
export const CheckCircleIcon = fi(FiCheckCircle);
export const UsersIcon = fi(FiUsers);
export const BookIcon = fi(FiBook);
export const SparkleIcon = fi(FiStar);
export const BellIcon = fi(FiBell);
export const ShieldIcon = fi(FiShield);
export const LogoutIcon = fi(FiLogOut);
export const MenuIcon = fi(FiMenu);
export const PlusIcon = fi(FiPlus);
export const ArrowRightIcon = fi(FiArrowRight);
export const ArrowLeftIcon = fi(FiArrowLeft);
export const CheckIcon = fi(FiCheck);
export const XIcon = fi(FiX);
export const LockIcon = fi(FiLock);
export const SendIcon = fi(FiSend);
export const ClockIcon = fi(FiClock);
export const LinkIcon = fi(FiLink);
export const RefreshIcon = fi(FiRefreshCw);
export const InboxIcon = fi(FiInbox);

export const LogoMark = ({ size = 16, className }: P) => (
  <Svg size={size} className={className}>
    <path d="M12 3.5 5 6.5v5.2c0 3.8 2.6 6.6 7 8.1 4.4-1.5 7-4.3 7-8.1V6.5L12 3.5z" />
    <path d="m9 12 2 2 4-4.5" />
  </Svg>
);
