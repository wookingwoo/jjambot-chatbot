import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(),
  incrementUsage: vi.fn(),
  updateUser: vi.fn(),
}));

import { app } from "../src/app.js";
import { getOrCreateUser, updateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateUser).mockResolvedValue(baseUser);
});

describe("POST /skill/join-date/change", () => {
  it("parses a YYYY-MM-DD param and stores it", async () => {
    const res = await app.request("/skill/join-date/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("입대일 변경", { date: "2025-06-15" })),
    });

    expect(updateUser).toHaveBeenCalledWith("test-user", { date_to_join_the_army: "2025-06-15" });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("입대일");
  });

  it("rejects text it can't parse as a date", async () => {
    const res = await app.request("/skill/join-date/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("입대일 변경 아무말")),
    });

    expect(updateUser).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("이해하지 못했어요");
  });
});

describe("POST /skill/discharge-date/change", () => {
  it("parses a dotted date and stores it on the discharge_date column", async () => {
    await app.request("/skill/discharge-date/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("전역일 변경", { date: "2026.12.31" })),
    });

    expect(updateUser).toHaveBeenCalledWith("test-user", { discharge_date: "2026-12-31" });
  });
});
