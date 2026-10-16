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
}

export async function createMongoDb(uri: string, dbName: string): Promise<Db> {
  const { MongoClient } = await import("mongodb");
  // Reuse the client across serverless invocations of a warm instance.
  const g = globalThis as unknown as { __hrMongoClient?: Promise<InstanceType<typeof MongoClient>> };
  g.__hrMongoClient ??= new MongoClient(uri, { maxPoolSize: 5 }).connect();
  const client = await g.__hrMongoClient;
  const handle: MongoDbHandle = client.db(dbName);

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
    async nextSeq(name: string) {
      const res = await counters.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
      return res?.seq ?? 1;
    },
  };
}
