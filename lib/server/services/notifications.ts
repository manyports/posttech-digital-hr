import { randomUUID } from "node:crypto";
import type {
  NotificationDoc,
  NotificationKind,
  NotificationView,
} from "../../domain/types";
import { getDb } from "../db";
import type { Db } from "../db";
import { badRequest } from "../errors";
import type { Actor } from "../policy";

// Strictly increasing timestamps: two notifications raised in the same
// millisecond must still sort deterministically (newest first).
let lastStamp = 0;
function monotonicNow(): string {
  lastStamp = Math.max(Date.now(), lastStamp + 1);
  return new Date(lastStamp).toISOString();
}

/** Create a notification. Called by other services when something happens. */
export async function notify(
  db: Db,
  userId: string,
  n: { kind: NotificationKind; title: string; body: string; href?: string },
): Promise<void> {
  const doc: NotificationDoc = {
    _id: `ntf-${randomUUID().slice(0, 12)}`,
    userId,
    ...n,
    createdAt: monotonicNow(),
    readAt: null,
  };
  await db.notifications.insertOne(doc);
}

const toView = (n: NotificationDoc): NotificationView => ({
  id: n._id,
  kind: n.kind,
  title: n.title,
  body: n.body,
  href: n.href,
  createdAt: n.createdAt,
  readAt: n.readAt,
});

/** The caller's own notifications, newest first. Nobody can read others'. */
export async function listNotifications(actor: Actor, limit = 50) {
  const db = await getDb();
  const [docs, unread] = await Promise.all([
    db.notifications.find({ userId: actor.id }, { sort: { createdAt: -1 }, limit }),
    db.notifications.count({ userId: actor.id, readAt: null }),
  ]);
  return { notifications: docs.map(toView), unread };
}

export async function markRead(actor: Actor, input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw badRequest("Provide `ids` (string[]) or `all: true`.");
  }
  const { ids, all } = input as { ids?: unknown; all?: unknown };
  const db = await getDb();
  const readAt = new Date().toISOString();
  if (all === true) {
    await db.notifications.updateMany({ userId: actor.id, readAt: null }, { $set: { readAt } });
    return;
  }
  if (!Array.isArray(ids) || ids.length > 1000 || ids.some((i) => typeof i !== "string")) {
    throw badRequest("Provide `ids` (string[]) or `all: true`.");
  }
  if (ids.length === 0) return;
  // userId in the filter: a user can only ever mark their own notifications.
  await db.notifications.updateMany(
    { _id: { $in: [...new Set(ids)] }, userId: actor.id, readAt: null },
    { $set: { readAt } },
  );
}
