import { supabase } from "../supabase.js";
import { serviceForCorps, type CorpsLabel } from "../corps.js";

export interface MealRow {
  service: string;
  meal_date: string;
  weekday: string | null;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  special_dish: string | null;
}

export async function getMeal(corps: CorpsLabel, date: string): Promise<MealRow | null> {
  const { data, error } = await supabase
    .from("meals")
    .select("service, meal_date, weekday, breakfast, lunch, dinner, special_dish")
    .eq("service", serviceForCorps(corps))
    .eq("meal_date", date)
    .maybeSingle();

  if (error) throw error;
  return data as MealRow | null;
}
