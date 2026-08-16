import { supabase } from "../supabase.js";

export interface UserRow {
  id: number;
  kakao_user_id: string;
  corps: string | null;
  allergy_show: boolean;
  date_to_join_the_army: string | null;
  discharge_date: string | null;
  usage_count: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export async function getOrCreateUser(kakaoUserId: string): Promise<UserRow> {
  // Atomic upsert rather than select-then-insert, so two near-simultaneous
  // first messages from the same new user can't race into a unique-constraint
  // error. Only kakao_user_id is in the payload, so on conflict this is a
  // no-op update that just returns the existing row untouched.
  const { data, error } = await supabase
    .from("users")
    .upsert({ kakao_user_id: kakaoUserId }, { onConflict: "kakao_user_id", ignoreDuplicates: false })
    .select("*")
    .single();

  if (error) throw error;
  return data as UserRow;
}

export async function updateUser(
  kakaoUserId: string,
  patch: Partial<Pick<UserRow, "corps" | "allergy_show" | "date_to_join_the_army" | "discharge_date">>,
): Promise<UserRow> {
  const { data, error } = await supabase
    .from("users")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("kakao_user_id", kakaoUserId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserRow;
}

export async function incrementUsage(user: UserRow, skill: string): Promise<void> {
  const usageCount = { ...user.usage_count, [skill]: (user.usage_count[skill] ?? 0) + 1 };
  const { error } = await supabase.from("users").update({ usage_count: usageCount }).eq("kakao_user_id", user.kakao_user_id);
  if (error) throw error;
}
