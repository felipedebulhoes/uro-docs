import { describe, it, expect } from "vitest";
import type { StatRecord } from "./historyStats";
import {
  goalProgress,
  countInYear,
  countInMonth,
  annualPace,
  annualPaceAlert,
  monthlyGoalAlert,
  monthlyPace,
} from "./goals";

function rec(date: string, id = "rtu-p", name = "RTU de Próstata"): StatRecord {
  return { procedureId: id, procedureName: name, date };
}

describe("goalProgress", () => {
  it("computes pct, remaining and reached", () => {
    const p = goalProgress(10, 5);
    expect(p.target).toBe(10);
    expect(p.achieved).toBe(5);
    expect(p.remaining).toBe(5);
    expect(p.pct).toBe(50);
    expect(p.reached).toBe(false);
  });

  it("clamps remaining at 0 and flags reached when exceeded", () => {
    const p = goalProgress(10, 12);
    expect(p.remaining).toBe(0);
    expect(p.pct).toBe(120);
    expect(p.reached).toBe(true);
  });

  it("treats target below 1 as at least 1", () => {
    const p = goalProgress(0, 0);
    expect(p.target).toBe(1);
  });
});

describe("countInYear / countInMonth", () => {
  const records = [
    rec("2026-01-10"),
    rec("2026-01-22"),
    rec("2026-03-05"),
    rec("2025-12-30"),
  ];
  it("counts by year", () => {
    expect(countInYear(records, "2026")).toBe(3);
    expect(countInYear(records, "2025")).toBe(1);
  });
  it("counts by month", () => {
    expect(countInMonth(records, "2026", "01")).toBe(2);
    expect(countInMonth(records, "2026", "03")).toBe(1);
    expect(countInMonth(records, "2026", "02")).toBe(0);
  });
});

describe("annualPace", () => {
  it("flags behind pace mid-year and computes needed per month", () => {
    // Annual goal 120, by June (month 6) expected 60. Achieved 30 → behind.
    const records = Array.from({ length: 30 }, (_, i) =>
      rec(`2026-0${(i % 5) + 1}-1${i % 9}`.replace(/-(\d)$/, "-0$1")),
    );
    const ref = new Date(2026, 5, 15); // June
    const pace = annualPace(records, 120, ref);
    expect(pace.progress.achieved).toBe(30);
    expect(pace.expected).toBe(60);
    expect(pace.paceDelta).toBe(-30);
    expect(pace.status).toBe("behind");
    // remaining 90 over 6 remaining months → 15/month
    expect(pace.neededPerRemainingMonth).toBe(15);
  });

  it("flags ahead pace", () => {
    const records = Array.from({ length: 40 }, () => rec("2026-02-10"));
    const ref = new Date(2026, 2, 1); // March (month 3) → expected 120*3/12=30
    const pace = annualPace(records, 120, ref);
    expect(pace.achieved ?? pace.progress.achieved).toBe(40);
    expect(pace.expected).toBe(30);
    expect(pace.status).toBe("ahead");
  });

  it("marks reached when achieved >= target", () => {
    const records = Array.from({ length: 120 }, () => rec("2026-05-10"));
    const ref = new Date(2026, 5, 1);
    const pace = annualPace(records, 100, ref);
    expect(pace.progress.reached).toBe(true);
    expect(pace.neededPerRemainingMonth).toBeNull();
    expect(annualPaceAlert(pace)).toMatch(/Meta anual atingida/);
  });
});

describe("annualPaceAlert", () => {
  it("produces a behind-pace alert with guidance", () => {
    const records = Array.from({ length: 10 }, () => rec("2026-01-10"));
    const ref = new Date(2026, 5, 15); // June, expected 60 for goal 120
    const pace = annualPace(records, 120, ref);
    const alert = annualPaceAlert(pace);
    expect(alert).toMatch(/abaixo do esperado/);
    expect(alert).toMatch(/cirurgia\(s\)\/mês/);
  });
});

describe("monthlyPace", () => {
  it("computes expected by day and flags behind the daily pace", () => {
    // Goal 30 in June (30 days). On day 15 → expected 15. Achieved 5 → behind.
    const records = Array.from({ length: 5 }, () => rec("2026-06-03"));
    const ref = new Date(2026, 5, 15);
    const pace = monthlyPace(records, 30, ref);
    expect(pace.dayOfMonth).toBe(15);
    expect(pace.daysInMonth).toBe(30);
    expect(pace.progress.achieved).toBe(5);
    expect(pace.expected).toBe(15);
    expect(pace.paceDelta).toBe(-10);
    expect(pace.status).toBe("behind");
    // remaining 25 over 15 remaining days → ~1.7/day
    expect(pace.neededPerRemainingDay).toBeCloseTo(1.7, 1);
  });

  it("flags ahead of the daily pace", () => {
    // Goal 30, day 10 of June → expected 10. Achieved 20 → ahead.
    const records = Array.from({ length: 20 }, () => rec("2026-06-02"));
    const ref = new Date(2026, 5, 10);
    const pace = monthlyPace(records, 30, ref);
    expect(pace.expected).toBe(10);
    expect(pace.paceDelta).toBe(10);
    expect(pace.status).toBe("ahead");
  });
});

describe("monthlyGoalAlert", () => {
  it("returns null without a monthly goal", () => {
    expect(monthlyGoalAlert([], 0)).toBeNull();
  });

  it("emits an explicit behind-the-daily-pace alert with guidance", () => {
    // Goal 4, June (30 days), day 15 → expected 2. Achieved 1 → behind.
    const records = [rec("2026-06-02")];
    const ref = new Date(2026, 5, 15);
    const alert = monthlyGoalAlert(records, 4, ref);
    expect(alert).toMatch(/Ritmo abaixo do esperado para a meta mensal/);
    expect(alert).toMatch(/1 de 2 previstos até o dia 15\/30/);
    expect(alert).toMatch(/1 abaixo/);
    expect(alert).toMatch(/cirurgia\(s\)\/dia/);
  });

  it("emits a positive message when ahead of the daily pace", () => {
    // Goal 10, June day 10 → expected ~3. Achieved 8 → ahead.
    const records = Array.from({ length: 8 }, () => rec("2026-06-02"));
    const ref = new Date(2026, 5, 10);
    const alert = monthlyGoalAlert(records, 10, ref);
    expect(alert).toMatch(/Ritmo acima do esperado para a meta mensal/);
    expect(alert).not.toMatch(/abaixo/);
  });

  it("reports reached when at/above the monthly goal", () => {
    const records = Array.from({ length: 12 }, () => rec("2026-06-03"));
    const ref = new Date(2026, 5, 15);
    const alert = monthlyGoalAlert(records, 10, ref);
    expect(alert).toMatch(/Meta do mês atingida/);
  });
});
