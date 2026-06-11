import { describe, it, expect } from "vitest";
import {
  surgeriesByMonth,
  surgeriesByType,
  summarizeHistory,
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
