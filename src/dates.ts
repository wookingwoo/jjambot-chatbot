const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$|^(\d{4})\.(\d{2})\.(\d{2})$|^(\d{4})(\d{2})(\d{2})$/;

/**
 * Kakao's sys.date entity value arrives as a JSON string, e.g.
 * `{"date": "2026-08-19", "dateTag": "afterTomorrow", ...}`, not a bare date.
 */
function unwrapEntityDate(raw: string): string {
  if (!raw.startsWith("{")) return raw;
  try {
    const parsed = JSON.parse(raw) as { date?: unknown };
    return typeof parsed.date === "string" ? parsed.date : raw;
  } catch {
    return raw;
  }
}

export function parseDateToISO(raw: string): string | null {
  const m = DATE_RE.exec(unwrapEntityDate(raw.trim()));
  if (!m) return null;
  const [y, mo, d] = m[1] ? [m[1], m[2], m[3]] : m[4] ? [m[4], m[5], m[6]] : [m[7], m[8], m[9]];
  return `${y}-${mo}-${d}`;
}

/** Today's date in Asia/Seoul as YYYY-MM-DD (the "en-CA" locale formats dates in ISO order). */
export function todayInSeoul(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/** Whole days from one YYYY-MM-DD date to another, treating both as UTC midnight so DST can't skew the count. */
export function daysBetween(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  const fromUTC = Date.UTC(fy ?? 0, (fm ?? 1) - 1, fd ?? 1);
  const toUTC = Date.UTC(ty ?? 0, (tm ?? 1) - 1, td ?? 1);
  return Math.round((toUTC - fromUTC) / 86_400_000);
}
