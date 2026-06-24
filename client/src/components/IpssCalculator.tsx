import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  text: string;
  options: string[];
}

const IPSS_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "No último mês, quantas vezes você teve a sensação de que a bexiga não esvaziou completamente após urinar?",
    options: ["Nenhuma", "Menos de 1 em 5 vezes", "Menos da metade das vezes", "Aproximadamente metade das vezes", "Mais da metade das vezes", "Quase sempre"],
  },
  {
    id: 2,
    text: "No último mês, quantas vezes você teve que urinar novamente menos de 2 horas após ter urinado?",
    options: ["Nenhuma", "Menos de 1 em 5 vezes", "Menos da metade das vezes", "Aproximadamente metade das vezes", "Mais da metade das vezes", "Quase sempre"],
  },
  {
    id: 3,
    text: "No último mês, quantas vezes você parou e recomeçou a urinar várias vezes?",
    options: ["Nenhuma", "Menos de 1 em 5 vezes", "Menos da metade das vezes", "Aproximadamente metade das vezes", "Mais da metade das vezes", "Quase sempre"],
  },
  {
    id: 4,
    text: "No último mês, quantas vezes você teve dificuldade em adiar a urina?",
    options: ["Nenhuma", "Menos de 1 em 5 vezes", "Menos da metade das vezes", "Aproximadamente metade das vezes", "Mais da metade das vezes", "Quase sempre"],
  },
  {
    id: 5,
    text: "No último mês, quantas vezes você teve jato urinário fraco?",
    options: ["Nenhuma", "Menos de 1 em 5 vezes", "Menos da metade das vezes", "Aproximadamente metade das vezes", "Mais da metade das vezes", "Quase sempre"],
  },
  {
    id: 6,
    text: "No último mês, quantas vezes você teve que fazer força para começar a urinar?",
    options: ["Nenhuma", "Menos de 1 em 5 vezes", "Menos da metade das vezes", "Aproximadamente metade das vezes", "Mais da metade das vezes", "Quase sempre"],
  },
  {
    id: 7,
    text: "No último mês, quantas vezes você acordou à noite para urinar (noctúria)?",
    options: ["Nenhuma", "1 vez", "2 vezes", "3 vezes", "4 vezes", "5 vezes ou mais"],
  },
];

const QOL_OPTIONS = [
  "Ótimo",
  "Satisfeito",
  "Mais ou menos satisfeito",
  "Indiferente",
  "Mais ou menos insatisfeito",
  "Insatisfeito",
  "Péssimo",
];

function getClassification(score: number): {
  label: string;
  color: string;
  conduct: string;
  badge: "default" | "secondary" | "destructive";
} {
  if (score <= 7) {
    return {
      label: "Leve",
      color: "text-green-600",
      conduct:
        "Conduta expectante com vigilância ativa. Orientar medidas comportamentais (restrição hídrica noturna, esvaziamento duplo, redução de cafeína). Reavaliação anual com IPSS e urofluxometria.",
      badge: "secondary",
    };
  } else if (score <= 19) {
    return {
      label: "Moderado",
      color: "text-yellow-600",
      conduct:
        "Tratamento farmacológico indicado. Alfa-bloqueador (tansulosina 0,4 mg/dia) como primeira linha. Se volume prostático ≥ 40 mL ou PSA ≥ 1,5 ng/mL, considerar 5-ARI (dutasterida 0,5 mg/dia) em monoterapia ou terapia combinada. Reavaliar em 3–6 meses.",
      badge: "default",
    };
  } else {
    return {
      label: "Grave",
      color: "text-red-600",
      conduct:
        "Avaliar indicação cirúrgica. Verificar complicações: retenção urinária, ITU recorrente, litíase vesical, hematúria, insuficiência renal obstrutiva. Solicitar urofluxometria + RPM + USG de vias urinárias. Encaminhar para discussão cirúrgica se falha clínica ou complicações presentes.",
      badge: "destructive",
    };
  }
}

export function IpssCalculator() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [qol, setQol] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const allAnswered = IPSS_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setShowResult(false);
  };

  const handleReset = () => {
    setAnswers({});
    setQol(null);
    setShowResult(false);
  };

  const classification = getClassification(totalScore);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-800 mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-xl">📋</span>
          Calculadora IPSS — International Prostate Symptom Score
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Escore 0–35 | Classificação: 0–7 leve · 8–19 moderado · 20–35 grave
          (Barry MJ et al. J Urol 1992)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {IPSS_QUESTIONS.map((q) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-medium">
              <span className="text-blue-600 dark:text-blue-400 font-bold mr-1">
                {q.id}.
              </span>
              {q.text}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(q.id, idx)}
                  className={`px-2.5 py-1 rounded text-xs border transition-all duration-150 active:scale-95 ${
                    answers[q.id] === idx
                      ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-sm"
                      : "bg-background border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  }`}
                >
                  <span className="text-muted-foreground mr-1 text-[10px]">
                    {idx}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Questão de Qualidade de Vida */}
        <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium">
            <span className="text-purple-600 dark:text-purple-400 font-bold mr-1">
              QoL.
            </span>
            Se você tivesse que passar o resto da vida com seus sintomas urinários atuais, como você se sentiria?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QOL_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setQol(idx)}
                className={`px-2.5 py-1 rounded text-xs border transition-all duration-150 active:scale-95 ${
                  qol === idx
                    ? "bg-purple-600 text-white border-purple-600 font-semibold shadow-sm"
                    : "bg-background border-border hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                }`}
              >
                <span className="text-muted-foreground mr-1 text-[10px]">
                  {idx}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={() => setShowResult(true)}
            disabled={!allAnswered}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Calcular Escore
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
          >
            Limpar
          </Button>
          {allAnswered && !showResult && (
            <span className="text-xs text-muted-foreground">
              Escore parcial: <strong>{totalScore}</strong>/35
            </span>
          )}
        </div>

        {/* Resultado */}
        {showResult && allAnswered && (
          <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-background p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-2xl font-bold mr-2">{totalScore}</span>
                <span className="text-sm text-muted-foreground">/ 35 pontos</span>
              </div>
              <Badge variant={classification.badge} className="text-sm px-3 py-1">
                {classification.label}
              </Badge>
            </div>

            {qol !== null && (
              <p className="text-sm">
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  Qualidade de vida (QoL):
                </span>{" "}
                {qol}/6 — {QOL_OPTIONS[qol]}
              </p>
            )}

            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Conduta recomendada (EAU 2024)
              </p>
              <p className="text-sm">{classification.conduct}</p>
            </div>

            <p className="text-xs text-muted-foreground">
              Referência: Barry MJ et al. The American Urological Association symptom index for benign prostatic hyperplasia. J Urol. 1992;148(5):1549–1557. | EAU Guidelines on BPH/LUTS 2024.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
