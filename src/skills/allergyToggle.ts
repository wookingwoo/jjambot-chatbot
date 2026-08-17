import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage, updateUser } from "../repo/users.js";

export const allergyToggleSkill = new Hono();

/** "꺼줘"/"켜줘" 같은 명시적 발화가 있으면 그 값을 쓰고, 없으면(그냥 "알러지 설정") 현재 상태를 반전시킨다. */
function resolveAllergyShow(utterance: string, current: boolean): boolean {
  if (/꺼|끄기|off/i.test(utterance)) return false;
  if (/켜|켜기|on/i.test(utterance)) return true;
  return !current;
}

allergyToggleSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "allergy_toggle");

  const next = resolveAllergyShow(req.userRequest.utterance, user.allergy_show);
  await updateUser(user.kakao_user_id, { allergy_show: next });

  return c.json(skillResponse([simpleText(`알러지 표시를 ${next ? "켰어요" : "껐어요"}.`)]));
});
