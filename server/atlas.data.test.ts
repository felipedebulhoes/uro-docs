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
    expect(atlasEntries.length).toBe(59);
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

  it("nenhuma figura tem imageUrl inválido (evita links quebrados)", () => {
    const valido = /^(https?:\/\/|\/manus-storage\/|\/)/;
    for (const e of atlasEntries) {
      for (const f of e.figures) {
        if (f.imageUrl !== undefined && f.imageUrl !== "") {
          expect(
            valido.test(f.imageUrl),
            `imageUrl inválido em ${e.id}: "${f.imageUrl}"`
          ).toBe(true);
        }
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

describe("Cobertura cruzada catálogo <-> Atlas", () => {
  const procToAtlas = (() => {
    const m = new Map<string, string>();
    for (const [atlasId, procId] of Object.entries(atlasToProcedure)) {
      if (!m.has(procId)) m.set(procId, atlasId);
    }
    return m;
  })();

  it("todo procedimento do catálogo tem ao menos uma entrada correspondente no Atlas", () => {
    const semAtlas = procedures.filter((p) => !procToAtlas.has(p.id)).map((p) => p.id);
    expect(semAtlas, `procedimentos sem entrada no Atlas: ${semAtlas.join(", ")}`).toEqual([]);
  });

  it("toda entrada do Atlas aponta para um procedimento existente no catálogo", () => {
    const procIds = new Set(procedures.map((p) => p.id));
    const semProc = atlasEntries
      .filter((e) => {
        const pid = atlasToProcedure[e.id];
        return !pid || !procIds.has(pid);
      })
      .map((e) => e.id);
    expect(semProc, `entradas do Atlas sem procedimento no catálogo: ${semProc.join(", ")}`).toEqual([]);
  });

  it("catálogo e Atlas têm contagens esperadas", () => {
    expect(procedures.length).toBe(57);
    expect(atlasEntries.length).toBe(59);
  });

  it("o link reverso (catálogo->Atlas) resolve para uma entrada existente em todos os procedimentos", () => {
    const atlasIds = new Set(atlasEntries.map((e) => e.id));
    for (const p of procedures) {
      const atlasId = Object.keys(atlasToProcedure).find(
        (k) => atlasToProcedure[k] === p.id
      );
      expect(atlasId, `procedimento ${p.id} deve ter entrada no Atlas`).toBeDefined();
      expect(
        atlasIds.has(atlasId as string),
        `link reverso de ${p.id} aponta para Atlas inexistente: ${atlasId}`
      ).toBe(true);
    }
  });
});
