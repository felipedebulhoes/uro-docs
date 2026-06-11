import { describe, it, expect, beforeEach } from "vitest";

// Minimal in-memory localStorage polyfill (vitest runs in the "node" env).
class MemStorage {
  private store = new Map<string, string>();
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, String(v));
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}
(globalThis as any).localStorage = new MemStorage();

import {
  saveTemplate,
  getTemplatesForProcedure,
  reorderTemplates,
  toggleTemplateFavorite,
  getAllTemplates,
} from "./prescriptionTemplates";

beforeEach(() => {
  (globalThis as any).localStorage.clear();
});

describe("prescriptionTemplates store", () => {
  it("assigns increasing sortOrder to new templates of a procedure", () => {
    const a = saveTemplate({ procedureId: "rtu-p", name: "A", content: "a" });
    const b = saveTemplate({ procedureId: "rtu-p", name: "B", content: "b" });
    const c = saveTemplate({ procedureId: "rtu-p", name: "C", content: "c" });
    expect(a.sortOrder).toBe(0);
    expect(b.sortOrder).toBe(1);
    expect(c.sortOrder).toBe(2);
  });

  it("keeps sortOrder independent per procedure", () => {
    saveTemplate({ procedureId: "rtu-p", name: "A", content: "a" });
    const other = saveTemplate({ procedureId: "nlp", name: "X", content: "x" });
    expect(other.sortOrder).toBe(0);
  });

  it("returns templates ordered by sortOrder (favorites first)", () => {
    saveTemplate({ procedureId: "p", name: "A", content: "a" });
    saveTemplate({ procedureId: "p", name: "B", content: "b" });
    saveTemplate({ procedureId: "p", name: "C", content: "c" });
    const order = getTemplatesForProcedure("p").map((t) => t.name);
    expect(order).toEqual(["A", "B", "C"]);
  });

  it("reorders templates by moving an id to a new position", () => {
    const a = saveTemplate({ procedureId: "p", name: "A", content: "a" });
    const b = saveTemplate({ procedureId: "p", name: "B", content: "b" });
    const c = saveTemplate({ procedureId: "p", name: "C", content: "c" });
    // Desired new order: C, A, B
    reorderTemplates("p", [c.id, a.id, b.id]);
    const order = getTemplatesForProcedure("p").map((t) => t.name);
    expect(order).toEqual(["C", "A", "B"]);
  });

  it("does not affect other procedures when reordering", () => {
    const a = saveTemplate({ procedureId: "p", name: "A", content: "a" });
    const b = saveTemplate({ procedureId: "p", name: "B", content: "b" });
    const x = saveTemplate({ procedureId: "q", name: "X", content: "x" });
    reorderTemplates("p", [b.id, a.id]);
    expect(getTemplatesForProcedure("q").map((t) => t.id)).toEqual([x.id]);
  });

  it("pins favorites above the manual order", () => {
    const a = saveTemplate({ procedureId: "p", name: "A", content: "a" });
    const b = saveTemplate({ procedureId: "p", name: "B", content: "b" });
    saveTemplate({ procedureId: "p", name: "C", content: "c" });
    // Favorite the last one; it should jump to the top despite higher sortOrder.
    toggleTemplateFavorite(getTemplatesForProcedure("p").find((t) => t.name === "C")!.id);
    const order = getTemplatesForProcedure("p").map((t) => t.name);
    expect(order[0]).toBe("C");
    // A and B remain in their relative manual order after the favorite.
    expect(order.slice(1)).toEqual(["A", "B"]);
    void a;
    void b;
  });

  it("backfills sortOrder for legacy records missing the field", () => {
    // Simulate legacy data written before sortOrder existed.
    const legacy = [
      { id: "1", procedureId: "p", name: "A", content: "a", favorite: false, createdAt: "x", updatedAt: "x" },
      { id: "2", procedureId: "p", name: "B", content: "b", favorite: false, createdAt: "x", updatedAt: "x" },
    ];
    (globalThis as any).localStorage.setItem(
      "urodocx_prescription_templates",
      JSON.stringify(legacy)
    );
    const all = getAllTemplates();
    expect(all[0].sortOrder).toBe(0);
    expect(all[1].sortOrder).toBe(1);
  });
});
