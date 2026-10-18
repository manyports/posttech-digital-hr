import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lastAllowedEnd, workingDays } from "../lib/domain/dates";

// 2026-07-13 is a Monday.
describe("lastAllowedEnd", () => {
  it("stops on the last working day that fits, keeping the free weekend after it", () => {
    assert.equal(lastAllowedEnd("2026-07-13", 5), "2026-07-19");
    assert.equal(workingDays("2026-07-13", "2026-07-19"), 5);
  });

  it("allows exactly one day when the cap is one", () => {
    assert.equal(lastAllowedEnd("2026-07-15", 1), "2026-07-15");
  });

  it("counts a weekend start as free", () => {
    // Sat 18 + Sun 19 are free, Mon 20 and Tue 21 use the two days.
    assert.equal(lastAllowedEnd("2026-07-18", 2), "2026-07-21");
  });

  it("returns null when no day can be taken", () => {
    assert.equal(lastAllowedEnd("2026-07-13", 0), null);
  });

  it("never yields a range over the cap", () => {
    for (let cap = 1; cap <= 30; cap++) {
      const end = lastAllowedEnd("2026-07-16", cap)!;
      assert.equal(workingDays("2026-07-16", end), cap);
    }
  });
});

describe("workingDays", () => {
  it("counts partial weeks and very long ranges", () => {
    assert.equal(workingDays("2026-07-18", "2026-07-19"), 0);
    assert.equal(workingDays("2026-07-18", "2026-07-20"), 1);
    assert.equal(workingDays("2026-07-20", "2026-07-18"), 0);
    const days = (Date.UTC(9999, 11, 31) - Date.UTC(2026, 0, 1)) / 86_400_000 + 1;
    assert.ok(workingDays("2026-01-01", "9999-12-31") >= Math.floor(days / 7) * 5);
  });
});
