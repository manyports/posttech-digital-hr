import { getDb, type Db } from "../db";
import { HttpError } from "../errors";

const MINUTE = 60_000;
const DAY = 86_400_000;

async function take(db: Db, key: string, limit: number, until: number) {
  const updated = await db.aiRateLimits.updateOne({ _id: key, count: { $lt: limit } }, { $inc: { count: 1 } });
  if (updated) return;
  try {
    await db.aiRateLimits.insertOne({ _id: key, count: 1, expiresAt: new Date(until) });
    return;
  } catch (error) {
    if (!(error instanceof Error) || !/E11000|Duplicate _id/.test(error.message)) throw error;
  }
  const raced = await db.aiRateLimits.updateOne({ _id: key, count: { $lt: limit } }, { $inc: { count: 1 } });
  if (!raced) throw new HttpError(429, "ai_rate_limited", "AI generation limit reached. Please try again later.");
}

export async function consumeAiQuota(userId: string, now = Date.now(), db?: Db) {
  const store = db ?? await getDb();
  if (process.env.MONGODB_URI && store.kind !== "mongodb") {
    throw new HttpError(503, "ai_unavailable", "AI generation requires the shared database while MongoDB is unavailable.");
  }
  const minute = Math.floor(now / MINUTE);
  const day = Math.floor(now / DAY);
  await take(store, `user-minute:${userId}:${minute}`, 3, (minute + 1) * MINUTE);
  await take(store, `user-day:${userId}:${day}`, 20, (day + 1) * DAY);
  await take(store, `global-minute:${minute}`, 10, (minute + 1) * MINUTE);
}
