import { describe, expect, it } from "vitest";
import { parseDateToISO } from "../src/dates.js";

describe("calendar validation", () => {
  it.each(["2026-02-30", "2026-02-29", "2026-13-01", "2026-00-12", "2026-01-00", "2026-04-31", "2026-01-32", "0000-01-01"])("rejects impossible date %s", (raw) => {
    expect(parseDateToISO(raw)).toBeNull();
    expect(parseDateToISO(JSON.stringify({ date: raw }))).toBeNull();
  });
  it.each(["2024-02-29", "2024.02.29", "20240229", '{"date":"2024-02-29"}'])("accepts valid leap day %s", (raw) => {
    expect(parseDateToISO(raw)).toBe("2024-02-29");
  });
});
