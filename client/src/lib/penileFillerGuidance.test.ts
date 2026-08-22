import { describe, expect, it } from "vitest";
import {
  getPenileFillerGuidance,
  isPenileFillerEntry,
} from "./penileFillerGuidance";

describe("penileFillerGuidance", () => {
  it("diferencia de forma explícita o alvo da haste e o da glande", () => {
    expect(getPenileFillerGuidance("aumento-peniano-com-preenchimento-de-acido-hialuronico")?.target).toBe("shaft");
    expect(getPenileFillerGuidance("aumento-de-glande-com-acido-hialuronico")?.target).toBe("glans");
  });

  it("não classifica outras entradas de estética como preenchimento peniano", () => {
    expect(isPenileFillerEntry("ligamentolise-peniana")).toBe(false);
    expect(getPenileFillerGuidance("postectomia")).toBeNull();
  });
});
