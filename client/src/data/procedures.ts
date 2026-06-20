// UroDocx — Documentos Cirúrgicos Urológicos
// Dr. Felipe Bulhões — Identidade Visual: Azul do Nilo + Tema Claro
// Descrições cirúrgicas em formato NUMERADO e OBJETIVO
import { proceduresExtra } from "./proceduresExtra";

export interface ConfigField {
  id: string;
  label: string;
  type: "select" | "text" | "number" | "calculated";
  options?: string[];
  defaultValue: string;
  placeholder?: string;
  // For type="calculated": function that receives current config and returns a CalcResult
  calculate?: (config: Record<string, string>) => CalcResult;
}

export interface CalcResult {
  probability: number;        // 0-100 (%)
  probLabel: string;          // e.g. "~78%"
  timeEstimate: string;       // e.g. "1–2 semanas"
  recommendation: string;     // short clinical recommendation
  color: "green" | "yellow" | "orange" | "red";  // visual indicator
  details: string[];          // bullet points with supporting data
}

export interface Procedure {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  category: string;
  configFields: ConfigField[];
  templates: {
    descricao: (config: Record<string, string>) => string;
    posOperatorio: (config: Record<string, string>) => string;
    receitaAlta: (config: Record<string, string>) => string;
    orientacoes: (config: Record<string, string>) => string;
  };
}

export const procedures: Procedure[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. URETEROLITOTRIPSIA RÍGIDA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ureterolitotripsia-rigida",
    name: "Ureterolitotripsia Rígida",
    shortName: "ULT Rígida",
    icon: "⚡",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda", "bilateral"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "raquianestesia"], defaultValue: "raquianestesia" },
      { id: "localizacao", label: "Localização do Cálculo", type: "select", options: ["terço distal", "terço médio", "terço proximal", "JUV (junção uretero-vesical)"], defaultValue: "terço distal" },
      { id: "tamanho_calculo", label: "Tamanho do Cálculo (mm)", type: "text", defaultValue: "8", placeholder: "Ex: 8" },
      { id: "mucosa", label: "Mucosa Ureteral", type: "select", options: ["íntegra", "edemaciada", "com sinais de impactação"], defaultValue: "íntegra" },
      { id: "duplo_j", label: "Cateter Duplo J", type: "select", options: ["Sim - 6Fr x 26cm", "Sim - 6Fr x 24cm", "Sim - 7Fr x 26cm", "Não implantado"], defaultValue: "Sim - 6Fr x 26cm" },
      { id: "fragmentacao", label: "Método de Fragmentação", type: "select", options: ["Laser Holmium", "Laser Thulium", "Balístico (pneumático)"], defaultValue: "Laser Holmium" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Perfuração ureteral mínima", "Migração de fragmento para rim", "Sangramento moderado"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Ureterolitotripsia Rígida ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Cistoscopia com identificação dos meatos ureterais.
4. Passagem de fio guia hidrofílico pelo meato ureteral ${c.lateralidade} até pelve renal, sob fluoroscopia.
5. Introdução do ureteroscópio rígido sobre o fio guia.
6. Identificação de cálculo de ${c.tamanho_calculo} mm em ${c.localizacao} do ureter ${c.lateralidade}. Mucosa ${c.mucosa}.
7. Fragmentação do cálculo com ${c.fragmentacao}.
8. Extração de fragmentos com cesta (basket). Poeira residual para eliminação espontânea.${c.duplo_j !== "Não implantado" ? `\n9. Implante de cateter Duplo J (${c.duplo_j.replace("Sim - ", "")}) sob controle fluoroscópico.` : ""}
10. Revisão hemostática e esvaziamento vesical.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → líquida → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV (diluído em 100mL SF) se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Escopolamina 20mg IV 8/8h se cólica/espasmos vesicais.
8. SSVV 4/4h.
9. Deambulação precoce após recuperação motora.
10. Alta prevista após aceitação de dieta e controle da dor.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 3-5 dias (com alimento).
3. Tansulosina 0,4mg ––– 01 cáps VO ao dia, após jantar${c.duplo_j !== "Não implantado" ? " (enquanto com DJ)" : ""}.
4. Pyridium 100mg ––– 01 drágea VO 8/8h por 3 dias se ardência urinária.
5. Ciprofloxacino 500mg ––– 01 cp VO 12/12h por 5 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Ureterolitotripsia Rígida ${c.lateralidade}.

REPOUSO: Repouso relativo por 3-5 dias. Evitar esforço físico, peso >5kg e atividade sexual${c.duplo_j !== "Não implantado" ? " enquanto com DJ" : " por 7 dias"}.

HIDRATAÇÃO: 2-3 litros de água/dia.
${c.duplo_j !== "Não implantado" ? `
CATETER DUPLO J — É NORMAL:
• Vontade frequente de urinar.
• Ardência ao urinar.
• Dor lombar ou em baixo ventre ao urinar.
• Urina rosada/avermelhada, especialmente após esforço.

RETIRADA: O DJ DEVE ser retirado na data agendada (1-3 semanas).
` : ""}
SINAIS DE ALERTA (Procurar PS):
• Febre >38°C ou calafrios.
• Dor intensa refratária às medicações.
• Sangramento intenso com coágulos.
• Impossibilidade de urinar.

RETORNO: ___ dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. URETEROLITOTRIPSIA FLEXÍVEL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ureterolitotripsia-flexivel",
    name: "Ureterolitotripsia Flexível",
    shortName: "ULT Flexível",
    icon: "🔄",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda", "bilateral"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "raquianestesia"], defaultValue: "anestesia geral" },
      { id: "localizacao", label: "Localização do Cálculo", type: "select", options: ["pelve renal", "cálice inferior", "cálice médio", "cálice superior", "JUP (junção uretero-piélica)"], defaultValue: "cálice inferior" },
      { id: "tamanho_calculo", label: "Tamanho do Cálculo (mm)", type: "text", defaultValue: "12", placeholder: "Ex: 12" },
      { id: "mucosa", label: "Mucosa", type: "select", options: ["íntegra", "edemaciada", "com sinais inflamatórios"], defaultValue: "íntegra" },
      { id: "bainha_acesso", label: "Bainha de Acesso Ureteral", type: "select", options: ["Sim - 12/14 Fr", "Sim - 10/12 Fr", "Não utilizada"], defaultValue: "Sim - 12/14 Fr" },
      { id: "duplo_j", label: "Cateter Duplo J", type: "select", options: ["Sim - 6Fr x 26cm", "Sim - 6Fr x 24cm", "Sim - 7Fr x 26cm", "Não implantado"], defaultValue: "Sim - 6Fr x 26cm" },
      { id: "fragmentacao", label: "Método de Fragmentação", type: "select", options: ["Laser Holmium (dusting)", "Laser Holmium (fragmentação)", "Laser Thulium Fiber"], defaultValue: "Laser Holmium (dusting)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado", "Lesão de mucosa", "Fragmento residual significativo"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Ureterolitotripsia Flexível ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Cistoscopia com identificação dos meatos ureterais.
4. Passagem de fio guia hidrofílico pelo meato ureteral ${c.lateralidade} até pelve renal, sob fluoroscopia.${c.bainha_acesso !== "Não utilizada" ? `\n5. Introdução de bainha de acesso ureteral (${c.bainha_acesso.replace("Sim - ", "")}) sob fluoroscopia.` : ""}
6. Introdução do ureteroscópio flexível e navegação até ${c.localizacao}.
7. Identificação de cálculo de ${c.tamanho_calculo} mm. Mucosa ${c.mucosa}.
8. Fragmentação com ${c.fragmentacao}.
9. Extração de fragmentos com cesta (basket). Poeira residual para eliminação espontânea.${c.duplo_j !== "Não implantado" ? `\n10. Implante de cateter Duplo J (${c.duplo_j.replace("Sim - ", "")}) sob controle fluoroscópico.` : ""}
11. Revisão hemostática e esvaziamento vesical.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → líquida → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV (diluído em 100mL SF) se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Escopolamina 20mg IV 8/8h se cólica/espasmos vesicais.
8. SSVV 4/4h.
9. Deambulação precoce.
10. Alta prevista após aceitação de dieta e controle da dor.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 3-5 dias (com alimento).
3. Tansulosina 0,4mg ––– 01 cáps VO ao dia, após jantar${c.duplo_j !== "Não implantado" ? " (enquanto com DJ)" : ""}.
4. Pyridium 100mg ––– 01 drágea VO 8/8h por 3 dias se ardência.
5. Ciprofloxacino 500mg ––– 01 cp VO 12/12h por 5 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Ureterolitotripsia Flexível ${c.lateralidade}.

REPOUSO: Repouso relativo por 3-5 dias. Evitar esforço, peso >5kg e atividade sexual${c.duplo_j !== "Não implantado" ? " enquanto com DJ" : " por 7 dias"}.

HIDRATAÇÃO: 2-3 litros de água/dia.
${c.duplo_j !== "Não implantado" ? `
CATETER DUPLO J — É NORMAL:
• Vontade frequente de urinar.
• Ardência ao urinar.
• Dor lombar ou em baixo ventre ao urinar.
• Urina rosada/avermelhada.

RETIRADA: O DJ DEVE ser retirado na data agendada (1-3 semanas).
` : ""}
SINAIS DE ALERTA (Procurar PS):
• Febre >38°C ou calafrios.
• Dor intensa refratária.
• Sangramento intenso com coágulos.
• Impossibilidade de urinar.

RETORNO: ___ dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. CISTOSCOPIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cistoscopia",
    name: "Cistoscopia Diagnóstica / Retirada de Duplo J",
    shortName: "Cistoscopia",
    icon: "🔍",
    category: "Endourologia",
    configFields: [
      { id: "tipo_procedimento", label: "Tipo de Procedimento", type: "select", options: ["Cistoscopia diagnóstica", "Cistoscopia com retirada de Duplo J", "Cistoscopia com biópsia vesical"], defaultValue: "Cistoscopia com retirada de Duplo J" },
      { id: "lateralidade_dj", label: "Lateralidade do DJ", type: "select", options: ["à direita", "à esquerda", "N/A (diagnóstica)"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia local com gel de lidocaína", "sedação", "raquianestesia"], defaultValue: "sedação" },
      { id: "tipo_cistoscopio", label: "Tipo de Cistoscópio", type: "select", options: ["flexível", "rígido"], defaultValue: "rígido" },
      { id: "achados_bexiga", label: "Achados da Bexiga", type: "select", options: ["mucosa de aspecto normal", "mucosa com trabeculações de esforço", "lesão papilífera identificada", "mucosa com áreas de hiperemia", "presença de cálculo vesical"], defaultValue: "mucosa de aspecto normal" },
      { id: "achados_uretra", label: "Achados da Uretra", type: "select", options: ["uretra pérvia, sem estenoses", "uretra com estenose em bulbar", "uretra com estenose em meato", "próstata com lobos laterais aumentados"], defaultValue: "uretra pérvia, sem estenoses" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve", "Falsa via (não ocorreu)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: ${c.tipo_procedimento}${c.lateralidade_dj !== "N/A (diagnóstica)" ? ` ${c.lateralidade_dj}` : ""}
Anestesia: ${c.anestesia}

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Introdução do cistoscópio ${c.tipo_cistoscopio} sob visão direta.
4. Inspeção da uretra: ${c.achados_uretra}.
5. Inspeção da bexiga: ${c.achados_bexiga}. Óstios ureterais tópicos, ejaculando urina clara.${c.tipo_procedimento.includes("Duplo J") ? `\n6. Identificação da extremidade vesical do cateter DJ ${c.lateralidade_dj}.\n7. Apreensão com pinça de corpo estranho e remoção por completo.` : ""}${c.tipo_procedimento.includes("biópsia") ? `\n6. Biópsia da lesão com pinça fria. Material enviado para anatomopatológico.` : ""}
8. Esvaziamento vesical e retirada do aparelho.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial.

1. Observação por 1-2h.
2. Dipirona 1g VO se dor.
3. Liberação após micção espontânea sem dificuldade.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Pyridium 100mg ––– 01 drágea VO 8/8h por 1-2 dias se ardência.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: ${c.tipo_procedimento}${c.lateralidade_dj !== "N/A (diagnóstica)" ? ` ${c.lateralidade_dj}` : ""}.

SINTOMAS ESPERADOS: Ardência ao urinar e urina rosada por 24-48h.

CUIDADOS:
• Beber bastante água.
• Evitar esforço físico por 24h.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Impossibilidade de urinar por >6h.
• Sangramento que piora após 48h.

RETORNO: ___ dias${c.tipo_procedimento.includes("biópsia") ? " (resultado da biópsia)" : ""}.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. RTU DE BEXIGA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "rtu-bexiga",
    name: "Ressecção Transuretral de Bexiga (RTU-B)",
    shortName: "RTU-B",
    icon: "🎯",
    category: "Oncologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral", "raquianestesia + sedação"], defaultValue: "raquianestesia" },
      { id: "localizacao_lesao", label: "Localização da Lesão", type: "select", options: ["parede lateral direita", "parede lateral esquerda", "parede posterior", "teto (cúpula)", "assoalho", "trígono", "colo vesical", "múltiplas lesões"], defaultValue: "parede lateral direita" },
      { id: "aspecto_lesao", label: "Aspecto da Lesão", type: "select", options: ["vegetante/papilífera", "séssil", "plana (flat)", "mista (papilífera + séssil)"], defaultValue: "vegetante/papilífera" },
      { id: "tamanho_lesao", label: "Tamanho da Lesão (cm)", type: "text", defaultValue: "2", placeholder: "Ex: 2" },
      { id: "numero_lesoes", label: "Número de Lesões", type: "select", options: ["única", "2 lesões", "3 lesões", "múltiplas (>3)"], defaultValue: "única" },
      { id: "resseccao_muscular", label: "Ressecção da Muscular", type: "select", options: ["incluindo camada muscular própria (estadiamento)", "até a lâmina própria", "ressecção profunda até gordura perivesical"], defaultValue: "incluindo camada muscular própria (estadiamento)" },
      { id: "ostios", label: "Óstios Ureterais", type: "select", options: ["tópicos e ejaculando urina clara", "próximos à lesão (preservados)", "envolvidos pela lesão"], defaultValue: "tópicos e ejaculando urina clara" },
      { id: "sonda", label: "Sonda Vesical", type: "select", options: ["SVD 3 vias 20Fr com irrigação contínua", "SVD 3 vias 22Fr com irrigação contínua", "SVD 2 vias 18Fr"], defaultValue: "SVD 3 vias 20Fr com irrigação contínua" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Perfuração vesical extraperitoneal", "Sangramento moderado controlado", "Estímulo do nervo obturador"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Ressecção Transuretral de Tumor de Bexiga (RTU-B)
Anestesia: ${c.anestesia}

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Introdução do ressectoscópio sob visão direta.
4. Inspeção da uretra e próstata: sem alterações obstrutivas.
5. Inspeção da bexiga: lesão ${c.aspecto_lesao}, ~${c.tamanho_lesao} cm, ${c.numero_lesoes}, em ${c.localizacao_lesao}. Óstios ureterais ${c.ostios}.
6. Ressecção completa da(s) lesão(ões), ${c.resseccao_muscular}.
7. Hemostasia rigorosa do leito com eletrocautério.
8. Extração dos fragmentos com evacuador de Ellik. Material enviado para AP (tumor + base em frascos separados).
9. Passagem de ${c.sonda}, balão com 30mL AD.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.
3. Irrigação vesical contínua: SF 0,9% — manter efluente claro/rosado.
4. Dipirona 1g IV 6/6h.
5. Cetoprofeno 100mg IV 12/12h.
6. Escopolamina 20mg IV 8/8h se espasmos vesicais.
7. Ondansetrona 4mg IV 8/8h se náuseas.
8. Enoxaparina 40mg SC 1x/dia (12h pós-op, se indicado).
9. SSVV 4/4h. Balanço hídrico rigoroso.
10. Suspender irrigação quando efluente claro por >2h.
11. Retirada da SVD conforme evolução (24-48h).`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Nitrofurantoína 100mg ––– 01 cáps VO 12/12h por 5 dias.
3. Pyridium 100mg ––– 01 drágea VO 8/8h por 3 dias se ardência.
4. Macrogol ––– 01 sachê diluído em água 1x/dia se constipação.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: RTU de Tumor de Bexiga — lesão em ${c.localizacao_lesao}.

REPOUSO: Evitar esforço e peso por 15-20 dias. Abstinência sexual por 15 dias.

HIDRATAÇÃO: 2-3 litros de água/dia.

SANGRAMENTO: Comum entre 10º-14º dia (queda da "crosta" vesical). Aumente líquidos e repouse.

INTESTINO: Manter funcionante. NÃO fazer força para evacuar.

ACOMPANHAMENTO ONCOLÓGICO: Retorno FUNDAMENTAL para resultado do AP e definição de tratamento complementar (BCG intravesical, cistoscopias de controle).

SINAIS DE ALERTA (Procurar PS):
• Sangramento intenso com retenção urinária.
• Febre >38°C.
• Dor abdominal intensa.

RETORNO: ___ dias (resultado AP).`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. RTU DE PRÓSTATA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "rtu-prostata",
    name: "Ressecção Transuretral da Próstata (RTU-P)",
    shortName: "RTU-P",
    icon: "⚙️",
    category: "Próstata",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "raquianestesia + sedação", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "tamanho_ressectoscopio", label: "Ressectoscópio", type: "select", options: ["24 Fr", "26 Fr", "28 Fr"], defaultValue: "26 Fr" },
      { id: "achados_prostata", label: "Achados da Próstata", type: "select", options: ["lobos laterais e mediano aumentados", "lobos laterais aumentados, mediano pouco proeminente", "lobo mediano predominante", "próstata trilobulada volumosa"], defaultValue: "lobos laterais e mediano aumentados" },
      { id: "achados_bexiga", label: "Achados da Bexiga", type: "select", options: ["trabeculações de esforço", "trabeculações + divertículos", "bexiga de aspecto normal", "presença de cálculos vesicais"], defaultValue: "trabeculações de esforço" },
      { id: "sonda", label: "Sonda Vesical", type: "select", options: ["SVD 3 vias 20Fr", "SVD 3 vias 22Fr", "SVD 3 vias 24Fr"], defaultValue: "SVD 3 vias 22Fr" },
      { id: "balao", label: "Volume do Balão (mL)", type: "select", options: ["30", "40", "50", "60"], defaultValue: "40" },
      { id: "tracao", label: "Tração da Sonda", type: "select", options: ["Sim, por 2 horas", "Sim, por 4 horas", "Não realizada"], defaultValue: "Sim, por 2 horas" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado controlado", "Perfuração capsular mínima", "Síndrome pós-RTU (não ocorreu)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Ressecção Transuretral da Próstata (RTU-P)
Anestesia: ${c.anestesia}

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Lubrificação uretral e introdução do ressectoscópio ${c.tamanho_ressectoscopio}.
4. Inspeção da uretra: sem estenoses.
5. Inspeção da bexiga: ${c.achados_bexiga}.
6. Achados prostáticos: ${c.achados_prostata}, ocluindo a uretra prostática.
7. Ressecção dos lobos prostáticos (laterais e mediano) desde o colo vesical até o verumontanum, com preservação do esfíncter externo.
8. Hemostasia minuciosa do leito prostático com eletrocautério.
9. Extração dos fragmentos com evacuador de Ellik. Material para AP.
10. Passagem de ${c.sonda}, balão com ${c.balao}mL AD. Irrigação vesical contínua com SF 0,9%.${c.tracao !== "Não realizada" ? `\n11. Tração da sonda na coxa (${c.tracao.replace("Sim, por ", "")}).` : ""}

Intercorrências: ${c.complicacoes}. Efluente claro ao final.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.
3. Irrigação vesical contínua: SF 0,9% — manter efluente claro/rosado.
4. Dipirona 1g IV 6/6h.
5. Escopolamina 20mg IV 8/8h se espasmos vesicais.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Enoxaparina 40mg SC 1x/dia (12h pós-op, se indicado).
8. SSVV 4/4h. Balanço hídrico rigoroso.${c.tracao !== "Não realizada" ? `\n9. Tração da sonda: manter por ${c.tracao.replace("Sim, por ", "")} e liberar.` : ""}
10. Suspender irrigação quando efluente claro por >2h.
11. Retirada da SVD conforme evolução (48-72h).`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Nitrofurantoína 100mg ––– 01 cáps VO 12/12h por 7 dias.
3. Pyridium 100mg ––– 01 drágea VO 8/8h por 3 dias se ardência.
4. Macrogol ––– 01 sachê diluído em água 1x/dia se constipação.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: RTU de Próstata (RTU-P).

REPOUSO: Repouso relativo por 15-30 dias. Não dirigir por 1-2 semanas. Não pegar peso >5kg. Abstinência sexual por 30 dias.

SANGRAMENTO: Normal urina rosada/coágulos por 3-4 semanas, especialmente após esforço. Se ocorrer: aumente água e repouse.

INTESTINO: Manter funcionante. NÃO fazer força para evacuar.

HIDRATAÇÃO: 2-3 litros de água/dia.

SINTOMAS URINÁRIOS: Ardência, urgência e aumento da frequência são comuns após retirada da sonda. Melhora em semanas.

EJACULAÇÃO RETRÓGRADA: Comum após RTU-P. Não prejudicial à saúde.

SINAIS DE ALERTA (Procurar PS):
• Impossibilidade de urinar.
• Sangramento intenso (urina cor de vinho) com coágulos.
• Febre >38°C.

RETORNO: ___ dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. NEFROLITOTRIPSIA PERCUTÂNEA (NLP)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "nefrolitotripsia-percutanea",
    name: "Nefrolitotripsia Percutânea (NLP)",
    shortName: "NLP",
    icon: "💎",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "anestesia geral + peridural"], defaultValue: "anestesia geral" },
      { id: "posicao", label: "Posição", type: "select", options: ["decúbito ventral (prona)", "decúbito modificado de Valdivia (supina)", "decúbito lateral (Galdakao)"], defaultValue: "decúbito ventral (prona)" },
      { id: "calice_puncao", label: "Cálice de Punção", type: "select", options: ["cálice inferior", "cálice médio", "cálice superior", "acesso intercostal (supracostal)"], defaultValue: "cálice inferior" },
      { id: "guia_puncao", label: "Guia de Punção", type: "select", options: ["fluoroscopia", "ultrassom", "fluoroscopia + ultrassom"], defaultValue: "fluoroscopia" },
      { id: "dilatacao", label: "Dilatação do Trajeto", type: "select", options: ["Amplatz até 30Fr", "Amplatz até 24Fr (mini-perc)", "balão dilatador até 30Fr"], defaultValue: "Amplatz até 30Fr" },
      { id: "tipo_calculo", label: "Tipo/Localização do Cálculo", type: "select", options: ["cálculo pélvico", "cálculo coraliforme parcial", "cálculo coraliforme completo", "cálculo calicial inferior", "cálculo calicial múltiplo"], defaultValue: "cálculo pélvico" },
      { id: "tamanho_calculo", label: "Tamanho do Cálculo (mm)", type: "text", defaultValue: "25", placeholder: "Ex: 25" },
      { id: "fragmentacao", label: "Fragmentação", type: "select", options: ["ultrassônico", "Laser Holmium", "balístico (pneumático)", "combinado (ultrassônico + balístico)"], defaultValue: "ultrassônico" },
      { id: "duplo_j", label: "Cateter DJ Anterógrado", type: "select", options: ["Sim", "Não"], defaultValue: "Sim" },
      { id: "nefrostomia", label: "Nefrostomia", type: "select", options: ["Sim - 14Fr", "Sim - 16Fr", "Sim - 18Fr", "Tubeless (sem nefrostomia)"], defaultValue: "Sim - 16Fr" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado controlado", "Perfuração de sistema coletor", "Lesão pleural (hidrotórax)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Nefrolitotripsia Percutânea ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em litotomia para passagem de cateter ureteral ${c.lateralidade}.
2. Reposicionamento em ${c.posicao}.
3. Antissepsia, assepsia e colocação de campos estéreis.
4. Punção do ${c.calice_puncao} guiada por ${c.guia_puncao}.
5. Confirmação do acesso com injeção de contraste.
6. Dilatação do trajeto com ${c.dilatacao}.
7. Introdução do nefroscópio. Identificação de ${c.tipo_calculo} de ~${c.tamanho_calculo} mm.
8. Fragmentação com energia ${c.fragmentacao} e extração dos fragmentos.
9. Revisão calicial — stone free / fragmentos residuais mínimos.${c.duplo_j === "Sim" ? "\n10. Passagem de cateter Duplo J anterógrado." : ""}${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? `\n11. Colocação de nefrostomia ${c.nefrostomia.replace("Sim - ", "")} no trajeto, fixada com fio inabsorvível.` : ""}
12. Curativo compressivo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 6h → líquida → geral conforme aceitação.
2. SF 0,9% 1500 mL IV em 24h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV (diluído) se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Cefazolina 1g IV 8/8h (24h).
8. Enoxaparina 40mg SC 1x/dia.
9. SSVV 4/4h. Controle de diurese.${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? "\n10. Cuidados com nefrostomia: manter pérvio, anotar débito." : ""}
11. Hemograma de controle em 6-12h.
12. RX simples (KUB) no 1º PO.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 5 dias (com alimento).
3. Ciprofloxacino 500mg ––– 01 cp VO 12/12h por 7 dias.
4. Macrogol ––– 01 sachê 1x/dia se constipação.${c.duplo_j === "Sim" ? "\n5. Tansulosina 0,4mg ––– 01 cáps VO ao dia, após jantar (enquanto com DJ)." : ""}`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Nefrolitotripsia Percutânea ${c.lateralidade}.

REPOUSO: Repouso relativo por 15 dias. Evitar esforço, peso e atividade sexual.
${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? `
NEFROSTOMIA (sonda nas costas):
• Lavar local com água e sabão diariamente.
• Secar e cobrir com gaze limpa.
• Não puxar ou tracionar.
• Urina avermelhada na bolsa é esperado.
• Esvaziar bolsa regularmente.
` : ""}
HIDRATAÇÃO: 2-3 litros de água/dia.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C ou calafrios.
• Dor intensa refratária.
• Sangramento volumoso.${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? "\n• Saída acidental da nefrostomia." : ""}

RETORNO: ___ dias (retirada de nefrostomia e/ou DJ).`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. POSTECTOMIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "postectomia",
    name: "Postectomia (Circuncisão)",
    shortName: "Postectomia",
    icon: "✂️",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["bloqueio peniano com lidocaína 2% s/ vasoconstritor", "sedação + bloqueio peniano", "raquianestesia"], defaultValue: "bloqueio peniano com lidocaína 2% s/ vasoconstritor" },
      { id: "indicacao", label: "Indicação", type: "select", options: ["fimose", "parafimose", "balanopostite de repetição", "estética/religiosa", "condiloma/lesão prepucial"], defaultValue: "fimose" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["convencional (sleeve)", "dispositivo (Anel/Gomco)", "grampeador (stapler)"], defaultValue: "convencional (sleeve)" },
      { id: "fio_sutura", label: "Fio de Sutura", type: "select", options: ["Monocryl 4-0 (pontos separados)", "Catgut simples 4-0 (pontos separados)", "Vicryl Rapide 4-0 (pontos separados)"], defaultValue: "Monocryl 4-0 (pontos separados)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado", "Edema moderado"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Postectomia (Circuncisão)
Indicação: ${c.indicacao}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Realização de ${c.anestesia}.
4. Demarcação da linha de incisão.
5. Técnica ${c.tecnica} com exérese do anel prepucial.
6. Hemostasia rigorosa com bisturi elétrico.
7. Síntese das bordas com ${c.fio_sutura}.
8. Curativo compressivo com gaze e fita.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial.

1. Observação por 1h.
2. Dipirona 1g VO se dor.
3. Gelo local (sobre curativo) 15min de 2/2h nas primeiras 6h.
4. Alta com curativo compressivo — retirar em 24-48h.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor, por 3-5 dias.
2. Ibuprofeno 600mg ––– 01 cp VO 8/8h por 3 dias (com alimento) se dor moderada.
3. Cefalexina 500mg ––– 01 cp VO 6/6h por 7 dias.

Uso Tópico:
4. Nebacetin (ou Mupirocina) pomada ––– aplicar fina camada 2x/dia sobre a ferida, após higiene, por 7 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Postectomia por ${c.indicacao}.

CURATIVO: Retirar após 24-48h, molhando a gaze durante o banho.

HIGIENE: Lavar com água e sabonete neutro diariamente. Secar com toques leves. Aplicar pomada prescrita.

EDEMA: Normal ficar inchado e arroxeado por 1-2 semanas.

PONTOS: Absorvíveis — caem sozinhos em 10-20 dias.

ATIVIDADE SEXUAL: Abstinência por 30 dias.

SINAIS DE ALERTA (Procurar PS):
• Sangramento que não para com compressão por 10min.
• Secreção purulenta com odor fétido.
• Febre >38°C.
• Dor extrema refratária.

RETORNO: ___ dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. VARICOCELECTOMIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "varicocelectomia",
    name: "Varicocelectomia Subinguinal Microcirúrgica",
    shortName: "Varicocelectomia",
    icon: "🔬",
    category: "Andrologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à esquerda", "à direita", "bilateral"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral", "sedação + bloqueio local"], defaultValue: "raquianestesia" },
      { id: "tecnica", label: "Técnica/Acesso", type: "select", options: ["subinguinal microcirúrgica", "inguinal (Ivanissevich)", "laparoscópica (Palomo)"], defaultValue: "subinguinal microcirúrgica" },
      { id: "grau", label: "Grau da Varicocele", type: "select", options: ["Grau I", "Grau II", "Grau III"], defaultValue: "Grau III" },
      { id: "veias_ligadas", label: "Nº de Veias Ligadas", type: "text", defaultValue: "4", placeholder: "Ex: 4" },
      { id: "arteria", label: "Artéria Testicular", type: "select", options: ["identificada e preservada", "não identificada (preservação de vasos arteriais)"], defaultValue: "identificada e preservada" },
      { id: "linfaticos", label: "Linfáticos", type: "select", options: ["identificados e preservados", "não visualizados claramente"], defaultValue: "identificados e preservados" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Varicocelectomia ${c.tecnica} ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Incisão subinguinal ${c.lateralidade} (~3cm) sobre o anel inguinal externo.
4. Dissecção por planos até identificação do funículo espermático.
5. Abertura da fáscia espermática e identificação das estruturas sob magnificação óptica (microscópio).
6. Identificação e ligadura de ${c.veias_ligadas} veias espermáticas dilatadas (varicocele ${c.grau}).
7. Artéria testicular: ${c.arteria}.
8. Linfáticos: ${c.linfaticos}.
9. Ducto deferente: identificado e preservado.
10. Revisão hemostática. Fechamento por planos. Curativo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial / Day clinic.

1. Observação por 2-4h.
2. Dipirona 1g VO se dor.
3. Gelo local (sobre curativo) 15min de 2/2h nas primeiras 12h.
4. Alta após deambulação e boa aceitação de dieta.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor, por 5 dias.
2. Ibuprofeno 600mg ––– 01 cp VO 8/8h por 5 dias (com alimento).
3. Cefalexina 500mg ––– 01 cp VO 6/6h por 7 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Varicocelectomia ${c.lateralidade}.

REPOUSO: Repouso relativo por 7-10 dias. Evitar esforço físico e peso >5kg por 15 dias.

CUECA: Usar cueca tipo boxer/sunga (suporte escrotal) por 15 dias.

GELO: Aplicar gelo local 15min de 2/2h nas primeiras 48h.

ATIVIDADE SEXUAL: Abstinência por 15 dias.

FERIDA: Manter limpa e seca. Pontos absorvíveis caem em 10-15 dias.

SINAIS DE ALERTA (Procurar PS):
• Aumento progressivo do volume escrotal (hematoma).
• Febre >38°C.
• Secreção purulenta na ferida.

RETORNO: ___ dias. Espermograma de controle em 3 meses.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 9. ORQUIECTOMIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "orquiectomia",
    name: "Orquiectomia Radical Inguinal",
    shortName: "Orquiectomia",
    icon: "🏥",
    category: "Oncologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à direita" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "indicacao", label: "Indicação", type: "select", options: ["tumor testicular", "orquiectomia subcapsular bilateral (bloqueio androgênico)", "testículo atrófico/não viável"], defaultValue: "tumor testicular" },
      { id: "achados", label: "Achados", type: "select", options: ["massa testicular sólida endurecida", "testículo aumentado de volume com nódulo palpável", "testículo atrófico", "testículo de aspecto normal (orquiectomia subcapsular)"], defaultValue: "massa testicular sólida endurecida" },
      { id: "protese", label: "Prótese Testicular", type: "select", options: ["Não implantada", "Implantada (silicone)"], defaultValue: "Não implantada" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Orquiectomia Radical Inguinal ${c.lateralidade}
Indicação: ${c.indicacao}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Incisão inguinal ${c.lateralidade} (~5cm) sobre o canal inguinal.
4. Dissecção por planos até identificação do funículo espermático.
5. Clampeamento precoce do funículo espermático (controle vascular proximal).
6. Exteriorização do testículo pela incisão inguinal.
7. Achados: ${c.achados}.
8. Ligadura e secção do funículo espermático com fio inabsorvível (dupla ligadura).
9. Peça enviada para anatomopatológico.${c.protese !== "Não implantada" ? "\n10. Implante de prótese testicular de silicone na bolsa escrotal." : ""}
11. Revisão hemostática. Fechamento por planos. Curativo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Ondansetrona 4mg IV 8/8h se náuseas.
6. Enoxaparina 40mg SC 1x/dia (se indicado).
7. SSVV 4/4h.
8. Gelo local 15min de 2/2h.
9. Alta prevista em 24h se boa evolução.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor, por 5 dias.
2. Ibuprofeno 600mg ––– 01 cp VO 8/8h por 5 dias (com alimento).
3. Cefalexina 500mg ––– 01 cp VO 6/6h por 7 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Orquiectomia Radical Inguinal ${c.lateralidade} por ${c.indicacao}.

REPOUSO: Repouso relativo por 10-15 dias. Evitar esforço e peso >5kg por 20 dias.

CUECA: Usar cueca de suporte escrotal por 15 dias.

GELO: Aplicar gelo local 15min de 2/2h nas primeiras 48h.

ATIVIDADE SEXUAL: Abstinência por 20 dias.

ACOMPANHAMENTO ONCOLÓGICO: Retorno FUNDAMENTAL para resultado do AP e estadiamento. Exames de marcadores tumorais (AFP, beta-HCG, LDH) e TC de controle serão solicitados.

SINAIS DE ALERTA (Procurar PS):
• Aumento progressivo do volume escrotal/inguinal (hematoma).
• Febre >38°C.
• Secreção purulenta na ferida.

RETORNO: ___ dias (resultado AP).`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 10. HIDROCELECTOMIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "hidrocelectomia",
    name: "Hidrocelectomia (Correção de Hidrocele)",
    shortName: "Hidrocelectomia",
    icon: "💧",
    category: "Andrologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda", "bilateral"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "sedação + bloqueio local", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["eversão da vaginal (Lord)", "excisão e eversão (Jaboulay)", "plicatura da vaginal"], defaultValue: "excisão e eversão (Jaboulay)" },
      { id: "volume", label: "Volume Aspirado (mL)", type: "text", defaultValue: "150", placeholder: "Ex: 150" },
      { id: "aspecto_liquido", label: "Aspecto do Líquido", type: "select", options: ["citrino (amarelo claro)", "hemático", "turvo"], defaultValue: "citrino (amarelo claro)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Hidrocelectomia ${c.lateralidade} — Técnica de ${c.tecnica}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Incisão escrotal transversa ${c.lateralidade} (~4cm).
4. Dissecção por planos até exposição da túnica vaginal.
5. Abertura da vaginal e drenagem do líquido hidrocélico (~${c.volume}mL, aspecto ${c.aspecto_liquido}).
6. Inspeção do testículo e epidídimo: sem alterações.
7. Realização da técnica de ${c.tecnica}.
8. Revisão hemostática. Fechamento por planos com Vicryl 3-0.
9. Curativo compressivo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial / Day clinic.

1. Observação por 2-4h.
2. Dipirona 1g VO se dor.
3. Gelo local (sobre curativo) 15min de 2/2h nas primeiras 12h.
4. Alta após deambulação e boa aceitação de dieta.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor, por 5 dias.
2. Ibuprofeno 600mg ––– 01 cp VO 8/8h por 5 dias (com alimento).
3. Cefalexina 500mg ––– 01 cp VO 6/6h por 7 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Hidrocelectomia ${c.lateralidade}.

REPOUSO: Repouso relativo por 7-10 dias. Evitar esforço e peso >5kg por 15 dias.

CUECA: Usar cueca de suporte escrotal por 15 dias.

GELO: Aplicar gelo local 15min de 2/2h nas primeiras 48h.

EDEMA: Normal inchaço escrotal por 1-3 semanas. Melhora progressiva.

ATIVIDADE SEXUAL: Abstinência por 15 dias.

SINAIS DE ALERTA (Procurar PS):
• Aumento progressivo e tenso do volume escrotal (hematoma).
• Febre >38°C.
• Secreção purulenta na ferida.

RETORNO: ___ dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 11. PROSTATECTOMIA RADICAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "prostatectomia-radical",
    name: "Prostatectomia Radical (Videolaparoscópica/Robótica)",
    shortName: "Prostatectomia Radical",
    icon: "🤖",
    category: "Próstata",
    configFields: [
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["videolaparoscópica", "robótica (Da Vinci)", "aberta retropúbica"], defaultValue: "videolaparoscópica" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "anestesia geral + peridural"], defaultValue: "anestesia geral" },
      { id: "linfadenectomia", label: "Linfadenectomia", type: "select", options: ["estendida bilateral", "limitada bilateral", "não realizada"], defaultValue: "estendida bilateral" },
      { id: "preservacao_nervos", label: "Preservação de Feixes Neurovasculares", type: "select", options: ["bilateral", "unilateral (direito)", "unilateral (esquerdo)", "não realizada (ampla ressecção)"], defaultValue: "bilateral" },
      { id: "anastomose", label: "Anastomose Vesicouretral", type: "select", options: ["contínua com V-Loc 3-0", "pontos separados com Monocryl 3-0", "contínua com Monocryl 3-0"], defaultValue: "contínua com V-Loc 3-0" },
      { id: "dreno", label: "Dreno", type: "select", options: ["Blake 19Fr em fossa ilíaca", "Penrose", "Sem dreno"], defaultValue: "Blake 19Fr em fossa ilíaca" },
      { id: "sonda", label: "Sonda Vesical", type: "select", options: ["SVD 18Fr", "SVD 20Fr"], defaultValue: "SVD 18Fr" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado controlado", "Lesão retal (não ocorreu)", "Lesão ureteral (não ocorreu)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Prostatectomia Radical ${c.via_acesso}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, posição de Trendelenburg.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Acesso ${c.via_acesso === "aberta retropúbica" ? "por incisão mediana infraumbilical" : "com colocação de trocárteres (pneumoperitônio com agulha de Veress)"}.
4. Dissecção do espaço de Retzius.${c.linfadenectomia !== "não realizada" ? `\n5. Linfadenectomia pélvica ${c.linfadenectomia}. Material enviado para AP.` : ""}
6. Incisão da fáscia endopélvica bilateralmente.
7. Ligadura do complexo venoso dorsal.
8. Secção do colo vesical e dissecção das vesículas seminais.
9. Dissecção dos feixes neurovasculares: preservação ${c.preservacao_nervos}.
10. Secção da uretra ao nível do ápice prostático.
11. Retirada da peça (próstata + vesículas seminais). Enviada para AP.
12. Anastomose vesicouretral ${c.anastomose} sobre SVD ${c.sonda.replace("SVD ", "")}.
13. Teste de estanqueidade da anastomose.${c.dreno !== "Sem dreno" ? `\n14. Colocação de dreno ${c.dreno}.` : ""}
15. Revisão hemostática. Fechamento por planos. Curativo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 6h → líquida → geral conforme aceitação.
2. SF 0,9% 1500 mL IV em 24h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Enoxaparina 40mg SC 1x/dia.
8. SSVV 4/4h. Balanço hídrico.${c.dreno !== "Sem dreno" ? "\n9. Controle de débito do dreno (retirar quando <100mL/24h)." : ""}
10. Deambulação precoce (6-12h pós-op).
11. SVD: manter por 7-14 dias (retirada ambulatorial).
12. Hemograma de controle em 6-12h.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 5 dias (com alimento).
3. Ciprofloxacino 500mg ––– 01 cp VO 12/12h por 7 dias.
4. Enoxaparina 40mg ––– 01 seringa SC 1x/dia por ___ dias (conforme indicação).
5. Macrogol ––– 01 sachê 1x/dia se constipação.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Prostatectomia Radical ${c.via_acesso}.

SONDA VESICAL: Será mantida por 7-14 dias. Cuidados:
• Manter bolsa coletora abaixo do nível da bexiga.
• Higiene do meato com água e sabão.
• Não tracionar.

REPOUSO: Evitar esforço e peso >5kg por 30 dias. Não dirigir por 15 dias.

DEAMBULAÇÃO: Caminhar desde o 1º dia — prevenção de trombose.

INCONTINÊNCIA: Após retirada da sonda, é NORMAL ter escape de urina. Melhora progressiva em semanas a meses. Exercícios de Kegel são fundamentais.

FUNÇÃO ERÉTIL: Recuperação gradual (meses). Depende da preservação dos feixes neurovasculares.

ACOMPANHAMENTO ONCOLÓGICO: PSA de controle em 6 semanas. Retorno para resultado do AP.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor abdominal intensa ou distensão.
• Sangramento pela sonda ou ferida.
• Sinais de TVP (dor/inchaço em panturrilha).

RETORNO: ___ dias (retirada da sonda). Resultado AP em ___ dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 12. VASECTOMIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "vasectomia",
    name: "Vasectomia",
    shortName: "Vasectomia",
    icon: "🔒",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia local (lidocaína 2% s/ vasoconstritor)", "sedação + bloqueio local"], defaultValue: "anestesia local (lidocaína 2% s/ vasoconstritor)" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["convencional (2 incisões)", "sem bisturi (no-scalpel)", "incisão única mediana"], defaultValue: "sem bisturi (no-scalpel)" },
      { id: "metodo_oclusao", label: "Método de Oclusão", type: "select", options: ["ligadura + cauterização + interposição de fáscia", "ligadura + excisão de segmento + interposição de fáscia", "clipes de titânio + cauterização"], defaultValue: "ligadura + cauterização + interposição de fáscia" },
      { id: "segmento_enviado", label: "Segmento para AP", type: "select", options: ["Sim (bilateral)", "Não"], defaultValue: "Sim (bilateral)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado", "Hematoma mínimo"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Vasectomia bilateral — Técnica ${c.tecnica}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Palpação e fixação do ducto deferente bilateralmente.
4. Infiltração anestésica local perifunicular bilateral.
5. Acesso ao deferente por técnica ${c.tecnica}.
6. Isolamento do ducto deferente direito. ${c.metodo_oclusao}. Excisão de segmento (~1cm).
7. Isolamento do ducto deferente esquerdo. ${c.metodo_oclusao}. Excisão de segmento (~1cm).${c.segmento_enviado === "Sim (bilateral)" ? "\n8. Segmentos enviados para confirmação anatomopatológica." : ""}
9. Revisão hemostática. Fechamento da pele (pontos ou aproximação). Curativo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial.

1. Observação por 30-60min.
2. Dipirona 1g VO se dor.
3. Gelo local 15min de 2/2h nas primeiras 6h.
4. Alta imediata.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor, por 3 dias.
2. Ibuprofeno 600mg ––– 01 cp VO 8/8h por 3 dias (com alimento).`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Vasectomia bilateral.

REPOUSO: Repouso relativo por 3-5 dias. Evitar esforço e peso >5kg por 7 dias.

CUECA: Usar cueca de suporte por 7 dias.

GELO: Aplicar gelo local 15min de 2/2h nas primeiras 48h.

ATIVIDADE SEXUAL: Abstinência por 7 dias.

IMPORTANTE — CONTRACEPÇÃO:
A vasectomia NÃO é imediata! Ainda há espermatozoides no canal. MANTER MÉTODO CONTRACEPTIVO até confirmação de azoospermia no espermograma (após 20 ejaculações ou 3 meses).

SINAIS DE ALERTA (Procurar PS):
• Aumento progressivo do volume escrotal (hematoma).
• Febre >38°C.
• Secreção purulenta.

RETORNO: ___ dias. Espermograma de controle em 3 meses (ou após 20 ejaculações).`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 13. LITOTRIPSIA EXTRACORPÓREA (LECO)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "leco",
    name: "Litotripsia Extracorpórea por Ondas de Choque (LECO)",
    shortName: "LECO",
    icon: "🌊",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "localizacao", label: "Localização do Cálculo", type: "select", options: ["pelve renal", "cálice inferior", "cálice médio", "cálice superior", "ureter proximal", "JUP"], defaultValue: "pelve renal" },
      { id: "tamanho_calculo", label: "Tamanho do Cálculo (mm)", type: "text", defaultValue: "10", placeholder: "Ex: 10" },
      { id: "numero_choques", label: "Nº de Choques", type: "text", defaultValue: "3000", placeholder: "Ex: 3000" },
      { id: "energia", label: "Energia Máxima", type: "text", defaultValue: "18kV", placeholder: "Ex: 18kV" },
      { id: "analgesia", label: "Analgesia", type: "select", options: ["sedação leve", "anestesia local + sedação", "sem sedação (analgesia VO prévia)"], defaultValue: "sedação leve" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Hematúria esperada", "Dor moderada durante sessão"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Litotripsia Extracorpórea por Ondas de Choque (LECO) ${c.lateralidade}
Analgesia: ${c.analgesia}

1. Paciente em decúbito dorsal.
2. Localização do cálculo de ~${c.tamanho_calculo} mm em ${c.localizacao} ${c.lateralidade} por fluoroscopia/ultrassom.
3. Acoplamento do transdutor com gel.
4. Aplicação de ${c.numero_choques} choques, energia progressiva até ${c.energia}.
5. Controle fluoroscópico ao final: fragmentação parcial/total do cálculo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial.

1. Observação por 30-60min.
2. Dipirona 1g VO se dor.
3. Alta imediata.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 3 dias (com alimento).
3. Tansulosina 0,4mg ––– 01 cáps VO ao dia, após jantar, por 15 dias (facilitar eliminação).`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: LECO — cálculo de ${c.tamanho_calculo}mm em ${c.localizacao} ${c.lateralidade}.

HIDRATAÇÃO: Beber 2-3 litros de água/dia para ajudar a eliminar os fragmentos.

HEMATÚRIA: Normal urina rosada/avermelhada por 24-48h.

ATIVIDADE: Retorno normal às atividades em 24-48h.

ELIMINAÇÃO: Pode sentir cólica leve ao eliminar fragmentos. Usar coador de urina para coletar fragmentos (análise).

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor intensa tipo cólica que não melhora com medicações.
• Impossibilidade de urinar.
• Hematúria intensa com coágulos.

RETORNO: ___ dias com exame de imagem de controle.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 14. SLING MASCULINO / ESFÍNCTER ARTIFICIAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "sling-masculino",
    name: "Sling Masculino (Incontinência Pós-Prostatectomia)",
    shortName: "Sling Masculino",
    icon: "🎗️",
    category: "Funcional",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "tipo_sling", label: "Tipo de Sling", type: "select", options: ["AdVance XP", "ATOMS", "Virtue (quadruple sling)"], defaultValue: "AdVance XP" },
      { id: "grau_incontinencia", label: "Grau de Incontinência", type: "select", options: ["leve (1-2 absorventes/dia)", "moderada (3-5 absorventes/dia)"], defaultValue: "moderada (3-5 absorventes/dia)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve", "Retenção urinária transitória"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Implante de Sling Masculino (${c.tipo_sling})
Indicação: Incontinência urinária de esforço pós-prostatectomia (${c.grau_incontinencia})
Anestesia: ${c.anestesia}

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Sondagem vesical com SVD 16Fr.
4. Incisão perineal mediana (~4cm).
5. Dissecção até identificação da uretra bulbar.
6. Posicionamento da tela do sling (${c.tipo_sling}) sob a uretra bulbar.
7. Passagem dos braços do sling pela membrana obturadora bilateralmente.
8. Tensionamento adequado da tela (compressão uretral sem obstrução).
9. Teste de continência intraoperatório (manobra de Valsalva com bexiga cheia).
10. Revisão hemostática. Fechamento por planos. Curativo.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Cefazolina 1g IV 8/8h (24h).
6. SSVV 4/4h.
7. SVD: manter por 24-48h.
8. Alta prevista em 24-48h após micção espontânea.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor, por 5 dias.
2. Ibuprofeno 600mg ––– 01 cp VO 8/8h por 5 dias (com alimento).
3. Cefalexina 500mg ––– 01 cp VO 6/6h por 7 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Implante de Sling Masculino (${c.tipo_sling}).

REPOUSO: Evitar esforço, peso >5kg e atividade sexual por 30 dias.

RESULTADO: A melhora da continência pode ser gradual (semanas). Não se preocupe se ainda houver escape nos primeiros dias.

NÃO FAZER: Bicicleta ou exercícios que comprimam o períneo por 6 semanas.

SINAIS DE ALERTA (Procurar PS):
• Impossibilidade de urinar (retenção).
• Febre >38°C.
• Dor perineal intensa.
• Secreção purulenta.

RETORNO: ___ dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 15. IMPLANTE DE PRÓTESE PENIANA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "protese-peniana",
    name: "Implante de Prótese Peniana",
    shortName: "Prótese Peniana",
    icon: "🏆",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "tipo_protese", label: "Tipo de Prótese", type: "select", options: ["inflável 3 peças (AMS 700 / Coloplast Titan)", "inflável 2 peças (AMS Ambicor)", "maleável (semirrígida)"], defaultValue: "inflável 3 peças (AMS 700 / Coloplast Titan)" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["penoescrotal", "infrapúbica", "subcoronal"], defaultValue: "penoescrotal" },
      { id: "tamanho_cilindros", label: "Tamanho dos Cilindros (cm)", type: "text", defaultValue: "20", placeholder: "Ex: 20" },
      { id: "reservatorio", label: "Reservatório", type: "select", options: ["retropúbico (Retzius)", "submuscular (ectópico)", "N/A (maleável)"], defaultValue: "retropúbico (Retzius)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Crossover corrigido", "Perfuração uretral (não ocorreu)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Implante de Prótese Peniana — ${c.tipo_protese}
Via de acesso: ${c.via_acesso}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal.
2. Tricotomia. Antissepsia rigorosa (solução alcoólica + aquosa). Campos estéreis.
3. Antibioticoprofilaxia: Vancomicina + Gentamicina IV.
4. Sondagem vesical com SVD 16Fr.
5. Incisão ${c.via_acesso} (~4-5cm).
6. Exposição dos corpos cavernosos bilateralmente.
7. Corporotomia bilateral e dilatação dos corpos cavernosos (proximal e distal).
8. Medição dos corpos cavernosos: ${c.tamanho_cilindros}cm.
9. Lavagem dos corpos cavernosos com solução antibiótica.
10. Inserção dos cilindros (${c.tamanho_cilindros}cm) bilateralmente.${c.tipo_protese.includes("inflável 3") ? `\n11. Criação de espaço para reservatório em posição ${c.reservatorio}. Colocação do reservatório.\n12. Posicionamento da bomba na bolsa escrotal (entre os testículos).` : ""}${c.tipo_protese.includes("inflável 2") ? "\n11. Posicionamento da bomba na bolsa escrotal." : ""}
13. Conexão dos componentes e teste de funcionamento (insuflação/desinsuflação).
14. Fechamento das corporotomias. Revisão hemostática.
15. Fechamento por planos. Curativo compressivo. Prótese mantida insuflada.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV se dor refratária.
6. Vancomicina 1g IV 12/12h (24-48h).
7. Gentamicina 240mg IV 1x/dia (24h).
8. Enoxaparina 40mg SC 1x/dia.
9. SSVV 4/4h.
10. SVD: retirar em 24h.
11. Manter prótese insuflada por 7-10 dias (prevenir hematoma).
12. Gelo local.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 8/8h por 7 dias (com alimento).
3. Cefalexina 500mg ––– 01 cp VO 6/6h por 10 dias.
4. Macrogol ––– 01 sachê 1x/dia se constipação.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento: Implante de Prótese Peniana (${c.tipo_protese}).

PRÓTESE INSUFLADA: Manter insuflada por 7-10 dias (conforme orientação). Após, iniciar ciclos de desinsuflação/insuflação diários.

REPOUSO: Evitar esforço e peso >5kg por 30 dias.

ATIVIDADE SEXUAL: Abstinência por 6 semanas. Após liberação, iniciar uso gradual.

EDEMA: Normal inchaço peniano/escrotal por 2-4 semanas.

CICLO DE ATIVAÇÃO: Após 4-6 semanas, treinar diariamente a bomba (insuflar e desinsuflar) para prevenir contratura capsular.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Secreção purulenta ou extrusão de componente.
• Dor intensa progressiva.
• Eritema e calor excessivo no pênis/escroto.

RETORNO: ___ dias.`
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // 16. NEFRECTOMIA RADICAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "nefrectomia-radical",
    name: "Nefrectomia Radical (Videolaparoscópica)",
    shortName: "Nefrectomia Radical",
    icon: "🫘",
    category: "Oncologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "anestesia geral + peridural"], defaultValue: "anestesia geral" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["Videolaparoscópica transperitoneal", "Videolaparoscópica retroperitoneal", "Aberta (lombotomia)", "Robótica"], defaultValue: "Videolaparoscópica transperitoneal" },
      { id: "indicacao_nefr", label: "Indicação", type: "select", options: ["Carcinoma de Células Renais (CCR)", "Carcinoma Urotelial de pelve renal", "Rim não funcionante (pionefrose)", "Rim não funcionante (hidronefrose grau IV)"], defaultValue: "Carcinoma de Células Renais (CCR)" },
      { id: "tamanho_tumor", label: "Tamanho do Tumor (cm)", type: "text", defaultValue: "6", placeholder: "Ex: 6" },
      { id: "linfadenectomia", label: "Linfadenectomia", type: "select", options: ["Não realizada", "Hilar", "Hilar + para-aórtica/paracaval"], defaultValue: "Não realizada" },
      { id: "adrenalectomia_conj", label: "Adrenalectomia Ipsilateral", type: "select", options: ["Não", "Sim (tumor polo superior >7cm)"], defaultValue: "Não" },
      { id: "dreno", label: "Dreno", type: "select", options: ["Penrose no leito renal", "Blake 19Fr no leito renal", "Sem dreno"], defaultValue: "Penrose no leito renal" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento controlado", "Lesão de órgão adjacente"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Nefrectomia Radical ${c.lateralidade}
Via: ${c.via_acesso}
Anestesia: ${c.anestesia}

1. Paciente em posição de decúbito lateral (lado contralateral) com coxim.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Pneumoperitônio com agulha de Veress (pressão 15mmHg).
4. Inserção de trocateres: óptica 10mm (paraumbilical), 12mm (mão dominante), 5mm (auxiliar), 5mm (retração hepática/esplênica).
5. Rebatimento do cólon (manobra de Cattell-Braasch ${c.lateralidade === "à direita" ? "à direita" : "à esquerda"}).
6. Identificação e dissecção do pedículo renal.
7. Ligadura da artéria renal com Hem-o-lok x3 (proximal) e x2 (distal), secção.
8. Ligadura da veia renal com Hem-o-lok x3 e x2, secção.
9. Dissecção do rim com gordura perirrenal (fáscia de Gerota íntegra).${c.linfadenectomia !== "Não realizada" ? `\n10. Linfadenectomia ${c.linfadenectomia}.` : ""}${c.adrenalectomia_conj === "Sim (tumor polo superior >7cm)" ? "\n11. Adrenalectomia ipsilateral (tumor polo superior >7cm)." : ""}
12. Liberação do ureter até cruzamento com vasos ilíacos, clipagem e secção.
13. Extração da peça em endobag pela ampliação do portal de 12mm.
14. Revisão hemostática do leito operatório.
15. ${c.dreno !== "Sem dreno" ? `Posicionamento de dreno ${c.dreno}.` : "Sem dreno."}
16. Fechamento dos portais por planos.

Peça cirúrgica: Rim ${c.lateralidade} com gordura perirrenal. Tumor de ${c.tamanho_tumor} cm.
Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 6h → líquida clara → branda conforme aceitação.
2. SF 0,9% 1000mL IV em 8h + RL 1000mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 100mg IV (diluído em 100mL SF) 8/8h se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Enoxaparina 40mg SC 1x/dia (iniciar 12h pós-op).
8. Omeprazol 40mg IV 1x/dia.
9. Cefazolina 1g IV 8/8h por 24h.
10. SSVV 4/4h + controle de diurese.
11. Manter SVD por 24h.
12. Débito do dreno: anotar volume e aspecto 6/6h.
13. Deambulação precoce (D1 PO).
14. HMG controle em 6h e D1 PO.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g VO 6/6h por 5 dias.
2. Cetoprofeno 100mg VO 12/12h por 5 dias (após refeições).
3. Tramadol 50mg VO 8/8h se dor intensa (máx 5 dias).
4. Omeprazol 20mg VO 1x/dia em jejum por 14 dias.
5. Enoxaparina 40mg SC 1x/dia por 7 dias (se oncológico).
6. Lactulose 15mL VO 12/12h se constipação.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — NEFRECTOMIA RADICAL

CUIDADOS GERAIS:
• Repouso relativo por 30 dias. Evitar esforço físico e carregar peso >5kg.
• Caminhadas leves a partir de D3 PO.
• Retorno às atividades laborais em 30-45 dias (sem esforço físico).
• Retorno ao exercício físico em 6-8 semanas.

CUIDADOS COM A FERIDA:
• Manter curativos limpos e secos por 48h.
• Após 48h, lavar com água e sabão neutro.
• Retirada de pontos em 10-14 dias.

DIETA:
• Dieta leve nos primeiros 5 dias.
• Hidratação abundante (>2L/dia).
• Evitar alimentos flatulentos nos primeiros 7 dias.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor abdominal intensa ou distensão progressiva.
• Sangramento ativo pela ferida ou hematúria franca.
• Náuseas/vômitos persistentes.
• Ausência de eliminação de gases >48h.

RETORNO: ___ dias.
Anatomopatológico: aguardar resultado em 15-20 dias.`
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // 17. NEFRECTOMIA PARCIAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "nefrectomia-parcial",
    name: "Nefrectomia Parcial (Videolaparoscópica/Robótica)",
    shortName: "Nefrectomia Parcial",
    icon: "🔪",
    category: "Oncologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "anestesia geral + peridural"], defaultValue: "anestesia geral" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["Videolaparoscópica transperitoneal", "Robótica (Da Vinci)", "Aberta (lombotomia)"], defaultValue: "Robótica (Da Vinci)" },
      { id: "tamanho_tumor", label: "Tamanho do Tumor (cm)", type: "text", defaultValue: "3", placeholder: "Ex: 3" },
      { id: "localizacao_tumor", label: "Localização do Tumor", type: "select", options: ["Polo superior", "Mesorrenal", "Polo inferior", "Face anterior", "Face posterior", "Hilar"], defaultValue: "Polo inferior" },
      { id: "renal_score", label: "RENAL Score", type: "text", defaultValue: "6", placeholder: "Ex: 6" },
      { id: "tempo_isquemia", label: "Tempo de Isquemia (min)", type: "text", defaultValue: "18", placeholder: "Ex: 18" },
      { id: "tipo_isquemia", label: "Tipo de Isquemia", type: "select", options: ["Isquemia quente (clamp arterial)", "Zero isquemia (sem clamp)", "Isquemia parcial (clamp seletivo)"], defaultValue: "Isquemia quente (clamp arterial)" },
      { id: "dreno", label: "Dreno", type: "select", options: ["Penrose no leito", "Blake 19Fr", "Sem dreno"], defaultValue: "Penrose no leito" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento controlado", "Abertura de via coletora (rafia)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Nefrectomia Parcial ${c.lateralidade}
Via: ${c.via_acesso}
Anestesia: ${c.anestesia}

1. Paciente em posição de decúbito lateral com coxim.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Pneumoperitônio (15mmHg). Inserção de trocateres conforme técnica habitual.
4. Rebatimento do cólon e exposição do rim ${c.lateralidade}.
5. Dissecção do pedículo renal com identificação da artéria renal.
6. Desencapsulamento do rim na região do tumor.
7. Demarcação da margem de ressecção com eletrocautério (margem de 5mm).
8. Clampeamento da artéria renal (${c.tipo_isquemia}).
9. Ressecção do tumor (${c.tamanho_tumor} cm em ${c.localizacao_tumor}). RENAL Score: ${c.renal_score}.
10. Rafia do leito tumoral em camada interna (via coletora) com Vicryl 3-0 + Hem-o-lok.
11. Rafia da cápsula renal com Vicryl 2-0 sobre Surgicel/bolsters + Hem-o-lok.
12. Desclampeamento arterial. Tempo de isquemia: ${c.tempo_isquemia} minutos.
13. Revisão hemostática. Hemostáticos tópicos (Floseal/Surgicel).
14. ${c.dreno !== "Sem dreno" ? `Posicionamento de dreno ${c.dreno}.` : "Sem dreno."}
15. Extração da peça em endobag.
16. Fechamento dos portais por planos.

Peça: Tumor renal ${c.lateralidade} (${c.tamanho_tumor} cm, ${c.localizacao_tumor}).
Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 6h → líquida clara → branda conforme aceitação.
2. SF 0,9% 1000mL IV em 8h + RL 1000mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 100mg IV 8/8h se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Enoxaparina 40mg SC 1x/dia (iniciar 12h pós-op).
8. Omeprazol 40mg IV 1x/dia.
9. Cefazolina 1g IV 8/8h por 24h.
10. SSVV 4/4h + controle de diurese.
11. Manter SVD por 24h.
12. Débito do dreno: anotar volume e aspecto 6/6h.
13. Deambulação precoce (D1 PO).
14. HMG + Cr + Ur controle em 6h e D1 PO.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g VO 6/6h por 5 dias.
2. Cetoprofeno 100mg VO 12/12h por 5 dias (após refeições).
3. Tramadol 50mg VO 8/8h se dor intensa (máx 5 dias).
4. Omeprazol 20mg VO 1x/dia em jejum por 14 dias.
5. Enoxaparina 40mg SC 1x/dia por 7 dias.
6. Lactulose 15mL VO 12/12h se constipação.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — NEFRECTOMIA PARCIAL

CUIDADOS GERAIS:
• Repouso relativo por 30 dias. Evitar esforço físico e carregar peso >5kg.
• Caminhadas leves a partir de D3 PO.
• Retorno às atividades laborais em 30-45 dias.
• Retorno ao exercício físico em 6-8 semanas.

CUIDADOS COM A FERIDA:
• Manter curativos limpos e secos por 48h.
• Após 48h, lavar com água e sabão neutro.
• Retirada de pontos em 10-14 dias.

FUNÇÃO RENAL:
• Hidratação abundante (>2L/dia).
• Evitar anti-inflamatórios (nefrotóxicos) — usar apenas se prescrito.
• Creatinina de controle em 7 e 30 dias.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor lombar intensa ou abdominal progressiva.
• Hematúria franca com coágulos.
• Sangramento ativo pela ferida.
• Náuseas/vômitos persistentes.

RETORNO: ___ dias.
Anatomopatológico: aguardar resultado em 15-20 dias.`
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // 18. ADRENALECTOMIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "adrenalectomia",
    name: "Adrenalectomia Videolaparoscópica",
    shortName: "Adrenalectomia",
    icon: "🔶",
    category: "Oncologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral"], defaultValue: "anestesia geral" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["Transperitoneal lateral", "Retroperitoneal posterior"], defaultValue: "Transperitoneal lateral" },
      { id: "indicacao_adr", label: "Indicação", type: "select", options: ["Feocromocitoma", "Adenoma produtor de aldosterona (Conn)", "Síndrome de Cushing", "Incidentaloma >4cm", "Metástase adrenal", "Carcinoma adrenocortical"], defaultValue: "Incidentaloma >4cm" },
      { id: "tamanho_lesao", label: "Tamanho da Lesão (cm)", type: "text", defaultValue: "4.5", placeholder: "Ex: 4.5" },
      { id: "dreno", label: "Dreno", type: "select", options: ["Penrose", "Blake 19Fr", "Sem dreno"], defaultValue: "Sem dreno" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento controlado", "Instabilidade hemodinâmica (feocromocitoma)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Adrenalectomia ${c.lateralidade}
Via: ${c.via_acesso}
Anestesia: ${c.anestesia}
Indicação: ${c.indicacao_adr}

1. Paciente em posição de decúbito lateral com coxim.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Pneumoperitônio (12-15mmHg). Inserção de trocateres.
4. ${c.lateralidade === "à direita" ? "Rebatimento hepático com afastador." : "Rebatimento do cólon esquerdo e cauda do pâncreas."}
5. Identificação da glândula adrenal ${c.lateralidade}.
6. Dissecção circunferencial da adrenal com preservação do rim.
7. Identificação e clipagem da veia adrenal central (Hem-o-lok x2 proximal, x1 distal).
8. Secção da veia adrenal.
9. Ligadura dos ramos arteriais com clips/energia (LigaSure/Harmônico).
10. Liberação completa da glândula.
11. Extração da peça em endobag.
12. Revisão hemostática do leito.
13. ${c.dreno !== "Sem dreno" ? `Posicionamento de dreno ${c.dreno}.` : "Sem dreno."}
14. Fechamento dos portais por planos.

Peça: Glândula adrenal ${c.lateralidade} (${c.tamanho_lesao} cm).
Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 4h → líquida → branda conforme aceitação.
2. SF 0,9% 1000mL IV em 8h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV 8/8h se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Enoxaparina 40mg SC 1x/dia (iniciar 12h pós-op).
8. Omeprazol 40mg IV 1x/dia.
9. Cefazolina 1g IV 8/8h por 24h.
10. SSVV 2/2h nas primeiras 12h (PA rigorosa se feocromocitoma).
11. ${c.indicacao_adr === "Feocromocitoma" ? "Monitorização em UTI por 24h. Controle pressórico rigoroso." : "Controle de PA 4/4h."}
12. HMG controle em 6h.
13. Deambulação precoce (D1 PO).`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g VO 6/6h por 5 dias.
2. Cetoprofeno 100mg VO 12/12h por 5 dias (após refeições).
3. Tramadol 50mg VO 8/8h se dor intensa (máx 5 dias).
4. Omeprazol 20mg VO 1x/dia em jejum por 14 dias.${c.indicacao_adr === "Feocromocitoma" ? "\n5. SUSPENDER alfa-bloqueador (Doxazosina) conforme orientação." : ""}${c.indicacao_adr === "Síndrome de Cushing" ? "\n5. Hidrocortisona conforme protocolo de desmame (endocrinologia)." : ""}`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — ADRENALECTOMIA

CUIDADOS GERAIS:
• Repouso relativo por 14-21 dias.
• Caminhadas leves a partir de D2 PO.
• Retorno às atividades laborais em 14-30 dias.

CUIDADOS COM A FERIDA:
• Manter curativos limpos e secos por 48h.
• Retirada de pontos em 10 dias.

ACOMPANHAMENTO HORMONAL:
• ${c.indicacao_adr === "Feocromocitoma" ? "Metanefrinas urinárias/plasmáticas em 4 semanas." : c.indicacao_adr === "Síndrome de Cushing" ? "Cortisol sérico seriado. Desmame de corticoide conforme endocrinologia." : c.indicacao_adr.includes("Conn") ? "Potássio e aldosterona em 4 semanas. Avaliar suspensão de anti-hipertensivos." : "Seguimento conforme anatomopatológico."}

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor abdominal intensa.
• Hipotensão ou tontura persistente.
• Sangramento pela ferida.

RETORNO: ___ dias.`
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // 19. PIELOPLASTIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "pieloplastia",
    name: "Pieloplastia (Videolaparoscópica/Robótica)",
    shortName: "Pieloplastia",
    icon: "🔧",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral"], defaultValue: "anestesia geral" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["Videolaparoscópica transperitoneal", "Robótica (Da Vinci)"], defaultValue: "Robótica (Da Vinci)" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["Anderson-Hynes (desmembrada)", "Fenger (Y-V plasty)"], defaultValue: "Anderson-Hynes (desmembrada)" },
      { id: "vaso_cruzamento", label: "Vaso Anômalo", type: "select", options: ["Sem vaso anômalo", "Vaso polar inferior (transposição anterior)"], defaultValue: "Sem vaso anômalo" },
      { id: "duplo_j", label: "Cateter Duplo J", type: "select", options: ["Sim - 6Fr x 26cm", "Sim - 7Fr x 26cm"], defaultValue: "Sim - 6Fr x 26cm" },
      { id: "dreno", label: "Dreno", type: "select", options: ["Penrose perianastomótico", "Blake 19Fr", "Sem dreno"], defaultValue: "Penrose perianastomótico" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento controlado", "Extravasamento mínimo"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Pieloplastia ${c.lateralidade} — Técnica de ${c.tecnica}
Via: ${c.via_acesso}
Anestesia: ${c.anestesia}

1. Paciente em posição de decúbito lateral com coxim.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Pneumoperitônio (15mmHg). Inserção de trocateres.
4. Rebatimento do cólon e exposição da JUP ${c.lateralidade}.
5. Identificação da junção ureteropélvica (JUP) estenótica.${c.vaso_cruzamento !== "Sem vaso anômalo" ? `\n6. Identificação de ${c.vaso_cruzamento}.` : ""}
7. Secção do ureter abaixo da estenose. Espatulação lateral do ureter proximal (2cm).
8. Ressecção da pelve renal redundante.
9. Anastomose pieloureteral com PDS 4-0 (sutura contínua posterior + anterior).
10. Teste de estanqueidade da anastomose.
11. Passagem anterógrada de cateter Duplo J (${c.duplo_j.replace("Sim - ", "")}).${c.vaso_cruzamento !== "Sem vaso anômalo" ? "\n12. Transposição da anastomose anterior ao vaso." : ""}
13. ${c.dreno !== "Sem dreno" ? `Posicionamento de dreno ${c.dreno}.` : "Sem dreno."}
14. Fechamento dos portais por planos.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 6h → líquida clara → branda conforme aceitação.
2. SF 0,9% 1000mL IV em 8h + RL 1000mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV 8/8h se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Cefazolina 1g IV 8/8h por 24h.
8. Omeprazol 40mg IV 1x/dia.
9. SSVV 4/4h + controle de diurese.
10. Manter SVD por 48h.
11. Débito do dreno: anotar volume 6/6h.
12. Deambulação precoce (D1 PO).
13. HMG + Cr controle D1 PO.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g VO 6/6h por 5 dias.
2. Cetoprofeno 100mg VO 12/12h por 5 dias (após refeições).
3. Tramadol 50mg VO 8/8h se dor intensa (máx 5 dias).
4. Omeprazol 20mg VO 1x/dia em jejum por 14 dias.
5. Ciprofloxacino 500mg VO 12/12h por 7 dias (profilaxia com DJ).`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — PIELOPLASTIA

CUIDADOS GERAIS:
• Repouso relativo por 21 dias. Evitar esforço físico.
• Caminhadas leves a partir de D3 PO.
• Retorno às atividades laborais em 21-30 dias.

CATETER DUPLO J:
• O cateter DJ será retirado em 4-6 semanas por cistoscopia.
• Pode causar: urgência miccional, desconforto lombar ao urinar, hematúria leve.
• Hidratação abundante (>2L/dia).

CUIDADOS COM A FERIDA:
• Manter curativos limpos e secos por 48h.
• Retirada de pontos em 10-14 dias.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor lombar intensa ou abdominal.
• Hematúria franca com coágulos.
• Náuseas/vômitos persistentes.
• Extravasamento de urina pela ferida.

RETORNO: ___ dias.
Retirada do DJ: agendar em 4-6 semanas.`
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // 20. REIMPLANTE URETERAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "reimplante-ureteral",
    name: "Reimplante Ureterovesical (Videolaparoscópico/Robótico)",
    shortName: "Reimplante Ureteral",
    icon: "🔗",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda", "bilateral"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral"], defaultValue: "anestesia geral" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["Videolaparoscópica", "Robótica (Da Vinci)", "Aberta (Pfannenstiel)"], defaultValue: "Robótica (Da Vinci)" },
      { id: "tecnica_reimp", label: "Técnica", type: "select", options: ["Lich-Gregoir (extravesical)", "Cohen (intravesical)", "Politano-Leadbetter", "Psoas hitch", "Boari flap"], defaultValue: "Lich-Gregoir (extravesical)" },
      { id: "indicacao_reimp", label: "Indicação", type: "select", options: ["Estenose ureteral distal", "Lesão iatrogênica de ureter", "Refluxo vesicoureteral grau IV-V", "Reimplante pós-nefrectomia de doador"], defaultValue: "Estenose ureteral distal" },
      { id: "duplo_j", label: "Cateter Duplo J", type: "select", options: ["Sim - 6Fr x 26cm", "Sim - 7Fr x 26cm"], defaultValue: "Sim - 6Fr x 26cm" },
      { id: "dreno", label: "Dreno", type: "select", options: ["Penrose perivesical", "Blake 19Fr", "Sem dreno"], defaultValue: "Penrose perivesical" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento controlado", "Tensão na anastomose"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Reimplante Ureterovesical ${c.lateralidade} — Técnica de ${c.tecnica_reimp}
Via: ${c.via_acesso}
Anestesia: ${c.anestesia}
Indicação: ${c.indicacao_reimp}

1. Paciente em posição de litotomia/Trendelenburg.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. ${c.via_acesso.includes("Aberta") ? "Incisão de Pfannenstiel." : "Pneumoperitônio (15mmHg). Inserção de trocateres."}
4. Identificação do ureter ${c.lateralidade} e dissecção até a porção saudável.
5. Secção do ureter na zona de estenose/lesão. Espatulação.
6. Mobilização da bexiga.${c.tecnica_reimp.includes("Psoas") ? "\n7. Fixação da bexiga ao tendão do psoas (Psoas hitch) com PDS 2-0." : ""}${c.tecnica_reimp.includes("Boari") ? "\n7. Confecção de flap de Boari (retalho vesical tubularizado)." : ""}
8. Cistotomia/detrusorrafia conforme técnica de ${c.tecnica_reimp}.
9. Anastomose ureterovesical com PDS 4-0 (pontos separados), mucosa-mucosa.
10. Passagem de cateter Duplo J (${c.duplo_j.replace("Sim - ", "")}) anterógrado.
11. Fechamento da bexiga em 2 planos (Vicryl 3-0 + PDS 2-0).
12. Teste de estanqueidade vesical.
13. ${c.dreno !== "Sem dreno" ? `Posicionamento de dreno ${c.dreno}.` : "Sem dreno."}
14. Fechamento por planos.

Intercorrências: ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero por 6h → líquida → branda conforme aceitação.
2. SF 0,9% 1000mL IV em 8h + RL 1000mL IV em 12h.
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h.
5. Tramadol 50mg IV 8/8h se dor refratária.
6. Ondansetrona 4mg IV 8/8h se náuseas.
7. Cefazolina 1g IV 8/8h por 24h.
8. Omeprazol 40mg IV 1x/dia.
9. Enoxaparina 40mg SC 1x/dia.
10. SSVV 4/4h + controle de diurese.
11. Manter SVD por 7-10 dias (repouso vesical).
12. Débito do dreno: anotar volume 6/6h.
13. Deambulação precoce (D1 PO).
14. HMG + Cr controle D1 PO.`,

      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g VO 6/6h por 5 dias.
2. Cetoprofeno 100mg VO 12/12h por 5 dias (após refeições).
3. Tramadol 50mg VO 8/8h se dor intensa (máx 5 dias).
4. Omeprazol 20mg VO 1x/dia em jejum por 14 dias.
5. Ciprofloxacino 500mg VO 12/12h enquanto SVD in situ.
6. Manter SVD por ___ dias (retirar conforme orientação).`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — REIMPLANTE URETERAL

CUIDADOS GERAIS:
• Repouso relativo por 21-30 dias.
• Evitar esforço físico e carregar peso >5kg.
• Caminhadas leves a partir de D3 PO.

SONDA VESICAL:
• Manter SVD por 7-10 dias (repouso vesical para cicatrização).
• Cuidados com a sonda: manter bolsa coletora abaixo da bexiga, higiene do meato.
• Retirada conforme agendamento.

CATETER DUPLO J:
• Retirada por cistoscopia em 4-6 semanas.
• Pode causar urgência miccional e desconforto.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor abdominal intensa.
• Urina turva ou fétida.
• Extravasamento de urina pela ferida.
• Obstrução da sonda vesical.

RETORNO: ___ dias.
Retirada da SVD: ___.
Retirada do DJ: 4-6 semanas.`
    }
    },
  // ═══════════════════════════════════════════════════════════════
  // 21. NEFROURETERECTOMIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "nefroureterectomia",
    name: "Nefroureterectomia Radical (Videolaparoscópica)",
    shortName: "Nefroureterectomia",
    icon: "🔴",
    category: "Oncologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "anestesia geral + peridural"], defaultValue: "anestesia geral" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["Videolaparoscópica", "Robótica (Da Vinci)", "Aberta"], defaultValue: "Videolaparoscópica" },
      { id: "indicacao", label: "Indicação", type: "select", options: ["Carcinoma urotelial de pelve renal", "Carcinoma urotelial de ureter", "Tumor de pelve renal de alto grau"], defaultValue: "Carcinoma urotelial de pelve renal" },
      { id: "cuff_vesical", label: "Cuff Vesical", type: "select", options: ["Sim — excisão do cuff vesical", "Não realizado"], defaultValue: "Sim — excisão do cuff vesical" },
      { id: "dreno", label: "Dreno", type: "select", options: ["Penrose em loja renal", "Blake 19Fr em loja renal", "Sem dreno"], defaultValue: "Blake 19Fr em loja renal" },
      { id: "svd", label: "Sonda Vesical", type: "select", options: ["SVD 16Fr", "SVD 18Fr", "SVD 20Fr"], defaultValue: "SVD 18Fr" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento controlado", "Lesão de órgão adjacente"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Nefroureterectomia Radical ${c.lateralidade} com excisão de cuff vesical
Via: ${c.via_acesso}
Anestesia: ${c.anestesia}
Indicação: ${c.indicacao}

1. Paciente em posição de decúbito lateral modificado (${c.lateralidade === "à direita" ? "esquerdo" : "direito"}).
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Passagem de ${c.svd}.
4. Pneumoperitônio (15mmHg). Inserção de trocateres (4 portais).
5. Rebatimento do cólon ${c.lateralidade === "à direita" ? "direito" : "esquerdo"}.
6. Identificação e ligadura da artéria e veia renal com Hem-o-lok/grampeador vascular.
7. Liberação completa do rim com gordura perirrenal (nefrectomia radical).
8. Dissecção do ureter em toda sua extensão até a junção ureterovesical.
9. ${c.cuff_vesical === "Sim — excisão do cuff vesical" ? "Excisão do cuff vesical com grampeador endoscópico ou sutura manual." : "Ligadura e secção do ureter distal."}
10. Sutura vesical em 2 planos (Vicryl 3-0 + PDS 2-0).
11. Revisão de hemostasia.
12. ${c.dreno !== "Sem dreno" ? `Posicionamento de ${c.dreno}.` : "Sem dreno."}
13. Retirada da peça em endobag por incisão de Pfannenstiel.
14. Fechamento por planos.

Intercorrências: ${c.complicacoes}.
Peça enviada para anatomopatológico.`,
      posOperatorio: (c) => `PÓS-OPERATÓRIO IMEDIATO — NEFROURETERECTOMIA RADICAL

1. Dieta zero por 6h → líquidos claros → dieta branda.
2. SF 0,9% 1000mL IV (8/8h) — suspender quando boa aceitação VO.
3. Dipirona 1g IV 6/6h.
4. Tramadol 100mg IV 8/8h (se dor moderada/intensa).
5. Cetoprofeno 100mg IV 12/12h.
6. Ondansetrona 8mg IV 8/8h (se náuseas).
7. Enoxaparina 40mg SC 1x/dia (tromboprofilaxia).
8. Omeprazol 40mg IV 1x/dia.
9. Cuidados com ${c.dreno} — anotar débito.
10. Manter ${c.svd} em drenagem livre.
11. Deambulação precoce (6-12h PO).
12. Controle de diurese.
13. Exames D1: hemograma, creatinina, eletrólitos.`,
      receitaAlta: (c) => `RECEITA DE ALTA — NEFROURETERECTOMIA

1. Dipirona 1g VO 6/6h por 5 dias.
2. Cetoprofeno 100mg VO 12/12h por 5 dias (após refeições).
3. Tramadol 50mg VO 8/8h se dor intensa (por 3 dias — SOS).
4. Omeprazol 20mg VO 1x/dia em jejum por 10 dias.
5. Enoxaparina 40mg SC 1x/dia por 14-28 dias (conforme risco).
6. Lactulose 15mL VO 12/12h se constipação.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — NEFROURETERECTOMIA

CUIDADOS GERAIS:
• Repouso relativo por 30 dias.
• Evitar esforço físico e carregar peso >5kg por 6 semanas.
• Caminhadas leves a partir de D3 PO.
• Manter boa hidratação.
FERIDA OPERATÓRIA:
• Manter curativo limpo e seco por 48h.
• Após 48h, lavar com água e sabão.
• Retirar pontos em 10-14 dias.
DRENO:
• ${c.dreno !== "Sem dreno" ? "Retirada conforme débito (<50mL/24h)." : "Não aplicável."}
SONDA VESICAL:
• Manter ${c.svd} por 7-10 dias (cicatrização do cuff vesical).
• Retirada conforme agendamento.
SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Dor abdominal intensa ou distensão.
• Sangramento ativo pela ferida ou urina.
• Extravasamento de urina.
• Náuseas/vômitos persistentes.
RETORNO: ___ dias.
Anatomopatológico: aguardar resultado em 15-20 dias.`
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // 22. URETROTOMIA INTERNA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "uretrotomia-interna",
    name: "Uretrotomia Interna (Sachse)",
    shortName: "Uretrotomia Interna",
    icon: "🔓",
    category: "Funcional",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "localizacao", label: "Localização da Estenose", type: "select", options: ["uretra bulbar", "uretra peniana", "uretra membranosa", "meato uretral", "colo vesical"], defaultValue: "uretra bulbar" },
      { id: "extensao", label: "Extensão da Estenose", type: "select", options: ["<1cm", "1-2cm", ">2cm"], defaultValue: "<1cm" },
      { id: "grau", label: "Grau da Estenose", type: "select", options: ["parcial (filiforme)", "subtotal", "completa"], defaultValue: "parcial (filiforme)" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["Cold knife (Sachse) às 12h", "Cold knife (Sachse) às 12h + balão dilatador", "Laser Holmium"], defaultValue: "Cold knife (Sachse) às 12h" },
      { id: "svd", label: "Sonda Vesical", type: "select", options: ["SVD 18Fr", "SVD 20Fr", "SVD 16Fr"], defaultValue: "SVD 18Fr" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado", "Falso trajeto — corrigido"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Uretrotomia Interna — ${c.tecnica}
Anestesia: ${c.anestesia}
Indicação: Estenose de ${c.localizacao} (${c.extensao}, ${c.grau})

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Introdução do uretrotomo de Sachse sob visão direta.
4. Identificação da estenose em ${c.localizacao} — ${c.grau}, extensão ${c.extensao}.
5. Incisão da estenose às 12h com lâmina fria (cold knife) sob visão direta.
6. Progressão do uretrotomo até a bexiga, confirmando perviedade uretral.
7. Revisão endoscópica — hemostasia adequada.
8. Passagem de ${c.svd} sob visão.
9. Fixação da sonda.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PÓS-OPERATÓRIO IMEDIATO — URETROTOMIA INTERNA

1. Dieta livre após recuperação anestésica.
2. SF 0,9% 500mL IV (manutenção até alta).
3. Dipirona 1g IV 6/6h.
4. Cetoprofeno 100mg IV 12/12h (se necessário).
5. Manter ${c.svd} em drenagem livre.
6. Observar hematúria (esperada nas primeiras horas).
7. Alta hospitalar em 12-24h se estável.`,
      receitaAlta: (c) => `RECEITA DE ALTA — URETROTOMIA INTERNA

1. Dipirona 1g VO 6/6h por 3 dias.
2. Cetoprofeno 100mg VO 12/12h por 3 dias (após refeições).
3. Norfloxacino 400mg VO 12/12h por 5 dias (profilaxia com sonda).
4. Omeprazol 20mg VO 1x/dia em jejum por 5 dias.
5. Fenazopiridina 200mg VO 8/8h por 3 dias (se disúria após retirada da sonda).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — URETROTOMIA INTERNA

CUIDADOS GERAIS:
• Repouso relativo por 7 dias.
• Evitar esforço físico por 14 dias.
• Boa hidratação (>2L/dia).
SONDA VESICAL:
• Manter ${c.svd} por 3-7 dias (conforme extensão da estenose).
• Cuidados: manter bolsa coletora abaixo da bexiga, higiene do meato.
• Retirada conforme agendamento.
APÓS RETIRADA DA SONDA:
• Pode haver ardência/desconforto miccional por 2-3 dias.
• Observar jato urinário — deve ser forte e contínuo.
• Autodilatação com cateter (se prescrita): conforme orientação médica.
SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Impossibilidade de urinar (retenção).
• Jato urinário muito fraco ou em gotejamento.
• Sangramento intenso.
• Dor intensa.
RETORNO: ___ dias.
Retirada da sonda: ___ dias.
Urofluxometria de controle: 30-60 dias.`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ENUCLEAÇÃO PROSTÁTICA BIPOLAR (BipoLEP)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "bipolep",
    name: "Enucleação Bipolar da Próstata (BipoLEP)",
    shortName: "BipoLEP",
    icon: "⚡",
    category: "Próstata",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "volume_prostata", label: "Volume Prostático (g)", type: "text", defaultValue: "80", placeholder: "Ex: 80" },
      { id: "lobos", label: "Lobos Enucleados", type: "select", options: ["lobos laterais e mediano", "lobos laterais", "lobo mediano predominante"], defaultValue: "lobos laterais e mediano" },
      { id: "peso_morcelado", label: "Peso do Tecido Morcelado (g)", type: "text", defaultValue: "55", placeholder: "Ex: 55" },
      { id: "morcelacao", label: "Morcelação", type: "select", options: ["morcelador mecânico transuretral", "ressecção dos fragmentos (loop bipolar)"], defaultValue: "morcelador mecânico transuretral" },
      { id: "svd", label: "Sonda Vesical", type: "select", options: ["SVD 22Fr 3 vias", "SVD 20Fr 3 vias", "SVD 24Fr 3 vias"], defaultValue: "SVD 22Fr 3 vias" },
      { id: "irrigacao", label: "Irrigação Vesical Contínua", type: "select", options: ["Sim - SF 0,9%", "Não necessária"], defaultValue: "Sim - SF 0,9%" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado controlado", "Lesão capsular", "Conversão para RTU-P"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Enucleação Bipolar da Próstata (BipoLEP)
Anestesia: ${c.anestesia}
Volume prostático estimado: ${c.volume_prostata} g

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Introdução do ressectoscópio bipolar com óptica de 30°, sob irrigação com SF 0,9%.
4. Inspeção: ${c.lobos} adenomatosos obstruindo o colo vesical. Meatos ureterais e veru montanum identificados.
5. Incisão da mucosa proximal ao veru montanum, identificando o plano cirúrgico entre adenoma e cápsula.
6. Enucleação dos ${c.lobos} com energia bipolar, em plano capsular, com hemostasia progressiva.
7. Liberação dos adenomas para a bexiga.
8. ${c.morcelacao === "morcelador mecânico transuretral" ? "Morcelação mecânica transuretral do tecido adenomatoso intravesical." : "Ressecção dos fragmentos adenomatosos com loop bipolar."} Tecido recuperado: ${c.peso_morcelado} g (enviado para anatomopatológico).
9. Revisão da loja: hemostasia minuciosa do leito prostático.
10. Passagem de ${c.svd}.${c.irrigacao === "Sim - SF 0,9%" ? "\n11. Instalação de irrigação vesical contínua com SF 0,9%." : ""}

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO — BipoLEP

1. Dieta zero por 4h → líquida → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.${c.irrigacao === "Sim - SF 0,9%" ? "\n3. Manter irrigação vesical contínua com SF 0,9% — ajustar gotejamento conforme aspecto da drenagem (manter rosa-claro)." : ""}
4. Dipirona 1g IV 6/6h.
5. Cetoprofeno 100mg IV 12/12h.
6. Tramadol 50mg IV (diluído em 100mL SF) se dor refratária.
7. Ácido tranexâmico 1g IV 8/8h por 24-48h (se sangramento).
8. Escopolamina 20mg IV 8/8h se espasmos vesicais.
9. Manter ${c.svd} em drenagem; tração suave nas primeiras horas se necessário.
10. SSVV 4/4h; atenção a balanço hídrico e hematúria.
11. Retirada da irrigação quando urina clara; SVD por 24-48h.`,
      receitaAlta: (c) => `RECEITA DE ALTA — BipoLEP

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 3-5 dias (com alimento).
3. Ciprofloxacino 500mg ––– 01 cp VO 12/12h por 5 dias.
4. Pyridium 100mg ––– 01 drágea VO 8/8h por 3 dias se ardência.
5. Lactulose ou laxante osmótico se constipação (evitar esforço evacuatório).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — BipoLEP

Procedimento: Enucleação Bipolar da Próstata (BipoLEP).

SINTOMAS ESPERADOS:
• Urina rosada e ardência miccional por 1-3 semanas.
• Urgência e aumento da frequência urinária que melhoram progressivamente.
• Pequena perda de urina (incontinência) transitória pode ocorrer.

CUIDADOS:
• Hidratação 2-3 L/dia.
• Evitar esforço físico, peso >5kg e atividade sexual por 3-4 semanas.
• Evitar constipação (dieta com fibras).
• A ejaculação retrógrada ("seca") é frequente após o procedimento — não é prejudicial à saúde.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C ou calafrios.
• Sangramento intenso com coágulos / retenção urinária.
• Impossibilidade de urinar.

RETORNO: ___ dias (resultado do anatomopatológico).`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ENUCLEAÇÃO PROSTÁTICA A LASER DE HÓLMIO (HoLEP)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "holep",
    name: "Enucleação da Próstata a Laser de Hólmio (HoLEP)",
    shortName: "HoLEP",
    icon: "🔦",
    category: "Próstata",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "volume_prostata", label: "Volume Prostático (g)", type: "text", defaultValue: "100", placeholder: "Ex: 100" },
      { id: "lobos", label: "Técnica de Enucleação", type: "select", options: ["três lobos (laterais e mediano)", "dois lobos", "en bloc"], defaultValue: "três lobos (laterais e mediano)" },
      { id: "energia_laser", label: "Energia do Laser", type: "text", defaultValue: "2,0 J / 40 Hz", placeholder: "Ex: 2,0 J / 40 Hz" },
      { id: "peso_morcelado", label: "Peso do Tecido Morcelado (g)", type: "text", defaultValue: "70", placeholder: "Ex: 70" },
      { id: "svd", label: "Sonda Vesical", type: "select", options: ["SVD 22Fr 3 vias", "SVD 20Fr 3 vias", "SVD 24Fr 3 vias"], defaultValue: "SVD 22Fr 3 vias" },
      { id: "irrigacao", label: "Irrigação Vesical Contínua", type: "select", options: ["Sim - SF 0,9%", "Não necessária"], defaultValue: "Sim - SF 0,9%" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado", "Lesão de mucosa vesical (morcelação)", "Conversão de técnica"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Enucleação da Próstata a Laser de Hólmio (HoLEP)
Anestesia: ${c.anestesia}
Volume prostático estimado: ${c.volume_prostata} g

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Introdução do ressectoscópio com fibra de laser de Hólmio (Ho:YAG, ${c.energia_laser}), sob irrigação com SF 0,9%.
4. Inspeção endoscópica: adenoma obstrutivo. Veru montanum e meatos ureterais identificados.
5. Incisões demarcatórias e identificação do plano cirúrgico capsular.
6. Enucleação (${c.lobos}) do adenoma no plano da cápsula com laser de Hólmio, com hemostasia simultânea, deslocando o tecido para a bexiga.
7. Hemostasia do leito com o laser.
8. Morcelação mecânica transuretral do tecido adenomatoso intravesical. Tecido recuperado: ${c.peso_morcelado} g (enviado para anatomopatológico).
9. Revisão endoscópica final — leito prostático amplo e hemostático.
10. Passagem de ${c.svd}.${c.irrigacao === "Sim - SF 0,9%" ? "\n11. Instalação de irrigação vesical contínua com SF 0,9%." : ""}

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO — HoLEP

1. Dieta zero por 4h → líquida → geral conforme aceitação.
2. SF 0,9% 1000 mL IV em 12h.${c.irrigacao === "Sim - SF 0,9%" ? "\n3. Manter irrigação vesical contínua com SF 0,9% — ajustar conforme aspecto da drenagem." : ""}
4. Dipirona 1g IV 6/6h.
5. Cetoprofeno 100mg IV 12/12h.
6. Tramadol 50mg IV se dor refratária.
7. Escopolamina 20mg IV 8/8h se espasmos vesicais.
8. Manter ${c.svd} em drenagem livre.
9. SSVV 4/4h; atenção à hematúria.
10. Retirada da irrigação quando urina clara; SVD habitualmente por 24h.`,
      receitaAlta: (c) => `RECEITA DE ALTA — HoLEP

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 3-5 dias (com alimento).
3. Ciprofloxacino 500mg ––– 01 cp VO 12/12h por 5 dias.
4. Pyridium 100mg ––– 01 drágea VO 8/8h por 3 dias se ardência.
5. Laxante osmótico se constipação (evitar esforço evacuatório).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — HoLEP

Procedimento: Enucleação da Próstata a Laser de Hólmio (HoLEP).

SINTOMAS ESPERADOS:
• Urina rosada e ardência miccional por 1-3 semanas.
• Urgência/frequência urinária que melhoram progressivamente.
• Incontinência urinária transitória leve pode ocorrer nas primeiras semanas.

CUIDADOS:
• Hidratação 2-3 L/dia.
• Evitar esforço físico, peso >5kg e atividade sexual por 3-4 semanas.
• Evitar constipação.
• A ejaculação retrógrada ("seca") é frequente após HoLEP — não prejudica a saúde.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C ou calafrios.
• Sangramento intenso com coágulos / retenção urinária.
• Impossibilidade de urinar.

RETORNO: ___ dias (resultado do anatomopatológico).`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // REZUM (TERMOTERAPIA POR VAPOR D'ÁGUA)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "rezum",
    name: "Rezūm (Termoterapia Prostática por Vapor d'Água)",
    shortName: "Rezūm",
    icon: "💨",
    category: "Próstata",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["sedação + bloqueio prostático", "anestesia local + sedação leve", "raquianestesia"], defaultValue: "sedação + bloqueio prostático" },
      { id: "volume_prostata", label: "Volume Prostático (g)", type: "text", defaultValue: "45", placeholder: "Ex: 45" },
      { id: "lobo_mediano", label: "Lobo Mediano", type: "select", options: ["ausente", "presente (tratado)"], defaultValue: "ausente" },
      { id: "injecoes_laterais", label: "Nº de Injeções (lobos laterais)", type: "text", defaultValue: "4", placeholder: "Ex: 4" },
      { id: "injecoes_mediano", label: "Nº de Injeções (lobo mediano)", type: "text", defaultValue: "0", placeholder: "Ex: 1" },
      { id: "sonda", label: "Sonda ao Final", type: "select", options: ["SVD 16Fr (3-7 dias)", "SVD 14Fr (3-7 dias)", "Sem sonda"], defaultValue: "SVD 16Fr (3-7 dias)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Hematúria leve", "Desconforto local"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Procedimento: Rezūm — Termoterapia Prostática por Vapor d'Água
Anestesia: ${c.anestesia}
Volume prostático estimado: ${c.volume_prostata} g
Lobo mediano: ${c.lobo_mediano}

1. Paciente em posição de litotomia.
2. Antissepsia, assepsia e colocação de campos estéreis.
3. Introdução do aparelho de cistoscopia com o dispositivo Rezūm sob visão direta.
4. Identificação do veru montanum, colo vesical e meatos ureterais (preservação).
5. Aplicação de injeções de vapor d'água (energia térmica convectiva, ~9 segundos cada) nos lobos laterais: ${c.injecoes_laterais} injeções.${c.lobo_mediano === "presente (tratado)" ? `\n6. Tratamento do lobo mediano: ${c.injecoes_mediano} injeção(ões) de vapor.` : ""}
7. Distribuição das aplicações respeitando o veru montanum (preservação da função ejaculatória).
8. Revisão endoscópica — sem sangramento ativo.
9. ${c.sonda === "Sem sonda" ? "Optado por não deixar sonda vesical." : `Passagem de ${c.sonda}.`}

Intercorrências: ${c.complicacoes}.

Obs.: O efeito de desobstrução é progressivo (necrose tecidual e reabsorção em semanas).`,
      posOperatorio: (c) => `PÓS-OPERATÓRIO — Rezūm (ambulatorial/curta permanência)

1. Observação por 1-3h.
2. Dipirona 1g VO/IV se dor.
3. Cetoprofeno se necessário.${c.sonda === "Sem sonda" ? "\n4. Liberar após micção espontânea." : `\n4. Manter ${c.sonda} em drenagem; orientar cuidados com a sonda.`}
5. Orientar que a melhora dos sintomas é gradual (semanas).`,
      receitaAlta: (c) => `RECEITA DE ALTA — Rezūm

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Ibuprofeno 600mg ––– 01 cp VO 12/12h por 3-5 dias (com alimento).
3. Tansulosina 0,4mg ––– 01 cáps VO ao dia, após jantar (por algumas semanas).
4. Pyridium 100mg ––– 01 drágea VO 8/8h por 3 dias se ardência.
5. Ciprofloxacino 500mg ––– 01 cp VO 12/12h por 3-5 dias${c.sonda === "Sem sonda" ? "" : " (enquanto com sonda)"}.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — Rezūm

Procedimento: Rezūm (vapor d'água prostático).

IMPORTANTE — RESULTADO PROGRESSIVO:
• A melhora do jato urinário é GRADUAL, ao longo de 2 a 6 semanas.
• Nas primeiras semanas os sintomas urinários podem até piorar transitoriamente.

SINTOMAS ESPERADOS:
• Ardência, urgência e aumento da frequência urinária.
• Urina rosada e eventual eliminação de pequenos fragmentos.
${c.sonda === "Sem sonda" ? "" : "\nSONDA VESICAL:\n• Manter a sonda pelo período orientado (geralmente 3-7 dias).\n• Cuidados de higiene e bolsa coletora abaixo da bexiga.\n"}
CUIDADOS:
• Hidratação 2-3 L/dia.
• Evitar esforço físico intenso por 1 semana.
• Vantagem: preservação habitual da função ejaculatória e sexual.

SINAIS DE ALERTA (Procurar PS):
• Febre >38°C.
• Retenção urinária (impossibilidade de urinar).
• Sangramento intenso com coágulos.

RETORNO: ___ dias (reavaliação de sintomas/urofluxometria).`
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // PREENCHIMENTO PENIANO COM ÁCIDO HIALURÔNICO
  // ═══════════════════════════════════════════════════════════════
  {
    id: "preenchimento-peniano-ah",
    name: "Preenchimento Peniano com Ácido Hialurônico",
    shortName: "Preench. Peniano (AH)",
    icon: "💉",
    category: "Andrologia",
    configFields: [
      { id: "indicacao", label: "Indicação", type: "select", options: ["aumento de circunferência (estético)", "glandular (aumento da glande)", "ejaculação precoce (dessensibilização glandular)"], defaultValue: "aumento de circunferência (estético)" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["creme anestésico tópico + bloqueio peniano com lidocaína", "bloqueio peniano com lidocaína 2% s/ vasoconstritor", "apenas anestésico tópico"], defaultValue: "creme anestésico tópico + bloqueio peniano com lidocaína" },
      { id: "produto", label: "Produto", type: "select", options: ["ácido hialurônico reticulado de alta densidade", "ácido hialurônico de média densidade"], defaultValue: "ácido hialurônico reticulado de alta densidade" },
      { id: "volume", label: "Volume Total Aplicado (mL)", type: "text", defaultValue: "10", placeholder: "Ex: 10" },
      { id: "plano", label: "Plano de Aplicação", type: "select", options: ["subcutâneo (entre dartos e fáscia de Buck)", "subcutâneo dorsal e lateral", "subglandular"], defaultValue: "subcutâneo (entre dartos e fáscia de Buck)" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["retroinjeção em leque com microcânula", "injeção com agulha em múltiplos pontos", "microcânula circunferencial"], defaultValue: "retroinjeção em leque com microcânula" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Equimose leve", "Edema moderado", "Assimetria leve corrigida com modelagem"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO DO PROCEDIMENTO

Procedimento: Preenchimento Peniano com Ácido Hialurônico
Indicação: ${c.indicacao}
Anestesia: ${c.anestesia}
Produto: ${c.produto}
Volume total: ${c.volume} mL

1. Paciente em decúbito dorsal. Antissepsia rigorosa da região genital e campos estéreis.
2. Anestesia: ${c.anestesia}.
3. Marcação dos pontos de entrada e da área a ser tratada.
4. Aplicação de ${c.produto} no plano ${c.plano}, por meio de ${c.tecnica}.
5. Distribuição homogênea do produto, com modelagem manual para uniformizar o contorno.
6. Volume total aplicado: ${c.volume} mL.
7. Compressão e curativo leve. Avaliação de simetria e perfusão da glande.

Intercorrências: ${c.complicacoes}.

Obs.: Procedimento estético, ambulatorial, reversível (hialuronidase, se necessário).`,
      posOperatorio: (c) => `PÓS-PROCEDIMENTO IMEDIATO — Preenchimento Peniano (AH)

1. Procedimento ambulatorial — observação por 30-60 min.
2. Compressas frias intermitentes nas primeiras horas (reduzir edema/equimose).
3. Analgesia: Dipirona 1g VO se dor.
4. Orientar modelagem suave conforme instrução, se indicado.
5. Liberação após avaliação de perfusão da glande (sem sinais de isquemia).`,
      receitaAlta: (c) => `RECEITA / ORIENTAÇÃO DE MEDICAÇÃO — Preenchimento Peniano (AH)

1. Dipirona 1g ––– 01 cp VO 6/6h se dor.
2. Arnica (gel/comprimido) ––– conforme bula, auxílio na equimose (opcional).
3. Evitar anti-inflamatórios nas primeiras 24-48h (favorecem equimose), salvo orientação.
4. Cefalexina 500mg ––– 01 cp VO 6/6h por 5 dias (se profilaxia antibiótica indicada).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-PROCEDIMENTO — Preenchimento Peniano (AH)

Indicação: ${c.indicacao}.

SINTOMAS ESPERADOS:
• Edema (inchaço), equimoses (roxos) e leve desconforto por alguns dias.
• Sensação de produto/relevo, que se uniformiza nas semanas seguintes.

CUIDADOS:
• Higiene local suave; manter a área limpa e seca.
• Compressas frias nas primeiras 24-48h.
• ABSTINÊNCIA SEXUAL e masturbação por 7-14 dias (conforme orientação).
• Evitar exercícios físicos intensos, sauna e sol direto na região por 1-2 semanas.
• Não manipular/massagear sem orientação.

SINAIS DE ALERTA (Procurar atendimento IMEDIATO):
• Dor intensa e progressiva, palidez ou coloração arroxeada/escurecida da glande (sinal de isquemia).
• Febre, secreção purulenta, vermelhidão que se espalha (infecção).
• Estes sinais podem exigir aplicação de hialuronidase de urgência.

RESULTADO: O resultado é temporário (em média 12-18 meses), variando conforme o produto e o metabolismo individual.

RETORNO: ___ dias (reavaliação e modelagem).`
    }
  },

  // ════════════════════════════════════════════════════════════════
  // IMPLANTE SUBCUTÂNEO DE TESTOSTERONA (PELLETS)
  // ════════════════════════════════════════════════════════════════
  {
    id: "implante-testosterona",
    name: "Implante Subcutâneo de Testosterona (Pellets)",
    shortName: "Implante Testosterona",
    icon: "\uD83D\uDC89",
    category: "Andrologia",
    configFields: [
      { id: "indicacao_trt", label: "Indicação", type: "select", options: ["hipogonadismo masculino (testosterona total baixa confirmada em 2 dosagens matinais)", "hipogonadismo de início tardio", "reposição de testosterona (continuidade de TRT)"], defaultValue: "hipogonadismo masculino (testosterona total baixa confirmada em 2 dosagens matinais)" },
      { id: "local", label: "Local do Implante", type: "select", options: ["quadrante súpero-lateral da região glútea", "parede abdominal inferior", "flanco/região do quadril"], defaultValue: "quadrante súpero-lateral da região glútea" },
      { id: "lado", label: "Lado", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à direita" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia local (lidocaína 1% sem vasoconstritor)", "anestesia local (lidocaína 2% sem vasoconstritor)"], defaultValue: "anestesia local (lidocaína 2% sem vasoconstritor)" },
      { id: "dose_pellet", label: "Dose por Pellet", type: "select", options: ["75 mg (Testopel)", "100 mg", "150 mg", "200 mg"], defaultValue: "75 mg (Testopel)" },
      { id: "num_pellets", label: "Número de Pellets", type: "text", defaultValue: "4", placeholder: "Ex: 4 a 6" },
      { id: "trocarte", label: "Trocarte", type: "select", options: ["trocarte descartável com mandril cortante e obturador rombo", "trocarte reutilizável (kit de implante)"], defaultValue: "trocarte descartável com mandril cortante e obturador rombo" },
      { id: "sintese", label: "Síntese", type: "select", options: ["aproximada com Steri-Strip (sem sutura)", "01 ponto simples com Nylon 4-0", "adesivo cutâneo"], defaultValue: "aproximada com Steri-Strip (sem sutura)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado", "Equimose local"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => {
        const mgPorPellet = parseInt((c.dose_pellet || "").replace(/[^0-9]/g, ""), 10) || 0;
        const qtd = parseInt((c.num_pellets || "").replace(/[^0-9]/g, ""), 10) || 0;
        const doseTotal = mgPorPellet && qtd ? `${mgPorPellet * qtd} mg` : "a definir";
        return `DESCRIÇÃO CIRÚRGICA

Procedimento: Implante Subcutâneo de Testosterona (pellets)
Indicação: ${c.indicacao_trt}
Dose: ${c.num_pellets} pellets de ${c.dose_pellet} (dose total ${doseTotal})
Local: ${c.local} ${c.lado}
Anestesia: ${c.anestesia}

1. Paciente em decúbito (lateral ou ventral conforme o local de implante).
2. Antissepsia, assepsia e colocação de campos estéreis sobre ${c.local} ${c.lado}.
3. Infiltração de ${c.anestesia} em botão dérmico e ao longo do trajeto subcutâneo (~5-7 cm).
4. Incisão puntiforme (~5 mm) com lâmina 11.
5. Introdução do ${c.trocarte} a 30-45°, avançando no plano subcutâneo (~2 cm de profundidade).
6. Substituição do mandril cortante pelo obturador rombo; implante dos ${c.num_pellets} pellets, um a um, em trajetos divergentes (em leque), afastados do ponto de inserção.
7. Conferência do número de pellets implantados e remoção do trocarte.
8. Compressão local para hemostasia; ${c.sintese}.
9. Curativo compressivo.

Intercorrências: ${c.complicacoes}.`;
      },

      posOperatorio: (c) => `PÓS-PROCEDIMENTO IMEDIATO — Implante de Testosterona

Procedimento ambulatorial.

1. Observação por 30-60 min.
2. Manter curativo compressivo seco e intacto.
3. Analgesia: Dipirona 1g VO se dor.
4. Orientar repouso relativo e evitar esforço sobre o local nas primeiras 48h (reduz risco de extrusão do pellet).
5. Alta com orientações e agendamento de reavaliação laboratorial.`,

      receitaAlta: (c) => {
        const mgPorPellet = parseInt((c.dose_pellet || "").replace(/[^0-9]/g, ""), 10) || 0;
        const qtd = parseInt((c.num_pellets || "").replace(/[^0-9]/g, ""), 10) || 0;
        const doseTotal = mgPorPellet && qtd ? `${mgPorPellet * qtd} mg` : "a definir";
        return `RECEITA DE ALTA — Implante de Testosterona

Procedimento realizado: implante de ${c.num_pellets} pellets de ${c.dose_pellet} (dose total ${doseTotal}).

1. Dipirona 1g ––– 01 cp VO 6/6h se dor, por 2-3 dias.
2. Paracetamol 750mg ––– 01 cp VO 6/6h se dor (alternativa à dipirona).

Observação: evitar anti-inflamatórios não esteroidais de rotina; usar apenas se orientado.

Uso Tópico (se houver ponto/incisão):
3. Mupirocina pomada ––– aplicar fina camada 2x/dia sobre a incisão, após higiene, por 5 dias.`;
      },

      orientacoes: (c) => {
        const mgPorPellet = parseInt((c.dose_pellet || "").replace(/[^0-9]/g, ""), 10) || 0;
        const qtd = parseInt((c.num_pellets || "").replace(/[^0-9]/g, ""), 10) || 0;
        const doseTotal = mgPorPellet && qtd ? `${mgPorPellet * qtd} mg` : "a definir";
        return `ORIENTAÇÕES PÓS-PROCEDIMENTO — Implante de Testosterona

Indicação: ${c.indicacao_trt}.
Foram implantados ${c.num_pellets} pellets de ${c.dose_pellet} (total ${doseTotal}) em ${c.local} ${c.lado}.

CURATIVO: Manter seco e intacto por 24-48h. Após, pode retirar e tomar banho normalmente.

ATIVIDADE FÍSICA: Evitar exercícios vigorosos, agachamentos e esforço sobre a região por 48-72h — isso reduz o risco de o pellet ser expelido (extrusão).

SINTOMAS ESPERADOS: Leve dor, inchaço e equimose (roxo) no local por alguns dias.

EFEITO: A testosterona é liberada de forma gradual; o efeito costuma durar de 3 a 6 meses, variando conforme o metabolismo. É normal sentir melhora progressiva de disposição, libido e bem-estar ao longo das primeiras semanas.

SINAIS DE ALERTA (Procurar atendimento):
• Vermelhidão que se espalha, calor, secreção purulenta ou febre >38°C (infecção).
• Saída (extrusão) de um pellet pela incisão.
• Sangramento que não cessa com compressão por 10 min.

SEGUIMENTO: Reavaliação laboratorial (testosterona total, hematócrito/hemoglobina e PSA conforme protocolo) antes da próxima aplicação. Reimplante habitualmente a cada 3-6 meses, ajustando a dose conforme resposta clínica e exames.

RETORNO: ___ dias.`;
      }
    }
  },
];

// Procedimentos do Atlas integrados ao catálogo (AUTO-GERADO em proceduresExtra.ts)
procedures.push(...proceduresExtra);

export const categories = Array.from(new Set(procedures.map(p => p.category)));
