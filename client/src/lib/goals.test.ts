import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { StatRecord } from "./historyStats";
import {
  goalProgress,
  countInYear,
  countInMonth,
  annualPace,
  annualPaceAlert,
  monthlyGoalAlert,
  monthlyPace,
  perProcedureMonthlyPaces,
  paceSignal,
  loadGoals,
  saveGoals,
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

describe("perProcedureMonthlyPaces", () => {
  it("returns [] without configured targets", () => {
    expect(perProcedureMonthlyPaces([], undefined)).toEqual([]);
    expect(perProcedureMonthlyPaces([], {})).toEqual([]);
  });

  it("computes pace per configured procedure for the current month", () => {
    const records = [
      rec("2026-06-02", "rtu-p", "RTU de Próstata"),
      rec("2026-06-05", "rtu-p", "RTU de Próstata"),
      rec("2026-06-10", "vasectomia", "Vasectomia"),
      rec("2026-05-20", "rtu-p", "RTU de Próstata"), // other month, ignored
    ];
    const ref = new Date(2026, 5, 15); // June 15
    const paces = perProcedureMonthlyPaces(
      records,
      { "rtu-p": 4, vasectomia: 2 },
      ref,
    );
    // Sorted by name: "RTU de Próstata" before "Vasectomia"
    expect(paces.map((p) => p.procedureId)).toEqual(["rtu-p", "vasectomia"]);

    const rtu = paces[0];
    expect(rtu.pace.progress.achieved).toBe(2); // only June rtu-p
    expect(rtu.pace.progress.target).toBe(4);
    // Goal 4, day 15/30 → expected 2; achieved 2 → on pace
    expect(rtu.pace.expected).toBe(2);
    expect(rtu.pace.status).toBe("on");

    const vas = paces[1];
    expect(vas.pace.progress.achieved).toBe(1);
    expect(vas.pace.progress.target).toBe(2);
  });

  it("drops invalid targets and keeps procedures with zero achieved", () => {
    const records = [rec("2026-06-02", "rtu-p", "RTU de Próstata")];
    const ref = new Date(2026, 5, 15);
    const paces = perProcedureMonthlyPaces(
      records,
      { "rtu-p": 0, holep: 3 },
      ref,
    );
    // rtu-p dropped (target 0); holep kept with achieved 0
    expect(paces).toHaveLength(1);
    expect(paces[0].procedureId).toBe("holep");
    expect(paces[0].pace.progress.achieved).toBe(0);
    // name falls back to id when no record exists
    expect(paces[0].procedureName).toBe("holep");
  });
});

describe("loadGoals / saveGoals perProcedureMonthly", () => {
  // The library no-ops when localStorage is absent (Node env), so provide a
  // minimal in-memory stub to exercise the persistence + sanitization path.
  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    } as Storage;
  });
  afterEach(() => {
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
  });

  it("sanitizes and round-trips per-procedure monthly targets", () => {
    saveGoals({
      monthly: 5,
      annual: 60,
      perProcedureMonthly: { "rtu-p": 4, vasectomia: 0, bad: -2 },
    });
    const loaded = loadGoals();
    expect(loaded.monthly).toBe(5);
    expect(loaded.annual).toBe(60);
    expect(loaded.perProcedureMonthly).toEqual({ "rtu-p": 4 });
  });

  it("omits perProcedureMonthly when nothing valid remains", () => {
    saveGoals({ monthly: 3, perProcedureMonthly: { a: 0, b: -1 } });
    const loaded = loadGoals();
    expect(loaded.perProcedureMonthly).toBeUndefined();
  });
});

describe("paceSignal", () => {
  it("returns green when reached / ahead / on pace", () => {
    // reached
    let pace = monthlyPace(
      Array.from({ length: 12 }, () => rec("2026-06-03")),
      10,
      new Date(2026, 5, 15),
    );
    expect(paceSignal(pace)).toBe("green");
    // ahead: goal 30, day 10 → expected 10, achieved 20
    pace = monthlyPace(
      Array.from({ length: 20 }, () => rec("2026-06-02")),
      30,
      new Date(2026, 5, 10),
    );
    expect(paceSignal(pace)).toBe("green");
    // on: goal 4, day 15/30 → expected 2, achieved 2
    pace = monthlyPace(
      Array.from({ length: 2 }, () => rec("2026-06-02")),
      4,
      new Date(2026, 5, 15),
    );
    expect(paceSignal(pace)).toBe("green");
  });

  it("returns amber when moderately behind (>= half of expected)", () => {
    // goal 4, day 15/30 → expected 2, achieved 1 → 1*2 == 2 (not < 2) → amber
    const pace = monthlyPace([rec("2026-06-02")], 4, new Date(2026, 5, 15));
    expect(pace.expected).toBe(2);
    expect(pace.progress.achieved).toBe(1);
    expect(paceSignal(pace)).toBe("amber");
  });

  it("returns red when severely behind (< half of expected)", () => {
    // goal 30, day 15/30 → expected 15, achieved 1 → 1*2 < 15 → red
    const pace = monthlyPace([rec("2026-06-02")], 30, new Date(2026, 5, 15));
    expect(pace.expected).toBe(15);
    expect(pace.progress.achieved).toBe(1);
    expect(paceSignal(pace)).toBe("red");
  });

  it("returns red with zero achieved once a case is expected", () => {
    const pace = monthlyPace([], 30, new Date(2026, 5, 15));
    expect(pace.expected).toBe(15);
    expect(paceSignal(pace)).toBe("red");
  });
});
