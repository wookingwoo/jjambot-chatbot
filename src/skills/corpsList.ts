import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage } from "../repo/users.js";
import { getMealsByDate } from "../repo/meals.js";
import { CORPS_LABELS, corpsForService, type CorpsLabel } from "../corps.js";
import { todayInSeoul } from "../dates.js";
import { stripAllergyCodes } from "../allergy.js";

export const corpsListSkill = new Hono();

const LUNCH_SNIPPET_LEN = 16;
const CORPS_ORDER = new Map(CORPS_LABELS.map((label, index) => [label, index]));

corpsListSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "corps_list");

  const date = todayInSeoul();
  const meals = await getMealsByDate(date);

  const entries: Array<{ corps: CorpsLabel; text: string }> = [];
  for (const meal of meals) {
    const corps = corpsForService(meal.service);
    if (!corps || !meal.lunch) continue;
    const lunch = stripAllergyCodes(meal.lunch);
    const snippet = lunch.length > LUNCH_SNIPPET_LEN ? `${lunch.slice(0, LUNCH_SNIPPET_LEN)}…` : lunch;
    entries.push({ corps, text: `${corps}: ${snippet}` });
  }
  entries.sort((a, b) => (CORPS_ORDER.get(a.corps) ?? 0) - (CORPS_ORDER.get(b.corps) ?? 0));
  const lines = entries.map((entry) => entry.text);

  if (lines.length === 0) {
    const text = `오늘(${date}) 등록된 식단이 아직 없어서 부대 코드만 보여드려요. "부대 변경 <코드>"로 설정해주세요.\n\n${CORPS_LABELS.join(", ")}`;
    return c.json(skillResponse([simpleText(text)]));
  }

  const header = `오늘(${date}) 부대별 점심 메뉴예요. 본인이 먹은 거랑 비슷한 걸 찾아서 "부대 변경 <코드>"라고 말해주세요.`;
  const half = Math.ceil(lines.length / 2);
  const outputs = [simpleText(header), simpleText(lines.slice(0, half).join("\n"))];
  if (lines.length > half) outputs.push(simpleText(lines.slice(half).join("\n")));

  return c.json(skillResponse(outputs));
});
