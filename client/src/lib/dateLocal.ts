// Local-date helpers that avoid UTC drift.
//
// Problem: `new Date().toISOString().split("T")[0]` converts to UTC, so in
// timezones behind UTC (e.g. America/Sao_Paulo, GMT-3) an evening "today"
// becomes tomorrow's date. Likewise `new Date("2026-06-12")` parses as UTC
// midnight, which formats back as the previous day in negative offsets.
//
// These helpers operate on the *local* calendar date, keeping the stored
// "YYYY-MM-DD" string aligned with what the user sees.

/** Format a Date as a local "YYYY-MM-DD" string (no UTC conversion). */
export function toLocalISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today's local date as "YYYY-MM-DD". */
export function todayLocalISO(): string {
  return toLocalISODate(new Date());
}

/**
 * Parse a "YYYY-MM-DD" string into a local Date (noon, to stay clear of DST
 * edges). Falls back to the native parser for other inputs.
 */
export function parseLocalISODate(dateStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (m) {
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), 12, 0, 0, 0);
  }
  return new Date(dateStr);
}

/**
 * Add a number of days to a "YYYY-MM-DD" string and return a new local
 * "YYYY-MM-DD" string (no UTC drift).
 */
export function addDaysISO(dateStr: string, days: number): string {
  const d = parseLocalISODate(dateStr);
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
}

/** Format a "YYYY-MM-DD" (or any parseable date) as a pt-BR local date. */
export function formatBR(dateStr: string): string {
  if (!dateStr) return "";
  return parseLocalISODate(dateStr).toLocaleDateString("pt-BR");
}
