import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { quickReply, simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage } from "../repo/users.js";
import { daysBetween, todayInSeoul } from "../dates.js";

export const calculateDateSkill = new Hono();

calculateDateSkill.post("/", zValidator("json", skillRequestSchema), async (c) => {
  const req = c.req.valid("json");
  const user = await getOrCreateUser(req.userRequest.user.id);
  await incrementUsage(user, "calculate_date");

  const dischargeDate = user.discharge_date;
  if (!dischargeDate) {
    return c.json(
      skillResponse([simpleText("전역일이 아직 설정되지 않았어요.")], {
        quickReplies: [quickReply({ label: "전역일 설정", action: "message", messageText: "전역일 변경" })],
      }),
    );
  }

  const today = todayInSeoul();
  const dDay = daysBetween(today, dischargeDate);

  if (dDay < 0) {
    return c.json(skillResponse([simpleText(`전역한지 ${-dDay}일 지났어요. 축하합니다!`)]));
  }
  if (dDay === 0) {
    return c.json(skillResponse([simpleText("바로 오늘이 전역일이에요!")]));
  }

  const lines = [`전역일(${dischargeDate})까지 D-${dDay}`];
  if (user.date_to_join_the_army) {
    const total = daysBetween(user.date_to_join_the_army, dischargeDate);
    const elapsed = daysBetween(user.date_to_join_the_army, today);
    if (total > 0) {
      const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 1000) / 10));
      lines.push(`복무 진행률: ${percent}% (${elapsed}/${total}일)`);
    }
  }

  return c.json(skillResponse([simpleText(lines.join("\n"))]));
});
