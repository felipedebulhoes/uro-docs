import { describe, it, expect } from "vitest";
import { buildStatsHtml } from "@/lib/exportStats";
import type { StatRecord } from "@/lib/historyStats";

const records: StatRecord[] = [
  { procedureId: "implante-testosterona", procedureName: "Implante Subcutâneo de Testosterona (Pellets)", date: "2026-06-11" },
];

describe("buildStatsHtml — banner de ritmo mensal", () => {
  it("não renderiza o banner quando não há texto de alerta mensal", () => {
    const html = buildStatsHtml(records, {});
    expect(html).not.toContain('<div class="pace-banner');
    expect(html).not.toContain("Ritmo da meta mensal");
  });

  it("renderiza o banner âmbar (behind) quando o ritmo está abaixo", () => {
    const html = buildStatsHtml(records, {
      monthlyAlertText: "Ritmo abaixo do esperado para a meta mensal: 1 de 4 previstos até o dia 12/30 (3 abaixo).",
      monthlyAlertStatus: "behind",
    });
    expect(html).toContain('<div class="pace-banner behind"');
    expect(html).toContain("Ritmo da meta mensal");
    expect(html).toContain("3 abaixo");
    // O ícone de alerta (⚠) deve estar presente no estado behind.
    expect(html).toContain("\u26A0");
    expect(html).not.toContain('<div class="pace-banner ok"');
  });

  it("renderiza o banner verde (ok) quando o ritmo está atingido/à frente", () => {
    const html = buildStatsHtml(records, {
      monthlyAlertText: "No ritmo esperado para a meta mensal: 1/2 (50%) até o dia 12/30.",
      monthlyAlertStatus: "on",
    });
    expect(html).toContain('<div class="pace-banner ok"');
    expect(html).toContain("Ritmo da meta mensal");
    // O ícone de check (✔) deve estar presente no estado ok.
    expect(html).toContain("\u2714");
    expect(html).not.toContain('<div class="pace-banner behind"');
  });

  it("o banner mensal aparece antes do bloco de Metas no documento", () => {
    const html = buildStatsHtml(records, {
      monthlyAlertText: "Ritmo abaixo do esperado para a meta mensal: 1 de 4 previstos.",
      monthlyAlertStatus: "behind",
      goalText: "Meta mensal: 1/10. Meta anual: 1/50.",
    });
    const bannerIdx = html.indexOf('<div class="pace-banner');
    const goalIdx = html.indexOf('class="goal"');
    expect(bannerIdx).toBeGreaterThan(-1);
    expect(goalIdx).toBeGreaterThan(-1);
    expect(bannerIdx).toBeLessThan(goalIdx);
  });
});
