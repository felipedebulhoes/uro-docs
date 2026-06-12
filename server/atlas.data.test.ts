import { describe, it, expect } from "vitest";
import {
  atlasEntries,
  atlasCategories,
  atlasCategoryOrder,
  atlasToProcedure,
  getAtlasEntry,
  atlasGroupedByCategory,
} from "../client/src/data/atlasData";
import { procedures } from "../client/src/data/procedures";

describe("Atlas data integrity", () => {
  it("has the expected number of entries", () => {
    expect(atlasEntries.length).toBe(34);
  });

  it("every entry has required, non-empty fields", () => {
    for (const e of atlasEntries) {
      expect(e.id, `id of ${e.name}`).toMatch(/^[a-z0-9-]+$/);
      expect(e.name.length, `name of ${e.id}`).toBeGreaterThan(3);
      expect(e.category.length, `category of ${e.id}`).toBeGreaterThan(0);
      expect(e.icon.length, `icon of ${e.id}`).toBeGreaterThan(0);
      expect(e.evidence.length, `evidence of ${e.id}`).toBeGreaterThan(0);
      expect(e.sections.length, `sections of ${e.id}`).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => {
    const ids = atlasEntries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry contains a references section", () => {
    for (const e of atlasEntries) {
      const hasRefs = e.sections.some((s) =>
        s.title.toLowerCase().includes("refer")
      );
      expect(hasRefs, `${e.id} should have a references section`).toBe(true);
    }
  });

  it("every section has a title and a body", () => {
    for (const e of atlasEntries) {
      for (const s of e.sections) {
        expect(s.title.length, `section title of ${e.id}`).toBeGreaterThan(0);
        expect(s.body.length, `section body of ${e.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("every figure has a caption and search terms", () => {
    for (const e of atlasEntries) {
      for (const f of e.figures) {
        expect(f.caption.length, `figure caption of ${e.id}`).toBeGreaterThan(2);
        expect(
          f.searchTerms.length,
          `figure searchTerms of ${e.id}`
        ).toBeGreaterThan(2);
      }
    }
  });

  it("figure captions are not raw prose fragments", () => {
    const bad = /^(deve|a figura|para |sugere)/i;
    for (const e of atlasEntries) {
      for (const f of e.figures) {
        expect(
          bad.test(f.caption),
          `figure caption looks like prose in ${e.id}: "${f.caption}"`
        ).toBe(false);
        // legendas devem começar com letra maiúscula
        expect(
          /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(f.caption),
          `figure caption should be capitalized in ${e.id}: "${f.caption}"`
        ).toBe(true);
      }
    }
  });
});

describe("Atlas helpers", () => {
  it("getAtlasEntry resolves a known id and returns undefined otherwise", () => {
    const first = atlasEntries[0];
    expect(getAtlasEntry(first.id)?.id).toBe(first.id);
    expect(getAtlasEntry("id-inexistente-xyz")).toBeUndefined();
  });

  it("atlasGroupedByCategory covers every entry exactly once", () => {
    const grouped = atlasGroupedByCategory();
    const flat = grouped.flatMap((g) => g.entries);
    expect(flat.length).toBe(atlasEntries.length);
    const ids = new Set(flat.map((e) => e.id));
    expect(ids.size).toBe(atlasEntries.length);
  });

  it("grouped categories are a subset of atlasCategories", () => {
    const grouped = atlasGroupedByCategory();
    for (const g of grouped) {
      expect(atlasCategories).toContain(g.category);
    }
  });

  it("atlasCategoryOrder contains no duplicates", () => {
    expect(new Set(atlasCategoryOrder).size).toBe(atlasCategoryOrder.length);
  });

  it("entries within a group are sorted alphabetically (pt-BR)", () => {
    for (const g of atlasGroupedByCategory()) {
      const names = g.entries.map((e) => e.name);
      const sorted = [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
      expect(names).toEqual(sorted);
    }
  });

  it("atlasToProcedure maps to existing atlas ids and existing procedures", () => {
    const procIds = new Set(procedures.map((p) => p.id));
    const atlasIds = new Set(atlasEntries.map((e) => e.id));
    for (const [atlasId, procId] of Object.entries(atlasToProcedure)) {
      expect(atlasIds.has(atlasId), `atlas id exists: ${atlasId}`).toBe(true);
      expect(procIds.has(procId), `procedure id exists: ${procId}`).toBe(true);
    }
  });
});
