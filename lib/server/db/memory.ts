import type { Collection, Db, Filter, FindOptions, UpdateOps } from "./types";
import { resolve } from "node:path";
import { JsonFileCollection } from "./json-collection";
import type { KnowledgeArticleDoc } from "../../domain/types";

export function createLocalKnowledgeCollection() {
  return new JsonFileCollection<KnowledgeArticleDoc>(
    process.env.JANA_KB_STORE_PATH ?? resolve(process.cwd(), "data/ai-jana-knowledge.json"),
  );
}

export function createMemoryAiRateLimitCollection(): Db["aiRateLimits"] {
  return new MemoryCollection();
}

/** Deep-clone so callers can never mutate stored state by accident. */
const clone = <T>(v: T): T => structuredClone(v);

function matches(doc: Record<string, unknown>, filter: Filter): boolean {
  for (const [key, cond] of Object.entries(filter)) {
    const value = doc[key];
    if (cond !== null && typeof cond === "object" && !Array.isArray(cond)) {
      const ops = cond as Record<string, unknown>;
      if ("$in" in ops && !(ops.$in as unknown[]).includes(value)) return false;
      if ("$ne" in ops && value === ops.$ne) return false;
      if ("$gte" in ops && !((value as number) >= (ops.$gte as number))) return false;
      if ("$lt" in ops && !((value as number) < (ops.$lt as number))) return false;
      continue;
    }
    if (value !== cond) return false;
  }
  return true;
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  return (a as string | number) < (b as string | number) ? -1 : 1;
}

class MemoryCollection<T extends { _id: string }> implements Collection<T> {
  private docs = new Map<string, T>();

  async find(filter: Filter = {}, opts: FindOptions = {}): Promise<T[]> {
    let out = [...this.docs.values()].filter((d) =>
      matches(d as Record<string, unknown>, filter),
    );
    if (opts.sort) {
      const entries = Object.entries(opts.sort);
      out.sort((a, b) => {
        for (const [key, dir] of entries) {
          const c = compare(
            (a as Record<string, unknown>)[key],
            (b as Record<string, unknown>)[key],
          );
          if (c !== 0) return c * dir;
        }
        return 0;
      });
    }
    if (opts.limit !== undefined) out = out.slice(0, opts.limit);
    return out.map(clone);
  }

  async findOne(filter: Filter): Promise<T | null> {
    for (const d of this.docs.values()) {
      if (matches(d as Record<string, unknown>, filter)) return clone(d);
    }
    return null;
  }

  async count(filter: Filter = {}): Promise<number> {
    let n = 0;
    for (const d of this.docs.values()) {
      if (matches(d as Record<string, unknown>, filter)) n++;
    }
    return n;
  }

  async countBy(filter: Filter, field: keyof T & string): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    for (const doc of this.docs.values()) {
      if (!matches(doc as Record<string, unknown>, filter)) continue;
      const key = doc[field];
      if (typeof key === "string") counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }

  async insertOne(doc: T): Promise<void> {
    if (this.docs.has(doc._id)) throw new Error(`Duplicate _id ${doc._id}`);
    this.docs.set(doc._id, clone(doc));
  }

  async insertMany(docs: T[]): Promise<void> {
    for (const d of docs) await this.insertOne(d);
  }

  // JS is single-threaded and this method has no awaits, so it is atomic.
  async updateOne(filter: Filter, update: UpdateOps): Promise<boolean> {
    for (const d of this.docs.values()) {
      if (!matches(d as Record<string, unknown>, filter)) continue;
      const target = d as Record<string, unknown>;
      if (update.$set) Object.assign(target, clone(update.$set));
      if (update.$push) {
        for (const [k, v] of Object.entries(update.$push)) {
          const arr = (target[k] as unknown[] | undefined) ?? [];
          arr.push(clone(v));
          target[k] = arr;
        }
      }
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          target[k] = ((target[k] as number | undefined) ?? 0) + v;
        }
      }
      return true;
    }
    return false;
  }

  async updateMany(filter: Filter, update: UpdateOps): Promise<number> {
    let count = 0;
    for (const d of this.docs.values()) {
      if (!matches(d as Record<string, unknown>, filter)) continue;
      const target = d as Record<string, unknown>;
      if (update.$set) Object.assign(target, clone(update.$set));
      if (update.$push) {
        for (const [k, v] of Object.entries(update.$push)) {
          const arr = (target[k] as unknown[] | undefined) ?? [];
          arr.push(clone(v));
          target[k] = arr;
        }
      }
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          target[k] = ((target[k] as number | undefined) ?? 0) + v;
        }
      }
      count++;
    }
    return count;
  }

  async deleteMany(filter: Filter = {}): Promise<number> {
    let n = 0;
    for (const [id, d] of [...this.docs.entries()]) {
      if (matches(d as Record<string, unknown>, filter)) {
        this.docs.delete(id);
        n++;
      }
    }
    return n;
  }

  async upsertOne(doc: T): Promise<void> {
    this.docs.set(doc._id, clone(doc));
  }
}

type DocOf<K extends keyof Db> = Db[K] extends Collection<infer T> ? T : never;

function col<K extends keyof Db>(): Db[K] {
  return new MemoryCollection<DocOf<K>>() as unknown as Db[K];
}

export class MemoryDb implements Db {
  readonly kind = "memory" as const;
  employees = col<"employees">();
  requests = col<"requests">();
  notifications = col<"notifications">();
  courses = col<"courses">();
  assignments = col<"assignments">();
  escalations = col<"escalations">();
  assistantLog = col<"assistantLog">();
  sessions = col<"sessions">();
  knowledgeArticles = createLocalKnowledgeCollection();
  aiRateLimits = createMemoryAiRateLimitCollection();
  private seqs = new Map<string, number>();

  async nextSeq(name: string): Promise<number> {
    const n = (this.seqs.get(name) ?? 0) + 1;
    this.seqs.set(name, n);
    return n;
  }

  async resetSeqs(): Promise<void> {
    this.seqs.clear();
  }
}
