// Data file: All surgical procedures with configurable templates
// Design: "Dark Clinical Dashboard — Surgical Command Center"
// Each procedure has configurable fields that propagate to all documents

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

Cirurgia Realizada: Ureterolitotripsia Rígida ${c.lateralidade} com fragmentação por ${c.fragmentacao} e implante de cateter Duplo J.

Achados Cirúrgicos: Meato ureteral tópico. A progressão do fio guia hidrofílico ocorreu sem intercorrências. A ureteroscopia evidenciou um cálculo de ${c.tamanho_calculo} mm localizado em ${c.localizacao} do ureter ${c.lateralidade}. A mucosa ureteral apresentou-se ${c.mucosa}.

Descrição do Procedimento: Paciente posicionado em litotomia sob ${c.anestesia}. Após antissepsia e assepsia rigorosas com colocação de campos estéreis, realizou-se cistoscopia inicial para identificação dos meatos ureterais. Procedeu-se com a passagem de fio guia hidrofílico pelo meato ureteral ${c.lateralidade} até a pelve renal, sob controle fluoroscópico. Em seguida, o ureteroscópio rígido foi introduzido sobre o fio guia. O cálculo foi identificado e fragmentado utilizando ${c.fragmentacao}. Os fragmentos maiores foram extraídos com o auxílio de cesta (basket), enquanto a poeira residual foi deixada para eliminação espontânea.${c.duplo_j !== "Não implantado" ? ` Realizou-se o implante de cateter Duplo J (${c.duplo_j.replace('Sim - ', '')}) sob controle fluoroscópico e visual.` : ""} Procedimento finalizado com revisão hemostática e esvaziamento vesical. ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta: Zero por 4 horas → Líquida restrita → Geral conforme aceitação.
2. Hidratação Venosa: Soro Fisiológico 0,9% 1000 mL IV em 12h.
3. Dipirona 1g IV de 6/6h (analgesia).
4. Cetoprofeno 100mg IV de 12/12h (se função renal normal).
5. Tramadol 50mg IV diluído em 100mL SF0,9% correr em 20 min — se dor refratária.
6. Ondansetrona 4mg IV de 8/8h se náuseas/vômitos.
7. Escopolamina (Buscopan) 20mg IV de 8/8h se cólica ou espasmos vesicais.
8. Sinais vitais de 4/4h.
9. Deambulação precoce após recuperação da sensibilidade motora.
10. Alta hospitalar prevista após boa aceitação de dieta oral e controle adequado da dor.`,

      receitaAlta: (c) => `RECEITA DE ALTA

Uso Oral:
1. Dipirona 1g ––– Tomar 01 comprimido de 6/6 horas em caso de dor.
2. Ibuprofeno 600mg ––– Tomar 01 comprimido de 12/12 horas por 3 a 5 dias (com alimento).
3. Tansulosina 0,4mg ––– Tomar 01 cápsula ao dia, após o jantar${c.duplo_j !== "Não implantado" ? " (enquanto estiver com o cateter Duplo J)" : ""}.
4. Pyridium (Fenazopiridina) 100mg ––– Tomar 01 drágea de 8/8 horas por 3 dias, em caso de ardência ao urinar. (Aviso: a urina ficará alaranjada).
5. Ciprofloxacino 500mg ––– Tomar 01 comprimido de 12/12 horas por 5 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento realizado: Ureterolitotripsia Rígida ${c.lateralidade}.

REPOUSO E ATIVIDADE:
Manter repouso relativo por 3 a 5 dias. Evitar esforço físico intenso, pegar peso (mais de 5 kg) e atividades sexuais${c.duplo_j !== "Não implantado" ? " enquanto estiver com o cateter Duplo J" : " por 7 dias"}. Caminhadas leves são permitidas e recomendadas.

HIDRATAÇÃO:
Beber bastante água — 2 a 3 litros por dia — para ajudar a "lavar" a via urinária e eliminar fragmentos residuais.
${c.duplo_j !== "Não implantado" ? `
SINTOMAS DO CATETER DUPLO J:
É NORMAL sentir:
• Vontade frequente de urinar.
• Ardência leve a moderada ao urinar.
• Dor na região lombar (costas) ou no pé da barriga, principalmente durante ou logo após urinar.
• Sangue na urina (urina rosada ou avermelhada), especialmente após caminhar ou fazer esforço.

RETIRADA DO CATETER:
O cateter Duplo J é temporário e DEVE SER RETIRADO em data agendada (geralmente em 1 a 3 semanas). Não falte ao retorno!
` : ""}
SINAIS DE ALERTA — Procurar o Pronto-Socorro se:
• Febre maior que 38°C ou calafrios.
• Dor intensa que não melhora com as medicações prescritas.
• Sangramento urinário muito forte com coágulos grandes que dificultem a micção.
• Impossibilidade de urinar (retenção urinária).

RETORNO: Agendar consulta de retorno em ___ dias.`
    }
  },
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
      { id: "mucosa", label: "Mucosa Ureteral/Piélica", type: "select", options: ["íntegra", "edemaciada", "com sinais inflamatórios"], defaultValue: "íntegra" },
      { id: "bainha_acesso", label: "Bainha de Acesso Ureteral", type: "select", options: ["Sim - 12/14 Fr", "Sim - 10/12 Fr", "Não utilizada"], defaultValue: "Sim - 12/14 Fr" },
      { id: "duplo_j", label: "Cateter Duplo J", type: "select", options: ["Sim - 6Fr x 26cm", "Sim - 6Fr x 24cm", "Sim - 7Fr x 26cm", "Não implantado"], defaultValue: "Sim - 6Fr x 26cm" },
      { id: "fragmentacao", label: "Método de Fragmentação", type: "select", options: ["Laser Holmium (dusting)", "Laser Holmium (fragmentação)", "Laser Thulium Fiber"], defaultValue: "Laser Holmium (dusting)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado", "Lesão de mucosa", "Fragmento residual significativo"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Cirurgia Realizada: Ureterolitotripsia Flexível ${c.lateralidade} com fragmentação por ${c.fragmentacao} e implante de cateter Duplo J.

Achados Cirúrgicos: Meato ureteral tópico. Ureter pérvio à progressão do ureteroscópio. Identificado cálculo de ${c.tamanho_calculo} mm em ${c.localizacao} ${c.lateralidade}. Mucosa ${c.mucosa}.

Descrição do Procedimento: Paciente posicionado em litotomia sob ${c.anestesia}. Após antissepsia e assepsia rigorosas com colocação de campos estéreis, realizou-se cistoscopia inicial para identificação dos meatos ureterais. Passagem de fio guia hidrofílico pelo meato ureteral ${c.lateralidade} até a pelve renal sob fluoroscopia.${c.bainha_acesso !== "Não utilizada" ? ` Introdução de bainha de acesso ureteral (${c.bainha_acesso.replace('Sim - ', '')}) sob controle fluoroscópico.` : ""} Introdução do ureteroscópio flexível com navegação até ${c.localizacao}. Identificação do cálculo e fragmentação utilizando ${c.fragmentacao}. Fragmentos maiores extraídos com cesta (basket); poeira residual deixada para eliminação espontânea.${c.duplo_j !== "Não implantado" ? ` Implante de cateter Duplo J (${c.duplo_j.replace('Sim - ', '')}) sob controle fluoroscópico e visual.` : ""} Revisão hemostática e esvaziamento vesical. ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta: Zero por 4 horas → Líquida restrita → Geral conforme aceitação.
2. Hidratação Venosa: Soro Fisiológico 0,9% 1000 mL IV em 12h.
3. Dipirona 1g IV de 6/6h (analgesia).
4. Cetoprofeno 100mg IV de 12/12h (se função renal normal).
5. Tramadol 50mg IV diluído em 100mL SF0,9% correr em 20 min — se dor refratária.
6. Ondansetrona 4mg IV de 8/8h se náuseas/vômitos.
7. Escopolamina (Buscopan) 20mg IV de 8/8h se cólica ou espasmos vesicais.
8. Sinais vitais de 4/4h.
9. Deambulação precoce após recuperação da sensibilidade motora.
10. Alta hospitalar prevista após boa aceitação de dieta oral e controle adequado da dor.`,

      receitaAlta: (c) => `RECEITA DE ALTA

Uso Oral:
1. Dipirona 1g ––– Tomar 01 comprimido de 6/6 horas em caso de dor.
2. Ibuprofeno 600mg ––– Tomar 01 comprimido de 12/12 horas por 3 a 5 dias (com alimento).
3. Tansulosina 0,4mg ––– Tomar 01 cápsula ao dia, após o jantar${c.duplo_j !== "Não implantado" ? " (enquanto estiver com o cateter Duplo J)" : ""}.
4. Pyridium (Fenazopiridina) 100mg ––– Tomar 01 drágea de 8/8 horas por 3 dias, em caso de ardência ao urinar.
5. Ciprofloxacino 500mg ––– Tomar 01 comprimido de 12/12 horas por 5 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento realizado: Ureterolitotripsia Flexível ${c.lateralidade}.

REPOUSO E ATIVIDADE:
Manter repouso relativo por 3 a 5 dias. Evitar esforço físico intenso, pegar peso (mais de 5 kg) e atividades sexuais${c.duplo_j !== "Não implantado" ? " enquanto estiver com o cateter Duplo J" : " por 7 dias"}. Caminhadas leves são permitidas.

HIDRATAÇÃO:
Beber bastante água — 2 a 3 litros por dia — para ajudar a eliminar fragmentos residuais.
${c.duplo_j !== "Não implantado" ? `
SINTOMAS DO CATETER DUPLO J:
É NORMAL sentir:
• Vontade frequente de urinar.
• Ardência leve a moderada ao urinar.
• Dor na região lombar ou no pé da barriga, principalmente durante ou logo após urinar.
• Sangue na urina (urina rosada ou avermelhada), especialmente após esforço.

RETIRADA DO CATETER:
O cateter Duplo J é temporário e DEVE SER RETIRADO em data agendada (geralmente em 1 a 3 semanas). Não falte ao retorno!
` : ""}
SINAIS DE ALERTA — Procurar o Pronto-Socorro se:
• Febre maior que 38°C ou calafrios.
• Dor intensa que não melhora com as medicações.
• Sangramento urinário muito forte com coágulos grandes.
• Impossibilidade de urinar.

RETORNO: Agendar consulta de retorno em ___ dias.`
    }
  },
  {
    id: "cistoscopia",
    name: "Cistoscopia Diagnóstica / Retirada de Duplo J",
    shortName: "Cistoscopia",
    icon: "🔍",
    category: "Endourologia",
    configFields: [
      { id: "tipo_procedimento", label: "Tipo de Procedimento", type: "select", options: ["Cistoscopia diagnóstica", "Cistoscopia com retirada de Duplo J", "Cistoscopia com biópsia vesical"], defaultValue: "Cistoscopia com retirada de Duplo J" },
      { id: "lateralidade_dj", label: "Lateralidade do Duplo J", type: "select", options: ["à direita", "à esquerda", "N/A (diagnóstica)"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia local com gel de lidocaína", "sedação", "raquianestesia"], defaultValue: "sedação" },
      { id: "tipo_cistoscopio", label: "Tipo de Cistoscópio", type: "select", options: ["flexível", "rígido"], defaultValue: "rígido" },
      { id: "achados_bexiga", label: "Achados da Bexiga", type: "select", options: ["mucosa de aspecto normal", "mucosa com trabeculações de esforço", "lesão papilífera identificada", "mucosa com áreas de hiperemia", "presença de cálculo vesical"], defaultValue: "mucosa de aspecto normal" },
      { id: "achados_uretra", label: "Achados da Uretra", type: "select", options: ["uretra pérvia, sem estenoses", "uretra com estenose em bulbar", "uretra com estenose em meato", "próstata com lobos laterais aumentados"], defaultValue: "uretra pérvia, sem estenoses" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve", "Falsa via (não ocorreu)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Cirurgia Realizada: ${c.tipo_procedimento}${c.lateralidade_dj !== "N/A (diagnóstica)" ? ` ${c.lateralidade_dj}` : ""}.

Achados Cirúrgicos: ${c.achados_uretra}. Bexiga com ${c.achados_bexiga}. Óstios ureterais tópicos e ejaculando urina clara.${c.tipo_procedimento.includes("Duplo J") ? ` Identificado cateter Duplo J exteriorizado pelo meato ureteral ${c.lateralidade_dj}.` : ""}

Descrição do Procedimento: Paciente posicionado em litotomia sob ${c.anestesia}. Após antissepsia e assepsia, introduziu-se o cistoscópio ${c.tipo_cistoscopio} sob visão direta. Realizou-se inspeção completa da uretra e bexiga.${c.tipo_procedimento.includes("Duplo J") ? ` A extremidade vesical do cateter Duplo J foi apreendida com pinça de corpo estranho e tracionada suavemente, sendo removida por completo.` : ""}${c.tipo_procedimento.includes("biópsia") ? ` Realizada biópsia da lesão identificada com pinça fria. Material enviado para anatomopatológico.` : ""} Esvaziamento vesical e retirada do aparelho. ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial — alta após recuperação anestésica.

1. Observação por 1 a 2 horas após o procedimento.
2. Dipirona 1g VO se dor.
3. Liberação para domicílio após micção espontânea sem dificuldade.`,

      receitaAlta: (c) => `RECEITA DE ALTA

Uso Oral:
1. Dipirona 1g ––– Tomar 01 comprimido de 6/6 horas em caso de dor.
2. Pyridium (Fenazopiridina) 100mg ––– Tomar 01 drágea de 8/8 horas por 1 a 2 dias, em caso de ardência ao urinar.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento realizado: ${c.tipo_procedimento}${c.lateralidade_dj !== "N/A (diagnóstica)" ? ` ${c.lateralidade_dj}` : ""}.

SINTOMAS ESPERADOS:
É normal sentir ardência ao urinar e notar a urina levemente rosada (com um pouco de sangue) nas primeiras 24 a 48 horas.

CUIDADOS:
• Beber bastante água para limpar a bexiga mais rapidamente.
• Banhos de assento mornos podem ajudar a aliviar o desconforto.
• Evitar esforço físico intenso por 24 horas.

SINAIS DE ALERTA — Procurar o Pronto-Socorro se:
• Febre maior que 38°C.
• Incapacidade de urinar por mais de 6 horas.
• Sangramento que não melhora após 48 horas ou piora progressivamente.

RETORNO: Agendar consulta de retorno em ___ dias${c.tipo_procedimento.includes("biópsia") ? " para resultado da biópsia" : ""}.`
    }
  },
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
      { id: "resseccao_muscular", label: "Ressecção da Muscular", type: "select", options: ["incluindo camada muscular própria (para estadiamento)", "até a lâmina própria", "ressecção profunda até gordura perivesical"], defaultValue: "incluindo camada muscular própria (para estadiamento)" },
      { id: "ostios", label: "Óstios Ureterais", type: "select", options: ["tópicos e ejaculando urina clara", "próximos à lesão (preservados)", "envolvidos pela lesão"], defaultValue: "tópicos e ejaculando urina clara" },
      { id: "sonda", label: "Sonda Vesical", type: "select", options: ["SVD 3 vias 20Fr com irrigação contínua", "SVD 3 vias 22Fr com irrigação contínua", "SVD 2 vias 18Fr (sem irrigação)"], defaultValue: "SVD 3 vias 20Fr com irrigação contínua" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Perfuração vesical extraperitoneal (tratamento conservador)", "Sangramento moderado controlado", "Estímulo do nervo obturador"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Cirurgia Realizada: Ressecção Transuretral de Tumor de Bexiga (RTU-B).

Achados Cirúrgicos: Uretra e próstata sem alterações obstrutivas. Na bexiga, identificou-se lesão ${c.aspecto_lesao} de aproximadamente ${c.tamanho_lesao} cm, ${c.numero_lesoes}, localizada em ${c.localizacao_lesao}. Óstios ureterais ${c.ostios}.

Descrição do Procedimento: Paciente posicionado em litotomia sob ${c.anestesia}. Após antissepsia, assepsia e colocação de campos estéreis, introduziu-se o ressectoscópio para inspeção completa da cavidade vesical. Realizou-se a ressecção completa da(s) lesão(ões), ${c.resseccao_muscular}. Hemostasia rigorosa do leito de ressecção com eletrocautério. Fragmentos retirados com evacuador de Ellik e enviados para análise anatomopatológica em frascos separados (tumor + base). Passagem de ${c.sonda} com balão insuflado com 30 mL de água destilada. ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta: Zero por 4 horas → Geral conforme aceitação.
2. Hidratação Venosa: Soro Fisiológico 0,9% 1000 mL IV em 12h.
3. Irrigação Vesical Contínua: SF 0,9% pela SVD de 3 vias — ajustar gotejamento para manter efluente claro/rosado.
4. Dipirona 1g IV de 6/6h.
5. Cetoprofeno 100mg IV de 12/12h.
6. Escopolamina (Buscopan) 20mg IV de 8/8h se espasmos vesicais.
7. Ondansetrona 4mg IV de 8/8h se náuseas.
8. Enoxaparina 40mg SC 1x/dia (iniciar 12h após cirurgia, se indicado).
9. Sinais vitais de 4/4h. Controle rigoroso do balanço hídrico.
10. Suspender irrigação quando efluente claro por mais de 2 horas.
11. Retirada da SVD conforme evolução (geralmente 24-48h).`,

      receitaAlta: (c) => `RECEITA DE ALTA

Uso Oral:
1. Dipirona 1g ––– Tomar 01 comprimido de 6/6 horas em caso de dor.
2. Macrodantina (Nitrofurantoína) 100mg ––– Tomar 01 cápsula de 12/12 horas por 5 dias.
3. Pyridium (Fenazopiridina) 100mg ––– Tomar 01 drágea de 8/8 horas por 3 dias, em caso de ardência.
4. Macrogol (Laxante) ––– Tomar 01 sachê diluído em água 1x ao dia se intestino preso.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento realizado: RTU de Tumor de Bexiga — lesão em ${c.localizacao_lesao}.

REPOUSO E ATIVIDADE:
Evitar esforço físico intenso e pegar peso por 15 a 20 dias para prevenir sangramento da ferida vesical. Evitar relações sexuais por 15 dias. Caminhadas leves são permitidas.

HIDRATAÇÃO:
Beber 2 a 3 litros de água por dia.

SANGRAMENTO:
É comum urinar sangue vivo ou pequenos coágulos, principalmente entre o 10º e o 14º dia pós-operatório (quando a "crosta" da ferida na bexiga cai). Aumente a ingestão de líquidos e repouse.

FUNÇÃO INTESTINAL:
Manter o intestino funcionando bem (fibras, frutas, água). Evitar fazer força para evacuar.

ACOMPANHAMENTO ONCOLÓGICO:
O retorno é FUNDAMENTAL para avaliar o resultado da biópsia (anatomopatológico) e definir a necessidade de tratamentos complementares (ex: BCG intravesical) ou novas cistoscopias de controle.

SINAIS DE ALERTA — Procurar o Pronto-Socorro se:
• Sangramento intenso com retenção urinária (não consegue urinar).
• Febre maior que 38°C.
• Dor abdominal intensa.

RETORNO: Agendar consulta de retorno em ___ dias para resultado do anatomopatológico.`
    }
  },
  {
    id: "rtu-prostata",
    name: "Ressecção Transuretral da Próstata (RTU-P)",
    shortName: "RTU-P",
    icon: "⚙️",
    category: "Próstata",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["raquianestesia", "raquianestesia + sedação", "anestesia geral"], defaultValue: "raquianestesia" },
      { id: "tamanho_ressectoscopio", label: "Ressectoscópio", type: "select", options: ["24 Fr", "26 Fr", "28 Fr"], defaultValue: "26 Fr" },
      { id: "achados_prostata", label: "Achados da Próstata", type: "select", options: ["lobos laterais e mediano aumentados, ocluindo a uretra prostática", "lobos laterais aumentados, mediano pouco proeminente", "lobo mediano predominante, lobos laterais pouco aumentados", "próstata trilobulada volumosa"], defaultValue: "lobos laterais e mediano aumentados, ocluindo a uretra prostática" },
      { id: "achados_bexiga", label: "Achados da Bexiga", type: "select", options: ["trabeculações de esforço", "trabeculações + divertículos", "bexiga de aspecto normal", "presença de cálculos vesicais"], defaultValue: "trabeculações de esforço" },
      { id: "sonda", label: "Sonda Vesical", type: "select", options: ["SVD 3 vias 20Fr", "SVD 3 vias 22Fr", "SVD 3 vias 24Fr"], defaultValue: "SVD 3 vias 22Fr" },
      { id: "balao", label: "Volume do Balão (mL)", type: "select", options: ["30", "40", "50", "60"], defaultValue: "40" },
      { id: "tracao", label: "Tração da Sonda", type: "select", options: ["Sim, por 2 horas", "Sim, por 4 horas", "Não realizada"], defaultValue: "Sim, por 2 horas" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado controlado", "Perfuração capsular mínima", "Síndrome pós-RTU (não ocorreu)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Cirurgia Realizada: Ressecção Transuretral da Próstata (RTU-P).

Achados Cirúrgicos: Uretra anterior sem estenoses. Próstata com ${c.achados_prostata}. Bexiga com ${c.achados_bexiga}.

Descrição do Procedimento: Paciente posicionado em litotomia sob ${c.anestesia}. Após antissepsia, assepsia e colocação de campos estéreis, realizou-se lubrificação uretral e passagem do ressectoscópio ${c.tamanho_ressectoscopio}. Inspeção da uretra, próstata e bexiga. Ressecção dos lobos prostáticos (laterais e mediano) desde o colo vesical até o verumontanum, com preservação rigorosa do esfíncter uretral externo. Hemostasia minuciosa do leito prostático com eletrocautério. Fragmentos prostáticos retirados com evacuador de Ellik e encaminhados para análise anatomopatológica. Passagem de ${c.sonda} com balão insuflado com ${c.balao} mL de água destilada. Instalação de irrigação vesical contínua com SF 0,9%.${c.tracao !== "Não realizada" ? ` Tração da sonda na coxa (${c.tracao}).` : ""} ${c.complicacoes}. Efluente claro ao final.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta: Zero por 4 horas → Geral conforme aceitação.
2. Hidratação Venosa: Soro Fisiológico 0,9% 1000 mL IV em 12h.
3. Irrigação Vesical Contínua: SF 0,9% pela SVD de 3 vias — ajustar gotejamento para manter efluente claro/rosado.
4. Dipirona 1g IV de 6/6h.
5. Escopolamina (Buscopan) 20mg IV de 8/8h se espasmos vesicais.
6. Ondansetrona 4mg IV de 8/8h se náuseas.
7. Enoxaparina 40mg SC 1x/dia (iniciar 12h após cirurgia, se indicado).
8. Sinais vitais de 4/4h. Controle rigoroso do balanço hídrico.${c.tracao !== "Não realizada" ? `\n9. Tração da sonda: manter por ${c.tracao.replace("Sim, por ", "")} e depois liberar.` : ""}
10. Suspender irrigação quando efluente claro por mais de 2 horas.
11. Retirada da SVD conforme evolução (geralmente 48-72h).`,

      receitaAlta: (c) => `RECEITA DE ALTA

Uso Oral:
1. Dipirona 1g ––– Tomar 01 comprimido de 6/6 horas em caso de dor.
2. Macrodantina (Nitrofurantoína) 100mg ––– Tomar 01 cápsula de 12/12 horas por 7 dias.
3. Pyridium (Fenazopiridina) 100mg ––– Tomar 01 drágea de 8/8 horas por 3 dias, em caso de ardência.
4. Macrogol (Laxante) ––– Tomar 01 sachê diluído em água 1x ao dia se intestino preso.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento realizado: Ressecção Transuretral da Próstata (RTU-P).

REPOUSO E ATIVIDADE:
Repouso relativo por 15 a 30 dias. Evitar dirigir por 1 a 2 semanas. Não levantar peso (mais de 5 kg). Evitar exercícios físicos intensos. Abstinência sexual por 30 dias.

SANGRAMENTO NA URINA:
É normal apresentar urina com sangue (rosada ou avermelhada) ou pequenos coágulos nas primeiras 3 a 4 semanas, especialmente após esforço físico ou ao evacuar. Se ocorrer, aumente a ingestão de água e repouse.

FUNÇÃO INTESTINAL:
Manter o intestino funcionando bem (fibras, frutas, água). EVITAR FAZER FORÇA para evacuar — isso pode causar sangramento.

HIDRATAÇÃO:
Beber 2 a 3 litros de água por dia.

SINTOMAS URINÁRIOS:
Após a retirada da sonda, é comum ter ardência, urgência (vontade incontrolável) e aumento da frequência urinária. Isso melhora gradualmente em algumas semanas.

EJACULAÇÃO RETRÓGRADA:
Após a RTU-P, é comum que o sêmen passe a ir para a bexiga em vez de sair pelo pênis durante o orgasmo. Isso NÃO é prejudicial à saúde, mas pode afetar a fertilidade.

SINAIS DE ALERTA — Procurar o Pronto-Socorro se:
• Incapacidade de urinar (retenção urinária).
• Sangramento urinário intenso (urina cor de vinho escuro) com muitos coágulos.
• Febre maior que 38°C.

RETORNO: Agendar consulta de retorno em ___ dias.`
    }
  },
  {
    id: "nefrolitotripsia-percutanea",
    name: "Nefrolitotripsia Percutânea (NLP)",
    shortName: "NLP",
    icon: "💎",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda"], defaultValue: "à esquerda" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["anestesia geral", "anestesia geral + peridural"], defaultValue: "anestesia geral" },
      { id: "posicao", label: "Posição Cirúrgica", type: "select", options: ["decúbito ventral (prona)", "decúbito modificado de Valdivia (supina)", "decúbito lateral (Galdakao)"], defaultValue: "decúbito ventral (prona)" },
      { id: "calice_puncao", label: "Cálice de Punção", type: "select", options: ["cálice inferior", "cálice médio", "cálice superior", "acesso intercostal (supracostal)"], defaultValue: "cálice inferior" },
      { id: "guia_puncao", label: "Guia de Punção", type: "select", options: ["fluoroscopia", "ultrassom", "fluoroscopia + ultrassom (combinada)"], defaultValue: "fluoroscopia" },
      { id: "dilatacao", label: "Dilatação do Trajeto", type: "select", options: ["dilatadores fasciais (Amplatz) até 30Fr", "dilatadores fasciais até 24Fr (mini-perc)", "balão dilatador até 30Fr"], defaultValue: "dilatadores fasciais (Amplatz) até 30Fr" },
      { id: "tipo_calculo", label: "Tipo/Localização do Cálculo", type: "select", options: ["cálculo pélvico", "cálculo coraliforme parcial", "cálculo coraliforme completo", "cálculo calicial inferior", "cálculo calicial múltiplo"], defaultValue: "cálculo pélvico" },
      { id: "tamanho_calculo", label: "Tamanho do Cálculo (mm)", type: "text", defaultValue: "25", placeholder: "Ex: 25" },
      { id: "fragmentacao", label: "Método de Fragmentação", type: "select", options: ["ultrassônico", "Laser Holmium", "balístico (pneumático)", "combinado (ultrassônico + balístico)"], defaultValue: "ultrassônico" },
      { id: "duplo_j", label: "Cateter Duplo J Anterógrado", type: "select", options: ["Sim", "Não"], defaultValue: "Sim" },
      { id: "nefrostomia", label: "Nefrostomia", type: "select", options: ["Sim - 14Fr", "Sim - 16Fr", "Sim - 18Fr", "Tubeless (sem nefrostomia)"], defaultValue: "Sim - 16Fr" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento moderado controlado", "Perfuração de sistema coletor", "Lesão pleural (hidrotórax)"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Cirurgia Realizada: Nefrolitotripsia Percutânea ${c.lateralidade}.

Achados Cirúrgicos: Identificado ${c.tipo_calculo} de aproximadamente ${c.tamanho_calculo} mm ${c.lateralidade}. Sistema coletor com dilatação moderada.

Descrição do Procedimento: Paciente submetido a ${c.anestesia}. Posicionado inicialmente em litotomia para passagem de cateter ureteral ${c.lateralidade} (para injeção de contraste). Reposicionado em ${c.posicao}. Punção do ${c.calice_puncao} guiada por ${c.guia_puncao}. Confirmação do acesso com injeção de contraste. Dilatação do trajeto com ${c.dilatacao}. Introdução do nefroscópio e identificação do cálculo. Fragmentação com energia ${c.fragmentacao} e extração dos fragmentos. Revisão calicial — stone free / fragmentos residuais mínimos.${c.duplo_j === "Sim" ? " Passagem de cateter Duplo J anterógrado." : ""}${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? ` Colocação de nefrostomia ${c.nefrostomia.replace('Sim - ', '')} no trajeto, fixada com fio inabsorvível.` : ""} Curativo compressivo. ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta: Zero por 6 horas → Líquida → Geral conforme aceitação.
2. Hidratação Venosa: Soro Fisiológico 0,9% 1500 mL IV em 24h.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Tramadol 50mg IV diluído em 100mL SF0,9% — se dor refratária.
6. Ondansetrona 4mg IV de 8/8h se náuseas.
7. Cefazolina 1g IV de 8/8h (antibioticoprofilaxia por 24h).
8. Enoxaparina 40mg SC 1x/dia.
9. Sinais vitais de 4/4h. Controle de diurese e aspecto da urina.${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? "\n10. Cuidados com nefrostomia: manter pérvio, anotar débito." : ""}
11. Hemograma de controle em 6-12h.
12. Raio-X simples de abdome (KUB) no 1º PO para avaliar fragmentos residuais.`,

      receitaAlta: (c) => `RECEITA DE ALTA

Uso Oral:
1. Dipirona 1g ––– Tomar 01 comprimido de 6/6 horas em caso de dor.
2. Ibuprofeno 600mg ––– Tomar 01 comprimido de 12/12 horas por 5 dias (com alimento).
3. Ciprofloxacino 500mg ––– Tomar 01 comprimido de 12/12 horas por 7 dias.
4. Macrogol (Laxante) ––– Tomar 01 sachê diluído em água 1x ao dia se intestino preso.${c.duplo_j === "Sim" ? "\n5. Tansulosina 0,4mg ––– Tomar 01 cápsula ao dia, após o jantar (enquanto estiver com Duplo J)." : ""}`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento realizado: Nefrolitotripsia Percutânea ${c.lateralidade}.

REPOUSO E ATIVIDADE:
Repouso relativo por 15 dias. Evitar qualquer esforço físico intenso, pegar peso e atividades sexuais.
${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? `
CUIDADOS COM A NEFROSTOMIA (sonda nas costas):
• Lavar o local de inserção com água e sabão diariamente.
• Secar bem e manter coberto com gaze limpa.
• Não puxar ou tracionar a sonda.
• A urina na bolsa coletora pode ficar avermelhada — isso é esperado.
• Esvaziar a bolsa regularmente.
` : ""}
HIDRATAÇÃO:
Beber 2 a 3 litros de água por dia.

SINAIS DE ALERTA — Procurar o Pronto-Socorro se:
• Febre maior que 38°C ou calafrios.
• Dor intensa refratária às medicações.
• Sangramento urinário volumoso.${c.nefrostomia !== "Tubeless (sem nefrostomia)" ? "\n• Vazamento excessivo de urina pelo local da nefrostomia." : ""}
• Saída de nefrostomia acidentalmente.

RETORNO: Agendar consulta de retorno em ___ dias para retirada da nefrostomia e/ou Duplo J.`
    }
  },
  {
    id: "postectomia",
    name: "Postectomia (Circuncisão)",
    shortName: "Postectomia",
    icon: "✂️",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["bloqueio peniano com lidocaína 2% sem vasoconstritor", "sedação + bloqueio peniano", "raquianestesia"], defaultValue: "bloqueio peniano com lidocaína 2% sem vasoconstritor" },
      { id: "indicacao", label: "Indicação", type: "select", options: ["fimose", "parafimose", "balanopostite de repetição", "estética/religiosa", "condiloma/lesão prepucial"], defaultValue: "fimose" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["técnica convencional (sleeve)", "técnica com dispositivo (Anel/Gomco)", "técnica com grampeador (stapler)"], defaultValue: "técnica convencional (sleeve)" },
      { id: "fio_sutura", label: "Fio de Sutura", type: "select", options: ["Monocryl 4-0 (pontos separados)", "Catgut simples 4-0 (pontos separados)", "Vicryl Rapide 4-0 (pontos separados)"], defaultValue: "Monocryl 4-0 (pontos separados)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado", "Edema moderado"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA

Cirurgia Realizada: Postectomia (Circuncisão).
Indicação: ${c.indicacao}.

Descrição do Procedimento: Paciente em decúbito dorsal sob ${c.anestesia}. Após antissepsia e colocação de campos estéreis, realizou-se a ${c.tecnica} com exérese do anel prepucial. Hemostasia rigorosa com bisturi elétrico. Síntese das bordas com ${c.fio_sutura}. Curativo compressivo com gaze e fita. ${c.complicacoes}.`,

      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

Procedimento ambulatorial — alta após recuperação.

1. Observação por 1 hora.
2. Dipirona 1g VO se dor.
3. Aplicar gelo local (sobre o curativo) por 15 min de 2/2h nas primeiras 6 horas.
4. Alta com curativo compressivo — orientar retirada em 24-48h.`,

      receitaAlta: (c) => `RECEITA DE ALTA

Uso Oral:
1. Dipirona 1g ––– Tomar 01 comprimido de 6/6 horas em caso de dor, por 3 a 5 dias.
2. Ibuprofeno 600mg ––– Tomar 01 comprimido de 8/8 horas por 3 dias (com alimento), se dor moderada.
3. Cefalexina 500mg ––– Tomar 01 comprimido de 6/6 horas por 7 dias (antibiótico).

Uso Tópico:
4. Pomada de Nebacetin (ou Mupirocina) ––– Aplicar fina camada sobre a ferida operatória 2x ao dia, após higiene, por 7 dias.`,

      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

Procedimento realizado: Postectomia (Circuncisão) por ${c.indicacao}.

CURATIVO:
Retirar o curativo inicial após 24 a 48 horas, preferencialmente durante o banho, molhando bem a gaze para não machucar.

HIGIENE:
Lavar o local com água e sabonete neutro diariamente. Secar com cuidado, dando leves toques com a toalha. Aplicar a pomada prescrita após a higiene.

EDEMA (INCHAÇO):
É NORMAL o pênis ficar inchado e arroxeado nos primeiros dias. Isso melhora progressivamente em 1 a 2 semanas.

PONTOS:
Os pontos são absorvíveis e cairão sozinhos em 10 a 20 dias. NÃO precisam ser retirados.

ATIVIDADE SEXUAL:
Abstinência sexual (incluindo masturbação) por 30 dias para garantir cicatrização adequada e evitar abertura dos pontos.

SINAIS DE ALERTA — Procurar o Pronto-Socorro se:
• Sangramento ativo que não para com compressão local por 10 minutos.
• Saída de secreção purulenta (pus) com odor fétido.
• Febre maior que 38°C.
• Dor extrema que não melhora com as medicações.

RETORNO: Agendar consulta de retorno em ___ dias para avaliação da cicatrização.`
    }
  },
];

export const categories = Array.from(new Set(procedures.map(p => p.category)));
