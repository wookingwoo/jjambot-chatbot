import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

/**
 * Server-side client using the service role key: this process is the only
 * caller (the Kakao webhook never reaches the browser), so RLS is bypassed
 * here rather than modeled with policies.
 */
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
