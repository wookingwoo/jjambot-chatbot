import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { makeSkillRequest, skillRequest } from "./helpers.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});

describe("POST /skill/ping", () => {
  it("echoes the utterance as a simpleText output", async () => {
    const res = await skillRequest("/skill/ping", makeSkillRequest("ping"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.version).toBe("2.0");
    expect(body.template.outputs[0].simpleText.text).toBe("pong: ping");
  });

  it("rejects a payload missing required fields", async () => {
    const res = await skillRequest("/skill/ping", { foo: "bar" });

    expect(res.status).toBe(400);
  });
});
