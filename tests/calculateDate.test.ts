import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(),
  incrementUsage: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("../src/dates.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/dates.js")>();
  return { ...actual, todayInSeoul: () => "2026-08-16" };
});

import { getOrCreateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /skill/calculate-date", () => {
  it("prompts to set a discharge date when missing", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, discharge_date: null });

    const res = await skillRequest("/skill/calculate-date", makeSkillRequest("전역일 계산"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("설정되지 않았어요");
    expect(body.template.quickReplies).toBeDefined();
  });

  it("reports days remaining for a future discharge date", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, discharge_date: "2026-08-26" });

    const res = await skillRequest("/skill/calculate-date", makeSkillRequest("전역일 계산"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("D-10");
  });

  it("includes service progress when the join date is also known", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({
      ...baseUser,
      date_to_join_the_army: "2026-07-16",
      discharge_date: "2026-09-15",
    });

    const res = await skillRequest("/skill/calculate-date", makeSkillRequest("전역일 계산"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("복무 진행률");
    expect(body.template.quickReplies).toBeUndefined();
  });

  it("suggests setting a join date when discharge date is known but join date isn't", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({
      ...baseUser,
      date_to_join_the_army: null,
      discharge_date: "2026-09-15",
    });

    const res = await skillRequest("/skill/calculate-date", makeSkillRequest("전역일 계산"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).not.toContain("복무 진행률");
    expect(body.template.quickReplies).toEqual([
      { label: "입대일 설정", action: "message", messageText: "입대일 변경" },
    ]);
  });

  it("congratulates the user once the discharge date has passed", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, discharge_date: "2026-08-06" });

    const res = await skillRequest("/skill/calculate-date", makeSkillRequest("전역일 계산"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("지났어요");
  });
});
