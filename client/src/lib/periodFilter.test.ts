import { describe, it, expect } from "vitest";
import {
  datePartsOf,
  availableYears,
  availableMonths,
  filterByPeriod,
  periodLabelOf,
} from "./periodFilter";

const recs = [
  { date: "2026-06-01" },
  { date: "2026-06-15" },
  { date: "2026-05-20" },
  { date: "2025-12-02" },
  { date: "" }, // invalid → ignored where relevant
];

describe("datePartsOf", () => {
  it("parses leading YYYY-MM", () => {
    expect(datePartsOf("2026-06-15")).toEqual({ year: "2026", month: "06" });
  });
  it("returns null for invalid dates", () => {
    expect(datePartsOf("")).toBeNull();
    expect(datePartsOf("nope")).toBeNull();
  });
});

describe("availableYears", () => {
  it("lists distinct years descending", () => {
    expect(availableYears(recs)).toEqual(["2026", "2025"]);
  });
});

describe("availableMonths", () => {
  it("lists months for a given year ascending", () => {
    expect(availableMonths(recs, "2026")).toEqual(["05", "06"]);
  });
  it("lists all months when year is 'all'", () => {
    expect(availableMonths(recs, "all")).toEqual(["05", "06", "12"]);
  });
});

describe("filterByPeriod", () => {
  it("returns all records when no filter is active", () => {
    expect(filterByPeriod(recs, "all", "all")).toHaveLength(5);
  });
  it("filters by year only", () => {
    expect(filterByPeriod(recs, "2026", "all")).toHaveLength(3);
  });
  it("filters by year + month", () => {
    expect(filterByPeriod(recs, "2026", "06")).toHaveLength(2);
  });
  it("filters by month across all years", () => {
    expect(filterByPeriod(recs, "all", "06")).toHaveLength(2);
  });
});

describe("periodLabelOf", () => {
  it("is undefined with no filter", () => {
    expect(periodLabelOf("all", "all")).toBeUndefined();
  });
  it("formats month/year", () => {
    expect(periodLabelOf("2026", "06")).toBe("jun/2026");
  });
  it("formats year only", () => {
    expect(periodLabelOf("2026", "all")).toBe("2026");
  });
  it("formats month across all years", () => {
    expect(periodLabelOf("all", "06")).toBe("jun (todos os anos)");
  });
});
