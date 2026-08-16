import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage } from "../repo/users.js";
import { CORPS_LABELS } from "../corps.js";

export const corpsListSkill = new Hono();

corpsListSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "corps_list");

  const text = `사용 가능한 부대 코드예요. "부대 변경 <코드>"로 설정해주세요.\n\n${CORPS_LABELS.join(", ")}`;
  return c.json(skillResponse([simpleText(text)]));
});
