import type { UserRow } from "../src/repo/users.js";

export function makeSkillRequest(utterance: string, params: Record<string, string> = {}, userId = "test-user") {
  return {
    intent: { id: "intent-1", name: "test" },
    userRequest: {
      utterance,
      user: { id: userId, type: "botUserKey" },
    },
    bot: { id: "bot-1" },
    action: { id: "action-1", name: "test", params, detailParams: {} },
  };
}

export const baseUser: UserRow = {
  id: 1,
  kakao_user_id: "test-user",
  corps: null,
  allergy_show: true,
  date_to_join_the_army: null,
  discharge_date: null,
  usage_count: {},
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};
