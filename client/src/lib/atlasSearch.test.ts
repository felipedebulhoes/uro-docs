import { describe, it, expect } from "vitest";
import { extractDoi, capesArticleUrl, capesSearchUrl } from "./atlasSearch";

describe("extractDoi", () => {
  it("extrai DOI de URL doi.org", () => {
    expect(extractDoi("https://doi.org/10.1186/s12894-023-01214-9")).toBe(
      "10.1186/s12894-023-01214-9"
    );
  });

  it("extrai DOI de URL Springer/BMC", () => {
    expect(
      extractDoi("https://bmcurol.biomedcentral.com/articles/10.1186/s12894-023-01214-9")
    ).toBe("10.1186/s12894-023-01214-9");
  });

  it("extrai DOI de URL link.springer.com", () => {
    expect(
      extractDoi("https://link.springer.com/article/10.1186/s12301-024-00464-9")
    ).toBe("10.1186/s12301-024-00464-9");
  });

  it("retorna null para URL PMC sem DOI", () => {
    expect(extractDoi("https://pmc.ncbi.nlm.nih.gov/articles/PMC4550597/")).toBeNull();
  });

  it("retorna null para string vazia", () => {
    expect(extractDoi("")).toBeNull();
  });
});

describe("capesArticleUrl", () => {
  it("gera URL CAPES com sfx para DOI quando disponível", () => {
    const url = capesArticleUrl("https://doi.org/10.1186/s12894-023-01214-9");
    expect(url).toContain("ez24.periodicos.capes.gov.br");
    expect(url).toContain("sfx=");
    expect(url).toContain("10.1186");
  });

  it("gera URL CAPES com sfx para DOI de Springer", () => {
    const url = capesArticleUrl(
      "https://link.springer.com/article/10.1186/s12301-024-00464-9"
    );
    expect(url).toContain("ez24.periodicos.capes.gov.br");
    expect(url).toContain("sfx=");
  });

  it("retorna URL PMC diretamente quando não há DOI", () => {
    const pmcUrl = "https://pmc.ncbi.nlm.nih.gov/articles/PMC4550597/";
    const url = capesArticleUrl(pmcUrl);
    expect(url).toBe(pmcUrl);
  });

  it("usa fallback de busca por termos quando sourceUrl é null", () => {
    const url = capesArticleUrl(null, "penile girth enhancement hyaluronic acid");
    expect(url).toContain("periodicos.capes.gov.br");
    expect(url).toContain("penile");
  });

  it("usa URL base do CAPES quando não há sourceUrl nem fallback", () => {
    const url = capesArticleUrl(null);
    expect(url).toBe("https://www.periodicos.capes.gov.br/");
  });

  it("URL CAPES gerada contém doi.org codificado", () => {
    const url = capesArticleUrl("https://doi.org/10.5534/wjmh.2015.33.2.50");
    expect(url).toContain(encodeURIComponent("https://doi.org/10.5534/wjmh.2015.33.2.50"));
  });
});
