import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseVacationRange } from "../lib/assistant/vacation-phrase";

describe("vacation phrase", () => {
  it("reads a Russian day range in the coming month", () => {
    const range = parseVacationRange("Хочу отпуск с 12 по 16 ноября", "2026-10-17");
    assert.deepEqual(range, { startDate: "2026-11-12", endDate: "2026-11-16" });
  });

  it("reads a Kazakh day range", () => {
    const range = parseVacationRange("12 қарашадан 16 қарашаға дейін демалыс", "2026-10-17");
    assert.deepEqual(range, { startDate: "2026-11-12", endDate: "2026-11-16" });
  });

  it("reads an ISO range", () => {
    const range = parseVacationRange("vacation 2026-11-12 to 2026-11-16", "2026-10-17");
    assert.deepEqual(range, { startDate: "2026-11-12", endDate: "2026-11-16" });
  });

  it("returns null when there is no range", () => {
    assert.equal(parseVacationRange("Сколько дней отпуска мне положено?", "2026-10-17"), null);
  });
});
