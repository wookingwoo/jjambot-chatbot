import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(),
  incrementUsage: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("../src/repo/meals.js", () => ({
  getMeal: vi.fn(),
  getMealsByDate: vi.fn(),
}));

import { getMealsByDate } from "../src/repo/meals.js";
import { getOrCreateUser, updateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateUser).mockResolvedValue(baseUser);
});

describe("POST /skill/corps/list", () => {
  it("falls back to the plain code list when no meal data exists yet", async () => {
    vi.mocked(getMealsByDate).mockResolvedValue([]);

    const res = await skillRequest("/skill/corps/list", makeSkillRequest("부대 조회"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("1570");
    expect(body.template.outputs[0].simpleText.text).toContain("STANDARD");
  });

  it("shows each corps' lunch so the user can spot their own unit", async () => {
    vi.mocked(getMealsByDate).mockResolvedValue([
      {
        service: "DS_TB_MNDT_DATEBYMLSVC_1570",
        meal_date: "2026-08-17",
        weekday: "월",
        breakfast: "죽",
        lunch: "쌀밥, 김치찌개, 제육볶음",
        dinner: "카레",
        special_dish: null,
      },
      {
        service: "DS_TB_MNDT_DATEBYMLSVC",
        meal_date: "2026-08-17",
        weekday: "월",
        breakfast: "빵",
        lunch: "비빔밥",
        dinner: "국수",
        special_dish: null,
      },
    ]);

    const res = await skillRequest("/skill/corps/list", makeSkillRequest("부대 조회"));

    const body = await res.json();
    const texts = body.template.outputs.map((o: { simpleText: { text: string } }) => o.simpleText.text).join("\n");
    expect(texts).toContain("1570: 쌀밥, 김치찌개, 제육볶음");
    expect(texts).toContain("STANDARD: 비빔밥");
    expect(body.template.outputs.length).toBeLessThanOrEqual(3);
  });
});

describe("POST /skill/corps/change", () => {
  it("sets corps from the action param", async () => {
    const res = await skillRequest("/skill/corps/change", makeSkillRequest("부대 변경 1570", { corps: "1570" }));

    expect(updateUser).toHaveBeenCalledWith("test-user", { corps: "1570" });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("1570");
  });

  it("falls back to parsing the utterance when no param is given", async () => {
    await skillRequest("/skill/corps/change", makeSkillRequest("부대 atc로 바꿔줘"));

    expect(updateUser).toHaveBeenCalledWith("test-user", { corps: "ATC" });
  });

  it("rejects an unrecognized corps code", async () => {
    const res = await skillRequest("/skill/corps/change", makeSkillRequest("부대 변경 9999"));

    expect(updateUser).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("찾지 못했어요");
  });
});
