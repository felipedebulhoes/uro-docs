// UroDocx — Documentos Cirúrgicos Urológicos
// Dr. Felipe Bulhões — Identidade Visual: Azul do Nilo + Tema Claro
// Descrições cirúrgicas em formato NUMERADO e OBJETIVO

export interface ConfigField {
  id: string;
  label: string;
  type: "select" | "text" | "number";
  options?: string[];
  defaultValue: string;
  placeholder?: string;
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
];

export const categories = Array.from(new Set(procedures.map(p => p.category)));
