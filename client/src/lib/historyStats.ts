// Pure, testable statistics over surgery history records.

export interface StatRecord {
  procedureId: string;
  procedureName: string;
  date: string; // YYYY-MM-DD (or any parseable date)
}

export interface MonthlyStat {
  /** "2026-06" */
  key: string;
  /** "jun/2026" */
  label: string;
  count: number;
}

export interface TypeStat {
  procedureId: string;
  procedureName: string;
  count: number;
}

const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** Parse a record date into a year-month key. Returns null when invalid. */
function monthKey(dateStr: string): string | null {
  if (!dateStr) return null;
  // Prefer the leading YYYY-MM when present (avoids timezone drift).
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const idx = parseInt(month, 10) - 1;
  return `${MONTH_LABELS[idx] ?? month}/${year}`;
}

/** Surgeries grouped by month, sorted chronologically ascending. */
export function surgeriesByMonth(records: StatRecord[]): MonthlyStat[] {
  const counts = new Map<string, number>();
  for (const r of records) {
    const key = monthKey(r.date);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, label: monthLabel(key), count }));
}

/** Surgeries grouped by procedure type, sorted by count descending. */
export function surgeriesByType(records: StatRecord[]): TypeStat[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const r of records) {
    const prev = counts.get(r.procedureId);
    if (prev) {
      prev.count += 1;
    } else {
      counts.set(r.procedureId, {
        name: r.procedureName || r.procedureId,
        count: 1,
      });
    }
  }
  return Array.from(counts.entries())
    .map(([procedureId, v]) => ({
      procedureId,
      procedureName: v.name,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count || a.procedureName.localeCompare(b.procedureName));
}

export interface HistorySummary {
  total: number;
  distinctTypes: number;
  busiestMonth: MonthlyStat | null;
  topType: TypeStat | null;
  byMonth: MonthlyStat[];
  byType: TypeStat[];
}

export function summarizeHistory(records: StatRecord[]): HistorySummary {
  const byMonth = surgeriesByMonth(records);
  const byType = surgeriesByType(records);
  const busiestMonth =
    byMonth.length > 0
      ? byMonth.reduce((max, m) => (m.count > max.count ? m : max), byMonth[0])
      : null;
  return {
    total: records.length,
    distinctTypes: byType.length,
    busiestMonth,
    topType: byType[0] ?? null,
    byMonth,
    byType,
  };
}
