import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { buildSeed } from "../lib/seed/seed";
import { getDb, resetDemoData } from "../lib/server/db";
import { createRequest } from "../lib/server/services/requests";
import { actor, fresh, weekRange } from "./helpers";

// Runs on whichever backend getDb() picks: memory by default, MongoDB under `npm run test:mongo`.
describe("demo data reset", () => {
  beforeEach(fresh);

  it("puts every collection back to the seed and restarts ids", async () => {
    const db = await getDb();
    const seed = buildSeed();
    const me = await actor("emp-e1");

    const first = await createRequest(me, { type: "vacation", ...weekRange(3) });
    assert.equal(first.id, "REQ-2001");
    await db.employees.updateOne({ _id: "emp-e1" }, { $set: { position: "Changed" } });

    await resetDemoData();

    assert.equal(await db.requests.count(), seed.requests.length);
    assert.equal(await db.requests.findOne({ _id: first.id }), null);
    assert.equal(await db.employees.count(), seed.employees.length);
    assert.equal((await db.employees.findOne({ _id: "emp-e1" }))?.position, seed.employees.find((e) => e._id === "emp-e1")?.position);
    assert.equal(await db.escalations.count(), 0);

    const again = await createRequest(me, { type: "vacation", ...weekRange(3) });
    assert.equal(again.id, "REQ-2001");
  });

  it("keeps sessions, so whoever pressed reset stays signed in", async () => {
    const db = await getDb();
    await db.sessions.insertOne({ _id: "tok", userId: "emp-hr1", createdAt: "2026-01-01T00:00:00.000Z", expiresAt: "2999-01-01T00:00:00.000Z" });
    await resetDemoData();
    assert.ok(await db.sessions.findOne({ _id: "tok" }));
    await db.sessions.deleteMany({ _id: "tok" });
  });

  it("upsertOne inserts, then replaces in place", async () => {
    const db = await getDb();
    const course = structuredClone(buildSeed().courses[0]);
    await db.courses.upsertOne({ ...course, title: "Edited" });
    assert.equal((await db.courses.findOne({ _id: course._id }))?.title, "Edited");
    assert.equal(await db.courses.count({ _id: course._id }), 1);
  });
});
