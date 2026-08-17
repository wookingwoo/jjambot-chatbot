import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage, updateUser } from "../repo/users.js";

export const allergyToggleSkill = new Hono();

// kakao-entities/toggle_state.csv (엔티티 off/on)의 동의어와 맞춰둔 패턴.
// "비활성화"가 "활성화"를 부분 문자열로 포함하므로 off를 먼저 검사해야 한다.
const OFF_PATTERN = /비활성화|비활|끄기|종료|꺼|off/i;
const ON_PATTERN = /활성화|켜기|키기|켜|on/i;

/** "꺼줘"/"비활성화" 같은 명시적 발화가 있으면 그 값을 쓰고, 없으면(그냥 "알러지 설정") 현재 상태를 반전시킨다. */
function resolveAllergyShow(utterance: string, current: boolean): boolean {
  if (OFF_PATTERN.test(utterance)) return false;
  if (ON_PATTERN.test(utterance)) return true;
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
