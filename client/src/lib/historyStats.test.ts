import { describe, it, expect } from "vitest";
import {
  surgeriesByMonth,
  surgeriesByType,
  summarizeHistory,
  executiveSummary,
  type StatRecord,
} from "./historyStats";

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
