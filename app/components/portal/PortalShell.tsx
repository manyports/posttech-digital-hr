"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/domain/types";
import { post } from "@/lib/client/api";
import { ROLE_LABEL } from "@/lib/client/format";
import { Avatar } from "../ui/Avatar";
import { Drawer } from "../ui/Drawer";
import { DropdownMenu } from "../ui/DropdownMenu";
import {
  BellIcon,
  BookIcon,
  CheckCircleIcon,
  DocIcon,
  HomeIcon,
  InboxIcon,
  LogoutIcon,
  MenuIcon,
  SparkleIcon,
  UserIcon,
  UsersIcon,
} from "./icons";
import { NotificationsProvider, useNotifications } from "./NotificationsProvider";
import { UserContext } from "./UserContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function navFor(user: SessionUser, unread: number): { title?: string; items: NavItem[] }[] {
  const mine: NavItem[] = [
    { href: "/dashboard", label: "Главная", icon: <HomeIcon /> },
    { href: "/profile", label: "Мой профиль", icon: <UserIcon /> },
    { href: "/requests", label: "Мои заявки", icon: <DocIcon /> },
    { href: "/academy", label: "Jana Academy", icon: <BookIcon /> },
    { href: "/assistant", label: "Al Jana", icon: <SparkleIcon /> },
    { href: "/notifications", label: "Уведомления", icon: <BellIcon />, badge: unread || undefined },
  ];
  const sections: { title?: string; items: NavItem[] }[] = [{ title: "Основное", items: mine }];
  if (user.role === "manager") {
    sections.push({
      title: "Моя команда",
      items: [
        { href: "/approvals", label: "Согласования", icon: <CheckCircleIcon /> },
        { href: "/team", label: "Команда", icon: <UsersIcon /> },
      ],
    });
  }
  if (user.role === "hr") {
    sections.push({
      title: "HR / Админ",
      items: [
        { href: "/approvals", label: "Все заявки", icon: <CheckCircleIcon /> },
        { href: "/team", label: "Сотрудники", icon: <UsersIcon /> },
        { href: "/hr", label: "Входящие HR", icon: <InboxIcon /> },
      ],
    });
  }
  return sections;
}

function NavList({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { unread } = useNotifications();
  const sections = navFor(user, unread);

  // Longest matching href wins (e.g. /requests/REQ-1 lights up /requests).
  const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));
  const activeHref = allHrefs
    .filter((h) => pathname === h || pathname.startsWith(`${h}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav aria-label="Основная навигация" className="flex flex-col gap-4">
      {sections.map((section, si) => (
        <div key={si} className="flex flex-col gap-0.5">
          {section.title && (
            <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium",
                  "transition-all duration-200",
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100",
                ].join(" ")}
                style={
                  active
                    ? { boxShadow: "0 1px 3px rgba(0,0,0,0.35), 0 4px 12px -3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }
                    : undefined
                }
              >
                <span
                  className={[
                    "shrink-0 w-[22px] h-[22px] rounded-md flex items-center justify-center transition-colors duration-200",
                    active ? "bg-white/15" : "bg-neutral-100 text-neutral-500",
                  ].join(" ")}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={[
                      "shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums leading-none",
                      active ? "bg-white/20 text-white" : "bg-neutral-900 text-white",
                    ].join(" ")}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group/brand">
      <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-[13px] font-semibold tracking-tight">
        J
      </span>
      <span className="text-[14px] font-semibold tracking-tight text-neutral-900 transition-opacity group-hover/brand:opacity-60">
        Digital HR
      </span>
    </Link>
  );
}

function Shell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const router = useRouter();
  const { unread } = useNotifications();
  const [navOpen, setNavOpen] = useState(false);

  async function signOut() {
    try {
      await post("/api/auth/logout");
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen">
      <header className="animate-header-in sticky top-0 z-30 px-4 sm:px-6 pt-3 pb-2 pointer-events-none">
        <div
          className="max-w-6xl mx-auto bg-white rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 pointer-events-auto"
          style={{
            boxShadow:
              "0 1px 2px rgba(17,17,17,0.04), 0 4px 16px -4px rgba(17,17,17,0.06), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              onClick={() => setNavOpen(true)}
              aria-label="Открыть меню"
            >
              <MenuIcon size={17} />
            </button>
            <Brand />
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/notifications"
              aria-label={unread ? `Уведомления (${unread} непрочитанных)` : "Уведомления"}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <BellIcon size={17} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums ring-2 ring-white">
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
                { key: "profile", label: "Мой профиль", icon: <UserIcon size={14} /> },
                { key: "div", label: "", divider: true },
                { key: "signout", label: "Выйти", icon: <LogoutIcon size={14} />, danger: true },
              ]}
              trigger={
                <button
                  className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Меню аккаунта"
                >
                  <Avatar name={user.fullName} size="sm" />
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-[12.5px] font-semibold text-neutral-900">{user.fullName}</span>
                    <span className="text-[10.5px] text-neutral-400">{ROLE_LABEL[user.role]}</span>
                  </span>
                </button>
              }
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 pt-4 grid grid-cols-1 lg:grid-cols-[224px_minmax(0,1fr)] gap-6 items-start">
        <aside className="hidden lg:block sticky top-[76px]">
          <div
            className="bg-white rounded-2xl p-2"
            style={{
              boxShadow:
                "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <NavList user={user} />
          </div>
          <p className="text-[11px] text-neutral-400 mt-3 px-2 leading-relaxed">
            Прототип · все данные вымышлены
          </p>
        </aside>

        <main id="main" className="min-w-0 flex flex-col gap-6">
          {children}
        </main>
      </div>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" size="sm" title="Digital HR" description={`${user.fullName} · ${ROLE_LABEL[user.role]}`}>
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

