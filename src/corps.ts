/**
 * Unit labels and MND OpenAPI service-code mapping, kept in sync with
 * jjambot-crawler's src/jjambot_crawler/config.py (same Supabase `meals`
 * table, populated by that crawler).
 */
export const CORPS_LABELS = [
  "1570", "5861", "1691", "3182", "8623", "7296", "1862", "2171",
  "7021", "9030", "ATC", "5397", "3296", "8902", "2621", "3389",
  "5021", "6176", "3007", "5322", "5067", "7162", "1575", "6335",
  "7369", "2136", "1968", "6685", "2291", "7652", "7461", "STANDARD",
] as const;

export type CorpsLabel = (typeof CORPS_LABELS)[number];

// 7461은 실제 SERVICE 코드가 6282로 부여되어 있음(정부 스펙 OA-9555 확인).
const SERVICE_OVERRIDES: Record<string, string> = { "7461": "6282" };

export function isValidCorps(label: string): label is CorpsLabel {
  return (CORPS_LABELS as readonly string[]).includes(label);
}

export function serviceForCorps(label: CorpsLabel): string {
  if (label === "STANDARD") return "DS_TB_MNDT_DATEBYMLSVC";
  const suffix = SERVICE_OVERRIDES[label] ?? label;
  return `DS_TB_MNDT_DATEBYMLSVC_${suffix}`;
}
