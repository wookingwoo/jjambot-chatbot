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
    expect(body.template.quickReplies).toEqual([
      { label: "부대 조회", action: "message", messageText: "부대 조회" },
    ]);
    expect(getMeal).not.toHaveBeenCalled();
  });

  it("strips allergy codes from dish names when allergy_show is off", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570", allergy_show: false });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-17",
      weekday: "월",
      breakfast: "마파두부덮밥(05)(06)(10),매운어묵탕(05)(06)(09)",
      lunch: "콩나물국(02)(05)(06)(09)(16)",
      dinner: "참치비빔밥(05)(06)",
      special_dish: "떠먹는발효유(딸기)(02)",
    });

    const res = await skillRequest("/skill/menu", makeSkillRequest("오늘 메뉴"));

    const body = await res.json();
    const text = body.template.outputs[0].simpleText.text as string;
    expect(text).toContain("조식: 마파두부덮밥,매운어묵탕");
    expect(text).toContain("중식: 콩나물국");
    expect(text).toContain("석식: 참치비빔밥");
    expect(text).toContain("특식: 떠먹는발효유(딸기)");
    expect(text).not.toMatch(/\(\d\d\)/);
  });

  it("keeps allergy codes in dish names when allergy_show is on", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570", allergy_show: true });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-17",
      weekday: "월",
      breakfast: "마파두부덮밥(05)(06)(10)",
      lunch: "국수",
      dinner: "찌개",
      special_dish: null,
    });

    const res = await skillRequest("/skill/menu", makeSkillRequest("오늘 메뉴"));

    const body = await res.json();
    const text = body.template.outputs[0].simpleText.text as string;
    expect(text).toContain("조식: 마파두부덮밥(05)(06)(10)");
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

  it("shows only the requested meal_type entries when provided", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-17",
      weekday: "월",
      breakfast: "밥",
      lunch: "국수",
      dinner: "찌개",
      special_dish: null,
    });

    const res = await skillRequest(
      "/skill/menu",
      makeSkillRequest("오늘 아침과 저녁 메뉴 알려줘", { meal_type0: "아침", meal_type1: "저녁" }),
    );

    const body = await res.json();
    const text = body.template.outputs[0].simpleText.text as string;
    expect(text).toContain("조식: 밥");
    expect(text).toContain("석식: 찌개");
    expect(text).not.toContain("중식");
  });

  it("handles a combined sys_date + meal_type request (real OpenBuilder payload)", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-18",
      weekday: "화",
      breakfast: "죽",
      lunch: "국수",
      dinner: "카레",
      special_dish: null,
    });

    const res = await skillRequest(
      "/skill/menu",
      makeSkillRequest("내일 아침과 석식 메뉴 알려줘", {
        sys_date: '{"date": "2026-08-18", "dateTag": "tomorrow", "dateHeadword": null, "year": null, "month": null, "day": null}',
        meal_type0: "아침",
        meal_type1: "저녁",
      }),
    );

    expect(getMeal).toHaveBeenCalledWith("1570", "2026-08-18");
    const body = await res.json();
    const text = body.template.outputs[0].simpleText.text as string;
    expect(text).toContain("조식: 죽");
    expect(text).toContain("석식: 카레");
    expect(text).not.toContain("중식");
  });

  it("shows the special dish when meal_type resolves to 부식 (synonym for 특식/간식)", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-17",
      weekday: "월",
      breakfast: "밥",
      lunch: "국수",
      dinner: "찌개",
      special_dish: "라면",
    });

    const res = await skillRequest("/skill/menu", makeSkillRequest("부식 메뉴 알려줘", { meal_type0: "부식" }));

    const body = await res.json();
    const text = body.template.outputs[0].simpleText.text as string;
    expect(text).toContain("특식: 라면");
    expect(text).not.toContain("조식");
    expect(text).not.toContain("중식");
    expect(text).not.toContain("석식");
  });

  it("reports no special dish rather than staying silent when explicitly requested", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-17",
      weekday: "월",
      breakfast: "밥",
      lunch: "국수",
      dinner: "찌개",
      special_dish: null,
    });

    const res = await skillRequest("/skill/menu", makeSkillRequest("부식 메뉴 알려줘", { meal_type0: "부식" }));

    const body = await res.json();
    const text = body.template.outputs[0].simpleText.text as string;
    expect(text).toContain("특식: 정보 없음");
  });

  it("shows all meals when no meal_type param is given", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "1570" });
    vi.mocked(getMeal).mockResolvedValue({
      service: "DS_TB_MNDT_DATEBYMLSVC_1570",
      meal_date: "2026-08-17",
      weekday: "월",
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
});
