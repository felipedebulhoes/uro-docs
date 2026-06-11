import { describe, it, expect, beforeEach } from "vitest";
import { renderPanelPng, exportPanelPng } from "./exportPanelImage";
import { summarizeHistory, type StatRecord } from "./historyStats";

// renderPanelPng draws on a Canvas. The default vitest environment here is
// "node", so we mock a minimal canvas 2d context that records nothing but
// satisfies the drawing calls, plus the anchor used for the download.

function installCanvasMock(): void {
  const ctx = {
    scale: () => {},
    fillRect: () => {},
    fillText: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arcTo: () => {},
    arc: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {},
    measureText: (s: string) => ({ width: s.length * 6 }),
    set fillStyle(_v: string) {},
    set strokeStyle(_v: string) {},
    set lineWidth(_v: number) {},
    set lineJoin(_v: string) {},
    set font(_v: string) {},
    set textAlign(_v: string) {},
    set textBaseline(_v: string) {},
  };
  (globalThis as any).document = {
    createElement: (tag: string) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => ctx,
          toDataURL: () => "data:image/png;base64,AAAA",
        };
      }
      return { href: "", download: "", click: () => {} };
    },
    body: { appendChild: () => {}, removeChild: () => {} },
  };
}

const RECORDS: StatRecord[] = [
  { procedureId: "holep", procedureName: "HoLEP", date: "2026-01-10" },
  { procedureId: "holep", procedureName: "HoLEP", date: "2026-02-14" },
  { procedureId: "rezum", procedureName: "Rezūm", date: "2026-03-05" },
  { procedureId: "rtu-p", procedureName: "RTU de Próstata", date: "2026-03-20" },
];

describe("renderPanelPng", () => {
  beforeEach(() => {
    installCanvasMock();
  });

  it("returns a PNG data URL for a populated summary", () => {
    const summary = summarizeHistory(RECORDS);
    const dataUrl = renderPanelPng(summary, {
      subtitle: "Período: 2026",
      summaryText: "4 cirurgias registradas em 3 meses.",
      monthlyGoalText: "1 de 4 cirurgias neste mês · 25%",
      annualGoalText: "4 de 60 cirurgias no ano · 7%",
      alertText: "Ritmo abaixo do esperado para a meta anual.",
      scale: 1,
    });
    expect(dataUrl).toMatch(/^data:image\/png/);
  });

  it("works without optional goal/alert text", () => {
    const summary = summarizeHistory(RECORDS);
    const dataUrl = renderPanelPng(summary, { scale: 1 });
    expect(dataUrl).toMatch(/^data:image\/png/);
  });

  it("returns null when the 2d context is unavailable", () => {
    (globalThis as any).document = {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => null,
        toDataURL: () => "",
      }),
    };
    const summary = summarizeHistory(RECORDS);
    expect(renderPanelPng(summary, { scale: 1 })).toBeNull();
  });

  it("exportPanelPng triggers a download without throwing", () => {
    const summary = summarizeHistory(RECORDS);
    expect(() =>
      exportPanelPng(summary, { fileName: "painel-teste", scale: 1 }),
    ).not.toThrow();
  });
});
