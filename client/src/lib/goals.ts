// Pure, testable helpers for surgical volume goals (monthly + annual) and
// pace alerts. All functions are side-effect free and timezone-agnostic
// (they accept an explicit reference date so tests are deterministic).

import type { StatRecord } from "./historyStats";
import { datePartsOf } from "./periodFilter";

export interface GoalConfig {
  /** Target number of surgeries per month (0 or undefined = no monthly goal). */
  monthly?: number;
  /** Target number of surgeries per year (0 or undefined = no annual goal). */
  annual?: number;
}

const LS_KEY = "urodocx_goals";

/** Read goal config from localStorage. Safe on server / missing storage. */
export function loadGoals(): GoalConfig {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as GoalConfig;
    return {
      monthly: numOrUndefined(parsed.monthly),
      annual: numOrUndefined(parsed.annual),
    };
  } catch {
    return {};
  }
}

/** Persist goal config to localStorage. */
export function saveGoals(config: GoalConfig): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        monthly: numOrUndefined(config.monthly),
        annual: numOrUndefined(config.annual),
      }),
    );
  } catch {
    /* ignore */
  }
}

function numOrUndefined(v: unknown): number | undefined {
  const n = typeof v === "string" ? parseInt(v, 10) : (v as number);
  return typeof n === "number" && isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

/** Count records that fall within a given year (YYYY). */
export function countInYear(records: StatRecord[], year: string): number {
  let n = 0;
  for (const r of records) {
    const p = datePartsOf(r.date);
    if (p && p.year === year) n += 1;
  }
  return n;
}

/** Count records that fall within a given year-month (YYYY, MM). */
export function countInMonth(
  records: StatRecord[],
  year: string,
  month: string,
): number {
  let n = 0;
  for (const r of records) {
    const p = datePartsOf(r.date);
    if (p && p.year === year && p.month === month) n += 1;
  }
  return n;
}

export interface GoalProgress {
  /** The goal target (already validated > 0). */
  target: number;
  /** Achieved count so far. */
  achieved: number;
  /** Remaining to hit the goal (never below 0). */
  remaining: number;
  /** Percentage achieved (0..100+, rounded). */
  pct: number;
  /** Whether the goal has been reached or exceeded. */
  reached: boolean;
}

/** Build a GoalProgress from a target and achieved count. */
export function goalProgress(target: number, achieved: number): GoalProgress {
  const safeTarget = Math.max(1, Math.floor(target));
  const pct = Math.round((achieved / safeTarget) * 100);
  return {
    target: safeTarget,
    achieved,
    remaining: Math.max(0, safeTarget - achieved),
    pct,
    reached: achieved >= safeTarget,
  };
}

export interface AnnualPace {
  progress: GoalProgress;
  /** 1..12 — the reference month within the year. */
  monthIndex: number;
  /**
   * Expected achieved count by this point in the year, assuming a linear pace
   * (target * monthsElapsed / 12), rounded.
   */
  expected: number;
  /** achieved - expected. Negative = behind pace. */
  paceDelta: number;
  /** "ahead" | "on" | "behind" relative to the linear pace. */
  status: "ahead" | "on" | "behind";
  /** Surgeries/month needed in remaining months to still hit the annual goal. */
  neededPerRemainingMonth: number | null;
}

/**
 * Compute annual pace for the year of `ref`, given the annual target and the
 * records. Uses the reference month (1..12) to derive the expected linear pace.
 */
export function annualPace(
  records: StatRecord[],
  annualTarget: number,
  ref: Date = new Date(),
): AnnualPace {
  const year = String(ref.getFullYear());
  const monthIndex = ref.getMonth() + 1; // 1..12
  const achieved = countInYear(records, year);
  const progress = goalProgress(annualTarget, achieved);

  const expected = Math.round((progress.target * monthIndex) / 12);
  const paceDelta = achieved - expected;
  const status: "ahead" | "on" | "behind" =
    paceDelta > 0 ? "ahead" : paceDelta < 0 ? "behind" : "on";

  const remainingMonths = 12 - monthIndex;
  let neededPerRemainingMonth: number | null = null;
  if (!progress.reached && remainingMonths > 0) {
    neededPerRemainingMonth = Math.ceil(progress.remaining / remainingMonths);
  } else if (!progress.reached && remainingMonths === 0) {
    neededPerRemainingMonth = progress.remaining; // all due this month
  }

  return {
    progress,
    monthIndex,
    expected,
    paceDelta,
    status,
    neededPerRemainingMonth,
  };
}

/**
 * Human-readable alert about annual pace, or null when the goal is reached or
 * there is no meaningful alert. Ready to display in the panel / PDF.
 */
export function annualPaceAlert(pace: AnnualPace): string | null {
  if (pace.progress.reached) {
    return `Meta anual atingida: ${pace.progress.achieved}/${pace.progress.target} (${pace.progress.pct}%).`;
  }
  if (pace.status === "behind") {
    const behindBy = Math.abs(pace.paceDelta);
    const needPart =
      pace.neededPerRemainingMonth != null
        ? ` Para alcançar a meta, ~${pace.neededPerRemainingMonth} cirurgia(s)/mês no restante do ano.`
        : "";
    return `Ritmo abaixo do esperado para a meta anual: ${pace.progress.achieved} de ${pace.expected} previstos até aqui (${behindBy} abaixo).${needPart}`;
  }
  if (pace.status === "ahead") {
    return `Ritmo acima do esperado para a meta anual: ${pace.progress.achieved} vs. ${pace.expected} previstos até aqui (+${pace.paceDelta}).`;
  }
  return `No ritmo esperado para a meta anual: ${pace.progress.achieved}/${pace.progress.target} (${pace.progress.pct}%).`;
}

/**
 * Monthly goal alert for a given year-month, or null when there is no monthly
 * goal. Compares the achieved count in that month against the monthly target.
 */
export function monthlyGoalAlert(
  records: StatRecord[],
  monthlyTarget: number,
  ref: Date = new Date(),
): string | null {
  if (!monthlyTarget || monthlyTarget <= 0) return null;
  const year = String(ref.getFullYear());
  const month = String(ref.getMonth() + 1).padStart(2, "0");
  const achieved = countInMonth(records, year, month);
  const progress = goalProgress(monthlyTarget, achieved);
  if (progress.reached) {
    return `Meta do mês atingida: ${achieved}/${progress.target} (${progress.pct}%).`;
  }
  return `Mês corrente: ${achieved}/${progress.target} (${progress.pct}%) — faltam ${progress.remaining}.`;
}
