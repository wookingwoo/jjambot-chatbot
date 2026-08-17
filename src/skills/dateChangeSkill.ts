import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { quickReply, simpleText, skillResponse } from "../kakao/builders.js";
import { getOrCreateUser, incrementUsage, updateUser, type UserRow } from "../repo/users.js";
import { parseDateToISO } from "../dates.js";

interface DateChangeOptions {
  usageKey: string;
  column: "date_to_join_the_army" | "discharge_date";
  paramName: string;
  label: string;
  /** 실제로 sys.date 엔티티가 인식하는 것으로 확인된 예시 발화 (파싱 실패 시 퀵리플라이로 제안). */
  exampleUtterance: string;
}

/** Both date-setting skills (입대일 변경, 전역일 변경) only differ by which column they write. */
export function createDateChangeSkill(options: DateChangeOptions): Hono {
  const app = new Hono();

  app.post("/", zValidator("json", skillRequestSchema), async (c) => {
    const req = c.req.valid("json");
    const user = await getOrCreateUser(req.userRequest.user.id);
    await incrementUsage(user, options.usageKey);

    const raw = req.action.params[options.paramName] || req.userRequest.utterance;
    const date = parseDateToISO(raw);
    if (!date) {
      return c.json(
        skillResponse([simpleText("날짜를 이해하지 못했어요. YYYY-MM-DD 형식으로 다시 말씀해주세요. (예: 2025-06-15)")], {
          quickReplies: [
            quickReply({ label: "오늘로 설정", action: "message", messageText: options.exampleUtterance }),
          ],
        }),
      );
    }

    const patch: Partial<Pick<UserRow, "date_to_join_the_army" | "discharge_date">> = {};
    patch[options.column] = date;
    await updateUser(user.kakao_user_id, patch);

    return c.json(skillResponse([simpleText(`${options.label}을(를) ${date}(으)로 설정했어요.`)]));
  });

  return app;
}
