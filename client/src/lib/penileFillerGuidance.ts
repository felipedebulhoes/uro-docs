export type PenileFillerTarget = "shaft" | "glans";

export const penileFillerEntryIds = [
  "aumento-peniano-com-preenchimento-de-acido-hialuronico",
  "aumento-de-glande-com-acido-hialuronico",
] as const;

export type PenileFillerEntryId = (typeof penileFillerEntryIds)[number];

export type PenileFillerGuidance = {
  target: PenileFillerTarget;
  label: string;
  shortLabel: string;
  objective: string;
  anatomicalPlane: string;
  distribution: string;
  mainRisk: string;
  shouldNotBeConfusedWith: string;
};

const guidanceByEntry: Record<PenileFillerEntryId, PenileFillerGuidance> = {
  "aumento-peniano-com-preenchimento-de-acido-hialuronico": {
    target: "shaft",
    label: "Preenchimento da haste / corpo peniano",
    shortLabel: "Haste",
    objective: "Ganho de circunferência e harmonização do contorno da haste; não é uma técnica de aumento do comprimento peniano.",
    anatomicalPlane: "Plano areolar superficial entre as fáscias de Dartos e de Buck, mantendo o feixe neurovascular dorsal e os corpos cavernosos profundamente protegidos.",
    distribution: "Deposição progressiva e circunferencial ao longo da haste, com modelagem para reduzir irregularidades de contorno.",
    mainRisk: "Nódulos, assimetria, migração para o prepúcio, edema e, raramente, isquemia por compressão ou plano inadequado.",
    shouldNotBeConfusedWith: "Não é injeção intracavernosa, não é injeção intravascular e não deve envolver depósito profundo junto à túnica albugínea.",
  },
  "aumento-de-glande-com-acido-hialuronico": {
    target: "glans",
    label: "Preenchimento da glande",
    shortLabel: "Glande",
    objective: "Melhora de contorno e proporção glandular; em contexto selecionado, pode ser discutido como intervenção adjuvante para hipersensibilidade/ejaculação precoce, sem substituir terapias de primeira linha.",
    anatomicalPlane: "Plano subepitelial / lâmina própria superficial da glande, respeitando a vascularização intensa, o meato uretral e o corpo esponjoso.",
    distribution: "Pequenos depósitos superficiais e simétricos em leque ou micropunções, com volumes conservadores e inspeção constante da perfusão.",
    mainRisk: "Isquemia ou necrose de mucosa por excesso de volume, pressão ou injeção intravascular; edema, assimetria e nódulos também podem ocorrer.",
    shouldNotBeConfusedWith: "Não é preenchimento circunferencial da haste e não deve ser extrapolado para o corpo esponjoso, meato ou planos profundos da glande.",
  },
};

export function getPenileFillerGuidance(entryId: string): PenileFillerGuidance | null {
  return entryId in guidanceByEntry
    ? guidanceByEntry[entryId as PenileFillerEntryId]
    : null;
}

export function isPenileFillerEntry(entryId: string): entryId is PenileFillerEntryId {
  return penileFillerEntryIds.includes(entryId as PenileFillerEntryId);
}
