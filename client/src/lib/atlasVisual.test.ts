import { describe, expect, it } from "vitest";
import type { AtlasEntry } from "@/data/atlasData";
import {
  getAtlasEvidenceLevel,
  getAtlasSubspecialty,
  entryMatchesVisualFilter,
  getFollowUpTimeline,
  getAtlasUrgencyAlert,
  visualFiltersForEntry,
} from "./atlasVisual";

const entry: AtlasEntry = {
  id: "fixture",
  name: "Procedimento teste",
  category: "Endourologia",
  icon: "🔬",
  evidence: "Teste",
  sections: [],
  figures: [
    {
      caption: "Acesso laparoscópico",
      searchTerms: "laparoscopic surgical access technique",
    },
    {
      caption: "Cistograma de extravasamento",
      searchTerms: "postoperative cystogram leak extravasation",
    },
  ],
};

describe("atlasVisual", () => {
  it("identifica entradas por tipo de conteúdo visual", () => {
    expect(entryMatchesVisualFilter(entry, "technique")).toBe(true);
    expect(entryMatchesVisualFilter(entry, "complication")).toBe(true);
    expect(entryMatchesVisualFilter(entry, "diagnostic")).toBe(true);
  });

  it("retorna os filtros visuais presentes na entrada", () => {
    expect(visualFiltersForEntry(entry)).toEqual([
      "technique",
      "complication",
      "diagnostic",
    ]);
  });

  it("expõe alertas de urgência apenas para entradas configuradas", () => {
    expect(getAtlasUrgencyAlert("priapismo-isquemico")?.title).toContain("Urgência");
    expect(getAtlasUrgencyAlert("procedimento-inexistente")).toBeUndefined();
  });

  it("classifica especialidade e evidência para filtros avançados", () => {
    expect(getAtlasSubspecialty(entry)).toBe("endourology");
    expect(getAtlasEvidenceLevel({ ...entry, evidence: "Diretriz EAU 2026" })).toBe("guideline");
    expect(getAtlasEvidenceLevel({ ...entry, evidence: "Revisão sistemática e meta-análise" })).toBe("high");
  });

  it("fornece linhas do tempo somente para entradas configuradas", () => {
    expect(getFollowUpTimeline("holep")).toHaveLength(3);
    expect(getFollowUpTimeline("procedimento-inexistente")).toEqual([]);
  });
});
