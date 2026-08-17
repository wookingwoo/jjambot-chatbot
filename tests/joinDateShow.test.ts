import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(),
  incrementUsage: vi.fn(),
  updateUser: vi.fn(),
}));

import { getOrCreateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /skill/join-date/show", () => {
  it("shows the stored join date", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, date_to_join_the_army: "2025-06-15" });

    const res = await skillRequest("/skill/join-date/show", makeSkillRequest("입대일 조회"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("2025-06-15");
  });

  it("prompts to set a join date when none is stored", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, date_to_join_the_army: null });

    const res = await skillRequest("/skill/join-date/show", makeSkillRequest("입대일 조회"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("아직 설정되지 않았어요");
    expect(body.template.quickReplies?.[0]?.messageText).toBe("입대일 변경");
  });
});
