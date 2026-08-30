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

export type AtlasSubspecialty =
  | "endourology"
  | "prostate"
  | "oncology"
  | "andrology"
  | "functional"
  | "imaging"
  | "urgency";

export const atlasSubspecialtyMeta: Record<AtlasSubspecialty, { label: string }> = {
  endourology: { label: "Endourologia" },
  prostate: { label: "Próstata" },
  oncology: { label: "Oncologia" },
  andrology: { label: "Andrologia" },
  functional: { label: "Funcional" },
  imaging: { label: "Imagem" },
  urgency: { label: "Urgência" },
};

export type AtlasEvidenceFilter = "guideline" | "high" | "moderate" | "limited";

export const atlasEvidenceFilterMeta: Record<AtlasEvidenceFilter, { label: string }> = {
  guideline: { label: "Diretriz / consenso" },
  high: { label: "Evidência alta" },
  moderate: { label: "Evidência moderada" },
  limited: { label: "Evidência limitada" },
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

export function getAtlasSubspecialty(entry: AtlasEntry): AtlasSubspecialty {
  if (entry.category === "Urgência") return "urgency";
  if (entry.category.includes("Imagem") || entry.category.includes("Diagnóstico") || entry.id.startsWith("usg-")) return "imaging";
  if (entry.category === "Endourologia") return "endourology";
  if (entry.category === "Próstata") return "prostate";
  if (entry.category === "Oncologia") return "oncology";
  if (entry.category === "Funcional") return "functional";
  return "andrology";
}

export function getAtlasEvidenceLevel(entry: AtlasEntry): AtlasEvidenceFilter {
  const evidence = entry.evidence.toLowerCase();
  if (/diretriz|guideline|consenso/.test(evidence)) return "guideline";
  if (/revisão sistemática|meta-análise|meta analise|ensaio clínico|nível 1|evidência alta/.test(evidence)) return "high";
  if (/moderad|nível 2|coorte|prospectiv/.test(evidence)) return "moderate";
  return "limited";
}

export type FollowUpMilestone = {
  timing: string;
  title: string;
  description: string;
};

const followUpTimelines: Record<string, FollowUpMilestone[]> = {
  "postectomia-circuncisao-no-adulto": [
    { timing: "24–48 h", title: "Curativo", description: "Retirada do curativo compressivo e revisão de sangramento ou edema importante." },
    { timing: "7–14 dias", title: "Cicatrização", description: "Consulta para avaliar dor, infecção, deiscência e alinhamento da linha de sutura." },
    { timing: "4–6 semanas", title: "Retorno gradual", description: "Reavaliação antes da retomada de atividade sexual, conforme cicatrização." },
  ],
  "varicocelectomia-subinguinal-microcirurgica": [
    { timing: "7–14 dias", title: "Revisão de ferida", description: "Avaliação de hematoma, infecção, dor persistente e retorno progressivo às atividades." },
    { timing: "3 meses", title: "Controle seminal", description: "Espermograma após ciclo completo de espermatogênese e reavaliação clínica." },
    { timing: "6 meses", title: "Desfecho reprodutivo", description: "Repetir avaliação seminal e discutir resposta, fertilidade e necessidade de estratégia adicional." },
  ],
  "prostatectomia-radical": [
    { timing: "7–14 dias", title: "Cateter e ferida", description: "Revisão pós-operatória conforme evolução e protocolo da equipe; avaliar cicatrização e sinais de extravasamento." },
    { timing: "6–12 semanas", title: "PSA inicial e função", description: "Dosagem de PSA, avaliação de continência e início ou ajuste de reabilitação funcional quando indicada." },
    { timing: "A cada 6–12 meses", title: "Vigilância", description: "Seguimento oncológico com PSA seriado e reavaliação de continência e função sexual." },
  ],
  "pieloplastia": [
    { timing: "4–6 semanas", title: "Dispositivo e sintomas", description: "Revisão de cateter ou stent quando presente e avaliação de dor, infecção e recuperação clínica." },
    { timing: "3 meses", title: "Imagem de controle", description: "Ultrassom e estudo funcional conforme indicação para documentar desobstrução da JUP." },
    { timing: "6–12 meses", title: "Função renal", description: "Reavaliar sintomas, dilatação residual e função diferencial quando necessário." },
  ],
  "nefrolitotripsia-percutanea": [
    { timing: "Dias iniciais", title: "Drenagem e segurança", description: "Avaliar nefrostomia ou stent, hematúria, febre, dor e sinais de sangramento significativo." },
    { timing: "4–12 semanas", title: "Stone-free", description: "Imagem de controle para fragmentos residuais e planejamento de abordagem complementar se indicada." },
    { timing: "6–12 meses", title: "Prevenção", description: "Investigação metabólica e estratégia preventiva de recorrência para pacientes selecionados." },
  ],
  "holep": [
    { timing: "1–2 semanas", title: "Recuperação inicial", description: "Avaliação de hematúria, disúria, infecção, retenção e sintomas irritativos." },
    { timing: "6–12 semanas", title: "Resultado funcional", description: "Documentar IPSS, QoL, Qmax, resíduo pós-miccional e continência." },
    { timing: "6–12 meses", title: "Desfecho sustentado", description: "Revisar satisfação, função miccional e necessidade de tratamento adicional." },
  ],
  "sling-masculino": [
    { timing: "1–2 semanas", title: "Ferida e restrições", description: "Avaliar cicatrização, dor, infecção e adesão às restrições físicas iniciais." },
    { timing: "6–12 semanas", title: "Continência", description: "Quantificar absorventes, impacto funcional e sintomas urinários." },
    { timing: "3–6 meses", title: "Desfecho funcional", description: "Reavaliar continência, satisfação e necessidade de investigação ou estratégia complementar." },
  ],
  "implante-de-protese-peniana-inflavel-de-3-volumes": [
    { timing: "1–2 semanas", title: "Ferida e infecção", description: "Examinar incisão, edema, hematoma, dor e sinais de infecção protética." },
    { timing: "4–6 semanas", title: "Ativação orientada", description: "Ensinar ciclagem ou ativação do dispositivo conforme cicatrização e protocolo da equipe." },
    { timing: "3 meses", title: "Função e satisfação", description: "Avaliar uso do dispositivo, satisfação e complicações mecânicas ou infecciosas." },
  ],
};

export function getFollowUpTimeline(entryId: string): FollowUpMilestone[] {
  return followUpTimelines[entryId] ?? [];
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
  "orquidopexia-na-torcao-testicular-exploracao-escrotal-de-urg": {
    title: "Urgência escrotal: nova dor intensa ou edema progressivo",
    description:
      "Após exploração escrotal, dor súbita intensa, aumento rápido do volume escrotal, febre ou alteração importante de cor exigem reavaliação imediata para excluir hematoma, infecção ou sofrimento testicular.",
  },
  "hidrocelectomia-tecnicas-de-jaboulay-e-lord": {
    title: "Alerta pós-operatório escrotal: hematoma em expansão ou febre",
    description:
      "Aumento rápido do volume escrotal, dor desproporcional, drenagem purulenta ou febre podem indicar hematoma relevante ou infecção e justificam avaliação urológica urgente.",
  },
  "orquiectomia-radical-inguinal-tumor-de-testiculo": {
    title: "Alerta pós-orquiectomia: sangramento, febre ou dor progressiva",
    description:
      "Hematoma inguinal ou escrotal em expansão, febre, secreção de ferida ou dor que piora progressivamente requerem avaliação precoce para excluir sangramento ou infecção pós-operatória.",
  },
  "rtu-bexiga": {
    title: "Alerta pós-RTU-B: retenção, hematúria intensa ou febre",
    description:
      "Coágulos com dificuldade para urinar, sangramento volumoso, dor abdominal crescente, febre ou calafrios podem sinalizar obstrução, perfuração ou infecção e exigem avaliação imediata.",
  },
  "nefrectomia-parcial": {
    title: "Alerta pós-nefrectomia parcial: hematúria ou instabilidade",
    description:
      "Hematúria importante, tontura, síncope, dor em flanco progressiva, febre ou queda do estado geral podem indicar sangramento, extravasamento urinário ou infecção e requerem avaliação urgente.",
  },
};

export function getAtlasUrgencyAlert(entryId: string): AtlasUrgencyAlert | undefined {
  return urgencyAlerts[entryId];
}
