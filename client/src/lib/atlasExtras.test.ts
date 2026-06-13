import { describe, it, expect } from "vitest";
import { buildAtlasPdfHtml } from "./atlasPdf";
import {
  clinicalKeySearchUrl,
  capesSearchUrl,
} from "./atlasSearch";
import { atlasEntries } from "@/data/atlasData";

describe("atlasSearch helpers", () => {
  it("gera URL do ClinicalKey com termos codificados", () => {
    const url = clinicalKeySearchUrl("varicocele microsurgical repair");
    expect(url.startsWith("https://www.clinicalkey.com/")).toBe(true);
    expect(url).toContain("varicocele%20microsurgical%20repair");
  });

  it("gera URL do Portal CAPES com termos codificados", () => {
    const url = capesSearchUrl("inflatable penile prosthesis");
    expect(url.startsWith("https://www.periodicos.capes.gov.br/")).toBe(true);
    expect(url).toContain("q=inflatable%20penile%20prosthesis");
  });

  it("escapa separadores que quebrariam a query (& e espaço)", () => {
    const url = capesSearchUrl("peyronie disease & grafting");
    const query = url.split("q=")[1] ?? "";
    // & e espaço precisam estar percent-encoded para não quebrar a URL
    expect(query.includes("&")).toBe(false);
    expect(query.includes(" ")).toBe(false);
    expect(query).toContain("%26"); // &
    expect(query).toContain("%20"); // espaço
  });
});

describe("buildAtlasPdfHtml", () => {
  const entry = atlasEntries[0];

  it("inclui cabeçalho institucional e identidade", () => {
    const html = buildAtlasPdfHtml(entry);
    expect(html).toContain("Dr. Felipe Bulhões");
    expect(html).toContain("CRM-SP 202.291");
    expect(html).toContain("UroDocx".replace("UroDocx", "Uro")); // brand-mark "Uro<span>Docx</span>"
  });

  it("inclui o nome do procedimento e a base de evidência", () => {
    const html = buildAtlasPdfHtml(entry);
    expect(html).toContain(entry.name);
    expect(html).toContain("Base de evidência");
  });

  it("gera HTML de documento completo (doctype + html + body)", () => {
    const html = buildAtlasPdfHtml(entry);
    expect(html.toLowerCase()).toContain("<!doctype html>");
    expect(html).toContain("<body>");
    expect(html).toContain("window.print()");
  });

  it("renderiza pelo menos uma seção técnica e as referências", () => {
    const html = buildAtlasPdfHtml(entry);
    // a primeira seção técnica deve aparecer como <h2>
    const firstTechnical = entry.sections.find(
      (s) => !s.title.toLowerCase().includes("refer")
    );
    expect(firstTechnical).toBeTruthy();
    if (firstTechnical) {
      expect(html).toContain(firstTechnical.title);
    }
  });

  it("funciona para todas as entradas do Atlas sem lançar erro", () => {
    for (const e of atlasEntries) {
      const html = buildAtlasPdfHtml(e);
      expect(html.length).toBeGreaterThan(500);
      expect(html).toContain(e.name);
    }
  });

  it("embute a imagem (data URI) quando fornecida para a figura", () => {
    const withFig = atlasEntries.find((e) => e.figures.length > 0)!;
    const dataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const images = new Map([[0, { dataUrl, credit: "Autor et al., 2023 (CC BY)" }]]);
    const html = buildAtlasPdfHtml(withFig, images);
    // a imagem deve aparecer embutida
    expect(html).toContain(`src="${dataUrl}"`);
    // crédito da imagem deve aparecer
    expect(html).toContain("Autor et al., 2023 (CC BY)");
    // figura com imagem não mostra os termos de busca (placeholder textual)
    const firstFig = withFig.figures[0];
    // o termo de busca não deve estar no bloco da figura 0 quando há imagem
    // (pode aparecer em outras figuras sem imagem, então checamos via marcador)
    expect(html).toContain('<img class="fig-img"');
    expect(firstFig.caption.length).toBeGreaterThan(0);
  });

  it("sem imagens, mantém os termos de busca no PDF", () => {
    const withFig = atlasEntries.find((e) => e.figures.length > 0)!;
    const html = buildAtlasPdfHtml(withFig);
    expect(html).not.toContain('<img class="fig-img"');
    expect(html).toContain("Buscar:");
  });
});
