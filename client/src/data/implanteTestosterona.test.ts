import { describe, it, expect } from "vitest";
import { procedures } from "@/data/procedures";

const proc = procedures.find((p) => p.id === "implante-testosterona")!;

function buildConfig(overrides: Record<string, string> = {}) {
  const cfg: Record<string, string> = {};
  for (const f of proc.configFields) cfg[f.id] = f.defaultValue;
  return { ...cfg, ...overrides };
}

describe("Implante de Testosterona — dose total automática", () => {
  it("o procedimento existe e tem os campos de dose", () => {
    expect(proc).toBeTruthy();
    const ids = proc.configFields.map((f) => f.id);
    expect(ids).toContain("dose_pellet");
    expect(ids).toContain("num_pellets");
    // O campo manual dose_total foi removido (agora é calculado).
    expect(ids).not.toContain("dose_total");
  });

  it("calcula 4 x 75 mg = 300 mg na descrição", () => {
    const c = buildConfig({ dose_pellet: "75 mg (Testopel)", num_pellets: "4" });
    const out = proc.templates.descricao(c);
    expect(out).toContain("dose total 300 mg");
  });

  it("calcula 6 x 100 mg = 600 mg nas orientações", () => {
    const c = buildConfig({ dose_pellet: "100 mg", num_pellets: "6" });
    const out = proc.templates.orientacoes(c);
    expect(out).toContain("total 600 mg");
  });

  it("reflete o número de pellets escolhido na descrição", () => {
    const c = buildConfig({ num_pellets: "5" });
    const out = proc.templates.descricao(c);
    expect(out).toContain("5 pellets");
  });

  it("usa fallback 'a definir' quando os dados são inválidos", () => {
    const c = buildConfig({ dose_pellet: "", num_pellets: "" });
    const out = proc.templates.descricao(c);
    expect(out).toContain("a definir");
  });

  it("a receita reflete os pellets/dose escolhidos (5 x 75 mg = 375 mg)", () => {
    const c = buildConfig({ dose_pellet: "75 mg (Testopel)", num_pellets: "5" });
    const out = proc.templates.receitaAlta(c);
    expect(out).toContain("5 pellets");
    expect(out).toContain("dose total 375 mg");
  });

  it("a indicação (indicacao_trt) aparece preenchida e não vazia", () => {
    const c = buildConfig();
    const desc = proc.templates.descricao(c);
    const orient = proc.templates.orientacoes(c);
    expect(desc).toContain("hipogonadismo");
    expect(orient).toContain("hipogonadismo");
    // Não deve sobrar um "Indicação: ." vazio.
    expect(desc).not.toMatch(/Indica\u00e7\u00e3o:\s*$/m);
  });
});
