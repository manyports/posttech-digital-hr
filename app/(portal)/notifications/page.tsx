"use client";

import { useRouter } from "next/navigation";
import type { NotificationKind, NotificationView } from "@/lib/domain/types";
import { fmtRelative } from "@/lib/client/format";
import { useI18n } from "@/lib/i18n/I18nProvider";

const RELATIVE_TIME_REFERENCE = Date.now();
import { localizeBody, localizeTitle } from "@/lib/i18n/notices";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { BellIcon, BookIcon, DocIcon, InboxIcon, ChatIcon } from "../../components/portal/icons";
import { useNotifications } from "../../components/portal/NotificationsProvider";
import { LoadingBlock, PageHeader, Panel } from "../../components/portal/Panel";

export default function NotificationsPage() {
  const router = useRouter();
  const { m, locale } = useI18n();
  const { notifications, unread, loading, markRead, markAllRead } = useNotifications();
  const KIND: Record<NotificationKind, { icon: React.ReactNode; label: string }> = {
    request: { icon: <DocIcon size={15} />, label: m.notices.request },
    course: { icon: <BookIcon size={15} />, label: m.notices.course },
    escalation: { icon: <ChatIcon size={15} />, label: m.notices.assistant },
    system: { icon: <InboxIcon size={15} />, label: m.notices.system },
  };

  async function open(n: NotificationView) {
    if (!n.readAt) await markRead([n.id]);
    if (n.href) router.push(n.href);
  }

  return (
    <>
      <PageHeader
        title={m.notices.title}
        actions={
          <Button variant="secondary" size="sm" disabled={unread === 0} onClick={() => void markAllRead()}>
            {m.notices.markAll}
          </Button>
        }
      />

      {loading && notifications.length === 0 && <LoadingBlock rows={3} />}

      {!loading && notifications.length === 0 && (
        <EmptyState icon={<BellIcon size={20} />} title={m.notices.empty} description={m.notices.emptyHint} />
      )}

      {notifications.length > 0 && (
        <Panel padding="p-0" as="div">
          <ul className="divide-y divide-hero-border">
            {notifications.map((n) => {
              const k = KIND[n.kind];
              return (
                <li key={n.id}>
                  <button
                    onClick={() => void open(n)}
                    className={["w-full flex items-start gap-3.5 px-5 py-4 text-left cursor-pointer transition-colors hover-wipe", n.readAt ? "" : "bg-hero-cell-bg/60"].join(" ")}
                  >
                    <span
                      className={[
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        n.readAt ? "bg-hero-cell-bg text-hero-muted" : "bg-hero-foreground text-hero-on-foreground",
                      ].join(" ")}
                    >
                      {k.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={["text-[13.5px] leading-snug", n.readAt ? "font-medium text-hero-foreground" : "font-semibold text-hero-foreground"].join(" ")}>{localizeTitle(n.title, locale)}</span>
                        {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-hero-foreground" aria-label={m.common.unread} />}
                      </span>
                      <span className="block text-[13px] text-hero-muted mt-0.5 leading-relaxed">{localizeBody(n.body, locale)}</span>
                      <span className="block text-[11.5px] text-tertiary mt-1.5">
                        {k.label} · {fmtRelative(n.createdAt, RELATIVE_TIME_REFERENCE, locale)}
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
