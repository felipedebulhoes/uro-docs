// Pure, testable helpers for the history period filter (month/year selects).

const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export interface DateParts {
  year: string; // "2026"
  month: string; // "06"
}

/** Extract YYYY and MM from a date string. Prefers leading YYYY-MM. */
export function datePartsOf(dateStr: string): DateParts | null {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  if (m) return { year: m[1], month: m[2] };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, "0"),
  };
}

interface HasDate {
  date: string;
}

/** Distinct years present in the records, descending. */
export function availableYears<T extends HasDate>(records: T[]): string[] {
  const set = new Set<string>();
  for (const r of records) {
    const p = datePartsOf(r.date);
    if (p) set.add(p.year);
  }
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

/** Distinct months present (optionally limited to a year), ascending. */
export function availableMonths<T extends HasDate>(
  records: T[],
  year: string
): string[] {
  const set = new Set<string>();
  for (const r of records) {
    const p = datePartsOf(r.date);
    if (!p) continue;
    if (year !== "all" && p.year !== year) continue;
    set.add(p.month);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Filter records by the selected year/month ("all" disables that dimension). */
export function filterByPeriod<T extends HasDate>(
  records: T[],
  year: string,
  month: string
): T[] {
  if (year === "all" && month === "all") return records;
  return records.filter((r) => {
    const p = datePartsOf(r.date);
    if (!p) return false;
    if (year !== "all" && p.year !== year) return false;
    if (month !== "all" && p.month !== month) return false;
    return true;
  });
}

/** Human label of the active period, or undefined when no filter is active. */
export function periodLabelOf(year: string, month: string): string | undefined {
  if (year === "all" && month === "all") return undefined;
  if (year !== "all" && month !== "all") {
    return `${MONTH_LABELS[parseInt(month, 10) - 1]}/${year}`;
  }
  if (year !== "all") return year;
  return `${MONTH_LABELS[parseInt(month, 10) - 1]} (todos os anos)`;
}

// --- Custom date range (free interval) ---------------------------------------

/** Normalize a date string to a comparable YYYY-MM-DD key, or null if invalid. */
export function dateKeyOf(dateStr: string): string | null {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/**
 * Filter records by a free date interval. `from`/`to` are YYYY-MM-DD strings
 * (inclusive); either side may be empty ("") to leave that bound open.
 */
export function filterByDateRange<T extends HasDate>(
  records: T[],
  from: string,
  to: string
): T[] {
  if (!from && !to) return records;
  return records.filter((r) => {
    const k = dateKeyOf(r.date);
    if (!k) return false;
    if (from && k < from) return false;
    if (to && k > to) return false;
    return true;
  });
}

/** Format a YYYY-MM-DD string as DD/MM/YYYY for display. */
export function formatDateKeyBR(key: string): string {
  const m = key.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return key;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Human label for an active date range, or undefined when both bounds empty. */
export function rangeLabelOf(from: string, to: string): string | undefined {
  if (!from && !to) return undefined;
  if (from && to) return `${formatDateKeyBR(from)} a ${formatDateKeyBR(to)}`;
  if (from) return `a partir de ${formatDateKeyBR(from)}`;
  return `até ${formatDateKeyBR(to)}`;
}

export { MONTH_LABELS };

// --- Period presets (quick ranges) -------------------------------------------

export type PeriodPreset = "last30" | "last90" | "currentYear";

/**
 * Compute a { from, to } YYYY-MM-DD range for a quick preset, relative to a
 * reference date (defaults to today). "to" is the reference day (inclusive).
 *  - last30: the last 30 days (today included)
 *  - last90: the last 90 days (today included)
 *  - currentYear: from Jan 1st of the reference year to the reference day
 */
export function presetRange(
  preset: PeriodPreset,
  ref: Date = new Date()
): { from: string; to: string } {
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  };

  const to = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());

  if (preset === "currentYear") {
    const from = new Date(ref.getFullYear(), 0, 1);
    return { from: fmt(from), to: fmt(to) };
  }

  // last30 includes today + 29 previous days; last90 includes today + 89.
  const days = preset === "last30" ? 29 : 89;
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from: fmt(from), to: fmt(to) };
}

export const PERIOD_PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: "last30", label: "Últimos 30 dias" },
  { key: "last90", label: "Últimos 90 dias" },
  { key: "currentYear", label: "Ano corrente" },
];
