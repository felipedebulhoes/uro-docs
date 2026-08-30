import type { AtlasGlobalResult } from "./atlasGlobalSearch";
import {
  appendRecentSearch,
  clearFavoriteResults,
  clearRecentSearches,
  parseStoredFavorites,
  parseStoredSearches,
  toggleFavoriteResult,
} from "./atlasSearchHistory";
import { describe, expect, it } from "vitest";

const result: AtlasGlobalResult = {
  key: "holep-section-4",
  entryId: "holep",
  entryName: "HoLEP",
  category: "Próstata",
  kind: "complication",
  sectionIndex: 4,
  sectionTitle: "Complicações e seu manejo",
  summary: "Sangramento e incontinência transitória.",
  score: 96,
};

describe("atlasSearchHistory", () => {
  it("mantém buscas recentes únicas e coloca a busca mais recente primeiro", () => {
    expect(appendRecentSearch(["HoLEP", "NLP"], "holep")).toEqual(["holep", "NLP"]);
  });

  it("ignora buscas muito curtas", () => {
    expect(appendRecentSearch(["HoLEP"], "a")).toEqual(["HoLEP"]);
  });

  it("recupera apenas buscas válidas do armazenamento", () => {
    expect(parseStoredSearches('["HoLEP", 7, "holep", "NLP"]')).toEqual(["HoLEP", "NLP"]);
    expect(parseStoredSearches("invalid")).toEqual([]);
  });

  it("adiciona e remove resultados favoritos", () => {
    const saved = toggleFavoriteResult([], result);
    expect(saved).toEqual([result]);
    expect(toggleFavoriteResult(saved, result)).toEqual([]);
  });

  it("descarta favoritos inválidos armazenados", () => {
    expect(parseStoredFavorites(JSON.stringify([result, { key: "bad" }]))).toEqual([result]);
  });

  it("limpa buscas recentes e favoritos", () => {
    expect(clearRecentSearches()).toEqual([]);
    expect(clearFavoriteResults()).toEqual([]);
  });
});
