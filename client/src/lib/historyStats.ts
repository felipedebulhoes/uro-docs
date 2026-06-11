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

/**
 * Build an automatic executive-summary sentence from a HistorySummary, ready to
 * paste into reports. Optionally include the period and procedure scope labels.
 *
 * Examples:
 *  - "Nenhuma cirurgia registrada no período."
 *  - "12 cirurgias registradas em 4 meses, distribuídas em 5 procedimentos
 *     distintos. Procedimento mais frequente: RTU de Próstata (5). Mês mais
 *     ativo: jun/2026 (4)."
 */
export function executiveSummary(
  summary: HistorySummary,
  opts: { periodLabel?: string; procedureLabel?: string } = {},
): string {
  const scope: string[] = [];
  if (opts.procedureLabel) scope.push(`procedimento: ${opts.procedureLabel}`);
  if (opts.periodLabel) scope.push(`período: ${opts.periodLabel}`);
  const scopeSuffix = scope.length > 0 ? ` (${scope.join("; ")})` : "";

  if (summary.total === 0) {
    return `Nenhuma cirurgia registrada${scopeSuffix ? scopeSuffix : ""}.`;
  }

  const surgeryWord = summary.total === 1 ? "cirurgia registrada" : "cirurgias registradas";
  const monthsCount = summary.byMonth.length;
  const monthsPart =
    monthsCount > 0
      ? ` em ${monthsCount} ${monthsCount === 1 ? "mês" : "meses"}`
      : "";

  const typesPart =
    summary.distinctTypes > 0
      ? `, distribuídas em ${summary.distinctTypes} ${
          summary.distinctTypes === 1 ? "procedimento distinto" : "procedimentos distintos"
        }`
      : "";

  const sentences: string[] = [];
  sentences.push(`${summary.total} ${surgeryWord}${monthsPart}${typesPart}${scopeSuffix}.`);

  if (summary.topType) {
    sentences.push(
      `Procedimento mais frequente: ${summary.topType.procedureName} (${summary.topType.count}).`,
    );
  }
  if (summary.busiestMonth) {
    sentences.push(
      `Mês mais ativo: ${summary.busiestMonth.label} (${summary.busiestMonth.count}).`,
    );
  }

  return sentences.join(" ");
}


export interface PeriodComparison {
  /** Total in the current period. */
  current: number;
  /** Total in the previous period of equal length. */
  previous: number;
  /** current - previous. */
  delta: number;
  /**
   * Percentage change vs. previous period.
   * - null when previous is 0 and current is 0 (no basis, no change).
   * - null when previous is 0 and current > 0 (infinite growth — render as "novo").
   */
  pct: number | null;
  direction: "up" | "down" | "flat";
}

/**
 * Compare two already-filtered record sets (current vs. a previous window of the
 * same length). Pure and side-effect free.
 */
export function comparePeriods(
  current: StatRecord[],
  previous: StatRecord[],
): PeriodComparison {
  const c = current.length;
  const p = previous.length;
  const delta = c - p;
  let pct: number | null;
  if (p === 0) {
    pct = c === 0 ? null : null; // no meaningful base; UI shows "novo"/"—"
  } else {
    pct = (delta / p) * 100;
  }
  const direction: "up" | "down" | "flat" = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return { current: c, previous: p, delta, pct, direction };
}

/**
 * Human label for a comparison, ready to display or paste.
 * Examples:
 *  - "Sem alteração frente ao período anterior (0)."
 *  - "+50,0% frente ao período anterior (8 → 12)."
 *  - "Novo: 5 cirurgias (período anterior sem registros)."
 */
export function comparisonLabel(cmp: PeriodComparison): string {
  if (cmp.previous === 0) {
    if (cmp.current === 0) return "Sem registros em ambos os períodos.";
    return `Novo: ${cmp.current} ${
      cmp.current === 1 ? "cirurgia" : "cirurgias"
    } (período anterior sem registros).`;
  }
  if (cmp.delta === 0) {
    return `Sem alteração frente ao período anterior (${cmp.current}).`;
  }
  const sign = cmp.delta > 0 ? "+" : "";
  const pctText =
    cmp.pct === null ? "" : `${sign}${cmp.pct.toFixed(1).replace(".", ",")}% `;
  return `${pctText}frente ao período anterior (${cmp.previous} → ${cmp.current}).`;
}
