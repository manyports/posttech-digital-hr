"use client";

import { useRouter } from "next/navigation";
import type { NotificationKind, NotificationView } from "@/lib/domain/types";
import { fmtRelative } from "@/lib/client/format";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { BellIcon, BookIcon, DocIcon, InboxIcon, SparkleIcon } from "../../components/portal/icons";
import { useNotifications } from "../../components/portal/NotificationsProvider";
import { LoadingBlock, PageHeader, Panel } from "../../components/portal/Panel";

const KIND: Record<NotificationKind, { icon: React.ReactNode; label: string }> = {
  request: { icon: <DocIcon size={15} />, label: "Request" },
  course: { icon: <BookIcon size={15} />, label: "Training" },
  escalation: { icon: <SparkleIcon size={15} />, label: "Al Jana" },
  system: { icon: <InboxIcon size={15} />, label: "System" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unread, loading, markRead, markAllRead } = useNotifications();

  async function open(n: NotificationView) {
    if (!n.readAt) await markRead([n.id]);
    if (n.href) router.push(n.href);
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Status changes on your requests, course assignments and completions, and replies from HR."
        actions={
          <Button variant="secondary" size="sm" disabled={unread === 0} onClick={() => void markAllRead()}>
            Mark all as read
          </Button>
        }
      />

      {loading && notifications.length === 0 && <LoadingBlock rows={3} />}

      {!loading && notifications.length === 0 && (
        <EmptyState icon={<BellIcon size={20} />} title="You're all caught up" description="New alerts appear here and as a toast the moment they happen." />
      )}

      {notifications.length > 0 && (
        <Panel padding="p-0" as="div">
          <ul className="divide-y divide-neutral-100">
            {notifications.map((n) => {
              const k = KIND[n.kind];
              return (
                <li key={n.id}>
                  <button
                    onClick={() => void open(n)}
                    className={["w-full flex items-start gap-3.5 px-5 py-4 text-left cursor-pointer transition-colors hover:bg-neutral-50", n.readAt ? "" : "bg-neutral-50/60"].join(" ")}
                  >
                    <span
                      className={[
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        n.readAt ? "bg-neutral-100 text-neutral-500" : "bg-neutral-900 text-white",
                      ].join(" ")}
                    >
                      {k.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={["text-[13.5px] leading-snug", n.readAt ? "font-medium text-neutral-700" : "font-semibold text-neutral-900"].join(" ")}>{n.title}</span>
                        {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" aria-label="unread" />}
                      </span>
                      <span className="block text-[13px] text-neutral-500 mt-0.5 leading-relaxed">{n.body}</span>
                      <span className="block text-[11.5px] text-neutral-400 mt-1.5">
                        {k.label} · {fmtRelative(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </>
  );
}
