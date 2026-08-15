import { describe, expect, it } from "vitest";
import type { Procedure } from "@/data/procedures";
import { procedureHasCalculator, searchCatalog } from "./catalogSearch";

const templates = {
  descricao: () => "",
  posOperatorio: () => "",
  receitaAlta: () => "",
  orientacoes: () => "",
};

const fixtures: Procedure[] = [
  {
    id: "hpb-clinico",
    name: "HPB — Tratamento Clínico",
    shortName: "HPB Clínico",
    icon: "💊",
    category: "Próstata",
    configFields: [
      { id: "ipss", label: "Escore IPSS", type: "calculated", defaultValue: "" },
    ],
    templates,
  },
  {
    id: "usg-renal",
    name: "Ultrassonografia Renal",
    shortName: "USG Renal",
    icon: "🫘",
    category: "Imagem",
    configFields: [
      { id: "hidronefrose", label: "Hidronefrose", type: "select", defaultValue: "Não", options: ["Não", "Sim"] },
    ],
    templates,
  },
];

describe("catalogSearch", () => {
  it("reconhece procedimentos que possuem campos calculados", () => {
    expect(procedureHasCalculator(fixtures[0])).toBe(true);
    expect(procedureHasCalculator(fixtures[1])).toBe(false);
  });

  it("busca por nome, abreviação, categoria e rótulo de campo sem diferenciar acentos", () => {
    expect(searchCatalog(fixtures, { query: "clinico", category: null, calculatorsOnly: false })).toEqual([fixtures[0]]);
    expect(searchCatalog(fixtures, { query: "imagem", category: null, calculatorsOnly: false })).toEqual([fixtures[1]]);
    expect(searchCatalog(fixtures, { query: "hidronefrose", category: null, calculatorsOnly: false })).toEqual([fixtures[1]]);
  });

  it("permite localizar e filtrar somente calculadoras", () => {
    expect(searchCatalog(fixtures, { query: "calculadora", category: null, calculatorsOnly: false })).toEqual([fixtures[0]]);
    expect(searchCatalog(fixtures, { query: "", category: null, calculatorsOnly: true })).toEqual([fixtures[0]]);
  });
});
