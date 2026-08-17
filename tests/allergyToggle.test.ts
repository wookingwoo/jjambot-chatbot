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
});

describe("POST /skill/allergy/toggle", () => {
  it("turns allergy display off when currently on", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, allergy_show: true });

    const res = await skillRequest("/skill/allergy/toggle", makeSkillRequest("알러지 설정"));

    expect(updateUser).toHaveBeenCalledWith("test-user", { allergy_show: false });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("껐어요");
  });

  it("turns allergy display on when currently off", async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, allergy_show: false });

    const res = await skillRequest("/skill/allergy/toggle", makeSkillRequest("알러지 설정"));

    expect(updateUser).toHaveBeenCalledWith("test-user", { allergy_show: true });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("켰어요");
  });

  it('turns it off on an explicit "꺼줘" even if it was already off', async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, allergy_show: false });

    const res = await skillRequest("/skill/allergy/toggle", makeSkillRequest("알러지 설정 꺼줘"));

    expect(updateUser).toHaveBeenCalledWith("test-user", { allergy_show: false });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("껐어요");
  });

  it('turns it on on an explicit "켜줘" even if it was already on', async () => {
    vi.mocked(getOrCreateUser).mockResolvedValue({ ...baseUser, allergy_show: true });

    const res = await skillRequest("/skill/allergy/toggle", makeSkillRequest("알러지 설정 켜줘"));

    expect(updateUser).toHaveBeenCalledWith("test-user", { allergy_show: true });
    const body = await res.json();
    expect(body.template.outputs[0].simpleText.text).toContain("켰어요");
  });
});
