import { describe, expect, it } from "vitest";
import { aestheticComparison, getAestheticAftercare } from "./aestheticGuidance";

describe("orientação estética visual", () => {
  it("oferece linha pós-operatória para todas as entradas de estética genital", () => {
    const ids = [
      "alongamento-peniano-seccao-do-ligamento-suspensor-ligamentol",
      "faloplastia-de-aumento-espessamento-peniano-com-enxerto-derm",
      "aumento-peniano-com-preenchimento-de-acido-hialuronico",
      "aumento-de-glande-com-acido-hialuronico",
      "lipoaspiracao-suprapubica-e-correcao-de-penis-enterrado-no-a",
      "escrotoplastia-scrotal-lift-lifting-escrotal-estetico",
      "circuncisao-estetica-revisao-de-circuncisao",
    ];

    ids.forEach((id) => expect(getAestheticAftercare(id)).not.toBeNull());
  });

  it("distingue indicações estéticas e reconstrutivas", () => {
    expect(aestheticComparison.map((item) => item.title)).toEqual(["Estética", "Reconstrutiva"]);
  });
});
