import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repo/users.js", () => ({
  getOrCreateUser: vi.fn(),
  incrementUsage: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("../src/repo/meals.js", () => ({
  getMeal: vi.fn(),
}));

import { getOrCreateUser, updateUser } from "../src/repo/users.js";
import { baseUser, makeSkillRequest, skillRequest } from "./helpers.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateUser).mockResolvedValue(baseUser);
});

describe("POST /skill/corps/list", () => {
  it("lists known corps codes", async () => {
    const res = await skillRequest("/skill/corps/list", makeSkillRequest("부대 조회"));

    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("1570");
    expect(body.template.outputs[0].simpleText.text).toContain("STANDARD");
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
