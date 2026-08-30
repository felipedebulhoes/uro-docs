export type AestheticAftercare = {
  name: string;
  immediate: string;
  firstWeek: string;
  recovery: string;
  release: string;
  warning: string;
};

const guidanceByEntryId: Record<string, AestheticAftercare> = {
  "alongamento-peniano-seccao-do-ligamento-suspensor-ligamentol": {
    name: "Ligamentólise",
    immediate: "Curativo e repouso relativo nos primeiros dias.",
    firstWeek: "Revisão de ferida e controle de edema.",
    recovery: "Iniciar tração conforme protocolo do cirurgião.",
    release: "Atividade sexual geralmente após 4–6 semanas.",
    warning: "Dor progressiva, alteração de cor, sangramento ou deiscência exigem contato precoce.",
  },
  "faloplastia-de-aumento-espessamento-peniano-com-enxerto-derm": {
    name: "Enxerto dermogorduroso",
    immediate: "Proteger a haste e o sítio doador com curativos prescritos.",
    firstWeek: "Avaliar viabilidade do enxerto, edema e área doadora.",
    recovery: "Evitar atrito e atividade física intensa durante a integração.",
    release: "Retorno sexual apenas após cicatrização e liberação clínica.",
    warning: "Febre, secreção, áreas arroxeadas ou sofrimento do enxerto requerem avaliação imediata.",
  },
  "aumento-peniano-com-preenchimento-de-acido-hialuronico": {
    name: "Preenchimento de haste com AH",
    immediate: "Curativo leve e compressão conforme orientação individual.",
    firstWeek: "Modelagem suave somente se prescrita e revisão de simetria.",
    recovery: "Evitar pressão, ciclismo e exercício intenso no período inicial.",
    release: "Abstinência sexual usualmente por 3–4 semanas.",
    warning: "Dor intensa, palidez, livedo, bolhas ou escurecimento são sinais de urgência.",
  },
  "aumento-de-glande-com-acido-hialuronico": {
    name: "Preenchimento de glande com AH",
    immediate: "Manter o curativo leve e observar a coloração da glande.",
    firstWeek: "Revisão precoce para edema, nódulos e simetria.",
    recovery: "Evitar atrito, masturbação e atividade física intensa.",
    release: "Abstinência sexual usualmente por 3–4 semanas.",
    warning: "Palidez, dor desproporcional, bolhas ou áreas escuras exigem avaliação urgente.",
  },
  "lipoaspiracao-suprapubica-e-correcao-de-penis-enterrado-no-a": {
    name: "Reconstrução de pênis enterrado",
    immediate: "Preservar curativo, drenos ou bolster conforme a técnica realizada.",
    firstWeek: "Revisar enxerto, ferida, micção e sinais de infecção.",
    recovery: "Higiene, mobilização progressiva e cuidado com áreas doadoras.",
    release: "Atividade sexual somente após cicatrização e liberação clínica.",
    warning: "Febre, mau odor, sangramento, perda de enxerto ou dificuldade miccional requerem contato imediato.",
  },
  "escrotoplastia-scrotal-lift-lifting-escrotal-estetico": {
    name: "Escrotoplastia",
    immediate: "Gelo indireto, elevação e suspensório escrotal conforme prescrição.",
    firstWeek: "Revisar hematoma, edema, ferida e conforto testicular.",
    recovery: "Manter suporte e evitar corrida, ciclismo e esforço.",
    release: "Atividade sexual geralmente após 4–6 semanas.",
    warning: "Aumento rápido do volume escrotal, dor intensa, febre ou deiscência são sinais de alerta.",
  },
  "circuncisao-estetica-revisao-de-circuncisao": {
    name: "Circuncisão estética",
    immediate: "Curativo não aderente e controle de edema conforme prescrição.",
    firstWeek: "Higiene gentil e revisão da linha de sutura.",
    recovery: "Evitar fricção e atividades que tensionem a ferida.",
    release: "Atividade sexual geralmente após 4–6 semanas.",
    warning: "Sangramento persistente, retenção urinária, secreção ou necrose exigem contato imediato.",
  },
};

export function getAestheticAftercare(entryId: string): AestheticAftercare | null {
  return guidanceByEntryId[entryId] ?? null;
}

export const aestheticComparison = [
  {
    title: "Estética",
    accent: "dourado",
    trigger: "Desejo de proporção ou aparência após avaliação de expectativas e função preservada.",
    goal: "Harmonia de contorno e satisfação informada, sem prometer mudança funcional.",
  },
  {
    title: "Reconstrutiva",
    accent: "azul",
    trigger: "Trauma, pênis enterrado, cicatriz, infecção, anomalia ou sequela que afete função, higiene ou dor.",
    goal: "Restaurar exposição, micção, cicatrização, conforto e função sexual quando possível.",
  },
] as const;
