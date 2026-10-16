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
  const docs = await db.notifications.find(
    { userId: actor.id },
    { sort: { createdAt: -1 }, limit },
  );
  const unread = await db.notifications.count({ userId: actor.id, readAt: null });
  return { notifications: docs.map(toView), unread };
}

export async function markRead(actor: Actor, input: { ids?: string[]; all?: boolean }) {
  const db = await getDb();
  const readAt = new Date().toISOString();
  if (input.all) {
    const unread = await db.notifications.find({ userId: actor.id, readAt: null });
    for (const n of unread) {
      await db.notifications.updateOne({ _id: n._id, userId: actor.id }, { $set: { readAt } });
    }
    return;
  }
  if (!Array.isArray(input.ids) || input.ids.some((i) => typeof i !== "string")) {
    throw badRequest("Provide `ids` (string[]) or `all: true`.");
  }
  for (const id of input.ids) {
    // userId in the filter: a user can only ever mark their own notifications.
    await db.notifications.updateOne({ _id: id, userId: actor.id, readAt: null }, { $set: { readAt } });
  }
}
