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

import { corpsForService, serviceForCorps } from "../src/corps.js";
import { getMealsByDate } from "../src/repo/meals.js";
import { getOrCreateUser, updateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateUser).mockResolvedValue(baseUser);
});

describe("serviceForCorps / corpsForService", () => {
  it("maps a plain corps label to the standard service pattern", () => {
    expect(serviceForCorps("1570")).toBe("DS_TB_MNDT_DATEBYMLSVC_1570");
  });

  it("applies the 7461 -> 6282 service-code override", () => {
    expect(serviceForCorps("7461")).toBe("DS_TB_MNDT_DATEBYMLSVC_6282");
  });

  it("applies KIDA's irregular full service-code override", () => {
    expect(serviceForCorps("KIDA")).toBe("DS_MNDT_DATEBYMLSVC_KIDA");
  });

  it("round-trips every corps label through its service code", () => {
    for (const label of ["1570", "7461", "7017", "1975", "KIDA", "STANDARD"] as const) {
      expect(corpsForService(serviceForCorps(label))).toBe(label);
    }
  });
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

  it("always strips allergy codes from the lunch snippet", async () => {
    vi.mocked(getMealsByDate).mockResolvedValue([
      {
        service: "DS_TB_MNDT_DATEBYMLSVC_1570",
        meal_date: "2026-08-17",
        weekday: "월",
        breakfast: "죽",
        lunch: "떡국(5.6.13), 잡곡밥(5,6)",
        dinner: "카레",
        special_dish: null,
      },
    ]);

    const res = await skillRequest("/skill/corps/list", makeSkillRequest("부대 조회"));

    const body = await res.json();
    const texts = body.template.outputs.map((o: { simpleText: { text: string } }) => o.simpleText.text).join("\n");
    expect(texts).not.toMatch(/\d\.\d|\d,\d/);
    expect(texts).toContain("1570");
  });
});

describe("POST /skill/corps/change", () => {
  it("sets corps from the action param", async () => {
    const res = await skillRequest("/skill/corps/change", makeSkillRequest("부대 변경 1570", { corps: "1570" }));

    expect(updateUser).toHaveBeenCalledWith("test-user", { corps: "1570" });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("1570");
    expect(body.template.quickReplies).toEqual([{ label: "오늘 메뉴", action: "message", messageText: "오늘 메뉴" }]);
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
    expect(body.template.quickReplies).toEqual([
      { label: "부대 조회", action: "message", messageText: "부대 조회" },
    ]);
  });
});
