import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage, updateUser } from "../repo/users.js";

export const allergyToggleSkill = new Hono();

allergyToggleSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "allergy_toggle");

  const next = !user.allergy_show;
  await updateUser(user.kakao_user_id, { allergy_show: next });

  return c.json(skillResponse([simpleText(`알러지 표시를 ${next ? "켰어요" : "껐어요"}.`)]));
});
