import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { skillRequestSchema } from "../kakao/schema.js";
import { quickReply, simpleText, skillResponse } from "../kakao/builders.js";

/**
 * Example skill, registered in the OpenBuilder admin center as a block's
 * skill URL (e.g. https://<host>/skill/ping). Kept here as a template for
 * new skills: parse the request, build a response with the kakao builders.
 */
export const pingSkill = new Hono();

pingSkill.post("/", zValidator("json", skillRequestSchema), (c) => {
  const { userRequest } = c.req.valid("json");

  const response = skillResponse([simpleText(`pong: ${userRequest.utterance}`)], {
    quickReplies: [quickReply({ label: "again", action: "message", messageText: "ping" })],
  });

  return c.json(response);
});
