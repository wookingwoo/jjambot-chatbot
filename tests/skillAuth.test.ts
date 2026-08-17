import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { makeSkillRequest } from "./helpers.js";

describe("/skill/* auth", () => {
  it("rejects a request with no token", async () => {
    const res = await app.request("/skill/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("ping")),
    });

    expect(res.status).toBe(401);
  });

  it("rejects a request with the wrong token", async () => {
    const res = await app.request("/skill/ping?token=wrong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeSkillRequest("ping")),
    });

    expect(res.status).toBe(401);
  });

  it("does not gate /health behind the token", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });
});
