import type { Collection as MongoCollection, Db as MongoDbHandle } from "mongodb";
import type { Collection, Db, Filter, FindOptions, UpdateOps } from "./types";


/**
 * MongoDB adapter: a thin, 1:1 mapping of our Collection interface onto the
 * official driver. All documents use string `_id`s, so no ObjectId handling.
 * The driver is imported lazily so memory mode never loads it.
 */

class MongoBackedCollection<T extends { _id: string }> implements Collection<T> {
  constructor(private readonly c: MongoCollection) {}

  async find(filter: Filter = {}, opts: FindOptions = {}): Promise<T[]> {
    let cursor = this.c.find(filter);
    if (opts.sort) cursor = cursor.sort(opts.sort);
    if (opts.limit !== undefined) cursor = cursor.limit(opts.limit);
    return (await cursor.toArray()) as unknown as T[];
  }

  async findOne(filter: Filter): Promise<T | null> {
    return (await this.c.findOne(filter)) as unknown as T | null;
  }

  count(filter: Filter = {}): Promise<number> {
    return this.c.countDocuments(filter);
  }

  async insertOne(doc: T): Promise<void> {
    await this.c.insertOne(doc as never);
  }

  async insertMany(docs: T[]): Promise<void> {
    if (docs.length) await this.c.insertMany(docs as never[]);
  }

  async updateOne(filter: Filter, update: UpdateOps): Promise<boolean> {
    const res = await this.c.updateOne(filter, update as never);
    return res.matchedCount > 0;
  }

  async deleteMany(filter: Filter = {}): Promise<number> {
    return (await this.c.deleteMany(filter)).deletedCount;
  }

  async upsertOne(doc: T): Promise<void> {
    await this.c.replaceOne({ _id: doc._id } as never, doc as never, { upsert: true });
  }
}

/**
 * Indexes for the queries the services actually run. `createIndexes` is a
 * no-op for indexes that already exist, so this is safe on every cold start.
 */
async function ensureIndexes(handle: MongoDbHandle) {
  await Promise.all([
    handle.collection("employees").createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { managerId: 1, active: 1 } },
      { key: { role: 1, active: 1 } },
    ]),
    handle.collection("requests").createIndexes([
      { key: { employeeId: 1, createdAt: -1 } },
      { key: { approverId: 1, status: 1 } },
      { key: { status: 1 } },
    ]),
    handle.collection("notifications").createIndexes([{ key: { userId: 1, createdAt: -1 } }]),
    handle.collection("assignments").createIndexes([{ key: { userId: 1, courseId: 1 } }]),
    handle.collection("escalations").createIndexes([{ key: { userId: 1, status: 1 } }, { key: { status: 1 } }]),
    handle.collection("assistantLog").createIndexes([{ key: { outcome: 1 } }]),
    handle.collection("sessions").createIndexes([{ key: { expiresAt: 1 } }]),
  ]);
}

export async function createMongoDb(uri: string, dbName: string): Promise<Db> {
  const { MongoClient } = await import("mongodb");
  // Reuse the client across serverless invocations of a warm instance.
  const g = globalThis as unknown as { __hrMongoClient?: Promise<InstanceType<typeof MongoClient>> };
  g.__hrMongoClient ??= new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 3000 }).connect();
  let client;
  try {
    client = await g.__hrMongoClient;
  } catch (error) {
    g.__hrMongoClient = undefined;
    throw error;
  }
  const handle: MongoDbHandle = client.db(dbName);
  // Indexes speed queries up but nothing depends on them existing yet, so a
  // cold start doesn't wait for this.
  void ensureIndexes(handle).catch((err) => console.error("Index setup failed", err));

  const col = <K extends keyof Db>(name: K): Db[K] =>
    new MongoBackedCollection(handle.collection(name as string)) as unknown as Db[K];

  const counters = handle.collection<{ _id: string; seq: number }>("counters");

  return {
    kind: "mongodb",
    employees: col("employees"),
    requests: col("requests"),
    notifications: col("notifications"),
    courses: col("courses"),
    assignments: col("assignments"),
    escalations: col("escalations"),
    assistantLog: col("assistantLog"),
    sessions: col("sessions"),
    knowledgeArticles: col("knowledgeArticles"),
    async nextSeq(name: string) {
      const res = await counters.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
      return res?.seq ?? 1;
    },
    async resetSeqs() {
      await counters.deleteMany({});
    },
  };
}
