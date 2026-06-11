import { describe, it, expect } from "vitest";
import {
  sameConfig,
  surgeryDiverges,
  presetDiverges,
  detectSurgeryConflicts,
  detectPresetConflicts,
  mergeFavorites,
  type SurgeryLike,
  type PresetLike,
} from "./syncLogic";

function surgery(overrides: Partial<SurgeryLike> = {}): SurgeryLike {
  return {
    id: "s1",
    procedureId: "rtu-prostata",
    procedureName: "RTU-P",
    patientName: "João",
    date: "2026-06-10",
    config: { lateralidade: "Direita" },
    createdAt: "2026-06-10T10:00:00.000Z",
    ...overrides,
  };
}

function preset(overrides: Partial<PresetLike> = {}): PresetLike {
  return {
    id: "p1",
    name: "Hospital A",
    defaults: { convenio: "SUS" },
    createdAt: "2026-06-10T10:00:00.000Z",
    ...overrides,
  };
}

describe("sameConfig", () => {
  it("treats key order as irrelevant", () => {
    expect(sameConfig({ a: "1", b: "2" }, { b: "2", a: "1" })).toBe(true);
  });

  it("detects different values", () => {
    expect(sameConfig({ a: "1" }, { a: "2" })).toBe(false);
  });

  it("detects different key sets", () => {
    expect(sameConfig({ a: "1" }, { a: "1", b: "2" })).toBe(false);
  });

  it("handles empty/undefined maps", () => {
    expect(sameConfig({}, {})).toBe(true);
    expect(sameConfig(undefined as any, {})).toBe(true);
  });
});

describe("surgeryDiverges", () => {
  it("returns false for identical records", () => {
    expect(surgeryDiverges(surgery(), surgery())).toBe(false);
  });

  it("detects a different patient name", () => {
    expect(surgeryDiverges(surgery(), surgery({ patientName: "Maria" }))).toBe(
      true
    );
  });

  it("detects a different config", () => {
    expect(
      surgeryDiverges(surgery(), surgery({ config: { lateralidade: "Esquerda" } }))
    ).toBe(true);
  });
});

describe("presetDiverges", () => {
  it("returns false for identical presets", () => {
    expect(presetDiverges(preset(), preset())).toBe(false);
  });

  it("detects a different name", () => {
    expect(presetDiverges(preset(), preset({ name: "Hospital B" }))).toBe(true);
  });

  it("detects different defaults", () => {
    expect(
      presetDiverges(preset(), preset({ defaults: { convenio: "Unimed" } }))
    ).toBe(true);
  });
});

describe("detectSurgeryConflicts", () => {
  it("appends cloud-only records as new (no conflict)", () => {
    const local = [surgery({ id: "s1" })];
    const cloud = [surgery({ id: "s2", patientName: "Ana" })];
    const { newRecords, conflicts } = detectSurgeryConflicts(local, cloud);
    expect(newRecords).toHaveLength(1);
    expect(newRecords[0].id).toBe("s2");
    expect(conflicts).toHaveLength(0);
  });

  it("does not flag identical records sharing an id", () => {
    const local = [surgery({ id: "s1" })];
    const cloud = [surgery({ id: "s1" })];
    const { newRecords, conflicts } = detectSurgeryConflicts(local, cloud);
    expect(newRecords).toHaveLength(0);
    expect(conflicts).toHaveLength(0);
  });

  it("flags divergent records sharing an id as a conflict", () => {
    const local = [surgery({ id: "s1", patientName: "João" })];
    const cloud = [surgery({ id: "s1", patientName: "Maria" })];
    const { newRecords, conflicts } = detectSurgeryConflicts(local, cloud);
    expect(newRecords).toHaveLength(0);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].kind).toBe("surgery");
    expect(conflicts[0].localId).toBe("s1");
    expect(conflicts[0].localSummary).toContain("João");
    expect(conflicts[0].cloudSummary).toContain("Maria");
  });
});

describe("detectPresetConflicts", () => {
  it("appends cloud-only presets as new", () => {
    const { newRecords, conflicts } = detectPresetConflicts(
      [preset({ id: "p1" })],
      [preset({ id: "p2", name: "Hospital B" })]
    );
    expect(newRecords).toHaveLength(1);
    expect(conflicts).toHaveLength(0);
  });

  it("flags divergent presets as a conflict", () => {
    const { conflicts } = detectPresetConflicts(
      [preset({ id: "p1", defaults: { convenio: "SUS" } })],
      [preset({ id: "p1", defaults: { convenio: "Unimed" } })]
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].kind).toBe("preset");
  });
});

describe("mergeFavorites", () => {
  it("unions without duplicates and preserves first-seen order", () => {
    expect(mergeFavorites(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("handles empty inputs", () => {
    expect(mergeFavorites([], ["x"])).toEqual(["x"]);
    expect(mergeFavorites(["x"], [])).toEqual(["x"]);
  });
});
