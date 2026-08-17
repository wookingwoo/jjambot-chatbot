import { timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { config } from "../config.js";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * OpenBuilder's skill registration screen has separate "헤더 이름"/"헤더 값"
 * fields, so the shared secret travels as the `X-Skill-Secret` header. The
 * `?token=` query param is still accepted as a fallback while existing
 * skills are migrated to the header in the admin console.
 */
export const requireSkillSecret: MiddlewareHandler = async (c, next) => {
  const token = c.req.header("X-Skill-Secret") ?? c.req.query("token") ?? "";
  if (!safeEqual(token, config.skillSecret)) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
};
