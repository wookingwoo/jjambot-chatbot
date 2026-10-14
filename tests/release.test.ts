import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(), incrementUsage: vi.fn(), updateUser: vi.fn(),
}));
vi.mock("../src/repo/meals.js", () => ({ getMeal: vi.fn(), getMealsByDate: vi.fn() }));

import { app } from "../src/app.js";
import { CORPS_LABELS, corpsForService, serviceForCorps } from "../src/corps.js";
import { todayInSeoul } from "../src/dates.js";
import { skillResponseSchema } from "../src/kakao/schema.js";
import { getMeal, getMealsByDate, type MealRow } from "../src/repo/meals.js";
import { getOrCreateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

const meal: MealRow = {
  service: "DS_TB_MNDT_DATEBYMLSVC_5322", meal_date: "2026-10-12", weekday: "월",
  breakfast: "밥,국", lunch: "국수", dinner: "찌개", special_dish: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-12T10:00:00Z"));
  vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "5322", allergy_show: false });
  vi.mocked(getMeal).mockResolvedValue(meal);
  vi.mocked(getMealsByDate).mockResolvedValue([]);
});
afterEach(() => vi.useRealTimers());

async function menu(params: Record<string, string> = {}) {
  const response = await skillRequest("/skill/menu", makeSkillRequest("식단", params));
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(skillResponseSchema.safeParse(body).success).toBe(true);
  return { body, text: body.template.outputs[0].simpleText.text as string };
}

describe("release date boundaries", () => {
  it.each([0, 182, 183])("queries a meal %i days ago", async (days) => {
    const date = new Date("2026-10-12T00:00:00Z");
    date.setUTCDate(date.getUTCDate() - days);
    const requested = date.toISOString().slice(0, 10);
    await menu({ sys_date: JSON.stringify({ date: requested }) });
    expect(getMeal).toHaveBeenCalledExactlyOnceWith("5322", requested);
  });

  it("rejects day 184 before reading meal data", async () => {
    const date = new Date("2026-10-12T00:00:00Z");
    date.setUTCDate(date.getUTCDate() - 184);
    const { body, text } = await menu({ sys_date: date.toISOString().slice(0, 10) });
    expect(text).toContain("6개월");
    expect(getMeal).not.toHaveBeenCalled();
    expect(body.template.quickReplies[0].messageText).toBe("오늘 메뉴");
  });

  it.each([
    ["2026-10-11T14:59:59Z", "2026-10-11"],
    ["2026-10-11T15:00:00Z", "2026-10-12"],
  ])("uses the Seoul date at %s", async (instant, expected) => {
    vi.setSystemTime(new Date(instant));
    expect(todayInSeoul()).toBe(expected);
    await menu();
    expect(getMeal).toHaveBeenCalledExactlyOnceWith("5322", expected);
  });

  it("still permits a future menu request", async () => {
    await menu({ sys_date: JSON.stringify({ date: "2026-10-13", dateTag: "tomorrow" }) });
    expect(getMeal).toHaveBeenCalledExactlyOnceWith("5322", "2026-10-13");
  });

  it("explains an invalid calendar date without reading meal data", async () => {
    const { text } = await menu({ sys_date: "2026-13-01" });
    expect(text).toContain("날짜");
    expect(text).toContain("YYYY-MM-DD");
    expect(getMeal).not.toHaveBeenCalled();
  });
});

describe("release menu contracts", () => {
  it("preserves nested descriptions and numeric allergy groups when enabled", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "5322", allergy_show: true });
    vi.mocked(getMeal).mockResolvedValue({ ...meal,
      breakfast: "밥(5,6) , 우유(백색우유(200ML,연간)), 떠먹는발효유(딸기)(02)",
    });
    expect((await menu()).text).toContain("[조식]\n밥(5,6), 우유(백색우유(200ML,연간)), 떠먹는발효유(딸기)(02)");
  });

  it("removes only allergy groups when disabled", async () => {
    vi.mocked(getMeal).mockResolvedValue({ ...meal,
      breakfast: "밥(5,6),우유(백색우유(200ML,연간))(02),떠먹는발효유(딸기)(02)",
    });
    expect((await menu()).text).toContain("[조식]\n밥, 우유(백색우유(200ML,연간)), 떠먹는발효유(딸기)");
  });

  it("deduplicates requested meals and orders them canonically", async () => {
    vi.mocked(getMeal).mockResolvedValue({ ...meal, special_dish: "과일" });
    const { text } = await menu({ meal_type0: "부식", meal_type1: "저녁", meal_type2: "아침", meal_type3: "조식" });
    expect(text).toBe("2026-10-12 (월) 5322 식단\n\n[조식]\n밥, 국\n\n[석식]\n찌개\n\n[특식]\n과일");
  });

  it("shows missing-data placeholders for null and whitespace-only meals", async () => {
    vi.mocked(getMeal).mockResolvedValue({ ...meal, weekday: null, breakfast: null, lunch: " \t ", dinner: ", ," });
    const { text } = await menu();
    expect(text).toContain("2026-10-12 (?) 5322 식단");
    expect(text.match(/정보 없음/g)).toHaveLength(3);
  });

  it("formats the supplied real-world menu within Kakao's text limit", async () => {
    vi.mocked(getMeal).mockResolvedValue({ ...meal,
      breakfast: "밥,얼큰쇠고기무국,밥싸먹는오리훈제,매콤볼어묵조림,배추김치(다수공급자),우유(백색우유(200ML,연간))",
      lunch: "밥,키조개미역국,타워함박스테이크,샐러드파스타,모듬피클,아이스홍시,깍두기(다수공급자)",
      dinner: "밥,중화식계란탕,마파두부,고추잡채&꽃빵,단무지무침,롯데칠성음료,펩시제로슈거라임향,355mL/캔",
    });
    const { body, text } = await menu();
    expect(body.template.outputs).toHaveLength(1);
    expect(text.split("\n")[0]).toBe("2026-10-12 (월) 5322 식단");
    expect(text).toContain("롯데칠성음료, 펩시제로슈거라임향, 355mL/캔");
    expect(text.length).toBeLessThanOrEqual(1000);
  });

  it("preserves menu content across 100 deterministic separator combinations", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, corps: "5322", allergy_show: true });
    const separators = [",", " ,", ",   ", "\t,\n"];
    for (let example = 0; example < 100; example++) {
      const dishes = Array.from({ length: 6 }, (_, index) => `메뉴${example}-${index}(설명(200ML,연간))(5,6)`);
      const raw = dishes.map((dish, index) => index ? separators[(example + index) % separators.length] + dish : dish).join("");
      vi.mocked(getMeal).mockResolvedValue({ ...meal, breakfast: raw });
      expect((await menu({ meal_type0: "아침" })).text).toBe(`2026-10-12 (월) 5322 식단\n\n[조식]\n${dishes.join(", ")}`);
    }
  });

  it("splits long menus into valid Kakao text outputs without losing content", async () => {
    vi.mocked(getMeal).mockResolvedValue({ ...meal,
      breakfast: "조식메뉴,".repeat(80), lunch: "중식메뉴,".repeat(80), dinner: "석식메뉴,".repeat(80),
    });
    const { body } = await menu();
    const texts = body.template.outputs.map((output: { simpleText: { text: string } }) => output.simpleText.text);
    expect(texts.length).toBeGreaterThan(1);
    expect(texts.length).toBeLessThanOrEqual(3);
    expect(texts.every((text: string) => text.length <= 1000)).toBe(true);
    const expected = `2026-10-12 (월) 5322 식단\n\n[조식]\n${Array(80).fill("조식메뉴").join(", ")}\n\n[중식]\n${Array(80).fill("중식메뉴").join(", ")}\n\n[석식]\n${Array(80).fill("석식메뉴").join(", ")}`;
    expect(texts.join("")).toBe(expected);
  });

  it("explains how to query very large menus within the three-output limit", async () => {
    vi.mocked(getMeal).mockResolvedValue({ ...meal, breakfast: "🍚쌀밥,".repeat(800) });
    const { body } = await menu();
    const texts = body.template.outputs.map((output: { simpleText: { text: string } }) => output.simpleText.text);
    expect(texts).toHaveLength(3);
    expect(texts.every((text: string) => text.length <= 1000 && text.isWellFormed())).toBe(true);
    expect(texts.at(-1)).toContain("끼니별");
  });
});

describe("release corps coverage", () => {
  it("keeps every supported corps in sync with the OpenBuilder entity CSV", () => {
    const csv = readFileSync(new URL("../kakao-entities/corps.csv", import.meta.url), "utf8");
    const labels = csv.trim().split(/\r?\n/).map((line) => line.split(",")[0]);
    expect(labels.sort()).toEqual([...CORPS_LABELS].sort());
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("round-trips all service codes without collisions", () => {
    const services = CORPS_LABELS.map(serviceForCorps);
    expect(new Set(services).size).toBe(CORPS_LABELS.length);
    for (const label of CORPS_LABELS) expect(corpsForService(serviceForCorps(label))).toBe(label);
    expect(serviceForCorps("KIDA")).toBe("DS_MNDT_DATEBYMLSVC_KIDA");
  });

  it("lists all corps once within Kakao's three-output and text limits", async () => {
    vi.mocked(getMealsByDate).mockResolvedValue([
      ...[...CORPS_LABELS].reverse().map((label) => ({ ...meal, service: serviceForCorps(label), lunch: "밥(05),김치찌개(5,6),제육볶음,샐러드,배추김치" })),
      { ...meal, service: "UNKNOWN_RELEASE_TEST_SERVICE", lunch: "미등록 부대" },
    ]);
    const response = await skillRequest("/skill/corps/list", makeSkillRequest("부대 조회"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(skillResponseSchema.safeParse(body).success).toBe(true);
    expect(body.template.outputs.length).toBeLessThanOrEqual(3);
    const texts = body.template.outputs.map((output: { simpleText: { text: string } }) => output.simpleText.text);
    expect(texts.every((text: string) => text.length <= 1000)).toBe(true);
    const list = texts.slice(1).join("\n");
    expect(list.split("\n").map((line: string) => line.split(":")[0])).toEqual([...CORPS_LABELS]);
    expect(list).not.toContain("미등록");
    expect(list).not.toMatch(/\([\d,]+\)/);
  });
});

describe("release request validation", () => {
  it.each(["", "wrong", "test-skill-secrex", "test-skill-secret-extra"])("rejects invalid credentials %s before database access", async (secret) => {
    const response = await app.request("/skill/menu", { method: "POST",
      headers: { "Content-Type": "application/json", "X-Skill-Secret": secret },
      body: JSON.stringify(makeSkillRequest("식단")),
    });
    expect(response.status).toBe(401);
    expect(getOrCreateUser).not.toHaveBeenCalled();
    expect(getMeal).not.toHaveBeenCalled();
  });

  it("rejects an invalid OpenBuilder request before database access", async () => {
    const response = await skillRequest("/skill/menu", { userRequest: { utterance: "식단" } });
    expect(response.status).toBe(400);
    expect(getOrCreateUser).not.toHaveBeenCalled();
  });

  it("keeps malformed JSON as a 400 validation response", async () => {
    const response = await app.request("/skill/menu", { method: "POST",
      headers: { "Content-Type": "application/json", "X-Skill-Secret": process.env.SKILL_SECRET ?? "" }, body: "{",
    });
    expect(response.status).toBe(400);
    expect(getOrCreateUser).not.toHaveBeenCalled();
  });

  it("returns a valid friendly Kakao response when the database fails", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      vi.mocked(getMeal).mockRejectedValue(new Error("release test database unavailable"));
      const { text } = await menu();
      expect(text).toContain("잠시 후");
      expect(text).not.toContain("release test database unavailable");
    } finally { errorLog.mockRestore(); }
  });
});
