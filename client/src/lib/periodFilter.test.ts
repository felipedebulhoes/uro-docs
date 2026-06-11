import { describe, it, expect } from "vitest";
import {
  datePartsOf,
  availableYears,
  availableMonths,
  filterByPeriod,
  periodLabelOf,
  dateKeyOf,
  filterByDateRange,
  formatDateKeyBR,
  rangeLabelOf,
  presetRange,
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

describe("dateKeyOf", () => {
  it("normalizes leading YYYY-MM-DD", () => {
    expect(dateKeyOf("2026-06-15T10:00:00Z")).toBe("2026-06-15");
  });
  it("returns null for invalid", () => {
    expect(dateKeyOf("")).toBeNull();
    expect(dateKeyOf("nope")).toBeNull();
  });
});

describe("filterByDateRange", () => {
  it("returns all when both bounds empty", () => {
    expect(filterByDateRange(recs, "", "")).toHaveLength(5);
  });
  it("filters inclusive interval", () => {
    // 2026-05-20 .. 2026-06-15 inclusive => 3 records
    expect(filterByDateRange(recs, "2026-05-20", "2026-06-15")).toHaveLength(3);
  });
  it("respects open start bound (to only)", () => {
    expect(filterByDateRange(recs, "", "2025-12-31")).toHaveLength(1);
  });
  it("respects open end bound (from only)", () => {
    expect(filterByDateRange(recs, "2026-06-01", "")).toHaveLength(2);
  });
  it("excludes records with invalid dates", () => {
    expect(filterByDateRange(recs, "2000-01-01", "2100-01-01")).toHaveLength(4);
  });
});

describe("formatDateKeyBR", () => {
  it("formats YYYY-MM-DD as DD/MM/YYYY", () => {
    expect(formatDateKeyBR("2026-06-15")).toBe("15/06/2026");
  });
});

describe("rangeLabelOf", () => {
  it("is undefined when both empty", () => {
    expect(rangeLabelOf("", "")).toBeUndefined();
  });
  it("formats full interval", () => {
    expect(rangeLabelOf("2026-05-01", "2026-06-30")).toBe(
      "01/05/2026 a 30/06/2026"
    );
  });
  it("formats open-ended bounds", () => {
    expect(rangeLabelOf("2026-05-01", "")).toBe("a partir de 01/05/2026");
    expect(rangeLabelOf("", "2026-06-30")).toBe("até 30/06/2026");
  });
});

describe("presetRange", () => {
  const ref = new Date(2026, 5, 11); // 11/06/2026 (month is 0-indexed)

  it("computes the last 30 days inclusive of today", () => {
    const { from, to } = presetRange("last30", ref);
    expect(to).toBe("2026-06-11");
    expect(from).toBe("2026-05-13"); // 11 Jun minus 29 days
  });

  it("computes the last 90 days inclusive of today", () => {
    const { from, to } = presetRange("last90", ref);
    expect(to).toBe("2026-06-11");
    expect(from).toBe("2026-03-14"); // 11 Jun minus 89 days
  });

  it("computes the current year from Jan 1st to today", () => {
    const { from, to } = presetRange("currentYear", ref);
    expect(from).toBe("2026-01-01");
    expect(to).toBe("2026-06-11");
  });

  it("pads single-digit month and day", () => {
    const { from, to } = presetRange("currentYear", new Date(2026, 0, 5));
    expect(from).toBe("2026-01-01");
    expect(to).toBe("2026-01-05");
  });
});
