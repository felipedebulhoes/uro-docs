// Lógica clínica das calculadoras interativas do Atlas/Catálogo de
// Procedimentos, extraída de proceduresExtra.ts para um único módulo
// testável e livre de duplicação.
//
// Motivação: antes desta extração, a probabilidade de expulsão espontânea
// de cálculo ureteral era calculada em TRÊS lugares com números diferentes
// (painel da calculadora, template de descrição e template de orientações
// ao paciente) — incluindo uma divergência real entre a matriz da
// calculadora e a do documento entregue ao paciente. Mantendo uma única
// fonte de verdade aqui, qualquer atualização de evidência se propaga para
// todos os documentos automaticamente.

export type CalcColor = "green" | "yellow" | "orange" | "red";

/** Mirrors data/procedures.ts `CalcResult`, duplicated locally to avoid a
 * dependency from this leaf module back into the data layer. */
export interface CalcOutput {
  probability: number;
  probLabel: string;
  timeEstimate: string;
  recommendation: string;
  color: CalcColor;
  details: string[];
}

// ─────────────────────────────────────────────────────────────────────────
// Terapia expulsiva — probabilidade de passagem espontânea de cálculo
// ureteral. Evidência: Hollingsworth JM et al. JAMA 2016;315(19):2104
// (revisão sistemática/meta-análise); EAU Guidelines on Urolithiasis 2024
// (Türk et al.). A matriz abaixo é a fonte única usada pelo painel da
// calculadora e por todos os templates de documento.
// ─────────────────────────────────────────────────────────────────────────

interface ExpulsaoBand {
  maxSize: number;
  distal: number;
  medio: number;
  proximal: number;
}

const EXPULSAO_MATRIX: ExpulsaoBand[] = [
  { maxSize: 4, distal: 87, medio: 76, proximal: 63 },
  { maxSize: 6, distal: 74, medio: 60, proximal: 48 },
  { maxSize: 8, distal: 55, medio: 42, proximal: 32 },
  { maxSize: 10, distal: 40, medio: 30, proximal: 22 },
  { maxSize: Infinity, distal: 20, medio: 15, proximal: 10 },
];

export type LocalizacaoCalculo = "distal" | "medio" | "proximal";

export function classificarLocalizacaoCalculo(
  localizacaoLabel: string
): LocalizacaoCalculo {
  const loc = (localizacaoLabel || "").toLowerCase();
  if (loc.includes("distal") || loc.includes("juv")) return "distal";
  if (loc.includes("proximal")) return "proximal";
  return "medio";
}

export interface ExpulsaoProbabilidade {
  probability: number;
  locKey: LocalizacaoCalculo;
  locLabel: string;
  timeEstimate: string;
  riskLabel: "ALTA" | "MODERADA" | "BAIXA" | "MUITO BAIXA";
  color: CalcColor;
  recommendation: string;
}

/** Probabilidade de expulsão espontânea por tamanho (mm) e localização do
 * cálculo ureteral. Única implementação da matriz — usada pelo campo
 * `calculated` e por todos os templates (descrição, orientações). */
export function calcExpulsaoProbabilidade(
  tamanhoMm: number,
  localizacaoLabel: string
): ExpulsaoProbabilidade {
  const tam = Number.isFinite(tamanhoMm) ? tamanhoMm : 0;
  const locKey = classificarLocalizacaoCalculo(localizacaoLabel);
  const band =
    EXPULSAO_MATRIX.find(b => tam <= b.maxSize) ??
    EXPULSAO_MATRIX[EXPULSAO_MATRIX.length - 1];
  const probability = band[locKey];

  const timeEstimate =
    probability >= 75
      ? "1–2 semanas"
      : probability >= 55
        ? "2–3 semanas"
        : probability >= 35
          ? "3–4 semanas"
          : "> 4 semanas (baixa chance)";

  const riskLabel: ExpulsaoProbabilidade["riskLabel"] =
    probability >= 70
      ? "ALTA"
      : probability >= 45
        ? "MODERADA"
        : probability >= 25
          ? "BAIXA"
          : "MUITO BAIXA";

  const color: CalcColor =
    probability >= 70
      ? "green"
      : probability >= 50
        ? "yellow"
        : probability >= 30
          ? "orange"
          : "red";

  const recommendation =
    probability >= 70
      ? "Terapia expulsiva indicada. Alta probabilidade de passagem espontânea."
      : probability >= 50
        ? "Terapia expulsiva razoável. Reavalie em 4 semanas com imagem."
        : probability >= 30
          ? "Chance moderada. Considere intervenção se dor refratária ou obstrução progressiva."
          : "Baixa probabilidade de expulsão espontânea. Discutir intervenção precoce.";

  const locLabel =
    locKey === "distal"
      ? "distal (JUV)"
      : locKey === "proximal"
        ? "proximal"
        : "médio";

  return {
    probability,
    locKey,
    locLabel,
    timeEstimate,
    riskLabel,
    color,
    recommendation,
  };
}

export function calcExpulsao(config: Record<string, string>): CalcOutput {
  const tam = parseFloat(config.tamanho) || 0;
  const { probability, locLabel, timeEstimate, recommendation, color } =
    calcExpulsaoProbabilidade(tam, config.localizacao || "");

  return {
    probability,
    probLabel: `~${probability}%`,
    timeEstimate,
    recommendation,
    color,
    details: [
      `Tamanho: ${tam > 0 ? tam + " mm" : "não informado"}`,
      `Localização: ureter ${locLabel}`,
      `Taxa de expulsão (Hollingsworth 2016 / EAU 2024): ~${probability}%`,
      `Tempo médio estimado: ${timeEstimate}`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────
// IPSS (International Prostate Symptom Score) — Barry MJ et al. J Urol
// 1992; EAU Guidelines on BPH 2024.
// ─────────────────────────────────────────────────────────────────────────

export interface IpssScore {
  total: number;
  qol: number;
  qolLabel: string;
  severity: "Leve" | "Moderado" | "Grave";
  obstrutivo: number;
  irritativo: number;
  color: CalcColor;
  probability: number;
  timeEstimate: string;
  recommendation: string;
}

const QOL_LABELS = [
  "Ótima",
  "Satisfeito",
  "Razoavelmente satisfeito",
  "Indiferente",
  "Razoavelmente insatisfeito",
  "Infeliz",
  "Péssima",
];

function parseLeadingDigit(val: string | undefined, fallback = 0): number {
  const n = parseInt((val || "").charAt(0), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Soma as 7 perguntas do IPSS (cada uma "N — texto", lê o dígito inicial)
 * e classifica severidade/QoL. Usada pelo painel `calc_ipss` e pelo
 * template de descrição da consulta de HPB clínica. */
export function calcIpssScore(config: Record<string, string>): IpssScore {
  const q1 = parseLeadingDigit(config.ipss_q1);
  const q2 = parseLeadingDigit(config.ipss_q2);
  const q3 = parseLeadingDigit(config.ipss_q3);
  const q4 = parseLeadingDigit(config.ipss_q4);
  const q5 = parseLeadingDigit(config.ipss_q5);
  const q6 = parseLeadingDigit(config.ipss_q6);
  const q7 = parseLeadingDigit(config.ipss_q7);
  const qol = parseLeadingDigit(config.ipss_qol, 3);
  const total = q1 + q2 + q3 + q4 + q5 + q6 + q7;

  let severity: IpssScore["severity"];
  let color: CalcColor;
  let probability: number;
  let timeEstimate: string;
  let recommendation: string;

  if (total <= 7) {
    severity = "Leve";
    color = "green";
    probability = 85;
    timeEstimate = "Conduta expectante / watchful waiting";
    recommendation =
      "IPSS leve (0–7): conduta expectante. Reavaliação anual. Mudanças de estilo de vida.";
  } else if (total <= 19) {
    severity = "Moderado";
    color = "yellow";
    probability = 60;
    timeEstimate = "Tratamento clínico — 4–6 semanas para resposta";
    recommendation =
      "IPSS moderado (8–19): tratamento farmacológico indicado. Alfa-bloqueador ± 5-ARI conforme volume prostático.";
  } else {
    severity = "Grave";
    color = "red";
    probability = 30;
    timeEstimate =
      "Tratamento clínico ou cirúrgico — avaliar indicação cirúrgica";
    recommendation =
      "IPSS grave (20–35): avaliar indicação cirúrgica (RTU-P, HoLEP). Tratar complicações (retenção, ITU, litíase vesical).";
  }

  return {
    total,
    qol,
    qolLabel: QOL_LABELS[qol] || "—",
    severity,
    obstrutivo: q1 + q3 + q5 + q6,
    irritativo: q2 + q4 + q7,
    color,
    probability,
    timeEstimate,
    recommendation,
  };
}

export function calcIpss(config: Record<string, string>): CalcOutput {
  const s = calcIpssScore(config);
  return {
    probability: s.probability,
    probLabel: `${s.total}/35`,
    timeEstimate: s.timeEstimate,
    recommendation: s.recommendation,
    color: s.color,
    details: [
      `Escore IPSS total: ${s.total}/35 — Sintomas ${s.severity}s`,
      `Qualidade de vida (QoL): ${s.qol}/6 — ${s.qolLabel}`,
      `Sintomas obstrutivos (Q1+Q3+Q5+Q6): ${s.obstrutivo}/20`,
      `Sintomas irritativos (Q2+Q4+Q7): ${s.irritativo}/15`,
      `Fonte: Barry MJ et al. J Urol 1992 (IPSS); EAU Guidelines on BPH 2024`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Risco de recorrência de litíase — heurística autoral de soma de pontos
// por fator de risco, com limiares lidos de: Pearle MS et al. AUA
// Guideline 2014 (amended 2019); EAU Urolithiasis 2024 (Türk et al.);
// Borghi L et al. NEJM 2002;346(2):77–84; Worcester EM, Coe FL. NEJM
// 2010;363(10):954–963.
//
// IMPORTANTE (transparência de evidência): este é um escore de risco
// construído internamente a partir dos limiares de referência dessas
// fontes — NÃO é um escore validado e publicado como instrumento único
// (diferente do `calcExpulsao`, que reproduz uma matriz publicada). Use
// como ferramenta de apoio à decisão, não como substituto do julgamento
// clínico ou de um nomograma validado.
// ─────────────────────────────────────────────────────────────────────────

export interface LitiaseRisco {
  score: number;
  risk: "Baixo" | "Moderado" | "Alto" | "Muito Alto";
  color: CalcColor;
  probability: number;
  timeEstimate: string;
  recommendation: string;
  riskFactors: string[];
}

function num(val: string | undefined): number {
  return parseFloat((val || "0").replace(",", ".")) || 0;
}

export function calcLitiaseRisco(config: Record<string, string>): LitiaseRisco {
  const riskFactors: string[] = [];
  let score = 0;

  const ep = parseInt(config.episodios || "1", 10);
  if (ep >= 3) {
    score += 3;
    riskFactors.push(`≥ 3 episódios (${ep}×) — alto risco de recorrência`);
  } else if (ep === 2) {
    score += 1;
    riskFactors.push(`2 episódios — risco moderado`);
  }

  const vol = num(config.volume_urina24);
  if (vol > 0 && vol < 1500) {
    score += 2;
    riskFactors.push(`Volume urinário baixo: ${vol} mL/dia (meta ≥ 2000 mL)`);
  } else if (vol >= 1500 && vol < 2000) {
    score += 1;
    riskFactors.push(`Volume urinário limítrofe: ${vol} mL/dia`);
  }

  const caU = num(config.ca_urina24);
  if (caU > 300) {
    score += 2;
    riskFactors.push(
      `Hipercalciúria: ${caU} mg/dia (ref: < 300 ♂ / < 250 ♀)`
    );
  }

  const oxU = num(config.oxalato_urina24);
  if (oxU > 40) {
    score += 2;
    riskFactors.push(`Hiperoxalúria: ${oxU} mg/dia (ref: < 40)`);
  }

  const citU = num(config.citrato_urina24);
  if (citU > 0 && citU < 320) {
    score += 2;
    riskFactors.push(
      `Hipocitratúria: ${citU} mg/dia (ref: > 320 ♀ / > 450 ♂)`
    );
  }

  const auU = num(config.au_urina24);
  if (auU > 800) {
    score += 1;
    riskFactors.push(
      `Hiperuricosúria: ${auU} mg/dia (ref: < 800 ♂ / < 750 ♀)`
    );
  }

  const naU = num(config.sodio_urina24);
  if (naU > 150) {
    score += 1;
    riskFactors.push(
      `Hipersodiosúria: ${naU} mEq/dia (ref: < 150) — aumenta calciúria`
    );
  }

  const caS = num(config.ca_sangue);
  if (caS > 10.2) {
    score += 2;
    riskFactors.push(
      `Hipercalcemia: ${caS} mg/dL — investigar hiperparatireoidismo`
    );
  }

  const pth = num(config.pth);
  if (pth > 65 && caS > 10.2) {
    score += 3;
    riskFactors.push(
      `PTH elevado (${pth} pg/mL) + hipercalcemia → hiperparatireoidismo primário`
    );
  } else if (pth > 65) {
    score += 1;
    riskFactors.push(`PTH elevado: ${pth} pg/mL (ref: 15–65)`);
  }

  const auS = num(config.au_sangue);
  if (auS > 7.0) {
    score += 1;
    riskFactors.push(`Hiperuricemia: ${auS} mg/dL (ref: < 7,0 ♂ / < 6,0 ♀)`);
  }

  const ph = num(config.ph_urina);
  if (ph > 0 && ph < 5.5) {
    score += 1;
    riskFactors.push(
      `pH urinário ácido: ${ph} (< 5,5 → risco de cálculo de ácido úrico)`
    );
  }
  if (ph > 7.0) {
    score += 1;
    riskFactors.push(
      `pH urinário alcalino: ${ph} (> 7,0 → risco de estruvita/fosfato de cálcio)`
    );
  }

  const comp = (config.composicao || "").toLowerCase();
  if (comp.includes("cistina")) {
    score += 4;
    riskFactors.push(
      "Cistinúria — risco muito alto de recorrência (doença genética)"
    );
  }
  if (comp.includes("estruvita")) {
    score += 3;
    riskFactors.push(
      "Cálculo de estruvita — associado a infecção por bactérias urease-positivas"
    );
  }

  let risk: LitiaseRisco["risk"];
  let color: CalcColor;
  let probability: number;
  let recommendation: string;
  let timeEstimate: string;

  if (score === 0) {
    risk = "Baixo";
    color = "green";
    probability = 15;
    timeEstimate = "Recorrência em ~15% em 5 anos";
    recommendation =
      "Risco baixo: hidratação (≥ 2 L/dia) e orientações dietéticas. Reavaliação anual.";
  } else if (score <= 3) {
    risk = "Moderado";
    color = "yellow";
    probability = 40;
    timeEstimate = "Recorrência em ~40% em 5 anos";
    recommendation =
      "Risco moderado: corrigir fatores identificados. Considerar tratamento farmacológico específico.";
  } else if (score <= 6) {
    risk = "Alto";
    color = "orange";
    probability = 65;
    timeEstimate = "Recorrência em ~65% em 5 anos";
    recommendation =
      "Risco alto: tratamento farmacológico indicado. Monitorar urina de 24h a cada 6–12 meses.";
  } else {
    risk = "Muito Alto";
    color = "red";
    probability = 85;
    timeEstimate = "Recorrência em ~85% em 5 anos";
    recommendation =
      "Risco muito alto: tratamento intensivo obrigatório. Avaliar causas secundárias (hiperparatireoidismo, cistinúria, ATR).";
  }

  return {
    score,
    risk,
    color,
    probability,
    timeEstimate,
    recommendation,
    riskFactors,
  };
}

export function calcRiscoLitiase(config: Record<string, string>): CalcOutput {
  const r = calcLitiaseRisco(config);
  const evidenceNote =
    "Nota: heurística de apoio à decisão baseada em limiares de guideline (AUA/EAU), não um escore validado e publicado isoladamente.";

  const details =
    r.riskFactors.length > 0
      ? [
          `Fatores de risco identificados (${r.riskFactors.length}):`,
          ...r.riskFactors,
          evidenceNote,
          "Fonte dos limiares: EAU Urolithiasis 2024; AUA/Endourology Society 2022; Worcester EM, Coe FL. NEJM 2010",
        ]
      : [
          "Nenhum fator de risco identificado nos dados informados",
          "Preencha os campos de exames para análise completa",
          evidenceNote,
          "Fonte dos limiares: EAU Urolithiasis 2024; AUA/Endourology Society 2022",
        ];

  return {
    probability: r.probability,
    probLabel: `Risco ${r.risk}`,
    timeEstimate: r.timeEstimate,
    recommendation: r.recommendation,
    color: r.color,
    details,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Indicação cirúrgica de HPB (RTU-P vs HoLEP vs Rezūm/UroLift) — EAU BPH
// Guidelines 2024; AUA/SUFU 2023; Ahyai SA et al. Eur Urol 2010.
// ─────────────────────────────────────────────────────────────────────────

export function calcIndicacaoCirurgicaHPB(
  config: Record<string, string>
): CalcOutput {
  const vol = parseFloat((config.volume_prostatico || "0").replace(",", "."));
  const ipss = parseInt(config.ipss_pre || "0", 10);
  const qmax = parseFloat((config.qmax_pre || "0").replace(",", "."));

  let recommended: string;
  let color: CalcColor;
  let probability: number;
  let timeEstimate: string;
  let recommendation: string;
  const details: string[] = [];

  const ipssGrave = ipss >= 20;
  const ipssModGrave = ipss >= 8;
  const obstrucaoSignificativa = qmax > 0 && qmax < 10;

  if (vol <= 0) {
    recommended = "Preencher volume prostático";
    color = "orange";
    probability = 0;
    timeEstimate = "Dados insuficientes";
    recommendation =
      "Informe o volume prostático para receber a recomendação de técnica cirúrgica.";
    details.push("Volume prostático não informado");
  } else if (vol > 80) {
    recommended = "HoLEP (enucleação a laser de hólmio)";
    color = "green";
    probability = 90;
    timeEstimate = "Resultado duradouro a longo prazo";
    recommendation = `Volume ${vol} mL (> 80 mL): HoLEP ou enucleação aberta (Millin). RTU-P é subideal para volumes grandes.`;
    details.push(
      `Volume prostático: ${vol} mL — indicação de enucleação (HoLEP/ThuLEP/Millin)`
    );
    details.push(
      "HoLEP: equivalente à prostatectomia aberta, menor sangramento, menor internação"
    );
    details.push(
      "Curva de aprendizado longa (50–100 casos) — encaminhar a centro especializado se necessário"
    );
    if (ipssGrave)
      details.push(`IPSS grave (${ipss}/35): indicação cirúrgica reforçada`);
  } else if (vol >= 30 && vol <= 80) {
    if (ipssModGrave || obstrucaoSignificativa) {
      recommended = "RTU-P (ressecção transuretral bipolar)";
      color = "green";
      probability = 85;
      timeEstimate = "Padrão-ouro para 30–80 mL";
      recommendation = `Volume ${vol} mL, IPSS ${ipss}/35${obstrucaoSignificativa ? `, Qmáx ${qmax} mL/s` : ""}: RTU-P bipolar é o padrão-ouro. Rezūm ou UroLift se preservação ejaculatória for prioridade.`;
      details.push(
        `Volume ${vol} mL + IPSS ${ipss}/35 — RTU-P bipolar (padrão-ouro)`
      );
      details.push(
        "Rezūm: alternativa com preservação ejaculatória (< 5% ejaculacão retrógrada), IPSS moderado"
      );
      details.push(
        "UroLift: sem ablação, preserva ejaculacão e função erétil, indicado para < 80 mL sem lóbulo mediano"
      );
    } else {
      recommended = "Rezūm ou UroLift (IPSS leve)";
      color = "yellow";
      probability = 75;
      timeEstimate = "Procedimento ambulatorial minimamente invasivo";
      recommendation = `Volume ${vol} mL, IPSS ${ipss}/35 (leve): Rezūm ou UroLift são preferíveis por menor morbidade. Reavalie indicação cirúrgica.`;
      details.push(
        `Volume ${vol} mL + IPSS leve (${ipss}/35) — procedimento minimamente invasivo`
      );
      details.push("Rezūm: vapor d'água, ambulatorial, preserva ejaculacão");
      details.push(
        "UroLift: implante prostático, ambulatorial, preserva ejaculacão e função erétil"
      );
    }
  } else {
    recommended = "UroLift ou Rezūm";
    color = "yellow";
    probability = 70;
    timeEstimate = "Procedimento ambulatorial";
    recommendation = `Volume ${vol} mL (< 30 mL): considerar UroLift ou Rezūm. RTU-P possível mas com menor tecido para ressecção.`;
    details.push(`Volume prostático: ${vol} mL — próstata pequena`);
    details.push(
      "UroLift: indicado para próstatas < 80 mL sem lóbulo mediano proeminente"
    );
    if (ipssGrave)
      details.push(
        `IPSS grave (${ipss}/35): apesar do volume pequeno, sintomas graves justificam intervenção`
      );
  }

  if (ipss > 0)
    details.push(
      `IPSS pré-op: ${ipss}/35 (${ipss <= 7 ? "leve" : ipss <= 19 ? "moderado" : "grave"})`
    );
  if (qmax > 0)
    details.push(
      `Qmáx pré-op: ${qmax} mL/s${qmax < 10 ? " — obstrução significativa" : ""}`
    );
  details.push(
    "Fonte: EAU BPH Guidelines 2024; AUA/SUFU 2023; Ahyai SA et al. Eur Urol 2010"
  );

  return {
    probability,
    probLabel: recommended,
    timeEstimate,
    recommendation,
    color,
    details,
  };
}
