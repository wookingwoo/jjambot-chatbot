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
 * Kakao's OpenBuilder can't attach custom headers to a skill URL, so the
 * shared secret has to travel as a `?token=` query param on the URL
 * registered in the admin console instead.
 */
export const requireSkillSecret: MiddlewareHandler = async (c, next) => {
  const token = c.req.query("token") ?? "";
  if (!safeEqual(token, config.skillSecret)) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
};
