import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { getProfile, listTeam } from "../lib/server/services/employees";
import { listNotifications } from "../lib/server/services/notifications";
import {
  actOnRequest,
  createRequest,
  getRequest,
  listApprovals,
} from "../lib/server/services/requests";
import { actor, fresh, rejectsWith, weekRange } from "./helpers";

beforeEach(fresh);

describe("critical employee -> manager -> employee journey", () => {
  it("completes the leave flow while keeping role scopes isolated", async () => {
    const employee = await actor("emp-e1");
    const manager = await actor("emp-m1");
    const hr = await actor("emp-hr1");

    assert.equal((await getProfile(employee)).fullName, "Aruzhan Kassymova");
    await rejectsWith(getProfile(employee, "emp-e5"), 403, "employee cannot see another employee");

    const request = await createRequest(employee, {
      type: "vacation",
      ...weekRange(20),
      comment: "Planned leave",
    });
    assert.ok((await listApprovals(manager)).some((item) => item.id === request.id));
    await rejectsWith(getRequest(manager, "REQ-1006"), 403, "manager cannot see another team");

    await actOnRequest(manager, request.id, { action: "start_review" });
    await actOnRequest(manager, request.id, { action: "approve", comment: "Approved" });
    assert.equal((await getRequest(employee, request.id)).status, "approved");
    assert.ok((await listNotifications(employee)).notifications.some((notice) => notice.body.includes(request.id)));

    assert.equal((await listTeam(hr)).length, 10);
    assert.ok((await listApprovals(hr)).some((item) => item.id === request.id));
  });
});
