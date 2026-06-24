/**
 * ErspcCalculator — Calculadora de Risco de Câncer de Próstata
 *
 * Baseada no ERSPC Risk Calculator 4 (RC4) de Roobol et al. (2012)
 * Referência: Roobol MJ et al. Eur Urol. 2012;62(2):229-36. PMID: 22633556
 * DOI: 10.1016/j.eururo.2012.05.008
 *
 * Calcula risco de:
 * - Qualquer câncer de próstata (PCa)
 * - Câncer clinicamente significativo (csPCa, ≥ Gleason 7 / ISUP ≥ 2)
 *
 * Recomendação de biópsia conforme EAU Guidelines 2024
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info, Calculator } from "lucide-react";

// ─── ERSPC RC4 Logistic Regression Coefficients ──────────────────────────────
// Fonte: Roobol MJ et al. Eur Urol. 2012;62(2):229-36
// Modelo para câncer clinicamente significativo (Gleason ≥ 7 / ISUP ≥ 2)
// Coeficientes do modelo multivariado publicado (Tabela 3 do artigo)
const RC4_INTERCEPT = -6.8418;
const RC4_COEF = {
  log_psa: 1.5721,        // ln(PSA)
  dre_suspicious: 1.4820, // DRE suspeito (nódulo, assimetria)
  trus_suspicious: 1.3660, // TRUS suspeito (hipoecogenicidade)
  family_history: 0.6240,  // Histórico familiar 1º grau
  prior_biopsy_neg: -0.5490, // Biópsia prévia negativa
};

/**
 * Calcula probabilidade logística
 */
function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Calcula risco de câncer clinicamente significativo (ERSPC RC4)
 * @returns risco em decimal (0–1)
 */
function calculateErspcRisk(params: {
  psa: number;
  dreSuspicious: boolean;
  trusSuspicious: boolean;
  familyHistory: boolean;
  priorBiopsyNeg: boolean;
}): number {
  const logit =
    RC4_INTERCEPT +
    RC4_COEF.log_psa * Math.log(params.psa) +
    RC4_COEF.dre_suspicious * (params.dreSuspicious ? 1 : 0) +
    RC4_COEF.trus_suspicious * (params.trusSuspicious ? 1 : 0) +
    RC4_COEF.family_history * (params.familyHistory ? 1 : 0) +
    RC4_COEF.prior_biopsy_neg * (params.priorBiopsyNeg ? 1 : 0);

  return logistic(logit);
}

/**
 * Interpreta o risco e fornece recomendação conforme EAU 2024
 */
function interpretRisk(
  riskPercent: number,
  psa: number,
  dreSuspicious: boolean
): {
  level: "low" | "intermediate" | "high";
  label: string;
  color: string;
  recommendation: string;
  evidence: string;
} {
  // EAU 2024: biópsia recomendada se risco ≥ 15% (csPCa) ou PSA ≥ 10 ou DRE suspeito
  if (psa >= 10 || dreSuspicious) {
    return {
      level: "high",
      label: "Alto Risco",
      color: "text-red-400",
      recommendation:
        "Biópsia de próstata indicada (PSA ≥ 10 ng/mL ou DRE suspeito). Considerar RM multiparamétrica (mpRM) prévia à biópsia para guiar amostragem (EAU 2024, Grau A).",
      evidence: "EAU Guidelines 2024 — Prostate Cancer, Seção 5.1.2",
    };
  }

  if (riskPercent >= 15) {
    return {
      level: "high",
      label: "Alto Risco",
      color: "text-red-400",
      recommendation:
        "Biópsia de próstata indicada (risco csPCa ≥ 15%). Realizar mpRM prévia para guiar biópsia-alvo (EAU 2024, Grau A). Se PIRADS ≥ 3, biópsia-alvo + sistemática.",
      evidence: "EAU Guidelines 2024 — Prostate Cancer, Seção 5.1.2; ERSPC RC4",
    };
  }

  if (riskPercent >= 7.5) {
    return {
      level: "intermediate",
      label: "Risco Intermediário",
      color: "text-yellow-400",
      recommendation:
        "Considerar mpRM. Se PIRADS ≥ 3, biópsia indicada. Se PIRADS 1–2, vigilância ativa com PSA a cada 6–12 meses e repetição da mpRM em 1–2 anos (EAU 2024).",
      evidence: "EAU Guidelines 2024 — Prostate Cancer, Seção 5.1.2",
    };
  }

  return {
    level: "low",
    label: "Baixo Risco",
    color: "text-green-400",
    recommendation:
      "Vigilância com PSA a cada 1–2 anos. Biópsia não indicada no momento. Reavaliação se PSA dobrar em < 3 anos (PSADT < 3 anos) ou DRE tornar-se suspeito.",
    evidence: "EAU Guidelines 2024 — Prostate Cancer, Seção 5.1.1",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ErspcCalculator() {
  const [psa, setPsa] = useState("");
  const [volume, setVolume] = useState("");
  const [dre, setDre] = useState<"normal" | "suspicious" | "">("");
  const [trus, setTrus] = useState<"normal" | "suspicious" | "">("");
  const [familyHistory, setFamilyHistory] = useState<"yes" | "no" | "">("");
  const [priorBiopsy, setPriorBiopsy] = useState<"none" | "negative" | "">("");
  const [calculated, setCalculated] = useState(false);

  const psaNum = parseFloat(psa);
  const volumeNum = parseFloat(volume);

  const psaDensity = useMemo(() => {
    if (psaNum > 0 && volumeNum > 0) return psaNum / volumeNum;
    return null;
  }, [psaNum, volumeNum]);

  const result = useMemo(() => {
    if (!calculated || !psaNum || psaNum <= 0) return null;
    if (!dre || !familyHistory || !priorBiopsy) return null;

    const risk = calculateErspcRisk({
      psa: psaNum,
      dreSuspicious: dre === "suspicious",
      trusSuspicious: trus === "suspicious",
      familyHistory: familyHistory === "yes",
      priorBiopsyNeg: priorBiopsy === "negative",
    });

    const riskPercent = risk * 100;
    const interpretation = interpretRisk(
      riskPercent,
      psaNum,
      dre === "suspicious"
    );

    return { riskPercent, interpretation, psaDensity };
  }, [calculated, psaNum, dre, trus, familyHistory, priorBiopsy, psaDensity]);

  const canCalculate =
    psa !== "" &&
    psaNum > 0 &&
    dre !== "" &&
    familyHistory !== "" &&
    priorBiopsy !== "";

  const handleCalculate = () => {
    if (canCalculate) setCalculated(true);
  };

  const handleReset = () => {
    setPsa("");
    setVolume("");
    setDre("");
    setTrus("");
    setFamilyHistory("");
    setPriorBiopsy("");
    setCalculated(false);
  };

  return (
    <Card className="p-4 bg-card/60 border-border mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-primary">
          Calculadora ERSPC RC4 — Risco de Câncer de Próstata
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* PSA */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            PSA total (ng/mL) <span className="text-red-400">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="ex: 5.2"
            value={psa}
            onChange={(e) => {
              setPsa(e.target.value);
              setCalculated(false);
            }}
            className="h-8 text-sm bg-background"
          />
        </div>

        {/* Volume prostático */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Volume prostático (mL) — para PSAD
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="ex: 40"
            value={volume}
            onChange={(e) => {
              setVolume(e.target.value);
              setCalculated(false);
            }}
            className="h-8 text-sm bg-background"
          />
        </div>

        {/* DRE */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Toque retal (DRE) <span className="text-red-400">*</span>
          </Label>
          <Select
            value={dre}
            onValueChange={(v) => {
              setDre(v as "normal" | "suspicious");
              setCalculated(false);
            }}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal (liso, simétrico)</SelectItem>
              <SelectItem value="suspicious">
                Suspeito (nódulo, assimetria, endurecimento)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TRUS */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            USG transretal (TRUS)
          </Label>
          <Select
            value={trus}
            onValueChange={(v) => {
              setTrus(v as "normal" | "suspicious");
              setCalculated(false);
            }}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal / Não realizado</SelectItem>
              <SelectItem value="suspicious">
                Suspeito (área hipoecogênica)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Histórico familiar */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Histórico familiar 1º grau (pai/irmão){" "}
            <span className="text-red-400">*</span>
          </Label>
          <Select
            value={familyHistory}
            onValueChange={(v) => {
              setFamilyHistory(v as "yes" | "no");
              setCalculated(false);
            }}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Não</SelectItem>
              <SelectItem value="yes">Sim</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Biópsia prévia */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Biópsia prévia <span className="text-red-400">*</span>
          </Label>
          <Select
            value={priorBiopsy}
            onValueChange={(v) => {
              setPriorBiopsy(v as "none" | "negative");
              setCalculated(false);
            }}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma biópsia anterior</SelectItem>
              <SelectItem value="negative">
                Biópsia prévia negativa
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PSAD preview */}
      {psaDensity !== null && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded bg-muted/30 border border-border">
          <Info className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">
            <strong className="text-foreground">
              Densidade do PSA (PSAD):
            </strong>{" "}
            {psaDensity.toFixed(3)} ng/mL/mL
            {psaDensity >= 0.15 ? (
              <span className="text-yellow-400 ml-1">
                (≥ 0.15 — fator de risco adicional)
              </span>
            ) : (
              <span className="text-green-400 ml-1">({"<"} 0.15 — baixo)</span>
            )}
          </span>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          className="h-8 text-xs bg-primary text-white hover:bg-primary/90"
          onClick={handleCalculate}
          disabled={!canCalculate}
        >
          <Calculator className="w-3 h-3 mr-1" />
          Calcular Risco
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={handleReset}
        >
          Limpar
        </Button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="space-y-3 border-t border-border pt-3">
          {/* Risco principal */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Risco de câncer clinicamente significativo (ISUP ≥ 2)
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-bold ${result.interpretation.color}`}
                >
                  {result.riskPercent.toFixed(1)}%
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${result.interpretation.color} border-current`}
                >
                  {result.interpretation.label}
                </Badge>
              </div>
            </div>
            {result.interpretation.level === "high" ? (
              <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
            ) : result.interpretation.level === "intermediate" ? (
              <AlertTriangle className="w-8 h-8 text-yellow-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
            )}
          </div>

          {/* PSAD adicional */}
          {result.psaDensity !== null && result.psaDensity >= 0.15 && (
            <div className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <Info className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300">
                <strong>PSAD ≥ 0.15:</strong> Fator de risco adicional para
                câncer clinicamente significativo. Considerar biópsia mesmo com
                risco calculado {"<"} 15% (EAU 2024).
              </p>
            </div>
          )}

          {/* Recomendação */}
          <div className="p-3 rounded bg-muted/30 border border-border">
            <p className="text-xs font-semibold text-foreground mb-1">
              Recomendação (EAU 2024):
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.interpretation.recommendation}
            </p>
          </div>

          {/* Referência */}
          <p className="text-xs text-muted-foreground/60 italic">
            Fonte: {result.interpretation.evidence} | ERSPC RC4: Roobol MJ et
            al. Eur Urol. 2012;62(2):229-36 (PMID: 22633556)
          </p>

          {/* Aviso */}
          <div className="flex items-start gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <Info className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Esta calculadora é uma ferramenta de apoio à decisão clínica e
              não substitui o julgamento médico individualizado. A decisão de
              biopsar deve considerar expectativa de vida, comorbidades,
              preferências do paciente e disponibilidade de mpRM.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
