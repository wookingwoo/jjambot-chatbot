import type { Button, QuickReply, SkillResponse } from "./schema.js";

export function simpleText(text: string) {
  return { simpleText: { text } };
}

/** Keep text within Kakao's 1,000-character and three-output limits, preserving Unicode pairs. */
export function simpleTextOutputs(text: string, overflowMessage = "내용이 길어 일부를 생략했어요. 요청을 나눠서 조회해주세요.") {
  const outputs: ReturnType<typeof simpleText>[] = [];
  let remaining = text;
  for (let index = 0; index < 3; index++) {
    if (remaining.length <= 1000) {
      outputs.push(simpleText(remaining));
      break;
    }
    const notice = index === 2 ? `\n\n${overflowMessage}` : "";
    let boundary = 1000 - notice.length;
    if (!notice) {
      // Avoid wasting capacity when the complete text can fit in the remaining outputs.
      const minimum = Math.max(500, Math.min(1000, remaining.length - (2 - index) * 1000));
      const prefix = remaining.slice(0, boundary);
      const newline = prefix.lastIndexOf("\n") + 1;
      const comma = prefix.lastIndexOf(", ") + 2;
      if (newline >= minimum) boundary = newline;
      else if (comma >= minimum) boundary = comma;
    }
    const last = remaining.charCodeAt(boundary - 1);
    if (last >= 0xd800 && last <= 0xdbff) boundary--;
    outputs.push(simpleText(remaining.slice(0, boundary) + notice));
    remaining = remaining.slice(boundary);
  }
  return outputs;
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
