import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { teamCalendar } from "../lib/server/services/employees";
import { actOnRequest, createRequest } from "../lib/server/services/requests";
import { actor, fresh, weekRange } from "./helpers";

describe("team vacation calendar coverage", () => {
  beforeEach(fresh);

  it("accepts same-day requests from different employees and keeps a full-team conflict visible after approval", async () => {
    const manager = await actor("emp-m1");
    const range = weekRange(3);
    const requests = [];
    for (const id of ["emp-e1", "emp-e2", "emp-e3", "emp-e4"]) {
      requests.push(await createRequest(await actor(id), {
        type: "vacation",
        startDate: range.startDate,
        endDate: range.startDate,
      }));
    }

    const openCalendar = await teamCalendar(manager, range.startDate, 7);
    const openConflict = openCalendar.conflicts.find((item) => item.date === range.startDate);
    assert.deepEqual(openConflict && { absent: openConflict.absent, total: openConflict.total, pending: openConflict.pendingRequestIds.length }, {
      absent: 4,
      total: 4,
      pending: 4,
    });

    for (const request of requests) {
      await actOnRequest(manager, request.id, { action: "start_review" });
      await actOnRequest(manager, request.id, { action: "approve" });
    }

    const approvedCalendar = await teamCalendar(manager, range.startDate, 7);
    const approvedConflict = approvedCalendar.conflicts.find((item) => item.date === range.startDate);
    assert.deepEqual(approvedConflict && { absent: approvedConflict.absent, total: approvedConflict.total, pending: approvedConflict.pendingRequestIds.length }, {
      absent: 4,
      total: 4,
      pending: 0,
    });
  });
});
