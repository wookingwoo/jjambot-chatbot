import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage } from "../repo/users.js";
import { getMeal } from "../repo/meals.js";
import { isValidCorps } from "../corps.js";
import { parseDateToISO, todayInSeoul } from "../dates.js";

export const menuSkill = new Hono();

type MealField = "breakfast" | "lunch" | "dinner";

const MEAL_TYPE_ENTITY_MAP: Record<string, MealField> = {
  아침: "breakfast",
  조식: "breakfast",
  점심: "lunch",
  중식: "lunch",
  저녁: "dinner",
  석식: "dinner",
};

const MEAL_TYPE_ORDER: Array<{ field: MealField; label: string }> = [
  { field: "breakfast", label: "조식" },
  { field: "lunch", label: "중식" },
  { field: "dinner", label: "석식" },
];

/** Kakao sends a `meal_type<N>` group param per selected 끼니 (e.g. "아침과 저녁"), or none for "전체". */
function requestedMealFields(params: Record<string, string>): Set<MealField> {
  const fields = new Set<MealField>();
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith("meal_type")) continue;
    const field = MEAL_TYPE_ENTITY_MAP[value];
    if (field) fields.add(field);
  }
  return fields;
}

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

  const requested = requestedMealFields(req.action.params);
  const mealTypesToShow = requested.size > 0 ? MEAL_TYPE_ORDER.filter((t) => requested.has(t.field)) : MEAL_TYPE_ORDER;

  const lines = [`${meal.meal_date} (${meal.weekday ?? "?"}) ${corps} 식단`];
  for (const { field, label } of mealTypesToShow) {
    lines.push(`${label}: ${meal[field] ?? "정보 없음"}`);
  }
  if (meal.special_dish) lines.push(`특식: ${meal.special_dish}`);

  return c.json(skillResponse([simpleText(lines.join("\n"))]));
});
