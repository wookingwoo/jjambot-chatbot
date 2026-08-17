import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage } from "../repo/users.js";
import { getMeal } from "../repo/meals.js";
import { isValidCorps } from "../corps.js";
import { parseDateToISO, todayInSeoul } from "../dates.js";

export const menuSkill = new Hono();

menuSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "menu");

  const corps = user.corps;
  if (!corps || !isValidCorps(corps)) {
    return c.json(
      skillResponse([
        simpleText("먼저 부대를 설정해주세요. '부대 조회'로 코드를 확인한 뒤 '부대 변경'으로 설정할 수 있어요."),
      ]),
    );
  }

  const requestedDate = req.action.params.sys_date ? parseDateToISO(req.action.params.sys_date) : null;
  const date = requestedDate ?? todayInSeoul();

  const meal = await getMeal(corps, date);
  if (!meal) {
    return c.json(skillResponse([simpleText(`${date} (${corps}) 식단 정보가 아직 없어요.`)]));
  }

  const lines = [
    `${meal.meal_date} (${meal.weekday ?? "?"}) ${corps} 식단`,
    `조식: ${meal.breakfast ?? "정보 없음"}`,
    `중식: ${meal.lunch ?? "정보 없음"}`,
    `석식: ${meal.dinner ?? "정보 없음"}`,
  ];
  if (meal.special_dish) lines.push(`특식: ${meal.special_dish}`);

  return c.json(skillResponse([simpleText(lines.join("\n"))]));
});
