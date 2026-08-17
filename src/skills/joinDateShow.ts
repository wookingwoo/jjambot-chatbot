import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { quickReply, simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage } from "../repo/users.js";

export const joinDateShowSkill = new Hono();

joinDateShowSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "join_date_show");

  if (!user.date_to_join_the_army) {
    return c.json(
      skillResponse([simpleText("입대일이 아직 설정되지 않았어요.")], {
        quickReplies: [quickReply({ label: "입대일 설정", action: "message", messageText: "입대일 변경" })],
      }),
    );
  }

  return c.json(skillResponse([simpleText(`입대일: ${user.date_to_join_the_army}`)]));
});
