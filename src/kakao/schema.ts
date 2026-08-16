import { z } from "zod";

/**
 * Kakao i OpenBuilder skill request payload.
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format
 */
export const skillRequestSchema = z
  .object({
    intent: z.object({
      id: z.string(),
      name: z.string(),
    }),
    userRequest: z.object({
      timezone: z.string().optional(),
      params: z.record(z.string()).optional(),
      block: z.object({ id: z.string(), name: z.string() }).optional(),
      utterance: z.string(),
      lang: z.string().nullable().optional(),
      user: z.object({
        id: z.string(),
        type: z.string(),
        properties: z.record(z.unknown()).optional(),
      }),
      callbackUrl: z.string().optional(),
    }),
    bot: z.object({
      id: z.string(),
      name: z.string().optional(),
    }),
    action: z.object({
      name: z.string(),
      clientExtra: z.record(z.unknown()).nullable().optional(),
      params: z.record(z.string()).default({}),
      id: z.string(),
      detailParams: z.record(z.unknown()).default({}),
    }),
  })
  .passthrough();

export type SkillRequest = z.infer<typeof skillRequestSchema>;

const buttonSchema = z
  .object({
    label: z.string(),
    action: z.enum(["webLink", "message", "phone", "block", "share", "operator"]),
    webLinkUrl: z.string().optional(),
    messageText: z.string().optional(),
    phoneNumber: z.string().optional(),
    blockId: z.string().optional(),
  })
  .passthrough();

const quickReplySchema = z
  .object({
    label: z.string(),
    action: z.enum(["message", "block"]),
    messageText: z.string().optional(),
    blockId: z.string().optional(),
  })
  .passthrough();

const outputSchema = z.record(z.unknown());

const contextValueSchema = z.object({
  name: z.string(),
  lifeSpan: z.number().int(),
  params: z.record(z.string()).optional(),
});

/**
 * Kakao skill response payload (version 2.0).
 */
export const skillResponseSchema = z.object({
  version: z.literal("2.0"),
  template: z
    .object({
      outputs: z.array(outputSchema).min(1).max(3),
      quickReplies: z.array(quickReplySchema).max(10).optional(),
    })
    .optional(),
  context: z
    .object({
      values: z.array(contextValueSchema),
    })
    .optional(),
  data: z.record(z.unknown()).optional(),
  useCallback: z.boolean().optional(),
});

export type SkillResponse = z.infer<typeof skillResponseSchema>;
export type Button = z.infer<typeof buttonSchema>;
export type QuickReply = z.infer<typeof quickReplySchema>;
