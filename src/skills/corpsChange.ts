import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { quickReply, simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage, updateUser } from "../repo/users.js";
import { CORPS_LABELS, isValidCorps, type CorpsLabel } from "../corps.js";

export const corpsChangeSkill = new Hono();

// Korean particles attach directly to the code with no space (e.g. "atc로 바꿔줘"),
// so match a label prefix rather than the whole token - but only when it isn't
// itself followed by more alphanumerics (so "15700" doesn't match "1570").
const CORPS_TOKEN_RE = new RegExp(`^(${CORPS_LABELS.join("|")})(?![A-Z0-9])`);

function extractCorps(paramValue: string | undefined, utterance: string): CorpsLabel | null {
  if (paramValue && isValidCorps(paramValue)) return paramValue;
  for (const token of utterance.toUpperCase().split(/\s+/)) {
    const match = CORPS_TOKEN_RE.exec(token);
    if (match) return match[1] as CorpsLabel;
  }
  return null;
}

corpsChangeSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "corps_change");

  const corps = extractCorps(req.action.params.corps, req.userRequest.utterance);
  if (!corps) {
    return c.json(
      skillResponse([simpleText(`부대 코드를 찾지 못했어요. 사용 가능한 코드: ${CORPS_LABELS.join(", ")}`)], {
        quickReplies: [quickReply({ label: "부대 조회", action: "message", messageText: "부대 조회" })],
      }),
    );
  }

  await updateUser(user.kakao_user_id, { corps });
  return c.json(
    skillResponse([simpleText(`부대를 ${corps}(으)로 설정했어요.`)], {
      quickReplies: [quickReply({ label: "오늘 메뉴", action: "message", messageText: "오늘 메뉴" })],
    }),
  );
});
