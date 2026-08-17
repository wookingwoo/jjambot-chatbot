import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { makeSkillRequest, skillRequest } from "./helpers.js";

describe("/skill/* auth", () => {
  it("rejects a request with no token", async () => {
    const res = await app.request("/skill/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("ping")),
    });

    expect(res.status).toBe(401);
  });

  it("rejects a request with the wrong header value", async () => {
    const res = await app.request("/skill/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Skill-Secret": "wrong" },
      body: JSON.stringify(makeSkillRequest("ping")),
    });

    expect(res.status).toBe(401);
  });

  it("accepts the X-Skill-Secret header", async () => {
    const res = await skillRequest("/skill/ping", makeSkillRequest("ping"));
    expect(res.status).toBe(200);
  });

  it("still accepts the legacy ?token= query param as a fallback", async () => {
    const res = await app.request(`/skill/ping?token=${process.env.SKILL_SECRET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("ping")),
    });

    expect(res.status).toBe(200);
  });

  it("does not gate /health behind the token", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });
});
