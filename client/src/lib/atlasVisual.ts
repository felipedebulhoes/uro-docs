import type { AtlasEntry, AtlasFigure } from "@/data/atlasData";

export type AtlasVisualFilter = "technique" | "complication" | "diagnostic";

export const atlasVisualFilterMeta: Record<
  AtlasVisualFilter,
  { label: string; shortLabel: string }
> = {
  technique: { label: "Técnica cirúrgica", shortLabel: "Técnica" },
  complication: { label: "Complicações e resgate", shortLabel: "Complicação" },
  diagnostic: { label: "Imagem diagnóstica", shortLabel: "Diagnóstico" },
};

const filterTerms: Record<AtlasVisualFilter, string[]> = {
  technique: [
    "technique", "surgical", "laparoscopic", "robotic", "endoscopic",
    "incision", "access", "dissection", "anastomosis", "resection",
    "enucleation", "implant", "reconstruction", "suture", "ligature",
    "puncture", "pyeloplasty", "ureteroscopy", "micro",
  ],
  complication: [
    "complication", "salvage", "rescue", "perforation", "leak",
    "extravasation", "bleeding", "hemorrhage", "pseudoaneurysm", "avulsion",
    "infection", "erosion", "fistula", "dehiscence", "emphysema", "recurrence",
    "hematoma", "injury", "necrosis", "urgency", "emergency",
  ],
  diagnostic: [
    "ultrasound", "doppler", "ct", "tomography", "cystogram", "mri",
    "angiography", "renogram", "uroflow", "biopsy", "pathology", "mag3",
    "functional", "follow-up", "followup", "radiology", "imaging",
  ],
};

function figureText(figure: AtlasFigure) {
  return `${figure.caption} ${figure.description ?? ""} ${figure.searchTerms}`.toLowerCase();
}

export function figureMatchesVisualFilter(
  figure: AtlasFigure,
  filter: AtlasVisualFilter,
) {
  const text = figureText(figure);
  return filterTerms[filter].some((term) => text.includes(term));
}

export function entryMatchesVisualFilter(
  entry: AtlasEntry,
  filter: AtlasVisualFilter | null,
) {
  return filter === null || entry.figures.some((figure) => figureMatchesVisualFilter(figure, filter));
}

export function visualFiltersForEntry(entry: AtlasEntry): AtlasVisualFilter[] {
  return (Object.keys(atlasVisualFilterMeta) as AtlasVisualFilter[]).filter((filter) =>
    entryMatchesVisualFilter(entry, filter),
  );
}

export type AtlasUrgencyAlert = {
  title: string;
  description: string;
};

const urgencyAlerts: Record<string, AtlasUrgencyAlert> = {
  "priapismo-isquemico": {
    title: "Urgência urológica: priapismo isquêmico",
    description:
      "Ereção dolorosa persistente exige avaliação e tratamento imediatos. O atraso pode comprometer irreversivelmente a função erétil.",
  },
  "ureterolitotripsia-flexivel": {
    title: "Alerta pós-operatório: febre, calafrios ou dor intensa",
    description:
      "Após ureteroscopia, sintomas sistêmicos ou dor refratária podem sinalizar obstrução infectada, lesão ureteral ou sepse e justificam avaliação urológica urgente.",
  },
  "ureterolitotripsia-rigida": {
    title: "Alerta pós-operatório: febre, calafrios ou dor intensa",
    description:
      "Após ureteroscopia, sintomas sistêmicos ou dor refratária podem sinalizar obstrução infectada, lesão ureteral ou sepse e justificam avaliação urológica urgente.",
  },
  "nefrolitotripsia-percutanea": {
    title: "Alerta pós-NLP: sangramento ou sinais de infecção",
    description:
      "Hematúria intensa com instabilidade, febre, calafrios ou dor progressiva pode indicar hemorragia relevante, obstrução ou sepse e requer avaliação urgente.",
  },
  "rtu-prostata": {
    title: "Alerta pós-RTU-P: retenção por coágulos ou sintomas sistêmicos",
    description:
      "Hematúria volumosa, retenção urinária, confusão, náuseas persistentes ou dispneia devem motivar avaliação imediata para sangramento, perfuração ou distúrbio hidroeletrolítico.",
  },
  "holep": {
    title: "Alerta pós-HoLEP: dor abdominal, febre ou distensão",
    description:
      "Dor progressiva, distensão abdominal, febre ou instabilidade podem indicar extravasamento de irrigação, perfuração ou infecção e exigem reavaliação urgente.",
  },
};

export function getAtlasUrgencyAlert(entryId: string): AtlasUrgencyAlert | undefined {
  return urgencyAlerts[entryId];
}
