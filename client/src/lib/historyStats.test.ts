import { describe, it, expect } from "vitest";
import {
  surgeriesByMonth,
  surgeriesByType,
  summarizeHistory,
  executiveSummary,
  comparePeriods,
  comparisonLabel,
  compareProcedures,
  procedureDeltaLabel,
  type StatRecord,
} from "./historyStats";

const rec = (n: number): StatRecord[] =>
  Array.from({ length: n }, (_, i) => ({
    procedureId: "x",
    procedureName: "X",
    date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
  }));

const sample: StatRecord[] = [
  { procedureId: "rtu-prostata", procedureName: "RTU de Próstata", date: "2026-06-01" },
  { procedureId: "rtu-prostata", procedureName: "RTU de Próstata", date: "2026-06-15" },
  { procedureId: "rtu-bexiga", procedureName: "RTU de Bexiga", date: "2026-05-20" },
  { procedureId: "rtu-prostata", procedureName: "RTU de Próstata", date: "2026-05-02" },
  { procedureId: "nefrectomia", procedureName: "Nefrectomia", date: "2026-04-10" },
];

describe("surgeriesByMonth", () => {
  it("groups records by month chronologically", () => {
    const result = surgeriesByMonth(sample);
    expect(result).toHaveLength(3);
    expect(result[0].key).toBe("2026-04");
    expect(result[0].count).toBe(1);
    expect(result[1].key).toBe("2026-05");
    expect(result[1].count).toBe(2);
    expect(result[2].key).toBe("2026-06");
    expect(result[2].count).toBe(2);
  });

  it("formats month labels in pt-BR short form", () => {
    const result = surgeriesByMonth([
      { procedureId: "x", procedureName: "X", date: "2026-01-05" },
    ]);
    expect(result[0].label).toBe("jan/2026");
  });

  it("ignores invalid dates", () => {
    const result = surgeriesByMonth([
      { procedureId: "x", procedureName: "X", date: "" },
      { procedureId: "y", procedureName: "Y", date: "not-a-date" },
    ]);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(surgeriesByMonth([])).toEqual([]);
  });
});

describe("surgeriesByType", () => {
  it("groups records by procedure type sorted by count desc", () => {
    const result = surgeriesByType(sample);
    expect(result[0].procedureId).toBe("rtu-prostata");
    expect(result[0].count).toBe(3);
    expect(result).toHaveLength(3);
  });

  it("breaks ties alphabetically by name", () => {
    const records: StatRecord[] = [
      { procedureId: "b", procedureName: "Beta", date: "2026-01-01" },
      { procedureId: "a", procedureName: "Alpha", date: "2026-01-02" },
    ];
    const result = surgeriesByType(records);
    expect(result[0].procedureName).toBe("Alpha");
    expect(result[1].procedureName).toBe("Beta");
  });

  it("falls back to procedureId when name is missing", () => {
    const result = surgeriesByType([
      { procedureId: "abc", procedureName: "", date: "2026-01-01" },
    ]);
    expect(result[0].procedureName).toBe("abc");
  });
});

describe("summarizeHistory", () => {
  it("computes totals, distinct types, busiest month and top type", () => {
    const summary = summarizeHistory(sample);
    expect(summary.total).toBe(5);
    expect(summary.distinctTypes).toBe(3);
    expect(summary.topType?.procedureId).toBe("rtu-prostata");
    // Both May and June have 2; reduce keeps the first max encountered (May).
    expect(summary.busiestMonth?.count).toBe(2);
  });

  it("handles empty history gracefully", () => {
    const summary = summarizeHistory([]);
    expect(summary.total).toBe(0);
    expect(summary.distinctTypes).toBe(0);
    expect(summary.busiestMonth).toBeNull();
    expect(summary.topType).toBeNull();
    expect(summary.byMonth).toEqual([]);
    expect(summary.byType).toEqual([]);
  });
});

describe("executiveSummary", () => {
  it("returns a no-data sentence for empty history", () => {
    const text = executiveSummary(summarizeHistory([]));
    expect(text).toBe("Nenhuma cirurgia registrada.");
  });

  it("includes scope in the no-data sentence when provided", () => {
    const text = executiveSummary(summarizeHistory([]), {
      periodLabel: "jun/2026",
    });
    expect(text).toContain("período: jun/2026");
  });

  it("summarizes total, months, types, top type and busiest month", () => {
    const text = executiveSummary(summarizeHistory(sample));
    expect(text).toContain("5 cirurgias registradas");
    expect(text).toContain("3 meses");
    expect(text).toContain("3 procedimentos distintos");
    expect(text).toContain("Procedimento mais frequente: RTU de Próstata (3)");
    expect(text).toMatch(/Mês mais ativo: (mai|jun)\/2026 \(2\)/);
  });

  it("uses singular wording for a single surgery in a single month", () => {
    const text = executiveSummary(
      summarizeHistory([
        { procedureId: "x", procedureName: "X", date: "2026-03-01" },
      ]),
    );
    expect(text).toContain("1 cirurgia registrada");
    expect(text).toContain("em 1 mês");
    expect(text).toContain("1 procedimento distinto");
  });

  it("appends procedure and period scope when provided", () => {
    const text = executiveSummary(summarizeHistory(sample), {
      periodLabel: "2026",
      procedureLabel: "RTU de Próstata",
    });
    expect(text).toContain("procedimento: RTU de Próstata");
    expect(text).toContain("período: 2026");
  });
});

describe("per-procedure scoped export", () => {
  // Mirrors what HistoryStats does when the user scopes the PDF to a single
  // procedure: filter by procedureId, then summarize the subset.
  const scopeByProcedure = (recs: StatRecord[], procedureId: string) =>
    recs.filter((r) => r.procedureId === procedureId);

  it("summarizes only the selected procedure", () => {
    const scoped = scopeByProcedure(sample, "rtu-prostata");
    const summary = summarizeHistory(scoped);
    expect(scoped).toHaveLength(3);
    expect(summary.total).toBe(3);
    expect(summary.distinctTypes).toBe(1);
    expect(summary.topType?.procedureId).toBe("rtu-prostata");
  });

  it("yields an empty summary for a procedure with no records", () => {
    const scoped = scopeByProcedure(sample, "inexistente");
    const summary = summarizeHistory(scoped);
    expect(scoped).toHaveLength(0);
    expect(summary.total).toBe(0);
  });
});

describe("comparePeriods", () => {
  it("computes positive growth and percentage", () => {
    const cmp = comparePeriods(rec(12), rec(8));
    expect(cmp.current).toBe(12);
    expect(cmp.previous).toBe(8);
    expect(cmp.delta).toBe(4);
    expect(cmp.pct).toBeCloseTo(50, 5);
    expect(cmp.direction).toBe("up");
  });

  it("computes negative change", () => {
    const cmp = comparePeriods(rec(6), rec(10));
    expect(cmp.delta).toBe(-4);
    expect(cmp.pct).toBeCloseTo(-40, 5);
    expect(cmp.direction).toBe("down");
  });

  it("reports flat when equal", () => {
    const cmp = comparePeriods(rec(5), rec(5));
    expect(cmp.delta).toBe(0);
    expect(cmp.pct).toBe(0);
    expect(cmp.direction).toBe("flat");
  });

  it("returns null pct when previous period has no records", () => {
    const cmp = comparePeriods(rec(3), rec(0));
    expect(cmp.previous).toBe(0);
    expect(cmp.pct).toBeNull();
    expect(cmp.direction).toBe("up");
  });
});

describe("comparisonLabel", () => {
  it("labels growth with percentage and arrow figures", () => {
    expect(comparisonLabel(comparePeriods(rec(12), rec(8)))).toBe(
      "+50,0% frente ao período anterior (8 → 12).",
    );
  });

  it("labels a drop with negative sign", () => {
    expect(comparisonLabel(comparePeriods(rec(6), rec(10)))).toBe(
      "-40,0% frente ao período anterior (10 → 6).",
    );
  });

  it("labels no change", () => {
    expect(comparisonLabel(comparePeriods(rec(5), rec(5)))).toBe(
      "Sem alteração frente ao período anterior (5).",
    );
  });

  it("labels a brand-new period (no previous records)", () => {
    expect(comparisonLabel(comparePeriods(rec(5), rec(0)))).toBe(
      "Novo: 5 cirurgias (período anterior sem registros).",
    );
  });

  it("labels empty-vs-empty", () => {
    expect(comparisonLabel(comparePeriods(rec(0), rec(0)))).toBe(
      "Sem registros em ambos os períodos.",
    );
  });
});

describe("compareProcedures", () => {
  const current: StatRecord[] = [
    { procedureId: "rtu-prostata", procedureName: "RTU de Próstata", date: "2026-06-01" },
    { procedureId: "rtu-prostata", procedureName: "RTU de Próstata", date: "2026-06-10" },
    { procedureId: "rtu-prostata", procedureName: "RTU de Próstata", date: "2026-06-20" },
    { procedureId: "nefrectomia", procedureName: "Nefrectomia", date: "2026-06-05" },
  ];
  const previous: StatRecord[] = [
    { procedureId: "rtu-prostata", procedureName: "RTU de Próstata", date: "2026-05-01" },
    { procedureId: "vasectomia", procedureName: "Vasectomia", date: "2026-05-03" },
  ];

  it("computes per-procedure deltas across both periods", () => {
    const deltas = compareProcedures(current, previous);
    const byId = Object.fromEntries(deltas.map((d) => [d.procedureId, d]));

    expect(byId["rtu-prostata"]).toMatchObject({
      current: 3,
      previous: 1,
      delta: 2,
      direction: "up",
    });
    expect(byId["nefrectomia"]).toMatchObject({
      current: 1,
      previous: 0,
      delta: 1,
      direction: "up",
    });
    expect(byId["vasectomia"]).toMatchObject({
      current: 0,
      previous: 1,
      delta: -1,
      direction: "down",
    });
  });

  it("sorts by largest absolute movement first", () => {
    const deltas = compareProcedures(current, previous);
    expect(deltas[0].procedureId).toBe("rtu-prostata"); // |+2| is the biggest mover
  });

  it("handles empty periods without throwing", () => {
    expect(compareProcedures([], [])).toEqual([]);
  });
});

describe("procedureDeltaLabel", () => {
  it("returns a friendly message when nothing changed", () => {
    const current: StatRecord[] = [
      { procedureId: "a", procedureName: "A", date: "2026-06-01" },
    ];
    const previous: StatRecord[] = [
      { procedureId: "a", procedureName: "A", date: "2026-05-01" },
    ];
    expect(procedureDeltaLabel(compareProcedures(current, previous))).toBe(
      "Sem variações por procedimento.",
    );
  });

  it("formats movers with signs and truncates extras", () => {
    const deltas = [
      { procedureId: "a", procedureName: "RTU-P", current: 3, previous: 1, delta: 2, direction: "up" as const },
      { procedureId: "b", procedureName: "Vasectomia", current: 0, previous: 1, delta: -1, direction: "down" as const },
      { procedureId: "c", procedureName: "Nefrectomia", current: 1, previous: 0, delta: 1, direction: "up" as const },
      { procedureId: "d", procedureName: "Sling", current: 2, previous: 1, delta: 1, direction: "up" as const },
      { procedureId: "e", procedureName: "NLP", current: 1, previous: 0, delta: 1, direction: "up" as const },
    ];
    const label = procedureDeltaLabel(deltas, 4);
    expect(label).toContain("RTU-P +2");
    expect(label).toContain("Vasectomia -1");
    expect(label).toContain("e mais 1");
  });
});
