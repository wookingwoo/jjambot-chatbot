import { describe, expect, it } from "vitest";
import { daysBetween, parseDateToISO } from "../src/dates.js";

describe("calendar validation", () => {
  it.each(["2026-02-30", "2026-02-29", "2026-13-01", "2026-00-12", "2026-01-00", "2026-04-31", "2026-01-32", "0000-01-01"])("rejects impossible date %s", (raw) => {
    expect(parseDateToISO(raw)).toBeNull();
    expect(parseDateToISO(JSON.stringify({ date: raw }))).toBeNull();
  });
  it.each(["2024-02-29", "2024.02.29", "20240229", '{"date":"2024-02-29"}'])("accepts valid leap day %s", (raw) => {
    expect(parseDateToISO(raw)).toBe("2024-02-29");
  });
  it("safely handles null, undefined, or non-string inputs", () => {
    expect(parseDateToISO(null)).toBeNull();
    expect(parseDateToISO(undefined)).toBeNull();
    expect(parseDateToISO("" as any)).toBeNull();
    expect(parseDateToISO(12345 as any)).toBeNull();
  });
});

describe("daysBetween", () => {
  it("calculates difference between valid ISO dates", () => {
    expect(daysBetween("2026-01-01", "2026-01-10")).toBe(9);
  });
  it("handles non-string inputs safely", () => {
    expect(daysBetween(null as any, "2026-01-10")).toBe(0);
  });
});
