import { describe, it, expect } from "vitest";
import {
  calcExpulsaoProbabilidade,
  calcExpulsao,
  calcIpssScore,
  calcIpss,
  calcLitiaseRisco,
  calcRiscoLitiase,
  calcIndicacaoCirurgicaHPB,
} from "./calculators";

describe("calcExpulsaoProbabilidade", () => {
  it("matches the published matrix for a small distal stone (best prognosis)", () => {
    const r = calcExpulsaoProbabilidade(3, "terço distal (JUV)");
    expect(r.probability).toBe(87);
    expect(r.locKey).toBe("distal");
    expect(r.color).toBe("green");
  });

  it("matches the matrix for a large proximal stone (worst prognosis)", () => {
    const r = calcExpulsaoProbabilidade(15, "terço proximal");
    expect(r.probability).toBe(10);
    expect(r.locKey).toBe("proximal");
    expect(r.color).toBe("red");
    expect(r.riskLabel).toBe("MUITO BAIXA");
  });

  it("falls back to the médio column when location is ambiguous", () => {
    const r = calcExpulsaoProbabilidade(5, "terço médio");
    expect(r.locKey).toBe("medio");
    expect(r.probability).toBe(60);
  });

  it("treats non-finite/blank size as 0mm (best band)", () => {
    const r = calcExpulsaoProbabilidade(NaN, "terço distal (JUV)");
    expect(r.probability).toBe(87);
  });

  it("is the single source used by calcExpulsao()'s CalcOutput", () => {
    const out = calcExpulsao({
      tamanho: "6",
      localizacao: "terço distal (JUV)",
    });
    const direct = calcExpulsaoProbabilidade(6, "terço distal (JUV)");
    expect(out.probability).toBe(direct.probability);
    expect(out.probLabel).toBe(`~${direct.probability}%`);
    expect(out.color).toBe(direct.color);
  });

  it("size-band boundaries are inclusive on the upper edge (regression: descricao/orientacoes drift)", () => {
    // 4mm and 10mm previously diverged between the calculator panel and the
    // patient-facing "orientações" template (two different hand-written
    // matrices). This pins the canonical values so a future edit can't
    // silently reintroduce that drift.
    expect(calcExpulsaoProbabilidade(4, "terço distal (JUV)").probability).toBe(
      87
    );
    expect(
      calcExpulsaoProbabilidade(4.1, "terço distal (JUV)").probability
    ).toBe(74);
    expect(calcExpulsaoProbabilidade(10, "terço proximal").probability).toBe(
      22
    );
    expect(calcExpulsaoProbabilidade(10.1, "terço proximal").probability).toBe(
      10
    );
  });
});

describe("calcIpssScore", () => {
  const blank = {
    ipss_q1: "0 — Nunca",
    ipss_q2: "0 — Nunca",
    ipss_q3: "0 — Nunca",
    ipss_q4: "0 — Nunca",
    ipss_q5: "0 — Nunca",
    ipss_q6: "0 — Nunca",
    ipss_q7: "0 — Nenhuma vez",
    ipss_qol: "3 — Indiferente",
  };

  it("sums all 7 questions and classifies as Leve at the 0-7 boundary", () => {
    const s = calcIpssScore({
      ...blank,
      ipss_q1: "5 — Quase sempre",
      ipss_q2: "2 — 2 vezes",
    });
    expect(s.total).toBe(7);
    expect(s.severity).toBe("Leve");
    expect(s.color).toBe("green");
  });

  it("classifies 8 as Moderado (just above the Leve boundary)", () => {
    const s = calcIpssScore({
      ...blank,
      ipss_q1: "5 — Quase sempre",
      ipss_q2: "3 — 3 vezes",
    });
    expect(s.total).toBe(8);
    expect(s.severity).toBe("Moderado");
  });

  it("classifies 20 as Grave (just above the Moderado boundary)", () => {
    const s = calcIpssScore({
      ...blank,
      ipss_q1: "5 — Quase sempre",
      ipss_q2: "5 — Quase sempre",
      ipss_q3: "5 — Quase sempre",
      ipss_q4: "5 — Quase sempre",
      ipss_q5: "0 — Nunca",
    });
    expect(s.total).toBe(20);
    expect(s.severity).toBe("Grave");
    expect(s.color).toBe("red");
  });

  it("splits obstrutivo (Q1+Q3+Q5+Q6) and irritativo (Q2+Q4+Q7) correctly", () => {
    const s = calcIpssScore({
      ipss_q1: "1 — < 1 em 5 vezes",
      ipss_q2: "2 — < metade das vezes",
      ipss_q3: "1 — < 1 em 5 vezes",
      ipss_q4: "2 — < metade das vezes",
      ipss_q5: "1 — < 1 em 5 vezes",
      ipss_q6: "1 — < 1 em 5 vezes",
      ipss_q7: "2 — 2 vezes",
      ipss_qol: "3 — Indiferente",
    });
    expect(s.obstrutivo).toBe(4); // q1+q3+q5+q6 = 1+1+1+1
    expect(s.irritativo).toBe(6); // q2+q4+q7 = 2+2+2
    expect(s.total).toBe(10);
  });

  it("defaults missing answers to 0 instead of throwing", () => {
    const s = calcIpssScore({});
    expect(s.total).toBe(0);
    expect(s.severity).toBe("Leve");
  });

  it("calcIpss() CalcOutput total/severity match calcIpssScore()", () => {
    const cfg = {
      ...blank,
      ipss_q1: "5 — Quase sempre",
      ipss_q2: "5 — Quase sempre",
    };
    const out = calcIpss(cfg);
    const score = calcIpssScore(cfg);
    expect(out.probLabel).toBe(`${score.total}/35`);
    expect(out.color).toBe(score.color);
  });
});

describe("calcLitiaseRisco / calcRiscoLitiase", () => {
  it("scores 0 with no risk factors informed → Baixo", () => {
    const r = calcLitiaseRisco({});
    expect(r.score).toBe(0);
    expect(r.risk).toBe("Baixo");
    expect(r.color).toBe("green");
  });

  it("flags hipercalciúria, hiperoxalúria and hipocitratúria independently", () => {
    const r = calcLitiaseRisco({
      ca_urina24: "350",
      oxalato_urina24: "55",
      citrato_urina24: "200",
    });
    expect(r.score).toBe(6); // 2 + 2 + 2
    expect(r.risk).toBe("Alto");
    expect(r.riskFactors.length).toBe(3);
  });

  it("treats cistinúria as a high standalone score (genetic, very high recurrence)", () => {
    const r = calcLitiaseRisco({ composicao: "Cistina" });
    expect(r.score).toBe(4);
    expect(r.risk).toBe("Alto");
    expect(
      r.riskFactors.some(f => f.toLowerCase().includes("cistinúria"))
    ).toBe(true);
  });

  it("escalates to Muito Alto when hyperparathyroidism pattern is present (PTH + hypercalcemia)", () => {
    const r = calcLitiaseRisco({ ca_sangue: "11", pth: "90" });
    // hipercalcemia (2) + combinação PTH+hipercalcemia (3) = 5 -> Alto;
    // adicionar >=3 episódios empurra para Muito Alto.
    const r2 = calcLitiaseRisco({ ca_sangue: "11", pth: "90", episodios: "3" });
    expect(r.risk).toBe("Alto");
    expect(r2.risk).toBe("Muito Alto");
  });

  it("calcRiscoLitiase() always includes the non-validated-score disclaimer", () => {
    const out = calcRiscoLitiase({});
    expect(out.details.some(d => d.toLowerCase().includes("heurística"))).toBe(
      true
    );
  });
});

describe("calcIndicacaoCirurgicaHPB", () => {
  it("asks for prostate volume when none is informed", () => {
    const out = calcIndicacaoCirurgicaHPB({});
    expect(out.probability).toBe(0);
    expect(out.color).toBe("orange");
  });

  it("recommends HoLEP for large prostates (> 80 mL)", () => {
    const out = calcIndicacaoCirurgicaHPB({
      volume_prostatico: "90",
      ipss_pre: "22",
    });
    expect(out.probLabel).toContain("HoLEP");
    expect(out.color).toBe("green");
  });

  it("recommends RTU-P for mid-size prostates with moderate/severe IPSS", () => {
    const out = calcIndicacaoCirurgicaHPB({
      volume_prostatico: "50",
      ipss_pre: "15",
    });
    expect(out.probLabel).toContain("RTU-P");
  });

  it("prefers Rezūm/UroLift for mid-size prostates with mild IPSS", () => {
    const out = calcIndicacaoCirurgicaHPB({
      volume_prostatico: "50",
      ipss_pre: "5",
    });
    expect(out.probLabel.toLowerCase()).toMatch(/rezūm|urolift/);
  });

  it("suggests UroLift/Rezūm for small prostates (< 30 mL)", () => {
    const out = calcIndicacaoCirurgicaHPB({
      volume_prostatico: "20",
      ipss_pre: "10",
    });
    expect(out.probLabel.toLowerCase()).toMatch(/urolift|rezūm/);
  });

  it("flags significant obstruction (Qmáx < 10) even with mild IPSS", () => {
    const out = calcIndicacaoCirurgicaHPB({
      volume_prostatico: "50",
      ipss_pre: "5",
      qmax_pre: "7",
    });
    expect(out.probLabel).toContain("RTU-P");
  });
});
