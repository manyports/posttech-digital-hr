import { buildSeed } from "../../seed/seed";
import { createMongoDb } from "./mongo";
import { createLocalKnowledgeCollection, createMemoryAiRateLimitCollection, MemoryDb } from "./memory";
import { RESETTABLE, type Db } from "./types";

/**
 * Single entry point to the database.
 *
 * - No MONGODB_URI  -> in-memory mock DB (default; great for local demos).
 *                      State lives on `globalThis`, so it survives Next.js
 *                      hot reloads but is per-process (NOT shared between
 *                      serverless instances).
 * - MONGODB_URI set -> MongoDB (persistent; use this when deployed to a
 *                      serverless platform).
 *
 * The first call seeds fake demo data if the employees collection is empty.
 */

const g = globalThis as unknown as { __hrDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!g.__hrDb) {
    g.__hrDb = init().catch((err) => {
      g.__hrDb = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return g.__hrDb.then(async (db) => {
    if (db.kind === "mongodb" && !process.env.MONGODB_URI) {
      g.__hrDb = undefined;
      return getDb();
    }
    // Next.js hot reload can retain a DB created before this collection existed.
    if (db.knowledgeArticles && db.aiRateLimits) return db;
    if (db.kind === "memory") {
      db.knowledgeArticles ??= createLocalKnowledgeCollection();
      db.aiRateLimits ??= createMemoryAiRateLimitCollection();
      return db;
    }
    g.__hrDb = undefined;
    return getDb();
  });
}

async function init(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  let db: Db;
  if (uri) {
    try {
      db = await createMongoDb(uri, process.env.MONGODB_DB ?? "digital_hr");
    } catch {
      console.warn("MongoDB is unavailable; Al Jana is using the local JSON knowledge base.");
      db = new MemoryDb();
    }
  } else {
    db = new MemoryDb();
  }
  await seedIfEmpty(db);
  return db;
}

const isDuplicateKey = (err: unknown) =>
  err instanceof Error && /E11000|Duplicate _id/.test(err.message);

async function insertSeed(db: Db) {
  const seed = buildSeed();
  const tolerant = async (p: Promise<void>) => {
    try {
      await p;
    } catch (err) {
      // Two cold serverless instances may seed at the same moment.
      if (!isDuplicateKey(err)) throw err;
    }
  };
  await tolerant(db.employees.insertMany(seed.employees));
  await tolerant(db.courses.insertMany(seed.courses));
  await tolerant(db.requests.insertMany(seed.requests));
  await tolerant(db.assignments.insertMany(seed.assignments));
  await tolerant(db.notifications.insertMany(seed.notifications));
}

async function seedIfEmpty(db: Db) {
  if ((await db.employees.count()) === 0) {
    await insertSeed(db);
  } else {
    // Course content ships with the code: refresh it in place (the stored copy
    // stays readable throughout). Off the critical path: a cold start doesn't
    // wait for it.
    void Promise.all(buildSeed().courses.map((c) => db.courses.upsertOne(c))).catch((err) =>
      console.error("Course refresh failed", err),
    );
  }
}

/** Wipe all business data (not sessions) and restore the pristine demo seed. */
export async function resetDemoData(): Promise<void> {
  const db = await getDb();
  for (const name of RESETTABLE) await db[name].deleteMany({});
  await db.resetSeqs();
  await insertSeed(db);
}

export type { Db } from "./types";
