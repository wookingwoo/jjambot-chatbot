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
});

describe("POST /skill/allergy/toggle", () => {
  it("turns allergy display off when currently on", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, allergy_show: true });

    const res = await app.request("/skill/allergy/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("알러지 설정")),
    });

    expect(updateUser).toHaveBeenCalledWith("test-user", { allergy_show: false });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("껐어요");
  });

  it("turns allergy display on when currently off", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, allergy_show: false });

    const res = await app.request("/skill/allergy/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("알러지 설정")),
    });

    expect(updateUser).toHaveBeenCalledWith("test-user", { allergy_show: true });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("켰어요");
  });
});
