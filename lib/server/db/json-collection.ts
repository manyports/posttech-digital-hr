import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { Collection, Filter, FindOptions, UpdateOps } from "./types";

const clone = <T>(value: T): T => structuredClone(value);

function matches(doc: Record<string, unknown>, filter: Filter) {
  return Object.entries(filter).every(([key, condition]) => {
    const value = doc[key];
    if (condition !== null && typeof condition === "object" && !Array.isArray(condition)) {
      const ops = condition as Record<string, unknown>;
      if ("$in" in ops && !(ops.$in as unknown[]).includes(value)) return false;
      if ("$ne" in ops && value === ops.$ne) return false;
      if ("$gte" in ops && !((value as number) >= (ops.$gte as number))) return false;
      if ("$lt" in ops && !((value as number) < (ops.$lt as number))) return false;
      return true;
    }
    return value === condition;
  });
}

/** Atomic, local JSON-backed collection for the no-Mongo demo configuration. */
export class JsonFileCollection<T extends { _id: string }> implements Collection<T> {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly path: string) {}

  private async load(): Promise<T[]> {
    try {
      const text = await readFile(this.path, "utf8");
      const value: unknown = JSON.parse(text);
      if (!Array.isArray(value)) throw new Error("Knowledge-base JSON must contain an array.");
      return value as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  private async save(docs: T[]) {
    await mkdir(dirname(this.path), { recursive: true });
    const tempPath = `${this.path}.${randomUUID()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(docs, null, 2)}\n`, "utf8");
    await rename(tempPath, this.path);
  }

  private async mutate<R>(fn: (docs: T[]) => R): Promise<R> {
    let release!: () => void;
    const previous = this.queue;
    this.queue = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try {
      const docs = await this.load();
      const result = fn(docs);
      await this.save(docs);
      return result;
    } finally { release(); }
  }

  async find(filter: Filter = {}, opts: FindOptions = {}): Promise<T[]> {
    let docs = (await this.load()).filter((doc) => matches(doc as Record<string, unknown>, filter));
    if (opts.sort) {
      const sort = Object.entries(opts.sort);
      docs = [...docs].sort((a, b) => {
        for (const [key, direction] of sort) {
          const left = (a as Record<string, unknown>)[key] as string | number | undefined;
          const right = (b as Record<string, unknown>)[key] as string | number | undefined;
          if (left === right) continue;
          if (left === undefined || left === null) return -direction;
          if (right === undefined || right === null) return direction;
          return (left < right ? -1 : 1) * direction;
        }
        return 0;
      });
    }
    return (opts.limit === undefined ? docs : docs.slice(0, opts.limit)).map(clone);
  }

  async findOne(filter: Filter): Promise<T | null> {
    return clone((await this.load()).find((doc) => matches(doc as Record<string, unknown>, filter)) ?? null);
  }

  async count(filter: Filter = {}): Promise<number> {
    return (await this.load()).filter((doc) => matches(doc as Record<string, unknown>, filter)).length;
  }

  async insertOne(doc: T): Promise<void> {
    await this.mutate((docs) => {
      if (docs.some((item) => item._id === doc._id)) throw new Error(`Duplicate _id ${doc._id}`);
      docs.push(clone(doc));
    });
  }

  async insertMany(docs: T[]): Promise<void> {
    await this.mutate((current) => {
      const ids = new Set(current.map((item) => item._id));
      for (const doc of docs) {
        if (ids.has(doc._id)) throw new Error(`Duplicate _id ${doc._id}`);
        ids.add(doc._id);
      }
      current.push(...docs.map(clone));
    });
  }

  async updateOne(filter: Filter, update: UpdateOps): Promise<boolean> {
    return this.mutate((docs) => {
      const doc = docs.find((item) => matches(item as Record<string, unknown>, filter));
      if (!doc) return false;
      const target = doc as Record<string, unknown>;
      if (update.$set) Object.assign(target, clone(update.$set));
      if (update.$push) for (const [key, value] of Object.entries(update.$push)) {
        const array = (target[key] as unknown[] | undefined) ?? [];
        array.push(clone(value)); target[key] = array;
      }
      if (update.$inc) for (const [key, value] of Object.entries(update.$inc)) target[key] = ((target[key] as number | undefined) ?? 0) + value;
      return true;
    });
  }

  async deleteMany(filter: Filter = {}): Promise<number> {
    return this.mutate((docs) => {
      const remaining = docs.filter((doc) => !matches(doc as Record<string, unknown>, filter));
      const removed = docs.length - remaining.length;
      docs.splice(0, docs.length, ...remaining);
      return removed;
    });
  }

  async upsertOne(doc: T): Promise<void> {
    await this.mutate((docs) => {
      const index = docs.findIndex((item) => item._id === doc._id);
      if (index < 0) docs.push(clone(doc)); else docs[index] = clone(doc);
    });
  }
}
