"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import type { NotificationView } from "@/lib/domain/types";
import { post } from "@/lib/client/api";
import { useApi } from "@/lib/client/hooks";
import { useToast } from "../ui/Toast";

interface Ctx {
  notifications: NotificationView[];
  unread: number;
  loading: boolean;
  reload: () => void;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<Ctx>({
  notifications: [],
  unread: 0,
  loading: true,
  reload: () => {},
  markRead: async () => {},
  markAllRead: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

const POLL_MS = 5000;

function variantFor(n: NotificationView): "default" | "success" | "warning" | "error" {
  const t = n.title.toLowerCase();
  if (t.includes("approved") || t.includes("completed") || t.includes("replied")) return "success";
  if (t.includes("rejected")) return "error";
  if (t.includes("review")) return "warning";
  return "default";
}

/**
 * Polls the caller's notifications and raises a toast for each NEW unread one,
 * which is what makes request status changes feel live (e.g. a manager
 * approves in another browser and the employee sees it within seconds).
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, reload } = useApi<{ notifications: NotificationView[]; unread: number }>(
    "/api/notifications",
    { interval: POLL_MS },
  );
  const { toast } = useToast();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!data) return;
    if (seen.current === null) {
      // First load: everything already there is "old"; don't toast it.
      seen.current = new Set(data.notifications.map((n) => n.id));
      return;
    }
    const fresh = data.notifications.filter((n) => !seen.current!.has(n.id));
    for (const n of fresh.reverse().slice(-3)) {
      toast({ title: n.title, description: n.body, variant: variantFor(n), duration: 6000 });
    }
    for (const n of data.notifications) seen.current.add(n.id);
  }, [data, toast]);

  const markRead = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      await post("/api/notifications/read", { ids });
      reload();
    },
    [reload],
  );

  const markAllRead = useCallback(async () => {
    await post("/api/notifications/read", { all: true });
    reload();
  }, [reload]);

  const value = useMemo<Ctx>(
    () => ({
      notifications: data?.notifications ?? [],
      unread: data?.unread ?? 0,
      loading,
      reload,
      markRead,
      markAllRead,
    }),
    [data, loading, reload, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
