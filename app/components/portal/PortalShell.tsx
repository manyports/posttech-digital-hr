"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/domain/types";
import { post } from "@/lib/client/api";
import { clearApiCache } from "@/lib/client/hooks";
import { LocaleSwitch, useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Avatar } from "../ui/Avatar";
import { Drawer } from "../ui/Drawer";
import { DropdownMenu } from "../ui/DropdownMenu";
import {
  BellIcon,
  BookIcon,
  ChatIcon,
  CheckCircleIcon,
  DocIcon,
  HomeIcon,
  InboxIcon,
  LogoutIcon,
  LogoMark,
  MenuIcon,
  SidebarIcon,
  UserIcon,
  UsersIcon,
} from "./icons";
import { NotificationsProvider, useNotifications } from "./NotificationsProvider";
import { Panel } from "./Panel";
import { UserContext } from "./UserContext";

const NAV_W = 224;
const RAIL_W = 58;
const SECTION_W = 260;

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function navFor(user: SessionUser, unread: number, m: ReturnType<typeof useI18n>["m"]): { title?: string; items: NavItem[] }[] {
  const mine: NavItem[] = [
    { href: "/dashboard", label: m.nav.home, icon: <HomeIcon /> },
    { href: "/profile", label: m.nav.profile, icon: <UserIcon /> },
    { href: "/requests", label: m.nav.requests, icon: <DocIcon /> },
    { href: "/academy", label: m.nav.academy, icon: <BookIcon /> },
    { href: "/assistant", label: m.nav.assistant, icon: <ChatIcon /> },
    { href: "/notifications", label: m.nav.notifications, icon: <BellIcon />, badge: unread || undefined },
  ];
  const sections: { title?: string; items: NavItem[] }[] = [{ title: m.nav.main, items: mine }];
  if (user.role === "manager") {
    sections.push({
      title: m.nav.myTeam,
      items: [
        { href: "/approvals", label: m.nav.approvals, icon: <CheckCircleIcon /> },
        { href: "/team", label: m.nav.team, icon: <UsersIcon /> },
      ],
    });
  }
  if (user.role === "hr") {
    sections.push({
      title: m.nav.hr,
      items: [
        { href: "/approvals", label: m.nav.allRequests, icon: <CheckCircleIcon /> },
        { href: "/team", label: m.nav.employees, icon: <UsersIcon /> },
        { href: "/hr", label: m.nav.inbox, icon: <InboxIcon /> },
      ],
    });
  }
  return sections;
}

/** Longest matching href wins (e.g. /requests/REQ-1 lights up /requests). */
function activeItem(sections: { items: NavItem[] }[], pathname: string): NavItem | undefined {
  return sections
    .flatMap((s) => s.items)
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/* ── Section sidebar ────────────────────────────────────────────────
 * A page renders <SectionSidebar> to put its own navigation where the main
 * nav is. While one is mounted the main nav folds into an icon rail. */

const SectionSlot = createContext<{ slot: HTMLElement | null; claim: () => () => void } | null>(null);

export function SectionSidebar({
  title,
  actions,
  mobile = "inline",
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  /** Below `lg` there is no sidebar column: show the content above the page, or not at all. */
  mobile?: "inline" | "none";
  children: React.ReactNode;
}) {
  const ctx = useContext(SectionSlot);
  const claim = ctx?.claim;
  useEffect(() => claim?.(), [claim]);

  const body = (
    <>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 pl-2.5 pr-1 pt-1 pb-1.5 min-h-[30px]">
          {title && <p className="text-[10px] font-semibold text-tertiary uppercase tracking-widest truncate">{title}</p>}
          {actions}
        </div>
      )}
      {children}
    </>
  );

  return (
    <>
      {ctx?.slot && createPortal(body, ctx.slot)}
      {mobile === "inline" && (
        <div className="lg:hidden">
          <Panel padding="p-2" as="div">{body}</Panel>
        </div>
      )}
    </>
  );
}

/* ── Main nav ───────────────────────────────────────────────────── */

function NavList({ user, collapsed = false, onNavigate }: { user: SessionUser; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { unread } = useNotifications();
  const { m } = useI18n();
  const sections = navFor(user, unread, m);
  const activeHref = activeItem(sections, pathname)?.href;

  return (
    <nav aria-label={m.nav.aria} className="flex flex-col gap-3">
      {sections.map((section, si) => (
        <div key={si} className="flex flex-col gap-0.5">
          {section.title && (
            <div className="relative h-[26px] px-2.5 flex items-center">
              <p className={["text-[10px] font-semibold text-tertiary uppercase tracking-widest whitespace-nowrap transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100"].join(" ")}>
                {section.title}
              </p>
              {si > 0 && (
                <span aria-hidden className={["absolute left-2.5 right-2.5 top-1/2 h-px bg-hero-border transition-opacity duration-200", collapsed ? "opacity-100" : "opacity-0"].join(" ")} />
              )}
            </div>
          )}
          {section.items.map((item) => {
            const active = item.href === activeHref;
            return (
              <div key={item.href} className="relative group/ni">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap overflow-hidden transition-colors duration-150",
                    active ? "bg-hero-cell-bg text-hero-foreground" : "text-hero-muted hover:text-hero-foreground hover:bg-hero-cell-bg/60",
                  ].join(" ")}
                >
                  <span className={["relative shrink-0 w-[22px] h-[22px] flex items-center justify-center", active ? "text-hero-foreground" : "text-tertiary group-hover/ni:text-hero-muted"].join(" ")}>
                    {item.icon}
                    {item.badge !== undefined && (
                      <span aria-hidden className={["absolute top-0 right-0 w-2 h-2 rounded-full bg-hero-foreground ring-2 ring-hero-elevated transition-opacity duration-200", collapsed ? "opacity-100" : "opacity-0"].join(" ")} />
                    )}
                  </span>
                  <span className={["flex-1 overflow-hidden transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100"].join(" ")}>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={["shrink-0 text-[11px] font-semibold tabular-nums leading-none transition-opacity duration-200", active ? "text-hero-foreground" : "text-hero-muted", collapsed ? "opacity-0" : "opacity-100"].join(" ")}>
                      {item.badge}
                    </span>
                  )}
                </Link>
                {collapsed && <RailTip>{item.label}</RailTip>}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Label bubble for a folded rail item. */
function RailTip({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-lg bg-hero-foreground px-2.5 py-1.5 text-[12px] font-medium text-hero-on-foreground opacity-0 shadow-lg transition-all duration-150 group-hover/ni:translate-x-0 group-hover/ni:opacity-100 group-has-[:focus-visible]/ni:translate-x-0 group-has-[:focus-visible]/ni:opacity-100"
    >
      {children}
    </span>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 shrink-0 text-hero-foreground hover:opacity-70 transition-opacity">
      <LogoMark size={18} className="text-logo" />
      <span className="text-[14px] font-semibold tracking-[-0.03em]">Digital HR</span>
    </Link>
  );
}

const CARD_STYLE: React.CSSProperties = { boxShadow: "var(--surface-shadow)" };

function Shell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { unread } = useNotifications();
  const { m } = useI18n();
  const [navOpen, setNavOpen] = useState(false);

  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [claims, setClaims] = useState(0);
  const claim = useCallback(() => {
    setClaims((c) => c + 1);
    return () => setClaims((c) => c - 1);
  }, []);
  const slotCtx = useMemo(() => ({ slot, claim }), [slot, claim]);
  const hasSection = claims > 0;

  // A manual toggle wins until the page's sidebar comes or goes.
  const [override, setOverride] = useState<{ when: boolean; collapsed: boolean } | null>(null);
  const collapsed = override && override.when === hasSection ? override.collapsed : hasSection;

  const current = activeItem(navFor(user, unread, m), pathname);

  async function signOut() {
    clearApiCache();
    try {
      await post("/api/auth/logout");
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen">
      <header className="animate-header-in sticky top-0 z-30 border-b border-hero-border bg-hero-cell-bg/80 backdrop-blur-md">
        <div className="app-container h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="lg:hidden -ml-1.5 w-8 h-8 flex items-center justify-center rounded-lg text-hero-foreground hover:bg-hero-elevated transition-colors cursor-pointer"
              onClick={() => setNavOpen(true)}
              aria-label={m.nav.openMenu}
            >
              <MenuIcon size={16} />
            </button>
            <Brand />
            {current && (
              <>
                <span aria-hidden className="hidden sm:block text-[15px] text-hero-border select-none">/</span>
                <span className="hidden sm:block text-[13px] text-hero-muted truncate">{current.label}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <LocaleSwitch />
            <span aria-hidden className="w-px h-4 bg-hero-border mx-1.5" />
            <Link
              href="/notifications"
              aria-label={unread ? tx(m.nav.unread, { n: unread }) : m.nav.notifications}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-hero-muted hover:text-hero-foreground hover:bg-hero-elevated transition-colors"
            >
              <BellIcon size={16} />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-hero-foreground text-hero-on-foreground text-[9.5px] font-semibold flex items-center justify-center tabular-nums ring-2 ring-hero-cell-bg">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            <DropdownMenu
              position="bottom-end"
              onSelect={(key) => {
                if (key === "profile") router.push("/profile");
                if (key === "signout") void signOut();
              }}
              items={[
                { key: "profile", label: m.nav.profile, icon: <UserIcon size={14} /> },
                { key: "div", label: "", divider: true },
                { key: "signout", label: m.nav.signOut, icon: <LogoutIcon size={14} />, danger: true },
              ]}
              trigger={
                <button
                  className="ml-1 rounded-full cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-foreground"
                  aria-label={`${m.nav.account}: ${user.fullName}, ${m.roles[user.role]}`}
                  title={`${user.fullName} · ${m.roles[user.role]}`}
                >
                  <Avatar name={user.fullName} size="sm" />
                </button>
              }
            />
          </div>
        </div>
      </header>

      <SectionSlot.Provider value={slotCtx}>
        <div className="app-container pt-6 pb-20 flex items-start">
          <aside
            // Sticky makes its own stacking context: lift it so rail tooltips clear the page content.
            className="hidden lg:block sticky top-20 z-40 shrink-0 mr-6 transition-[width] duration-[420ms] ease-shell"
            style={{ width: collapsed ? RAIL_W : NAV_W }}
          >
            <div className="bg-hero-elevated rounded-2xl p-2" style={CARD_STYLE}>
              <NavList user={user} collapsed={collapsed} />
              <div className="relative group/ni mt-2 pt-2 border-t border-hero-border">
                <button
                  onClick={() => setOverride({ when: hasSection, collapsed: !collapsed })}
                  aria-label={collapsed ? m.nav.expand : m.nav.collapse}
                  aria-expanded={!collapsed}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] text-tertiary hover:text-hero-foreground hover:bg-hero-cell-bg/60 whitespace-nowrap overflow-hidden transition-colors cursor-pointer"
                >
                  <span className="shrink-0 w-[22px] h-[22px] flex items-center justify-center">
                    <SidebarIcon size={15} />
                  </span>
                  <span className={["overflow-hidden transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100"].join(" ")}>{m.nav.collapse}</span>
                </button>
                {collapsed && <RailTip>{m.nav.expand}</RailTip>}
              </div>
            </div>
            <p className={["text-[11px] text-tertiary mt-3 px-2.5 leading-relaxed whitespace-nowrap overflow-hidden transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100"].join(" ")}>
              {m.nav.prototype}
            </p>
          </aside>

          <aside
            aria-hidden={!hasSection}
            className="hidden lg:block sticky top-20 shrink-0 transition-[width,margin,opacity] duration-[420ms] ease-shell"
            // Clip the fixed-width card while the column grows, but leave room for its shadow.
            style={{ width: hasSection ? SECTION_W : 0, marginRight: hasSection ? 24 : 0, opacity: hasSection ? 1 : 0, clipPath: "inset(-16px)" }}
          >
            <div
              ref={setSlot}
              className="chat-scrollbar bg-hero-elevated rounded-2xl p-2 max-h-[calc(100dvh-104px)] overflow-y-auto"
              style={{ ...CARD_STYLE, width: SECTION_W, display: hasSection ? undefined : "none" }}
            />
          </aside>

          <main id="main" className="flex-1 min-w-0 flex flex-col gap-6">
            {children}
          </main>
        </div>
      </SectionSlot.Provider>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" size="sm" title="Digital HR" description={`${user.fullName} · ${m.roles[user.role]}`}>
        <NavList user={user} onNavigate={() => setNavOpen(false)} />
      </Drawer>
    </div>
  );
}

export function PortalShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <UserContext.Provider value={user}>
      <NotificationsProvider>
        <Shell user={user}>{children}</Shell>
      </NotificationsProvider>
    </UserContext.Provider>
  );
}
