import { describe, it, expect } from "vitest";
import {
  curvaFluxoPeniano,
  classificarDopplerEscrotal,
} from "./proceduresExtra";
import { atlasEntries, getAtlasEntry, atlasToProcedure } from "./atlasData";
import { procedures } from "./procedures";

describe("curvaFluxoPeniano", () => {
  it("retorna indisponibilidade quando nenhum tempo é informado", () => {
    const r = curvaFluxoPeniano("", "", "", "", "");
    expect(r).toMatch(/indispon[íi]vel/i);
  });

  it("identifica o PSV máximo e o tempo até o pico", () => {
    const r = curvaFluxoPeniano("22", "30", "36", "38", "37");
    expect(r).toMatch(/PSV M[ÁA]XIMO = 38 cm\/s/i);
    expect(r).toMatch(/aos 20 min/i);
  });

  it("acrescenta nota de pico tardio quando o pico ocorre em >= 20 min", () => {
    const r = curvaFluxoPeniano("20", "24", "28", "40");
    expect(r).toMatch(/aos 20 min/i);
    expect(r).toMatch(/pico tardio/i);
  });

  it("não acrescenta nota de pico tardio quando o pico é precoce", () => {
    const r = curvaFluxoPeniano("40", "30", "20");
    expect(r).toMatch(/aos 5 min/i);
    expect(r).not.toMatch(/pico tardio/i);
  });

  it("lista os tempos não medidos como '— (não medido)'", () => {
    const r = curvaFluxoPeniano("", "30", "", "", "");
    expect(r).toMatch(/5 min: — \(não medido\)/);
    expect(r).toMatch(/10 min: 30 cm\/s/);
  });

  it("aceita vírgula decimal", () => {
    const r = curvaFluxoPeniano("22,5", "35,8", "", "", "");
    expect(r).toMatch(/PSV M[ÁA]XIMO = 35\.8 cm\/s/);
  });
});

describe("classificarDopplerEscrotal", () => {
  it("torção sem fluxo é emergência cirúrgica", () => {
    const r = classificarDopplerEscrotal("Torção do cordão espermático", {
      fluxo: "Ausência/redução do fluxo intratesticular",
    });
    expect(r).toMatch(/TOR[ÇC][ÃA]O DO CORD[ÃA]O/i);
    expect(r).toMatch(/EMERG[ÊE]NCIA/i);
  });

  it("torção com fluxo presente alerta para torção intermitente", () => {
    const r = classificarDopplerEscrotal("Torção do cordão espermático", {
      fluxo: "Fluxo intratesticular presente e simétrico",
    });
    expect(r).toMatch(/intermitente|parcial/i);
    expect(r).toMatch(/n[ãa]o deve ser postergada/i);
  });

  it("varícocele inclui o grau informado", () => {
    const r = classificarDopplerEscrotal("Varícocele", { grauVaricocele: "III" });
    expect(r).toMatch(/VAR[ÍI]COCELE/i);
    expect(r).toMatch(/grau III/i);
  });

  it("microlitíase clássica é diferenciada de limitada", () => {
    const classica = classificarDopplerEscrotal("Microlitíase testicular", {
      microlitiase: "Clássica (≥ 5 focos)",
    });
    const limitada = classificarDopplerEscrotal("Microlitíase testicular", {
      microlitiase: "Limitada (< 5 focos)",
    });
    expect(classica).toMatch(/CL[ÁA]SSICA/i);
    expect(limitada).toMatch(/LIMITADA/i);
  });

  it("massa sólida sugere investigação oncológica com marcadores", () => {
    const r = classificarDopplerEscrotal("Massa testicular sólida");
    expect(r).toMatch(/marcadores tumorais/i);
    expect(r).toMatch(/oncol[óo]gica/i);
  });

  it("normal descreve testículos tópicos e sem sinais de torção", () => {
    const r = classificarDopplerEscrotal("Normal");
    expect(r).toMatch(/homog[êe]nea/i);
    expect(r).toMatch(/sem sinais de tor[çc][ãa]o/i);
  });

  it("achado desconhecido pede seleção do achado principal", () => {
    const r = classificarDopplerEscrotal(undefined);
    expect(r).toMatch(/Selecione o achado/i);
  });
});

describe("Novas entradas do Atlas (Lote OA 6)", () => {
  it("dossiê USG escrotal existe e está na categoria Andrologia / Imagem", () => {
    const e = getAtlasEntry("usg-escrotal-doppler-testicular");
    expect(e).toBeDefined();
    expect(e!.category).toBe("Andrologia / Imagem");
    expect(e!.figures.length).toBe(7); // atualizado: +3 imagens (volumetria PMC13281861, varicocele Wikimedia CC BY 3.0, hidrocele CC0, massa paratesticular PMC13283463)
  });

  it("USG peniano tem 7 figuras (incluindo priapismo isquêmico)", () => {
    const e = getAtlasEntry("usg-doppler-peniano");
    expect(e).toBeDefined();
    expect(e!.figures.length).toBe(7);
    expect(e!.figures[6].caption).toMatch(/priapismo isqu[êe]mico/i);
  });

  it("USG escrotal tem procedimento correspondente no catálogo", () => {
    expect(atlasToProcedure["usg-escrotal-doppler-testicular"]).toBe(
      "usg-escrotal-doppler-testicular"
    );
    const p = procedures.find((p) => p.id === "usg-escrotal-doppler-testicular");
    expect(p).toBeDefined();
    expect(p!.templates.descricao({ achado: "Normal", fluxo: "Não avaliado" })).toMatch(
      /ULTRASSONOGRAFIA ESCROTAL/i
    );
  });
});
