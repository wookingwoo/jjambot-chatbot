import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(),
  incrementUsage: vi.fn(),
  updateUser: vi.fn(),
}));

import { getOrCreateUser, updateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateUser).mockResolvedValue(baseUser);
});

describe("POST /skill/join-date/change", () => {
  it("parses a YYYY-MM-DD sys_date param and stores it", async () => {
    const res = await skillRequest(
      "/skill/join-date/change",
      makeSkillRequest("입대일 변경", { sys_date: "2025-06-15" }),
    );

    expect(updateUser).toHaveBeenCalledWith("test-user", { date_to_join_the_army: "2025-06-15" });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("입대일");
  });

  it("unwraps the JSON-encoded sys.date entity value Kakao actually sends", async () => {
    const res = await skillRequest(
      "/skill/join-date/change",
      makeSkillRequest("모레 입대", {
        sys_date: '{"date": "2026-08-19", "dateTag": "afterTomorrow", "dateHeadword": null, "year": null, "month": null, "day": null}',
      }),
    );

    expect(updateUser).toHaveBeenCalledWith("test-user", { date_to_join_the_army: "2026-08-19" });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("입대일");
  });

  it("rejects text it can't parse as a date", async () => {
    const res = await skillRequest("/skill/join-date/change", makeSkillRequest("입대일 변경 아무말"));

    expect(updateUser).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("이해하지 못했어요");
    expect(body.template.quickReplies).toEqual([
      { label: "오늘로 설정", action: "message", messageText: "오늘 입대" },
    ]);
  });
});

describe("POST /skill/discharge-date/change", () => {
  it("parses a dotted date and stores it on the discharge_date column", async () => {
    await skillRequest("/skill/discharge-date/change", makeSkillRequest("전역일 변경", { sys_date: "2026.12.31" }));

    expect(updateUser).toHaveBeenCalledWith("test-user", { discharge_date: "2026-12-31" });
  });
});
