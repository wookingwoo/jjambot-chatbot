/** MND API dish names carry allergy codes like "떡국(5.6.13)"; strip them when allergy display is off. */
export function stripAllergyCodes(text: string): string {
  return text.replace(/\([\d.,\s]+\)/g, "").trim();
}
