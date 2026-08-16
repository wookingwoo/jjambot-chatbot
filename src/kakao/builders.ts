import type { Button, QuickReply, SkillResponse } from "./schema.js";

export function simpleText(text: string) {
  return { simpleText: { text } };
}

export function simpleImage(imageUrl: string, altText: string) {
  return { simpleImage: { imageUrl, altText } };
}

export function basicCard(card: {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  buttons?: Button[];
}) {
  return {
    basicCard: {
      title: card.title,
      description: card.description,
      thumbnail: card.thumbnailUrl ? { imageUrl: card.thumbnailUrl } : undefined,
      buttons: card.buttons,
    },
  };
}

export function quickReply(reply: QuickReply): QuickReply {
  return reply;
}

/** Assemble a normal (synchronous) skill response. */
export function skillResponse(
  outputs: ReturnType<typeof simpleText | typeof simpleImage | typeof basicCard>[],
  options?: { quickReplies?: QuickReply[]; context?: SkillResponse["context"] },
): SkillResponse {
  return {
    version: "2.0",
    template: {
      outputs,
      quickReplies: options?.quickReplies,
    },
    context: options?.context,
  };
}

/**
 * Acknowledge a request that will be answered later via callbackUrl,
 * for handlers expected to exceed the 5s skill timeout.
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/ai_chatbot_callback_guide
 */
export function callbackAck(): SkillResponse {
  return { version: "2.0", useCallback: true };
}
