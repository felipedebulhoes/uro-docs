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

/** Number of days in the month of `ref`. */
function daysInMonthOf(ref: Date): number {
  return new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
}

export interface MonthlyPace {
  progress: GoalProgress;
  /** Current day of month (1..31). */
  dayOfMonth: number;
  /** Total days in the current month. */
  daysInMonth: number;
  /**
   * Expected achieved count by this day, assuming a linear daily pace
   * (target * dayOfMonth / daysInMonth), rounded.
   */
  expected: number;
  /** achieved - expected. Negative = behind the daily pace. */
  paceDelta: number;
  /** "ahead" | "on" | "behind" relative to the linear daily pace. */
  status: "ahead" | "on" | "behind";
  /** Surgeries/day needed in remaining days to still hit the monthly goal. */
  neededPerRemainingDay: number | null;
}

/**
 * Compute the monthly pace for the month of `ref`, comparing the achieved
 * count against the expected linear daily pace (proportional to the day of
 * the month). Deterministic given an explicit `ref`.
 */
export function monthlyPace(
  records: StatRecord[],
  monthlyTarget: number,
  ref: Date = new Date(),
): MonthlyPace {
  const year = String(ref.getFullYear());
  const month = String(ref.getMonth() + 1).padStart(2, "0");
  const achieved = countInMonth(records, year, month);
  const progress = goalProgress(monthlyTarget, achieved);

  const dayOfMonth = ref.getDate();
  const daysInMonth = daysInMonthOf(ref);
  const expected = Math.round((progress.target * dayOfMonth) / daysInMonth);
  const paceDelta = achieved - expected;
  const status: "ahead" | "on" | "behind" =
    paceDelta > 0 ? "ahead" : paceDelta < 0 ? "behind" : "on";

  const remainingDays = daysInMonth - dayOfMonth;
  let neededPerRemainingDay: number | null = null;
  if (!progress.reached && remainingDays > 0) {
    neededPerRemainingDay =
      Math.round((progress.remaining / remainingDays) * 10) / 10;
  } else if (!progress.reached && remainingDays === 0) {
    neededPerRemainingDay = progress.remaining; // all due today
  }

  return {
    progress,
    dayOfMonth,
    daysInMonth,
    expected,
    paceDelta,
    status,
    neededPerRemainingDay,
  };
}

/**
 * Human-readable monthly pace alert, or null when there is no monthly goal.
 * Unlike a neutral progress label, this compares the achieved count against
 * the expected daily pace and explicitly flags when the current month is
 * behind what is needed proportionally to the day of the month.
 */
export function monthlyGoalAlert(
  records: StatRecord[],
  monthlyTarget: number,
  ref: Date = new Date(),
): string | null {
  if (!monthlyTarget || monthlyTarget <= 0) return null;
  const pace = monthlyPace(records, monthlyTarget, ref);
  const { progress, expected, paceDelta, dayOfMonth, daysInMonth } = pace;

  if (progress.reached) {
    return `Meta do mês atingida: ${progress.achieved}/${progress.target} (${progress.pct}%).`;
  }
  if (pace.status === "behind") {
    const behindBy = Math.abs(paceDelta);
    const needPart =
      pace.neededPerRemainingDay != null
        ? ` Para alcançar a meta, ~${pace.neededPerRemainingDay} cirurgia(s)/dia no restante do mês.`
        : "";
    return `Ritmo abaixo do esperado para a meta mensal: ${progress.achieved} de ${expected} previstos até o dia ${dayOfMonth}/${daysInMonth} (${behindBy} abaixo).${needPart}`;
  }
  if (pace.status === "ahead") {
    return `Ritmo acima do esperado para a meta mensal: ${progress.achieved} vs. ${expected} previstos até o dia ${dayOfMonth}/${daysInMonth} (+${paceDelta}).`;
  }
  return `No ritmo esperado para a meta mensal: ${progress.achieved}/${progress.target} (${progress.pct}%) até o dia ${dayOfMonth}/${daysInMonth}.`;
}
