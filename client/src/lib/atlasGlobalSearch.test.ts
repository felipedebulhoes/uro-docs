import { describe, expect, it } from "vitest";
import { atlasEntries } from "@/data/atlasData";
import { filterAtlasGlobalResults, searchAtlasGlobally } from "./atlasGlobalSearch";

describe("atlasGlobalSearch", () => {
  it("encontra um procedimento mesmo quando a busca ignora acentos", () => {
    const results = searchAtlasGlobally(atlasEntries, "cancer prostata");
    expect(results.some((result) => result.entryId === "investigacao-cancer-prostata")).toBe(true);
  });

  it("prioriza a seção de complicações quando há busca por evento adverso", () => {
    const results = searchAtlasGlobally(atlasEntries, "sangramento");
    expect(results.some((result) => result.kind === "complication")).toBe(true);
  });

  it("expõe procedimentos de partida quando a consulta está vazia", () => {
    const results = searchAtlasGlobally(atlasEntries, "", 6);
    expect(results).toHaveLength(6);
    expect(results.every((result) => result.kind === "procedure")).toBe(true);
  });

  it("filtra os resultados pelo tipo de conteúdo solicitado", () => {
    const results = searchAtlasGlobally(atlasEntries, "sangramento");
    const complications = filterAtlasGlobalResults(results, "complication");
    expect(complications.length).toBeGreaterThan(0);
    expect(complications.every((result) => result.kind === "complication")).toBe(true);
  });
});
