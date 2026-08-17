import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(),
  incrementUsage: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("../src/repo/meals.js", () => ({
  getMeal: vi.fn(),
}));

import { getMeal } from "../src/repo/meals.js";
import { getOrCreateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /skill/menu", () => {
  it("asks the user to set a corps first when none is stored", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: null });

    const res = await skillRequest("/skill/menu", makeSkillRequest("오늘 메뉴"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("부대");
    expect(getMeal).not.toHaveBeenCalled();
  });

  it("returns the stored meal for the user's corps", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-16",
      weekday: "일",
      breakfast: "밥",
      lunch: "국수",
      dinner: "찌개",
      special_dish: null,
    });

    const res = await skillRequest("/skill/menu", makeSkillRequest("오늘 메뉴"));

    const body = await res.json();
    const text = body.template.outputs[0].simpleText.text as string;
    expect(text).toContain("조식: 밥");
    expect(text).toContain("중식: 국수");
    expect(text).toContain("석식: 찌개");
  });

  it("reports when there is no meal data for the date", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue(null);

    const res = await skillRequest("/skill/menu", makeSkillRequest("오늘 메뉴"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("아직 없어요");
  });

  it("looks up the date from the JSON-encoded sys_date entity param", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue(null);

    await skillRequest(
      "/skill/menu",
      makeSkillRequest("테스트로 모레 메뉴", {
        sys_date: '{"date": "2026-08-19", "dateTag": "afterTomorrow", "dateHeadword": null, "year": null, "month": null, "day": null}',
      }),
    );

    expect(getMeal).toHaveBeenCalledWith("1570", "2026-08-19");
  });
});
