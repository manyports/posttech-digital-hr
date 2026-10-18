import assert from "node:assert/strict";
import { after } from "node:test";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { rm } from "node:fs/promises";
import { addDays, nextWeekday, todayISO } from "../lib/domain/dates";
import { getDb, resetDemoData } from "../lib/server/db";
import { HttpError } from "../lib/server/errors";
import type { Actor } from "../lib/server/policy";

const testKnowledgeStore = resolve(process.cwd(), `.test-ai-jana-${randomUUID()}.json`);
process.env.JANA_KB_STORE_PATH ??= testKnowledgeStore;
after(async () => { await rm(testKnowledgeStore, { force: true }); });

/** Restore pristine fake data (in-memory DB). Call in beforeEach. */
export const fresh = () => resetDemoData();

/** Build an Actor exactly as the session layer would (from the employee record). */
export async function actor(id: string): Promise<Actor> {
  const db = await getDb();
  const e = await db.employees.findOne({ _id: id });
  assert.ok(e, `seed employee ${id} exists`);
  return {
    id: e._id,
    fullName: e.fullName,
    email: e.email,
    role: e.role,
    position: e.position,
    department: e.department,
  };
}

/** Assert that a promise rejects with the given HTTP status. */
export async function rejectsWith(p: Promise<unknown>, status: number, label = "") {
  await assert.rejects(p, (err: unknown) => {
    assert.ok(err instanceof HttpError, `${label} expected HttpError, got ${String(err)}`);
    assert.equal(err.status, status, `${label} expected ${status}, got ${err.status}: ${err.message}`);
    return true;
  });
}

/** A Monday `weeks` weeks from now, and the Friday of that same week. */
export function weekRange(weeks: number): { startDate: string; endDate: string } {
  const monday = nextWeekday(addDays(todayISO(), weeks * 7), 1);
  return { startDate: monday, endDate: addDays(monday, 4) };
}
