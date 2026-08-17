import type { MiddlewareHandler } from "hono";

/** Logs the raw Kakao skill request JSON (visible via `docker compose logs`) since OpenBuilder's bot test screen doesn't show it. */
export const logSkillRequest: MiddlewareHandler = async (c, next) => {
  const body = await c.req.json().catch(() => null);
  console.log(`[skill] ${c.req.path}`, JSON.stringify(body));
  await next();
};
