import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { quickReply, simpleText, simpleTextOutputs, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage } from "../repo/users.js";
import { getMeal } from "../repo/meals.js";
import { isValidCorps } from "../corps.js";
import { daysBetween, parseDateToISO, todayInSeoul } from "../dates.js";
import { stripAllergyCodes } from "../allergy.js";

export const menuSkill = new Hono();

type MealField = "breakfast" | "lunch" | "dinner" | "special_dish";

const MEAL_TYPE_ENTITY_MAP: Record<string, MealField> = {
  아침: "breakfast",
  조식: "breakfast",
  점심: "lunch",
  중식: "lunch",
  저녁: "dinner",
  석식: "dinner",
  부식: "special_dish",
  특식: "special_dish",
  간식: "special_dish",
  "side dish": "special_dish",
  snack: "special_dish",
};

const MEAL_LABELS: Record<MealField, string> = {
  breakfast: "조식",
  lunch: "중식",
  dinner: "석식",
  special_dish: "특식",
};

/** Default (no meal_type param): the three regular meals only, matching the pre-filter behavior. */
const DEFAULT_MEAL_FIELDS: MealField[] = ["breakfast", "lunch", "dinner"];
const MEAL_FIELD_ORDER: MealField[] = ["breakfast", "lunch", "dinner", "special_dish"];

/** Meal data is only queryable for the trailing 6 months (~183 days). */
const MEAL_LOOKBACK_DAYS = 183;

/** Space menu separators while keeping commas inside nested dish descriptions intact. */
function spaceDishSeparators(text: string): string {
  const dishes: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(") depth++;
    else if (char === ")") depth = Math.max(0, depth - 1);
    else if (char === "," && depth === 0) {
      dishes.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  dishes.push(text.slice(start).trim());
  return dishes.filter(Boolean).join(", ");
}

/** Kakao sends a `meal_type<N>` group param per selected 끼니 (e.g. "아침과 저녁"), or none for "전체". */
function requestedMealFields(params: Record<string, string>): Set<MealField> {
  const fields = new Set<MealField>();
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith("meal_type")) continue;
    const field = MEAL_TYPE_ENTITY_MAP[value] ?? MEAL_TYPE_ENTITY_MAP[value.toLowerCase()];
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
      skillResponse([simpleText("먼저 부대를 설정해주세요. '부대 조회'로 코드를 확인한 뒤 '부대 변경'으로 설정할 수 있어요.")], {
        quickReplies: [quickReply({ label: "부대 조회", action: "message", messageText: "부대 조회" })],
      }),
    );
  }

  const today = todayInSeoul();
  const requestedDate = req.action.params.sys_date ? parseDateToISO(req.action.params.sys_date) : null;
  if (req.action.params.sys_date && !requestedDate) {
    return c.json(skillResponse([simpleText("날짜를 이해하지 못했어요. YYYY-MM-DD 형식으로 다시 말씀해주세요.")], {
      quickReplies: [quickReply({ label: "오늘 메뉴", action: "message", messageText: "오늘 메뉴" })],
    }));
  }
  const date = requestedDate ?? today;

  if (daysBetween(date, today) > MEAL_LOOKBACK_DAYS) {
    return c.json(
      skillResponse([simpleText("식단은 최근 6개월 데이터만 조회할 수 있어요.")], {
        quickReplies: [quickReply({ label: "오늘 메뉴", action: "message", messageText: "오늘 메뉴" })],
      }),
    );
  }

  const meal = await getMeal(corps, date);
  if (!meal) {
    return c.json(skillResponse([simpleText(`${date} (${corps}) 식단 정보가 아직 없어요.`)]));
  }

  const requested = requestedMealFields(req.action.params);
  const fieldsToShow =
    requested.size > 0 ? MEAL_FIELD_ORDER.filter((f) => requested.has(f)) : DEFAULT_MEAL_FIELDS;

  const formatDish = (dish: string | null) => {
    if (!dish) return null;
    return spaceDishSeparators(user.allergy_show ? dish : stripAllergyCodes(dish)) || null;
  };

  const sections = [`${meal.meal_date} (${meal.weekday ?? "?"}) ${corps} 식단`];
  for (const field of fieldsToShow) {
    sections.push(`[${MEAL_LABELS[field]}]\n${formatDish(meal[field]) ?? "정보 없음"}`);
  }
  // Special dish is a bonus, not a regular meal: only mention it unprompted when present.
  if (requested.size === 0 && meal.special_dish) sections.push(`[특식]\n${formatDish(meal.special_dish) ?? "정보 없음"}`);

  return c.json(skillResponse(simpleTextOutputs(sections.join("\n\n"), "내용이 길어 일부를 생략했어요. 아침·점심·저녁을 끼니별로 조회해주세요.")));
});
