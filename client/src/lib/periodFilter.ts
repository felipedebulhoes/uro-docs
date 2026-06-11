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

export { MONTH_LABELS };
