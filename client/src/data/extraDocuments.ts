// Documentos adicionais por procedimento
// Pré-operatório, TCLE, Evolução D1, Materiais/OPME, Exames Pós-Op, Relatório Convênio

export interface ExtraDocuments {
  preOperatorio: (config: Record<string, string>) => string;
  tcle: (config: Record<string, string>) => string;
  evolucaoD1: (config: Record<string, string>) => string;
  materiaisOPME: (config: Record<string, string>) => string;
  examesPosOp: (config: Record<string, string>) => string;
  relatorioConvenio: (config: Record<string, string>) => string;
}

// Templates genéricos que se aplicam a todos os procedimentos
const preOpGenerico = (procedimento: string) => (c: Record<string, string>) => `ORIENTAÇÕES PRÉ-OPERATÓRIAS

Procedimento: ${procedimento}
Paciente: ${c.paciente || "___"}
Data da Cirurgia: ${c.data_cirurgia || "___/___/___"}

JEJUM:
• Jejum absoluto de 8 horas antes do horário da cirurgia.
• Última refeição leve (sem frituras/gorduras).

MEDICAMENTOS:
• Manter: anti-hipertensivos (exceto IECA/BRA no dia).
• SUSPENDER 7 dias antes: AAS, Clopidogrel, Varfarina, Rivaroxabana, Apixabana.
• SUSPENDER 48h antes: Anti-inflamatórios (Ibuprofeno, Diclofenaco).
• SUSPENDER 10h antes: Metformina.
• Informar uso de insulina para ajuste de dose.

EXAMES PRÉ-OPERATÓRIOS (levar no dia):
• Hemograma, Coagulograma, Creatinina, Na, K.
• ECG (se >40 anos ou cardiopata).
• Risco cirúrgico (se solicitado).
• Urocultura (se procedimento endoscópico).
• Exames de imagem pertinentes (TC, US).

PREPARO ESPECÍFICO:
• Banho com clorexidina degermante na noite anterior e manhã da cirurgia.
• Tricotomia da região operatória na manhã (clipper, não lâmina).
• Trazer acompanhante maior de 18 anos.
• Chegar ao hospital com ${c.horario_internacao || "2h"} de antecedência.

DOCUMENTOS:
• RG e CPF.
• Carteirinha do convênio.
• Guias autorizadas.
• Exames pré-operatórios.
• TCLE assinado.`;

const tcleGenerico = (procedimento: string, riscos: string, beneficios: string) => (c: Record<string, string>) => `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO

Eu, ${c.paciente || "___"}, declaro que fui informado(a) pelo Dr. Felipe de Bulhões (CRM-SP 202.291) sobre o procedimento cirúrgico proposto e autorizo sua realização.

PROCEDIMENTO: ${procedimento}
ANESTESIA: ${c.anestesia || "A ser definida pelo anestesista"}

INDICAÇÃO: ${c.indicacao || "Conforme avaliação clínica e exames complementares."}

BENEFÍCIOS ESPERADOS:
${beneficios}

RISCOS E COMPLICAÇÕES POSSÍVEIS:
${riscos}

RISCOS GERAIS DE QUALQUER CIRURGIA:
• Infecção de sítio cirúrgico.
• Sangramento e necessidade de transfusão.
• Trombose venosa profunda / Tromboembolismo pulmonar.
• Reações adversas à anestesia.
• Lesão de estruturas adjacentes.
• Necessidade de conversão para cirurgia aberta (se minimamente invasiva).
• Necessidade de reintervenção.

Declaro que:
1. Fui informado(a) sobre alternativas terapêuticas.
2. Tive oportunidade de esclarecer todas as dúvidas.
3. Compreendo que o resultado não pode ser garantido.
4. Autorizo a realização de procedimentos adicionais se necessário durante o ato cirúrgico.

Data: ___/___/___

_________________________          _________________________
Paciente / Responsável              Dr. Felipe de Bulhões
                                    CRM-SP 202.291`;

const evolucaoD1Generica = (procedimento: string) => (c: Record<string, string>) => `EVOLUÇÃO PÓS-OPERATÓRIA — D1 PO

Data: ${c.data_evolucao || "___/___/___"}
Paciente: ${c.paciente || "___"}
Procedimento realizado: ${procedimento} (${c.data_cirurgia || "D0"})

S: ${c.queixa_d1 || "Paciente refere estar bem, sem queixas. Nega dor intensa, náuseas ou vômitos."}

O:
• BEG, corado, hidratado, afebril, acianótico.
• PA: ___  FC: ___  Tax: ___
• AR: MV+ bilateral, sem RA.
• ACV: BRNF 2T, sem sopros.
• ABD: Plano, flácido, RHA+, sem sinais de irritação peritoneal.
• FO: ${c.ferida_operatoria || "Limpo, seco, sem sinais flogísticos."}
• Diurese: ${c.diurese || "Clara, sem hematúria."}
• Dreno: ${c.dreno || "N/A"}

A: POI de ${procedimento}. Boa evolução.

P:
1. Dieta geral.
2. Manter analgesia VO.
3. Deambulação livre.
4. ${c.plano_adicional || "Alta hospitalar com orientações."}
5. Retorno ambulatorial em ___ dias.`;

const relatorioConvenioGenerico = (procedimento: string, codTUSS: string, justificativa: string) => (c: Record<string, string>) => `RELATÓRIO MÉDICO / JUSTIFICATIVA PARA AUTORIZAÇÃO

À Operadora: ${c.convenio || "___"}
Guia/Protocolo: ${c.numero_guia || "___"}

DADOS DO PACIENTE:
Nome: ${c.paciente || "___"}
Carteirinha: ${c.carteirinha || "___"}
Data de Nascimento: ${c.data_nascimento || "___/___/___"}

DADOS DO PROCEDIMENTO:
Procedimento Solicitado: ${procedimento}
Código TUSS: ${codTUSS}
Caráter: ${c.carater || "Eletivo"}
Regime: ${c.regime || "Internação (hospital-dia)"}

JUSTIFICATIVA CLÍNICA:
${justificativa}

HISTÓRIA CLÍNICA RESUMIDA:
${c.historia_clinica || "Paciente com indicação cirúrgica conforme avaliação clínica e exames complementares."}

EXAMES COMPLEMENTARES:
${c.exames_justificativa || "Conforme laudos anexos."}

CID-10: ${c.cid || "___"}

Solicito autorização para realização do procedimento acima descrito, que é clinicamente necessário e indicado conforme diretrizes da Sociedade Brasileira de Urologia (SBU) e American Urological Association (AUA).

São Paulo, ___/___/___

Dr. Felipe de Bulhões
CRM-SP 202.291 | RQE 146538
Urologista — Instituto D'Or de Ensino e Pesquisa`;

// Dados específicos por procedimento
export const extraDocsByProcedure: Record<string, ExtraDocuments> = {
  "ureterolitotripsia-rigida": {
    preOperatorio: preOpGenerico("Ureterolitotripsia Rígida"),
    tcle: tcleGenerico(
      "Ureterolitotripsia Rígida",
      `• Perfuração ou lesão ureteral.\n• Migração do cálculo para o rim.\n• Estenose ureteral tardia.\n• Hematúria prolongada.\n• Infecção urinária / Sepse urinária.\n• Cólica por fragmentos residuais.\n• Necessidade de novo procedimento.`,
      `• Desobstrução ureteral e alívio da dor.\n• Resolução da litíase.\n• Preservação da função renal.`
    ),
    evolucaoD1: evolucaoD1Generica("Ureterolitotripsia Rígida"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Ureterolitotripsia Rígida ${c.lateralidade || ""}
Hospital: ${c.hospital || "___"}
Data: ${c.data_cirurgia || "___/___/___"}

MATERIAIS OPME:
1. Fio guia hidrofílico 0.035″ x 150cm — 01 un.
2. Fibra de laser Holmium 200μm — 01 un.
3. Cesta extratora (basket) 2.4Fr — 01 un.
${c.duplo_j !== "Não implantado" ? `4. Cateter Duplo J ${c.duplo_j?.replace("Sim - ", "") || "6Fr x 26cm"} — 01 un.\n5. Fio guia rígido (backup) 0.035″ — 01 un.` : "4. Fio guia rígido (backup) 0.035″ — 01 un."}

EQUIPAMENTOS (do hospital):
• Ureteroscópio rígido 8/9.8Fr.
• Fonte de laser Holmium/Thulium.
• Arco em C (fluoroscopia).
• Torre de vídeo endoscopia.

MATERIAIS DE CONSUMO:
• Kit de cistoscopia (campo, sonda Foley, gel lubrificante).
• SF 0,9% 3000mL (irrigação).
• Sonda Foley 16-18Fr (se necessário).`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Ureterolitotripsia Rígida ${c.lateralidade || ""}
Paciente: ${c.paciente || "___"}

IMEDIATO (antes da alta):
• Rx simples de abdome (verificar posição do DJ e fragmentos residuais).

1 SEMANA:
• Urocultura (se sintomas urinários).

2-4 SEMANAS (retorno para retirada do DJ):
• TC de abdome sem contraste (stone protocol) — avaliar fragmentos residuais.
• Creatinina sérica (se rim único ou função renal limítrofe).

3 MESES:
• US de vias urinárias (controle).
• Análise metabólica: Urina 24h (cálcio, oxalato, citrato, ácido úrico, sódio, volume).

ANÁLISE DO CÁLCULO:
• Enviar fragmento para cristalografia/espectroscopia (se disponível).`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Ureterolitotripsia Rígida",
      "31.303.030",
      "Paciente com cálculo ureteral obstrutivo, com indicação de tratamento endoscópico conforme diretrizes da SBU/AUA/EAU. Litíase ureteral com indicação cirúrgica por: tamanho >6mm, dor refratária, obstrução com hidronefrose, ou falha de tratamento conservador."
    ),
  },
  "ureterolitotripsia-flexivel": {
    preOperatorio: preOpGenerico("Ureterolitotripsia Flexível"),
    tcle: tcleGenerico(
      "Ureterolitotripsia Flexível",
      `• Perfuração ou lesão ureteral.\n• Lesão de bainha de acesso.\n• Estenose ureteral tardia.\n• Hematúria prolongada.\n• Infecção urinária / Sepse urinária.\n• Fragmentos residuais com necessidade de novo procedimento.\n• Migração de fragmentos.\n• Avulsão ureteral (raro).`,
      `• Tratamento do cálculo renal sem incisões.\n• Preservação da função renal.\n• Alta precoce e rápida recuperação.`
    ),
    evolucaoD1: evolucaoD1Generica("Ureterolitotripsia Flexível"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Ureterolitotripsia Flexível ${c.lateralidade || ""}
Hospital: ${c.hospital || "___"}
Data: ${c.data_cirurgia || "___/___/___"}

MATERIAIS OPME:
1. Bainha de acesso ureteral ${c.bainha_acesso?.replace("Sim - ", "") || "12/14Fr"} x 36cm — 01 un.
2. Fio guia hidrofílico 0.035″ x 150cm — 02 un.
3. Fibra de laser Holmium 200μm — 01 un.
4. Cesta extratora (basket) 1.9Fr (tipless) — 01 un.
5. Cateter Duplo J ${c.duplo_j?.replace("Sim - ", "") || "6Fr x 26cm"} — 01 un.

EQUIPAMENTOS (do hospital):
• Ureteroscópio flexível digital.
• Fonte de laser Holmium/Thulium.
• Arco em C (fluoroscopia).
• Torre de vídeo endoscopia.

MATERIAIS DE CONSUMO:
• Kit de cistoscopia.
• SF 0,9% 6000mL (irrigação sob pressão).
• Bomba de irrigação.
• Sonda Foley 16Fr.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Ureterolitotripsia Flexível ${c.lateralidade || ""}
Paciente: ${c.paciente || "___"}

IMEDIATO (antes da alta):
• Rx simples de abdome (posição do DJ).

2-4 SEMANAS (retorno para retirada do DJ):
• TC de abdome sem contraste (stone protocol).
• Creatinina sérica.

3 MESES:
• US de vias urinárias.
• Análise metabólica: Urina 24h (cálcio, oxalato, citrato, ácido úrico, sódio, volume).
• Cristalografia do cálculo (se disponível).`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Ureterolitotripsia Flexível a Laser",
      "31.303.048",
      "Paciente com cálculo renal com indicação de tratamento endoscópico flexível. Indicações: cálculo renal 10-20mm, cálculo em cálice inferior com anatomia desfavorável para LECO, falha de LECO prévia, ou preferência por abordagem minimamente invasiva conforme guidelines EAU/AUA 2023."
    ),
  },
  "cistoscopia": {
    preOperatorio: preOpGenerico("Cistoscopia Diagnóstica / Retirada de Duplo J"),
    tcle: tcleGenerico(
      "Cistoscopia",
      `• Hematúria transitória.\n• Infecção urinária.\n• Desconforto/ardência urinária temporária.\n• Perfuração vesical (raro).\n• Retenção urinária transitória.`,
      `• Avaliação diagnóstica da bexiga e uretra.\n• Retirada de cateter Duplo J.\n• Procedimento ambulatorial com rápida recuperação.`
    ),
    evolucaoD1: evolucaoD1Generica("Cistoscopia"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Cistoscopia ${c.indicacao_cisto || "Diagnóstica"}
Hospital: ${c.hospital || "___"}

MATERIAIS:
1. Gel lubrificante com lidocaína — 01 bisnaga.
2. Pinça de corpo estranho (se retirada de DJ) — 01 un.

EQUIPAMENTOS (do hospital):
• Cistoscópio flexível ou rígido.
• Torre de vídeo.
• Fonte de luz.

MATERIAIS DE CONSUMO:
• SF 0,9% 1000mL (irrigação).
• Campo estéril simples.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Cistoscopia
Paciente: ${c.paciente || "___"}

Geralmente não são necessários exames de rotina após cistoscopia diagnóstica.

SE BIÓPSIA REALIZADA:
• Resultado anatomopatológico em 7-14 dias.

SE HEMATÚRIA PERSISTENTE (>48h):
• Hemograma.
• Urocultura.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Cistoscopia",
      "31.302.017",
      "Paciente com indicação de cistoscopia para avaliação diagnóstica / retirada de cateter Duplo J. Indicações conforme protocolo: hematúria em investigação, controle oncológico, sintomas do trato urinário inferior, ou retirada de dispositivo intravesical."
    ),
  },
  "rtu-bexiga": {
    preOperatorio: preOpGenerico("Ressecção Transuretral de Tumor de Bexiga (RTU-B)"),
    tcle: tcleGenerico(
      "RTU de Bexiga",
      `• Hematúria e necessidade de irrigação vesical contínua.\n• Perfuração vesical (intra ou extraperitoneal).\n• Síndrome pós-RTU (absorção de líquido).\n• Infecção urinária / Sepse.\n• Estenose uretral tardia.\n• Lesão de óstio ureteral.\n• Necessidade de re-RTU (second look).\n• Ressecção incompleta.`,
      `• Diagnóstico histológico e estadiamento do tumor vesical.\n• Tratamento curativo de tumores superficiais.\n• Definição de conduta oncológica.`
    ),
    evolucaoD1: evolucaoD1Generica("RTU de Bexiga"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: RTU de Bexiga
Hospital: ${c.hospital || "___"}
Data: ${c.data_cirurgia || "___/___/___"}

MATERIAIS OPME:
1. Alça de ressecção monopolar/bipolar — 01 un.
2. Eletrodo esférico (roller ball) — 01 un.

EQUIPAMENTOS (do hospital):
• Ressectoscópio 26Fr.
• Gerador eletrocirúrgico (monopolar ou bipolar).
• Torre de vídeo endoscopia.
• Evacuador de Ellik.

MATERIAIS DE CONSUMO:
• Solução de irrigação (Manitol 3% se monopolar / SF se bipolar) — 10-20L.
• SVD 3 vias 20-22Fr — 01 un.
• Frascos para anatomopatológico (tumor + base separados).
• SF 0,9% 3000mL (irrigação contínua pós-op).`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: RTU de Bexiga
Paciente: ${c.paciente || "___"}

IMEDIATO:
• Hemograma (se sangramento significativo).

1-2 SEMANAS:
• Resultado anatomopatológico (AP).
• Discutir em equipe multidisciplinar se T1HG ou CIS.

4-6 SEMANAS:
• Re-RTU (second look) se: T1, alto grau, ausência de muscular na amostra.
• Iniciar BCG intravesical (se indicado pelo AP).

3 MESES:
• Cistoscopia de controle.
• Citologia urinária.

SEGUIMENTO ONCOLÓGICO:
• Baixo risco: cistoscopia 3m, 12m, depois anual.
• Alto risco: cistoscopia + citologia 3/3m por 2 anos, depois 6/6m.
• TC de abdome/tórax se T1HG ou invasão muscular.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Ressecção Transuretral de Tumor de Bexiga",
      "31.302.025",
      "Paciente com lesão vesical identificada em exame de imagem/cistoscopia, com indicação de ressecção transuretral para diagnóstico histológico, estadiamento e tratamento. Procedimento essencial conforme guidelines EAU/AUA/SBU para manejo de neoplasia vesical."
    ),
  },
  "rtu-prostata": {
    preOperatorio: preOpGenerico("Ressecção Transuretral da Próstata (RTU-P)"),
    tcle: tcleGenerico(
      "RTU de Próstata",
      `• Hematúria e necessidade de irrigação contínua.\n• Síndrome pós-RTU (hiponatremia dilucional) — se monopolar.\n• Perfuração capsular.\n• Incontinência urinária (geralmente transitória).\n• Ejaculação retrógrada (60-90%).\n• Disfunção erétil (5-10%).\n• Estenose uretral ou esclerose de colo vesical.\n• Necessidade de re-RTU.\n• Infecção / Sepse.`,
      `• Desobstrução do trato urinário inferior.\n• Melhora dos sintomas urinários (LUTS).\n• Melhora do fluxo urinário.\n• Prevenção de complicações da obstrução (retenção, ITU, insuficiência renal).`
    ),
    evolucaoD1: evolucaoD1Generica("RTU de Próstata"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: RTU de Próstata
Hospital: ${c.hospital || "___"}
Data: ${c.data_cirurgia || "___/___/___"}

MATERIAIS OPME:
1. Alça de ressecção monopolar/bipolar — 02 un.
2. Eletrodo esférico (roller ball) — 01 un.

EQUIPAMENTOS (do hospital):
• Ressectoscópio 26Fr.
• Gerador eletrocirúrgico.
• Torre de vídeo endoscopia.
• Evacuador de Ellik.

MATERIAIS DE CONSUMO:
• Solução de irrigação (Manitol 3% ou SF 0,9%) — 20-40L.
• SVD 3 vias 22Fr — 01 un.
• SF 0,9% 6000mL (irrigação contínua pós-op).
• Frasco para AP.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: RTU de Próstata
Paciente: ${c.paciente || "___"}

IMEDIATO:
• Hemograma + Na/K (risco de síndrome pós-RTU).

1-2 SEMANAS:
• Resultado anatomopatológico.
• Urocultura (se sintomas).

1 MÊS:
• Urofluxometria + resíduo pós-miccional.
• IPSS (comparar com pré-op).

3 MESES:
• PSA (novo baseline pós-ressecção).
• US de vias urinárias com RPM.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Ressecção Transuretral da Próstata",
      "31.303.099",
      "Paciente com Hiperplasia Prostática Benigna (HPB) com indicação cirúrgica por: LUTS moderados/graves refratários a tratamento clínico, retenção urinária recorrente, ITU de repetição, hematúria refratária, litíase vesical secundária, ou insuficiência renal obstrutiva. Próstata estimada em ___g. IPSS: ___."
    ),
  },
  "nefrolitotripsia-percutanea": {
    preOperatorio: preOpGenerico("Nefrolitotripsia Percutânea (NLP)"),
    tcle: tcleGenerico(
      "Nefrolitotripsia Percutânea",
      `• Sangramento significativo / necessidade de transfusão (5-8%).\n• Lesão de órgãos adjacentes (pleura, cólon, baço, fígado).\n• Pneumotórax / Hidrotórax.\n• Infecção / Sepse urinária.\n• Fístula urinária.\n• Fragmentos residuais com necessidade de novo procedimento.\n• Perda renal (nefrectomia — raro).\n• Lesão vascular com necessidade de embolização.`,
      `• Tratamento de cálculos renais grandes (>2cm) ou complexos.\n• Alta taxa de stone-free em procedimento único.\n• Preservação da função renal.`
    ),
    evolucaoD1: evolucaoD1Generica("Nefrolitotripsia Percutânea"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Nefrolitotripsia Percutânea ${c.lateralidade || ""}
Hospital: ${c.hospital || "___"}
Data: ${c.data_cirurgia || "___/___/___"}

MATERIAIS OPME:
1. Kit de punção percutânea (agulha 18G + dilatadores fasciais) — 01 un.
2. Bainha de Amplatz 30Fr — 01 un.
3. Fio guia rígido 0.035″ x 150cm — 02 un.
4. Fibra de laser Holmium 550μm — 01 un.
5. Cateter Duplo J 6Fr x 26cm — 01 un.
${c.nefrostomia !== "Não" ? "6. Cateter de nefrostomia 14Fr (Malecot/Foley) — 01 un." : ""}

EQUIPAMENTOS (do hospital):
• Nefroscópio rígido 24-26Fr.
• Fonte de laser Holmium/Thulium.
• Arco em C (fluoroscopia).
• US para punção (se técnica combinada).
• Litotriptor ultrassônico/pneumático.
• Torre de vídeo.

MATERIAIS DE CONSUMO:
• SF 0,9% 12000mL (irrigação sob pressão).
• SVD 16-18Fr — 01 un.
• Frascos para AP (se indicado).`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: NLP ${c.lateralidade || ""}
Paciente: ${c.paciente || "___"}

IMEDIATO (D1):
• Hemograma.
• Creatinina, Na, K.
• Rx simples de abdome (fragmentos residuais, posição de nefrostomia/DJ).

48-72h (antes da alta):
• TC de abdome sem contraste (avaliar stone-free).
• Hemograma de controle (se queda de Hb).

1 MÊS:
• US de vias urinárias.
• Creatinina.
• Retirada do DJ (se presente).

3 MESES:
• TC sem contraste (controle definitivo).
• Análise metabólica: Urina 24h.
• Cristalografia do cálculo.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Nefrolitotripsia Percutânea",
      "31.303.056",
      "Paciente com cálculo renal complexo/volumoso com indicação de nefrolitotripsia percutânea. Indicações: cálculo >2cm, cálculo coraliforme, cálculo em cálice inferior >1.5cm com anatomia desfavorável, falha de ULT flexível prévia, ou cálculo em rim com anomalia anatômica. Conforme guidelines EAU/AUA 2023."
    ),
  },
  "postectomia": {
    preOperatorio: preOpGenerico("Postectomia (Circuncisão)"),
    tcle: tcleGenerico(
      "Postectomia",
      `• Sangramento / Hematoma.\n• Infecção de ferida operatória.\n• Edema prolongado.\n• Resultado estético insatisfatório.\n• Excesso ou falta de pele residual.\n• Alteração de sensibilidade da glande.\n• Dor crônica (raro).\n• Lesão de glande ou uretra (raro).`,
      `• Tratamento de fimose/parafimose.\n• Prevenção de balanopostites de repetição.\n• Higiene facilitada.\n• Redução de risco de ISTs e HPV.`
    ),
    evolucaoD1: evolucaoD1Generica("Postectomia"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Postectomia
Hospital: ${c.hospital || "___"}

MATERIAIS:
• Fio absorvível (Vicryl Rapide 4-0 ou Catgut Cromado 4-0) — 02 un.
• Bisturi elétrico (cautério).

EQUIPAMENTOS:
• Instrumental de pequenas cirurgias.
• Eletrocautério.

MATERIAIS DE CONSUMO:
• Campo cirúrgico simples.
• Curativo compressivo (gaze + micropore).`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Postectomia
Paciente: ${c.paciente || "___"}

Não são necessários exames de rotina após postectomia.

SE INDICAÇÃO POR HPV:
• Peniscopia de controle em 3-6 meses.

SE INDICAÇÃO POR FIMOSE COM LESÃO SUSPEITA:
• Resultado anatomopatológico do prepúcio.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Postectomia",
      "31.301.011",
      "Paciente com fimose/parafimose com indicação de postectomia. Indicações: fimose verdadeira com impossibilidade de exposição da glande, balanopostites de repetição, parafimose, lesão suspeita em prepúcio, ou indicação profilática conforme avaliação clínica."
    ),
  },
  "varicocelectomia": {
    preOperatorio: preOpGenerico("Varicocelectomia Subinguinal Microcirúrgica"),
    tcle: tcleGenerico(
      "Varicocelectomia",
      `• Hidrocele reacional (5-10%).\n• Recidiva da varicocele (1-5%).\n• Atrofia testicular (raro).\n• Hematoma/seroma.\n• Infecção de ferida.\n• Lesão de artéria testicular (raro com microcirurgia).\n• Dor crônica inguinal.`,
      `• Melhora dos parâmetros seminais (60-80%).\n• Alívio de dor testicular.\n• Preservação da fertilidade.\n• Melhora dos níveis de testosterona.`
    ),
    evolucaoD1: evolucaoD1Generica("Varicocelectomia Subinguinal Microcirúrgica"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Varicocelectomia Subinguinal Microcirúrgica ${c.lateralidade || ""}
Hospital: ${c.hospital || "___"}

MATERIAIS OPME:
1. Fio Prolene 6-0 (ligadura de veias) — 02 un.
2. Clips vasculares (Weck/Hem-o-lok) — 01 cartela.

EQUIPAMENTOS:
• Microscópio cirúrgico (ou lupa 3.5-4.5x).
• Doppler microvascular intraoperatório.
• Instrumental de microcirurgia.

MATERIAIS DE CONSUMO:
• Fio absorvível (Vicryl 3-0, 4-0) para fechamento.
• Papaverina tópica (identificação de artéria).`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Varicocelectomia ${c.lateralidade || ""}
Paciente: ${c.paciente || "___"}

1 MÊS:
• US de bolsa escrotal com Doppler (avaliar recidiva, hidrocele).

3 MESES:
• Espermograma (primeiro controle — comparar com pré-op).

6 MESES:
• Espermograma (segundo controle).
• Testosterona total (se indicação por hipogonadismo).

12 MESES:
• Espermograma definitivo.
• US Doppler de controle.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Varicocelectomia Subinguinal Microcirúrgica",
      "31.301.038",
      "Paciente com varicocele clínica com indicação cirúrgica por: infertilidade com alteração de espermograma, dor testicular refratária, ou hipogonadismo associado. Varicocele grau ___. Espermograma com ___. Técnica microcirúrgica subinguinal (padrão-ouro conforme AUA/ASRM guidelines)."
    ),
  },
  "orquiectomia": {
    preOperatorio: preOpGenerico("Orquiectomia Radical Inguinal"),
    tcle: tcleGenerico(
      "Orquiectomia Radical Inguinal",
      `• Sangramento / Hematoma inguinal ou escrotal.\n• Infecção de ferida.\n• Dor crônica inguinal.\n• Necessidade de tratamento complementar (QT, RT).\n• Alteração hormonal (se bilateral).\n• Infertilidade (se bilateral ou testículo único).`,
      `• Diagnóstico histológico definitivo do tumor testicular.\n• Tratamento curativo de neoplasia testicular localizada.\n• Estadiamento patológico.`
    ),
    evolucaoD1: evolucaoD1Generica("Orquiectomia Radical Inguinal"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Orquiectomia Radical Inguinal ${c.lateralidade || ""}
Hospital: ${c.hospital || "___"}

MATERIAIS:
• Fio inabsorvível (Prolene/Seda 0) para ligadura do cordão — 02 un.
• Clips vasculares (Hem-o-lok) — 01 cartela.
${c.protese_testicular === "Sim" ? "• Prótese testicular de silicone — 01 un." : ""}

EQUIPAMENTOS:
• Instrumental de cirurgia geral.
• Eletrocautério.

MATERIAIS DE CONSUMO:
• Frasco para AP (testículo + cordão espermático).
• Dreno Penrose (se necessário).`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Orquiectomia Radical ${c.lateralidade || ""}
Paciente: ${c.paciente || "___"}

1 SEMANA:
• Resultado anatomopatológico.

2 SEMANAS (estadiamento):
• TC de tórax, abdome e pelve com contraste.
• Marcadores tumorais: AFP, beta-HCG, LDH.

1 MÊS:
• Marcadores tumorais (normalização).
• Testosterona total (se testículo único).

SEGUIMENTO ONCOLÓGICO (conforme estadiamento):
• Marcadores + TC conforme protocolo (vigilância vs QT vs RT).
• Criopreservação de sêmen (se não realizada pré-op e testículo contralateral presente).`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Orquiectomia Radical Inguinal",
      "31.301.046",
      "Paciente com massa testicular suspeita de neoplasia, com indicação de orquiectomia radical por via inguinal para diagnóstico histológico e tratamento. Marcadores tumorais: AFP ___, beta-HCG ___, LDH ___. US testicular com lesão sólida/heterogênea. Procedimento de urgência oncológica conforme guidelines EAU/AUA."
    ),
  },
  "hidrocelectomia": {
    preOperatorio: preOpGenerico("Hidrocelectomia"),
    tcle: tcleGenerico(
      "Hidrocelectomia",
      `• Hematoma escrotal.\n• Infecção de ferida.\n• Recidiva da hidrocele (5-10%).\n• Dor crônica.\n• Edema prolongado.\n• Atrofia testicular (raro).`,
      `• Resolução do acúmulo de líquido na bolsa escrotal.\n• Alívio do desconforto e peso.\n• Melhora estética.`
    ),
    evolucaoD1: evolucaoD1Generica("Hidrocelectomia"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Hidrocelectomia ${c.lateralidade || ""}
Hospital: ${c.hospital || "___"}

MATERIAIS:
• Fio absorvível (Vicryl 3-0) — 02 un.
• Dreno Penrose fino — 01 un (se grande volume).

EQUIPAMENTOS:
• Instrumental de cirurgia geral.
• Eletrocautério.

MATERIAIS DE CONSUMO:
• Suspensório escrotal.
• Curativo compressivo.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Hidrocelectomia ${c.lateralidade || ""}
Paciente: ${c.paciente || "___"}

Geralmente não são necessários exames de rotina.

1 MÊS:
• US de bolsa escrotal (se suspeita de recidiva ou hematoma organizado).

SE LÍQUIDO ENVIADO PARA CITOLOGIA:
• Resultado citológico.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Hidrocelectomia",
      "31.301.054",
      "Paciente com hidrocele volumosa/sintomática com indicação de correção cirúrgica. Hidrocele com volume estimado de ___mL, causando desconforto/limitação funcional. US de bolsa escrotal confirmando coleção líquida sem lesões sólidas associadas."
    ),
  },
  "prostatectomia-radical": {
    preOperatorio: preOpGenerico("Prostatectomia Radical"),
    tcle: tcleGenerico(
      "Prostatectomia Radical",
      `• Incontinência urinária (5-20% persistente).\n• Disfunção erétil (30-70%, dependendo da preservação neurovascular).\n• Estenose de anastomose vesicouretral (3-5%).\n• Sangramento / necessidade de transfusão.\n• Lesão retal (raro).\n• Linfocele (se linfadenectomia).\n• TVP/TEP.\n• Fístula urinária.\n• Necessidade de tratamento complementar (RT, HT).`,
      `• Tratamento curativo do câncer de próstata localizado.\n• Estadiamento patológico definitivo.\n• Possibilidade de cura oncológica.\n• Avaliação de margens cirúrgicas.`
    ),
    evolucaoD1: evolucaoD1Generica("Prostatectomia Radical"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Prostatectomia Radical ${c.tecnica_prost || "Videolaparoscópica"}
Hospital: ${c.hospital || "___"}
Data: ${c.data_cirurgia || "___/___/___"}

MATERIAIS OPME:
1. Trocárteres 5mm — 03 un.
2. Trocárteres 12mm — 02 un.
3. Clip aplicador (Hem-o-lok ML/L) — 02 cartelas.
4. Fio Monocryl 3-0 (anastomose) — 02 un.
5. Fio V-Loc 3-0 (anastomose vesicouretral) — 01 un.
6. Saco extrator (endobag) — 01 un.
7. SVD 18Fr — 01 un.
8. Dreno Blake 19Fr — 01 un.

EQUIPAMENTOS:
• Torre de videolaparoscopia / Sistema robótico.
• Instrumental laparoscópico.
• Bisturi harmônico / LigaSure.

MATERIAIS DE CONSUMO:
• CO2 medicinal.
• SF 0,9% 2000mL.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Prostatectomia Radical
Paciente: ${c.paciente || "___"}

D1 PO:
• Hemograma.
• Creatinina (débito do dreno — se >200mL, dosar creatinina do líquido).

7-14 DIAS:
• Resultado anatomopatológico (Gleason, margens, estadiamento pT).
• Retirada da SVD (7-14 dias, conforme cistografia se indicada).

6 SEMANAS:
• PSA (primeiro controle — esperar indetectável <0.2).
• Avaliação de continência (pad test).

3 MESES:
• PSA.
• IIEF-5 (avaliação de função erétil).
• Início de reabilitação peniana (se não iniciada).

SEGUIMENTO ONCOLÓGICO:
• PSA 3/3m por 2 anos, depois 6/6m até 5 anos, depois anual.
• Se PSA detectável: considerar RT de resgate ± HT.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Prostatectomia Radical Videolaparoscópica",
      "31.303.102",
      "Paciente com adenocarcinoma de próstata com indicação de prostatectomia radical. Gleason: ___. PSA: ___. Estadiamento clínico: ___. Grupo de risco: ___. Indicação conforme guidelines NCCN/EAU: expectativa de vida >10 anos, doença localizada, paciente candidato a tratamento curativo."
    ),
  },
  "vasectomia": {
    preOperatorio: preOpGenerico("Vasectomia"),
    tcle: tcleGenerico(
      "Vasectomia",
      `• Hematoma escrotal.\n• Infecção de ferida.\n• Granuloma espermático.\n• Dor crônica pós-vasectomia (1-2%).\n• Falha (recanalização espontânea — 0.1-0.5%).\n• Congestão epididimária.`,
      `• Contracepção definitiva masculina.\n• Procedimento ambulatorial minimamente invasivo.\n• Não altera função sexual ou hormonal.`
    ),
    evolucaoD1: evolucaoD1Generica("Vasectomia"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Vasectomia (Técnica No-Scalpel)
Hospital/Consultório: ${c.hospital || "___"}

MATERIAIS:
• Fio absorvível (Vicryl 4-0) — 01 un.
• Clips de titânio (opcional) — 01 cartela.

EQUIPAMENTOS:
• Pinça de dissecção no-scalpel (ringed clamp).
• Pinça de ponta afiada (sharp dissecting forceps).
• Eletrocautério (para cauterização intraluminal).

MATERIAIS DE CONSUMO:
• Anestésico local (Lidocaína 2% sem vasoconstritor) — 10mL.
• Campo estéril simples.
• Curativo oclusivo.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Vasectomia
Paciente: ${c.paciente || "___"}

3 MESES (ou após 20 ejaculações):
• Espermograma — confirmar azoospermia.
  - Se azoospermia: liberar método como contracepção definitiva.
  - Se espermatozoides presentes: repetir em 1 mês.
  - Se persistir: considerar falha e re-vasectomia.

IMPORTANTE:
• Manter método contraceptivo alternativo ATÉ confirmação de azoospermia.
• Não são necessários outros exames de rotina.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Vasectomia",
      "31.301.070",
      "Paciente com desejo de contracepção definitiva, com indicação de vasectomia conforme Lei nº 9.263/1996 (planejamento familiar). Paciente >25 anos e/ou com pelo menos 2 filhos vivos. Prazo de reflexão de 60 dias cumprido. TCLE assinado."
    ),
  },
  "leco": {
    preOperatorio: preOpGenerico("Litotripsia Extracorpórea por Ondas de Choque (LECO)"),
    tcle: tcleGenerico(
      "LECO",
      `• Hematúria (esperada).\n• Cólica renal por eliminação de fragmentos.\n• Steinstrasse (obstrução por múltiplos fragmentos).\n• Hematoma perirrenal (raro).\n• Falha do tratamento (necessidade de outro método).\n• Infecção / Sepse.`,
      `• Tratamento não invasivo de cálculos renais/ureterais.\n• Sem necessidade de incisões.\n• Procedimento ambulatorial.`
    ),
    evolucaoD1: evolucaoD1Generica("LECO"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: LECO
Hospital: ${c.hospital || "___"}

EQUIPAMENTOS:
• Litotritor extracorpóreo (eletromagnético/piezoelétrico).
• Fluoroscopia ou US para localização.

MATERIAIS DE CONSUMO:
• Gel de acoplamento.
• Analgesia (se sedação).

Obs: LECO geralmente não requer OPME específica.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: LECO
Paciente: ${c.paciente || "___"}

2 SEMANAS:
• Rx simples de abdome ou US (avaliar fragmentação).

1 MÊS:
• TC sem contraste (se fragmentos residuais em Rx).
• Avaliar necessidade de sessão adicional.

3 MESES:
• US de vias urinárias (controle definitivo).
• Se stone-free: análise metabólica (urina 24h).`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Litotripsia Extracorpórea por Ondas de Choque",
      "31.303.013",
      "Paciente com cálculo renal/ureteral com indicação de LECO. Indicações: cálculo renal <2cm (exceto cálice inferior >1cm com anatomia desfavorável), cálculo ureteral proximal <1cm. Conforme guidelines EAU/AUA. Cálculo de ___mm em ___."
    ),
  },
  "sling-masculino": {
    preOperatorio: preOpGenerico("Sling Masculino"),
    tcle: tcleGenerico(
      "Sling Masculino",
      `• Retenção urinária transitória.\n• Dor perineal.\n• Infecção de ferida/prótese.\n• Erosão uretral.\n• Falha do procedimento (persistência da incontinência).\n• Necessidade de revisão/retirada.\n• Disfunção erétil (raro).`,
      `• Tratamento da incontinência urinária pós-prostatectomia.\n• Melhora da qualidade de vida.\n• Procedimento menos invasivo que esfíncter artificial.`
    ),
    evolucaoD1: evolucaoD1Generica("Sling Masculino"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Sling Masculino (AdVance XP / ATOMS)
Hospital: ${c.hospital || "___"}

MATERIAIS OPME:
1. Kit de Sling Masculino (AdVance XP ou ATOMS) — 01 un.
2. SVD 16Fr — 01 un.

EQUIPAMENTOS:
• Cistoscópio (verificação intraoperatória).
• Instrumental de cirurgia perineal.

MATERIAIS DE CONSUMO:
• Antibiótico profilático (Cefazolina 2g).
• SF 0,9% 500mL (irrigação).`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Sling Masculino
Paciente: ${c.paciente || "___"}

1 SEMANA:
• Urocultura (se sintomas).
• Resíduo pós-miccional (US ou BladderScan).

1 MÊS:
• Pad test 24h (comparar com pré-op).
• Urofluxometria + RPM.
• Questionário de continência (ICIQ-SF).

3 MESES:
• Pad test 24h.
• Avaliação de satisfação.

6-12 MESES:
• Pad test definitivo.
• Urodinâmica (se resultado insatisfatório).`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Implante de Sling Masculino",
      "31.303.200",
      "Paciente com incontinência urinária de esforço pós-prostatectomia radical, com indicação de sling masculino. Pad test: ___ g/24h. Incontinência grau leve-moderada (1-3 pads/dia). Falha de fisioterapia pélvica por ___meses. Urodinâmica com pressão de perda ___cmH2O."
    ),
  },
  "protese-peniana": {
    preOperatorio: preOpGenerico("Implante de Prótese Peniana"),
    tcle: tcleGenerico(
      "Implante de Prótese Peniana",
      `• Infecção da prótese (1-3%) — pode necessitar retirada.\n• Mau funcionamento mecânico.\n• Erosão da prótese.\n• Encurtamento peniano percebido.\n• Dor crônica.\n• Hematoma.\n• Necessidade de revisão/troca.\n• Resultado estético insatisfatório.`,
      `• Tratamento definitivo da disfunção erétil refratária.\n• Alta taxa de satisfação (>90%).\n• Ereção sob demanda.\n• Não interfere na ejaculação ou orgasmo.`
    ),
    evolucaoD1: evolucaoD1Generica("Implante de Prótese Peniana"),
    materiaisOPME: (c) => `SOLICITAÇÃO DE MATERIAIS / OPME

Procedimento: Implante de Prótese Peniana ${c.tipo_protese || "Inflável 3 peças"}
Hospital: ${c.hospital || "___"}
Data: ${c.data_cirurgia || "___/___/___"}

MATERIAIS OPME:
1. Prótese Peniana ${c.tipo_protese || "Inflável 3 peças"} (Coloplast Titan / AMS 700) — 01 kit.
2. Dilatadores de Hegar (set) — uso do hospital.
3. Dreno Penrose fino — 01 un.

EQUIPAMENTOS:
• Instrumental de cirurgia genital.
• Eletrocautério.
• Closing tool (fornecido com o kit).

MATERIAIS DE CONSUMO:
• Antibiótico tópico (Rifampicina + Gentamicina para banho da prótese).
• SVD 16Fr — 01 un.
• Curativo compressivo.`,
    examesPosOp: (c) => `EXAMES PÓS-OPERATÓRIOS

Procedimento: Implante de Prótese Peniana
Paciente: ${c.paciente || "___"}

1 SEMANA:
• Avaliação de ferida operatória.
• Hemograma (se suspeita de infecção).

4-6 SEMANAS:
• Ativação da prótese (ciclo de insuflação/desinsuflação).
• Orientação de uso.

3 MESES:
• Avaliação de satisfação.
• IIEF-5.
• Verificação de funcionamento mecânico.

ANUAL:
• Consulta de seguimento.
• Avaliação mecânica.`,
    relatorioConvenio: relatorioConvenioGenerico(
      "Implante de Prótese Peniana",
      "31.301.089",
      "Paciente com disfunção erétil refratária a tratamento clínico, com indicação de implante de prótese peniana. Falha de: PDE5i (Sildenafila, Tadalafila), injeção intracavernosa (Trimix/Bimix), vacuum. IIEF-5: ___. Etiologia: ___. Conforme guidelines AUA/EAU para DE refratária."
    ),
  },
};

// Função para obter documentos extras de um procedimento
export function getExtraDocs(procedureId: string): ExtraDocuments | null {
  return extraDocsByProcedure[procedureId] || null;
}
