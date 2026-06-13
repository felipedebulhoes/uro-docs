// AUTO-GERADO (build_extra_procedures.py): procedimentos do Atlas adicionados ao catálogo.
// Conteúdo clínico padronizado para o Dr. Felipe Bulhões. Fontes: EAU/AUA/SBU/Campbell-Walsh-Wein 13ª ed.
import type { Procedure } from "./procedures";

export const proceduresExtra: Procedure[] = [
  {
    id: "frenuloplastia",
    name: "Frenuloplastia peniana (correção de freio curto)",
    shortName: "Frenuloplastia",
    icon: "✂️",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Anestesia local", "Bloqueio peniano", "Sedação + Bloqueio peniano"], defaultValue: "Bloqueio peniano" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["Incisão transversal e sutura longitudinal", "Z-plastia", "Excisão do freio"], defaultValue: "Incisão transversal e sutura longitudinal" },
      { id: "fio_sutura", label: "Fio de Sutura", type: "select", options: ["Monocryl 4-0", "Monocryl 5-0", "Vicryl Rapide 4-0", "Catgut simples 4-0"], defaultValue: "Monocryl 4-0" },
      { id: "hemostasia", label: "Hemostasia", type: "select", options: ["Eletrocautério", "Compressão", "Bisturi elétrico bipolar"], defaultValue: "Eletrocautério" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Frenuloplastia peniana
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal.
2. Antissepsia da genitália com clorexidina aquosa e colocação de campos estéreis.
3. Realizada ${c.anestesia}.
4. Retração do prepúcio e exposição do freio balanoprepucial.
5. Aplicação de pinças hemostáticas no freio, se necessário.
6. Realizada ${c.tecnica} com bisturi lâmina 15.
7. Hemostasia rigorosa com ${c.hemostasia}.
8. Aproximação das bordas e sutura com ${c.fio_sutura} em pontos separados.
9. Revisão da hemostasia e do aspecto estético-funcional.
10. Curativo oclusivo leve com gaze e pomada cicatrizante/antibiótica.
Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO
1. Dieta livre.
2. Acesso venoso salinizado (se aplicável).
3. Dipirona 1g IV ou VO se dor.
4. Cetoprofeno 100mg IV ou VO se dor forte.
5. Curativo compressivo leve no pênis.
6. Alta hospitalar/ambulatorial após recuperação da ${c.anestesia} e micção espontânea.`,
      receitaAlta: (c) => `RECEITA DE ALTA
1. Dipirona 500mg ------ 1 caixa
Tomar 01 comprimido via oral de 6/6 horas em caso de dor.
2. Ibuprofeno 600mg ------ 1 caixa
Tomar 01 comprimido via oral de 8/8 horas por 3 a 5 dias.
3. Pomada de Colagenase + Cloranfenicol (ou similar) ------ 1 bisnaga
Aplicar no local da incisão 2 vezes ao dia, após higiene, por 7 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA
REPOUSO:
- Repouso relativo nos primeiros 2 a 3 dias.
- Evitar atividades físicas intensas por 15 dias.
- Abstinência sexual (incluindo masturbação) por 21 a 30 dias, até completa cicatrização e queda dos pontos.

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Manter o curativo inicial até o dia seguinte.
- Lavar o local diariamente com água e sabonete neutro durante o banho, secando bem com toalha limpa (sem esfregar).
- Aplicar a pomada prescrita conforme orientação.
- Os pontos (${c.fio_sutura}) caem sozinhos em 10 a 21 dias, não sendo necessária a retirada.
- É normal apresentar leve inchaço (edema) e arroxeamento (equimose) na região nos primeiros dias.

SINAIS DE ALERTA (Procurar PS):
- Sangramento ativo que não cessa com compressão local por 10 minutos.
- Dor intensa não aliviada pelas medicações.
- Saída de secreção purulenta ou vermelhidão excessiva no local da cirurgia.
- Febre (temperatura > 37,8°C).

RETORNO:
- Retorno ambulatorial em 7 a 14 dias para reavaliação.`,
    },
  },
  {
    id: "prepucioplastia",
    name: "Prepucioplastia / plástica prepucial poupadora de prepúcio",
    shortName: "Prepucioplastia",
    icon: "✂️",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Bloqueio peniano", "Sedação + Bloqueio peniano", "Raquianestesia", "Anestesia local"], defaultValue: "Sedação + Bloqueio peniano" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["Incisão dorsal longitudinal e sutura transversal", "Múltiplas incisões longitudinais e sutura transversal", "Z-plastia", "V-Y plastia"], defaultValue: "Incisão dorsal longitudinal e sutura transversal" },
      { id: "fios", label: "Fio de Sutura", type: "select", options: ["Monocryl 4-0", "Monocryl 5-0", "Vicryl Rapide 4-0", "Catgut simples 4-0"], defaultValue: "Monocryl 4-0" },
      { id: "curativo", label: "Curativo", type: "select", options: ["Gaze e micropore", "Gaze e atadura", "Coban levemente compressivo"], defaultValue: "Gaze e micropore" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Prepucioplastia / plástica prepucial poupadora de prepúcio
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da genitália com clorexidina alcoólica ou aquosa e colocação de campos estéreis.
3. Retração cuidadosa do prepúcio para exposição do anel fimótico.
4. Realização de ${c.tecnica} na área de constrição do anel fimótico.
5. Divulsão delicada de eventuais aderências balanoprepuciais e liberação completa da glande.
6. Hemostasia rigorosa com eletrocautério bipolar.
7. Sutura das bordas da incisão utilizando fio ${c.fios}, garantindo o alargamento do anel prepucial sem ressecção de pele.
8. Retorno do prepúcio à posição anatômica, cobrindo a glande.
9. Limpeza local e confecção de curativo com ${c.curativo}.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta oral livre assim que bem acordado.
2. Acesso venoso salinizado (se aplicável).
3. Dipirona 1g IV ou VO de 6/6h se dor.
4. Cetoprofeno 100mg IV de 12/12h se dor forte.
5. Ondansetrona 4mg IV ou VO se náuseas ou vômitos.
6. Sinais vitais de rotina.
7. Alta hospitalar após micção espontânea e tolerância à dieta (procedimento ambulatorial).`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g: Tomar 01 comprimido por via oral de 6/6 horas em caso de dor. (1 caixa)
2. Ibuprofeno 600mg: Tomar 01 comprimido por via oral de 8/8 horas por 3 a 5 dias. (1 caixa)
3. Cefalexina 500mg: Tomar 01 comprimido por via oral de 6/6 horas por 5 dias. (1 caixa)
4. Pomada de Dexametasona + Neomicina (ou similar): Aplicar fina camada no local da incisão 2x ao dia por 7 dias. (1 bisnaga)`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 2 a 3 dias.
- Evitar atividades físicas intensas (academia, corrida, bicicleta) por 15 a 20 dias.
- Abstinência sexual (incluindo masturbação) por 3 a 4 semanas, até a cicatrização completa e queda dos pontos.

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Manter o curativo (${c.curativo}) nas primeiras 24 horas. Após, retirar durante o banho com água morna.
- Lavar o local diariamente com água e sabonete neutro. Secar bem com toalha limpa ou gaze.
- Retrair o prepúcio suavemente durante o banho para limpeza da glande e aplicar a pomada prescrita, retornando o prepúcio à posição normal em seguida (muito importante para evitar parafimose).
- Os pontos (fio ${c.fios}) cairão sozinhos em 10 a 20 dias, não sendo necessária a retirada no consultório.
- É normal apresentar inchaço (edema) e áreas arroxeadas (equimose) nos primeiros dias.

SINAIS DE ALERTA:
Procurar o Pronto-Socorro em caso de:
- Sangramento ativo e contínuo que não cessa com compressão local.
- Aumento progressivo e doloroso do volume peniano (hematoma expansivo).
- Dificuldade ou impossibilidade de urinar (retenção urinária).
- Febre (temperatura > 37,8°C) ou saída de secreção purulenta com mau cheiro pela ferida.
- Impossibilidade de retornar o prepúcio sobre a glande (parafimose).

RETORNO:
- Retorno agendado no consultório em 7 a 14 dias para reavaliação.`,
    },
  },
  {
    id: "vasovasostomia",
    name: "Reversão de vasectomia - vasovasostomia microcirúrgica em dois planos",
    shortName: "Vasovasostomia",
    icon: "🔬",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Raquianestesia com sedação"], defaultValue: "Raquianestesia" },
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Bilateral", "Unilateral à direita", "Unilateral à esquerda"], defaultValue: "Bilateral" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["Vasovasostomia microcirúrgica em dois planos", "Vasovasostomia microcirúrgica em plano único", "Vasoepididimostomia microcirúrgica"], defaultValue: "Vasovasostomia microcirúrgica em dois planos" },
      { id: "achado_fluido", label: "Achado do Fluido Vasal", type: "select", options: ["Espermatozoides presentes", "Fluido claro abundante", "Fluido espesso/opaco", "Ausência de fluido"], defaultValue: "Espermatozoides presentes" },
      { id: "fios", label: "Fios Utilizados", type: "select", options: ["Nylon 10-0 e 9-0", "Prolene 10-0 e 9-0", "Nylon 9-0 e 8-0"], defaultValue: "Nylon 10-0 e 9-0" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houver" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Reversão de vasectomia (${c.tecnica}) ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital e colocação de campos estéreis.
3. Incisão escrotal alta, bilateralmente (ou unilateral conforme ${c.lateralidade}), de aproximadamente 2 a 3 cm.
4. Dissecção por planos até a identificação do deferente e do granuloma espermático prévio.
5. Exérese do segmento fibrótico/granuloma de ambos os cotos do deferente até obtenção de tecido sadio e sangrante.
6. Cateterismo do coto abdominal com soro fisiológico para confirmar perviedade.
7. Expressão do coto testicular e análise do fluido vasal (Achado: ${c.achado_fluido}).
8. Aproximação dos cotos sem tensão utilizando clampes de aproximação microcirúrgicos.
9. Realização da anastomose sob magnificação microscópica (${c.tecnica}), utilizando fios de ${c.fios}.
10. Revisão rigorosa da hemostasia.
11. Fechamento por planos do tecido dartos e pele com fio absorvível.
12. Curativo compressivo local e elevação escrotal.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero até total recuperação anestésica, evoluindo para dieta livre.
2. Soro Fisiológico 0,9% 500 mL IV se necessário.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Suspensório escrotal contínuo.
7. Gelo local de forma intermitente (20 min a cada 2h).
8. Sinais vitais de 4/4h.
9. Alta hospitalar após micção espontânea, deambulação e controle álgico adequado.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g comprimido: Tomar 01 comprimido via oral de 6/6h por 5 dias, se dor.
2. Ibuprofeno 600mg comprimido: Tomar 01 comprimido via oral de 8/8h por 5 dias.
3. Cefalexina 500mg comprimido: Tomar 01 comprimido via oral de 6/6h por 7 dias.
4. Omeprazol 20mg cápsula: Tomar 01 cápsula via oral pela manhã, em jejum, por 5 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos, academia e carregar peso por 30 dias.
- Abstinência sexual e masturbação por 3 a 4 semanas.

CUIDADOS LOCAIS:
- Uso contínuo de suspensório escrotal ou cueca justa por 15 a 30 dias.
- Aplicação de gelo local (protegido por pano) por 20 minutos, 3 a 4 vezes ao dia, nos primeiros 3 dias.
- Manter o curativo limpo e seco. Trocar diariamente após o banho.
- Os pontos caem sozinhos em 10 a 15 dias, não sendo necessária a retirada.

SINAIS DE ALERTA:
- Procurar o Pronto Socorro em caso de: febre (temperatura > 37,8°C), dor intensa não aliviada pelas medicações, inchaço exagerado no escroto, sangramento ativo ou saída de secreção purulenta pela ferida operatória.

RETORNO:
- Retorno ambulatorial agendado em 7 a 14 dias para avaliação da ferida operatória.
- Espermograma de controle solicitado para 45 a 60 dias após a cirurgia.`,
    },
  },
  {
    id: "vasoepididimostomia",
    name: "Reversão de vasectomia - vasoepididimostomia microcirúrgica",
    shortName: "Vasoepididimostomia",
    icon: "🔬",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Sedação + Anestesia Local"], defaultValue: "Raquianestesia" },
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Bilateral", "Unilateral Direita", "Unilateral Esquerda"], defaultValue: "Bilateral" },
      { id: "tecnica", label: "Técnica de Anastomose", type: "select", options: ["Invaginação longitudinal (técnica de Marmar)", "Término-lateral clássica"], defaultValue: "Invaginação longitudinal (técnica de Marmar)" },
      { id: "fios", label: "Fios Utilizados", type: "select", options: ["Nylon 10-0 e 9-0", "Prolene 10-0 e 9-0"], defaultValue: "Nylon 10-0 e 9-0" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Reversão de vasectomia - vasoepididimostomia microcirúrgica ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital e colocação de campos estéreis.
3. Incisão escrotal anterior alta ou incisão subinguinal, conforme a ${c.lateralidade}.
4. Dissecção por planos até a identificação e exteriorização do testículo, epidídimo e segmento distal do ducto deferente.
5. Secção do ducto deferente distal à área de fibrose da vasectomia prévia, com confirmação de patência do coto abdominal através da injeção de soro fisiológico.
6. Inspeção do coto testicular do deferente e do epidídimo sob magnificação microscópica. Identificação de ausência de espermatozoides no fluido do deferente, indicando obstrução epididimária.
7. Dissecção da túnica albugínea do epidídimo e identificação de um túbulo epididimário dilatado.
8. Abertura do túbulo epididimário com microbisturi e confirmação da presença de espermatozoides no fluido epididimário.
9. Realização da anastomose vasoepididimária utilizando a técnica de ${c.tecnica}, com fios de ${c.fios} sob visão microscópica.
10. Revisão rigorosa da hemostasia.
11. Reposicionamento do testículo e cordão espermático na bolsa escrotal.
12. Fechamento por planos da incisão cirúrgica com fios absorvíveis e pele com fio de rápida absorção.
13. Curativo compressivo local e elevação da bolsa escrotal com suspensório.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre assim que bem acordado.
2. Soro Fisiológico 0,9% 500 mL IV se necessário.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Gelo local sobre a bolsa escrotal (protegido) por 15-20 minutos a cada 2 horas.
7. Manter suspensório escrotal.
8. Sinais vitais de rotina.
9. Alta hospitalar após recuperação anestésica, micção espontânea e controle álgico.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g: Tomar 01 comprimido via oral de 6/6 horas por 5 dias, se dor.
2. Ibuprofeno 600mg: Tomar 01 comprimido via oral de 8/8 horas por 5 dias.
3. Cefalexina 500mg: Tomar 01 comprimido via oral de 6/6 horas por 7 dias.
4. Omeprazol 20mg: Tomar 01 cápsula via oral pela manhã, em jejum, por 5 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos, carregar peso ou atividades de impacto por 3 a 4 semanas.
- Abstinência sexual e masturbação por 3 a 4 semanas para proteger a anastomose microcirúrgica.

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Uso contínuo de suspensório escrotal ou cueca justa por 15 a 30 dias, inclusive para dormir.
- Aplicação de compressas de gelo (envoltas em pano) na região escrotal por 15-20 minutos, 4 a 6 vezes ao dia, nos primeiros 3 dias.
- Manter o curativo limpo e seco. Pode tomar banho normalmente após 24 horas, lavando a ferida com água e sabão neutro.
- Os pontos geralmente caem sozinhos ou são absorvidos em 10 a 15 dias.

SINAIS DE ALERTA (Procurar PS):
- Dor intensa que não melhora com as medicações prescritas.
- Inchaço exagerado ou aumento súbito de volume na bolsa escrotal (suspeita de hematoma).
- Vermelhidão intensa, calor local ou saída de secreção purulenta pela ferida.
- Febre (temperatura > 37,8°C).

RETORNO:
- Retorno ambulatorial em 7 a 10 dias para avaliação da ferida operatória.
- O primeiro espermograma de controle deverá ser realizado entre 45 e 60 dias após a cirurgia, conforme orientação médica.`,
    },
  },
  {
    id: "espermatocelectomia",
    name: "Espermatocelectomia / exérese de cisto de epidídimo",
    shortName: "Espermatocelectomia",
    icon: "💧",
    category: "Andrologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Direita", "Esquerda", "Bilateral"], defaultValue: "Direita" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia local com sedação", "Anestesia geral"], defaultValue: "Raquianestesia" },
      { id: "tamanho_cisto", label: "Tamanho do Cisto", type: "text", defaultValue: "3 cm", placeholder: "ex: 3 cm" },
      { id: "dreno", label: "Uso de Dreno", type: "select", options: ["Sem dreno", "Dreno de Penrose exteriorizado por contra-abertura"], defaultValue: "Sem dreno" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Espermatocelectomia / exérese de cisto de epidídimo ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital e colocação de campos estéreis.
3. Incisão escrotal transversa ou longitudinal na rafe mediana/hemiescroto ${c.lateralidade}, de aproximadamente 3-4 cm.
4. Dissecção por planos (pele, dartos, fáscia espermática externa, cremáster, fáscia espermática interna) até a túnica vaginal.
5. Abertura da túnica vaginal e exteriorização do testículo e epidídimo ${c.lateralidade}.
6. Identificação do cisto de epidídimo (espermatocele), medindo aproximadamente ${c.tamanho_cisto}.
7. Dissecção cuidadosa do cisto de suas aderências ao epidídimo, preservando os túbulos epididimários adjacentes e a vascularização testicular.
8. Exérese completa do cisto intacto.
9. Hemostasia rigorosa do leito cruento com eletrocautério e fios absorvíveis finos.
10. Fechamento da túnica vaginal com fio absorvível.
11. Reposicionamento do testículo na bolsa escrotal na sua posição anatômica.
12. Revisão da hemostasia. Drenagem: ${c.dreno}.
13. Fechamento por planos: dartos com fio absorvível e pele com fio absorvível em pontos intradérmicos ou separados.
14. Curativo compressivo local e elevação da bolsa escrotal (suspensório escrotal).

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre após recuperação anestésica.
2. Soro Fisiológico 0,9% 500 mL IV se necessário.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Suspensório escrotal contínuo.
7. Gelo local intermitente (20 min a cada 2h).
8. Sinais vitais de rotina.
9. Alta hospitalar após micção espontânea, deambulação e controle da dor (geralmente no mesmo dia).`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g: Tomar 01 comprimido via oral de 6/6 horas por 5 dias, em caso de dor.
2. Cetoprofeno 100mg: Tomar 01 comprimido via oral de 12/12 horas por 5 dias.
3. Cefalexina 500mg: Tomar 01 comprimido via oral de 6/6 horas por 7 dias (a critério médico, se indicado).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos, carregar peso ou atividades esportivas por 15 a 30 dias.
- Abstinência sexual por 15 a 21 dias.

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Uso contínuo de suspensório escrotal ou cueca justa por 15 dias.
- Aplicação de compressas de gelo no local (protegido por pano) por 20 minutos, 3 a 4 vezes ao dia, nos primeiros 3 dias.
- Manter o curativo limpo e seco. Trocar diariamente após o banho.
- Os pontos geralmente são absorvíveis e caem sozinhos em 10 a 20 dias.

SINAIS DE ALERTA (Procurar PS):
- Aumento importante do volume escrotal (inchaço excessivo) ou hematoma volumoso.
- Dor intensa que não melhora com as medicações prescritas.
- Febre (temperatura > 37,8°C).
- Secreção purulenta ou vermelhidão intensa na ferida operatória.

RETORNO:
- Retorno ambulatorial agendado em 7 a 14 dias para reavaliação.`,
    },
  },
  {
    id: "epididimectomia",
    name: "Epididimectomia",
    shortName: "Epididimectomia",
    icon: "🥚",
    category: "Andrologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Direita", "Esquerda", "Bilateral"], defaultValue: "Direita" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio local com sedação"], defaultValue: "Raquianestesia" },
      { id: "indicacao", label: "Indicação", type: "select", options: ["Cisto de epidídimo", "Espermatocele", "Epididimite crônica", "Tumor benigno"], defaultValue: "Cisto de epidídimo" },
      { id: "dreno", label: "Uso de Dreno", type: "select", options: ["Sem dreno", "Dreno de Penrose", "Dreno de sucção (Porto-Vac)"], defaultValue: "Sem dreno" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Epididimectomia ${c.lateralidade}
Indicação: ${c.indicacao}
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital e colocação de campos cirúrgicos estéreis.
3. Incisão escrotal transversa ou longitudinal no hemiescroto ${c.lateralidade}, de aproximadamente 3 a 5 cm.
4. Dissecção por planos anatômicos até a túnica vaginal, que é incisada para exposição do testículo e epidídimo.
5. Identificação da lesão e do epidídimo (${c.indicacao}).
6. Dissecção cuidadosa do epidídimo, separando-o do testículo, com preservação rigorosa da vascularização testicular (artéria testicular).
7. Ligadura e secção do ducto deferente na cauda do epidídimo.
8. Exérese completa do epidídimo ${c.lateralidade}.
9. Revisão rigorosa da hemostasia com eletrocautério.
10. Fechamento da túnica vaginal com fio absorvível (Vicryl 3-0 ou 4-0).
11. Posicionamento de dreno: ${c.dreno}.
12. Fechamento do tecido subcutâneo (túnica dartos) com fio absorvível.
13. Síntese da pele com fio absorvível (Monocryl 4-0 ou Catgut simples 4-0) em pontos separados ou intradérmico.
14. Curativo compressivo local com gaze e suspensório escrotal.
Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO
1. Dieta zero até total recuperação anestésica, evoluindo para dieta livre conforme aceitação.
2. Soro Fisiológico 0,9% 500 mL IV, correr em 2 horas.
3. Dipirona 1g IV de 6/6 horas.
4. Cetoprofeno 100mg IV de 12/12 horas.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Manter suspensório escrotal e curativo compressivo.
7. Gelo local intermitente (20 minutos a cada 2 horas).
8. Sinais vitais de 4/4 horas.
9. Alta hospitalar após micção espontânea, deambulação e controle álgico adequado.`,
      receitaAlta: (c) => `RECEITA DE ALTA
1. Dipirona 1g comprimido: Tomar 01 comprimido via oral de 6/6 horas por 5 dias, em caso de dor.
2. Cetoprofeno 100mg comprimido: Tomar 01 comprimido via oral de 12/12 horas por 5 dias.
3. Cefalexina 500mg comprimido: Tomar 01 comprimido via oral de 6/6 horas por 7 dias.
4. Suspensório escrotal: Uso contínuo por 14 dias, retirando apenas para o banho.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA
REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos, carregar peso ou atividades esportivas por 21 a 30 dias.
- Abstinência sexual por 14 a 21 dias.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (água e sucos naturais).
- Manter o uso do suspensório escrotal (ou cueca justa) continuamente por 2 semanas.
- Aplicar compressas de gelo no local (protegido por um pano) por 15 a 20 minutos, 3 a 4 vezes ao dia, nos primeiros 3 dias.
- Lavar a ferida operatória com água e sabonete neutro durante o banho, secando bem em seguida.
- Os pontos caem sozinhos em 10 a 20 dias, não sendo necessária a retirada.
- Se houver dreno (${c.dreno}), seguir as orientações específicas para cuidados e agendar retorno precoce para retirada.

SINAIS DE ALERTA (Procurar Pronto-Socorro):
- Aumento importante do volume escrotal (inchaço excessivo).
- Dor intensa que não melhora com as medicações prescritas.
- Vermelhidão intensa, calor local ou saída de secreção purulenta pela ferida.
- Febre (temperatura maior que 37,8°C).
- Sangramento ativo e contínuo pelo corte.

RETORNO:
- Retorno ambulatorial agendado em 7 a 14 dias para reavaliação.`,
    },
  },
  {
    id: "protese-testicular",
    name: "Implante de prótese testicular",
    shortName: "Prótese Testicular",
    icon: "🥚",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio local com sedação"], defaultValue: "Raquianestesia" },
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Direita", "Esquerda", "Bilateral"], defaultValue: "Esquerda" },
      { id: "via_acesso", label: "Via de Acesso", type: "select", options: ["Inguinal", "Escrotal"], defaultValue: "Inguinal" },
      { id: "tamanho_protese", label: "Tamanho da Prótese", type: "select", options: ["Pequena (P)", "Média (M)", "Grande (G)"], defaultValue: "Média (M)" },
      { id: "fixacao", label: "Fixação da Prótese", type: "select", options: ["Fio inabsorvível (Prolene)", "Fio absorvível (Vicryl)", "Sem fixação"], defaultValue: "Fio inabsorvível (Prolene)" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Implante de prótese testicular ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal horizontal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região pélvica, inguinal e genital com clorexidina alcoólica e colocação de campos estéreis.
3. Incisão ${c.via_acesso} de aproximadamente 3 a 4 cm.
4. Dissecção por planos até a identificação do funículo espermático e/ou bolsa escrotal ipsilateral.
5. Criação de loja (bolsa) subdartoica no hemiescroto ${c.lateralidade} com espaço adequado para acomodação da prótese.
6. Preparo e lavagem da prótese testicular de silicone, tamanho ${c.tamanho_protese}, com solução antibiótica (gentamicina/rifamicina).
7. Inserção da prótese testicular na loja escrotal criada.
8. Fixação da prótese na porção dependente da bolsa escrotal utilizando ${c.fixacao}, para evitar rotação ou migração superior.
9. Fechamento do colo da bolsa escrotal (teto da loja) com fio absorvível (Vicryl 3-0) para evitar extrusão.
10. Revisão rigorosa da hemostasia.
11. Fechamento por planos do tecido subcutâneo com fio absorvível (Vicryl 3-0 ou 4-0).
12. Síntese da pele com fio absorvível (Monocryl 4-0) intradérmico ou pontos separados.
13. Curativo compressivo local e elevação da bolsa escrotal (suspensório escrotal).

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta: Zero até recuperação anestésica, após, dieta livre.
2. Hidratação: Soro Fisiológico 0,9% 500 ml IV ACM.
3. Analgesia: Dipirona 1g IV de 6/6h.
4. Analgesia de resgate: Cetoprofeno 100mg IV de 12/12h se dor forte.
5. Antiemético: Ondansetrona 4mg IV de 8/8h se náuseas.
6. Profilaxia: Cefazolina 1g IV (dose única intraoperatória).
7. Cuidados locais: Manter suspensório escrotal e curativo compressivo.
8. SSVV: Controle de sinais vitais conforme rotina.
9. Deambulação: Precoce, assim que recuperar sensibilidade/motricidade.
10. Alta hospitalar: Após micção espontânea, aceitação da dieta e controle da dor.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg ---------- 1 caixa
Tomar 1 comprimido, via oral, de 6 em 6 horas por 7 dias.

2. Dipirona 1g ---------- 1 caixa
Tomar 1 comprimido, via oral, de 6 em 6 horas, em caso de dor.

3. Cetoprofeno 100mg ---------- 1 caixa
Tomar 1 comprimido, via oral, de 12 em 12 horas, por 3 a 5 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 7 a 10 dias.
- Evitar esforços físicos intensos, carregar peso ou atividades de impacto por 30 dias.
- Abstinência sexual por 3 a 4 semanas.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Uso contínuo de suspensório escrotal ou cueca justa por 15 a 30 dias para evitar edema e desconforto.
- Aplicar compressas de gelo no local (protegidas por um pano) por 15 minutos, 3 a 4 vezes ao dia, nos primeiros 3 dias.
- Manter a ferida operatória limpa e seca. Lavar com água e sabonete neutro durante o banho.
- Os pontos geralmente são absorvíveis e caem sozinhos em 15 a 21 dias.

SINAIS DE ALERTA (Procurar Pronto-Socorro):
- Dor intensa que não melhora com as medicações prescritas.
- Aumento progressivo e acentuado do volume escrotal (inchaço excessivo) ou hematoma volumoso.
- Febre (temperatura > 37,8°C).
- Saída de secreção purulenta (pus) ou vermelhidão intensa na ferida operatória.
- Extrusão (exposição) da prótese pela ferida.

RETORNO:
- Retorno ambulatorial agendado em 7 a 14 dias para reavaliação da ferida operatória.`,
    },
  },
  {
    id: "orquidopexia",
    name: "Orquidopexia para criptorquidia / testículo retrátil",
    shortName: "Orquidopexia",
    icon: "🥚",
    category: "Andrologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Direita", "Esquerda", "Bilateral"], defaultValue: "Direita" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Anestesia Geral", "Raquianestesia", "Bloqueio loco-regional"], defaultValue: "Anestesia Geral" },
      { id: "posicao_testiculo", label: "Posição do Testículo", type: "select", options: ["Canal inguinal", "Anel inguinal externo", "Retrátil", "Ectópico"], defaultValue: "Canal inguinal" },
      { id: "tecnica_fixacao", label: "Técnica de Fixação", type: "select", options: ["Bolsa subdartoica (Schoemaker)", "Fixação com fio inabsorvível", "Bolsa subdartoica + fixação"], defaultValue: "Bolsa subdartoica (Schoemaker)" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento", "Dificuldade de descida do testículo", "Abertura inadvertida do saco herniário"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Orquidopexia ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal sob ${c.anestesia}.
2. Antissepsia da região inguinal, genital e abdominal inferior, seguida de colocação de campos estéreis.
3. Incisão transversa na prega inguinal ${c.lateralidade} (ou incisão escrotal alta, dependendo da técnica).
4. Dissecção por planos até a identificação da aponeurose do músculo oblíquo externo.
5. Abertura da aponeurose e identificação do funículo espermático e do testículo, que se encontrava na posição: ${c.posicao_testiculo}.
6. Liberação do testículo e do funículo espermático das aderências locais.
7. Dissecção e ligadura alta do conduto peritoneovaginal (saco herniário associado), quando presente.
8. Liberação retroperitoneal dos vasos espermáticos para garantir alongamento adequado do funículo.
9. Confecção de trajeto em direção ao escroto ${c.lateralidade}.
10. Incisão transversa na hemibolsa escrotal ${c.lateralidade} e confecção de bolsa subdartoica.
11. Passagem do testículo para a bolsa escrotal sem tensão.
12. Fixação do testículo utilizando a técnica: ${c.tecnica_fixacao}.
13. Revisão da hemostasia.
14. Fechamento por planos da incisão inguinal e escrotal com fios absorvíveis.
15. Curativo oclusivo.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO
1. Dieta: Livre assim que bem acordado.
2. Hidratação: Soro Fisiológico 0,9% 500ml IV se necessário.
3. Analgesia: Dipirona 1g IV de 6/6h.
4. Analgesia de resgate: Cetoprofeno 100mg IV de 12/12h se dor forte.
5. Antiemético: Ondansetrona 4mg IV se náuseas ou vômitos.
6. Sinais vitais: Controle de SSVV conforme rotina.
7. Deambulação: Precoce.
8. Critério de alta: Alta hospitalar após recuperação anestésica, aceitação da dieta e micção espontânea.`,
      receitaAlta: (c) => `RECEITA DE ALTA
1. Dipirona 500mg/ml: Tomar 40 gotas (ou 1 comprimido de 1g) VO de 6/6h por 3 a 5 dias, em caso de dor.
2. Ibuprofeno 600mg: Tomar 1 comprimido VO de 8/8h por 3 a 5 dias.
3. Cefalexina 500mg: Tomar 1 comprimido VO de 6/6h por 5 dias (se indicado profilaxia estendida).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 7 a 10 dias.
- Evitar atividades físicas intensas, esportes de contato e andar de bicicleta por 30 dias.
- Retorno às atividades escolares/trabalho leves em 3 a 5 dias, conforme tolerância.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Manter a ferida operatória limpa e seca. Lavar com água e sabão durante o banho.
- Pode haver inchaço e equimose (roxo) na região inguinal e escrotal, que melhoram progressivamente.
- Uso de cueca mais justa ou suspensório escrotal pode trazer maior conforto nos primeiros dias.
- Os pontos geralmente são absorvíveis e caem sozinhos em 2 a 3 semanas.

SINAIS DE ALERTA (Procurar PS):
- Febre (temperatura > 38°C).
- Dor intensa que não melhora com as medicações prescritas.
- Sangramento volumoso ou saída de secreção purulenta pela ferida.
- Aumento súbito e doloroso do volume escrotal.

RETORNO:
- Retorno ambulatorial agendado em 7 a 14 dias para reavaliação.`,
    },
  },
  {
    id: "orquidopexia-torcao",
    name: "Orquidopexia na torção testicular (exploração escrotal de urgência)",
    shortName: "Orquidopexia (Torção)",
    icon: "🥚",
    category: "Funcional",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio local com sedação"], defaultValue: "Raquianestesia" },
      { id: "lateralidade", label: "Lateralidade da Torção", type: "select", options: ["Direita", "Esquerda", "Bilateral"], defaultValue: "Direita" },
      { id: "viabilidade", label: "Viabilidade Testicular", type: "select", options: ["Testículo viável com boa perfusão", "Testículo com isquemia reversível após distorção e aquecimento", "Testículo com isquemia severa, mas mantido", "Testículo inviável (necessitou orquiectomia)"], defaultValue: "Testículo viável com boa perfusão" },
      { id: "fixacao", label: "Técnica de Fixação", type: "select", options: ["Fixação em 3 pontos com fio inabsorvível (Prolene 4-0)", "Fixação em 2 pontos com fio inabsorvível", "Fixação em bolsa de Dartos"], defaultValue: "Fixação em 3 pontos com fio inabsorvível (Prolene 4-0)" },
      { id: "contralateral", label: "Abordagem Contralateral", type: "select", options: ["Realizada orquidopexia contralateral profilática", "Não realizada orquidopexia contralateral"], defaultValue: "Realizada orquidopexia contralateral profilática" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Exploração escrotal de urgência e Orquidopexia ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital e colocação de campos estéreis.
3. Incisão escrotal transversa na rafe mediana ou incisão transversa na hemibolsa ${c.lateralidade}.
4. Abertura por planos (pele, dartos, fáscia espermática externa, músculo cremaster, fáscia espermática interna) até a túnica vaginal.
5. Abertura da túnica vaginal e identificação do testículo e cordão espermático.
6. Constatada torção do cordão espermático. Realizada distorção manual do cordão.
7. Envolvimento do testículo com compressas mornas e aguardado tempo para avaliação da perfusão.
8. Avaliação da viabilidade: ${c.viabilidade}.
9. Realizada orquidopexia do testículo afetado: ${c.fixacao} entre a túnica albugínea e a túnica dartos, evitando os vasos e o epidídimo.
10. Abordagem do testículo contralateral: ${c.contralateral} utilizando a mesma técnica de fixação para prevenir torção futura.
11. Revisão rigorosa da hemostasia.
12. Fechamento da túnica vaginal com fio absorvível (Vicryl 4-0).
13. Fechamento da pele e dartos com pontos separados de fio absorvível (Monocryl 4-0 ou Catgut simples 4-0).
14. Curativo compressivo local com gaze e suspensório escrotal.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO
1. Dieta: Zero até recuperação anestésica, após, dieta livre.
2. Hidratação: Soro Fisiológico 0,9% 500 ml IV correr em 2 horas.
3. Analgesia: Dipirona 1g IV de 6/6h se dor.
4. Analgesia resgate: Cetoprofeno 100mg IV de 12/12h se dor forte.
5. Antiemético: Ondansetrona 4mg IV se náuseas ou vômitos.
6. Profilaxia: Cefazolina 1g IV (dose única pré-operatória já realizada).
7. Cuidados locais: Manter suspensório escrotal e aplicar bolsa de gelo local (protegida) por 15 minutos a cada 2 horas.
8. Sinais vitais: Controle de SSVV conforme rotina da RPA/Enfermaria.
9. Alta hospitalar: Após recuperação anestésica completa, micção espontânea e controle adequado da dor.`,
      receitaAlta: (c) => `RECEITA DE ALTA
1. Dipirona 1g comprimido: Tomar 01 comprimido via oral de 6/6 horas por 5 dias em caso de dor.
2. Ibuprofeno 600mg comprimido: Tomar 01 comprimido via oral de 8/8 horas por 3 a 5 dias (após as refeições).
3. Cefalexina 500mg comprimido: Tomar 01 comprimido via oral de 6/6 horas por 7 dias (se prescrito pelo cirurgião).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA
REPOUSO:
- Repouso relativo nos primeiros 7 a 10 dias.
- Evitar esforços físicos intensos, carregar peso ou atividades esportivas por 30 dias.
- Uso contínuo de suspensório escrotal ou cueca justa (tipo sunga) por 15 a 30 dias para elevação da bolsa escrotal e alívio da dor.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (água, sucos naturais).
- Aplicar compressas de gelo (envoltas em um pano limpo para não queimar a pele) na região escrotal por 15-20 minutos, 3 a 4 vezes ao dia, nos primeiros 3 dias.
- Manter a ferida operatória limpa e seca. Lavar com água e sabonete neutro durante o banho.
- Os pontos geralmente caem sozinhos em 10 a 20 dias (se fio absorvível).

SINAIS DE ALERTA (Procurar Pronto-Socorro):
- Dor intensa e contínua que não melhora com as medicações prescritas.
- Aumento progressivo e acentuado do volume da bolsa escrotal (sugestivo de hematoma).
- Vermelhidão intensa, calor local ou saída de secreção purulenta pela ferida.
- Febre (temperatura maior que 37,8°C).

RETORNO:
- Agendar retorno no consultório em 7 a 14 dias para reavaliação da ferida operatória e exame físico.`,
    },
  },
  {
    id: "biopsia-testicular",
    name: "Biópsia testicular diagnóstica",
    shortName: "Biópsia Testicular",
    icon: "🔬",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Anestesia local com sedação", "Raquianestesia", "Anestesia geral", "Bloqueio de cordão espermático"], defaultValue: "Anestesia local com sedação" },
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["à direita", "à esquerda", "bilateral"], defaultValue: "bilateral" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["Aberta (TESE)", "Percutânea por agulha (TESA)", "Microcirúrgica (micro-TESE)"], defaultValue: "Aberta (TESE)" },
      { id: "achados", label: "Achados", type: "text", defaultValue: "Material enviado para análise anatomopatológica e/ou pesquisa de espermatozoides.", placeholder: "Ex: túbulos seminíferos dilatados..." },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Biópsia testicular diagnóstica ${c.lateralidade}
Anestesia: ${c.anestesia}
Técnica: ${c.tecnica}

1. Paciente em decúbito dorsal horizontal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região escrotal, pênis, períneo e face interna das coxas com clorexidina alcoólica.
3. Colocação de campos cirúrgicos estéreis.
4. Apreensão e estabilização do testículo ${c.lateralidade} com a mão não dominante, tensionando a pele escrotal anterior.
5. Incisão transversal ou longitudinal de aproximadamente 1 a 2 cm na pele da rafe escrotal ou na face anterior do hemescroto.
6. Dissecção por planos (dartos e fáscias espermáticas) até a identificação da túnica vaginal.
7. Abertura da túnica vaginal e exposição da túnica albugínea do testículo.
8. Incisão de cerca de 5 mm na túnica albugínea com lâmina de bisturi nº 15, expondo o parênquima testicular (túbulos seminíferos).
9. Excisão de pequeno fragmento de tecido testicular com tesoura de íris ou lâmina, com cuidado para não tracionar excessivamente os túbulos.
10. Envio do material para análise: ${c.achados}.
11. Hemostasia rigorosa do leito biopsiado com eletrocautério bipolar.
12. Síntese da túnica albugínea com fio absorvível (Vicryl ou Monocryl 4-0 ou 5-0) em pontos contínuos ou separados.
13. Fechamento da túnica vaginal e fáscias com fio absorvível 4-0.
14. Síntese da pele escrotal com fio absorvível (Catgut simples ou Monocryl 4-0) em pontos separados.
15. Curativo compressivo local e elevação escrotal (suspensório).

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre assim que bem acordado.
2. Cabeceira elevada a 30 graus.
3. Acesso venoso salinizado (se aplicável).
4. Dipirona 1g IV ou VO de 6/6h se dor.
5. Cetoprofeno 100mg IV de 12/12h se dor forte (se função renal normal).
6. Ondansetrona 4mg IV ou VO se náuseas ou vômitos.
7. Gelo local sobre o curativo escrotal (protegido) por 15-20 minutos a cada 2 horas.
8. Suspensório escrotal contínuo.
9. Sinais vitais de 4/4h.
10. Alta hospitalar após recuperação anestésica completa, micção espontânea e controle da dor.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g comprimido: Tomar 01 comprimido por via oral de 6/6 horas em caso de dor.
2. Ibuprofeno 600mg comprimido: Tomar 01 comprimido por via oral de 8/8 horas por 3 a 5 dias.
3. Suspensório escrotal: Uso contínuo por 7 a 10 dias, retirando apenas para banho.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 2 a 3 dias.
- Evitar esforços físicos intensos, academia, corrida ou levantamento de peso por 10 a 14 dias.
- Abstinência sexual por 7 a 10 dias, ou conforme orientação médica.

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Manter o uso do suspensório escrotal (ou cueca justa) continuamente por 7 a 10 dias para reduzir o edema e o desconforto.
- Aplicar compressas de gelo (envoltas em um pano limpo para não queimar a pele) na região escrotal por 15 a 20 minutos, 3 a 4 vezes ao dia, nos primeiros 2 dias.
- O curativo pode ser retirado após 24 horas. Lavar a ferida operatória com água e sabonete neutro durante o banho e secar bem.
- Os pontos da pele são absorvíveis e cairão sozinhos em 2 a 3 semanas.

SINAIS DE ALERTA (Procurar PS):
- Aumento progressivo e importante do volume escrotal (suspeita de hematoma).
- Dor intensa e refratária aos analgésicos prescritos.
- Febre (temperatura > 37,8°C).
- Sangramento ativo ou saída de secreção purulenta pela ferida operatória.

RETORNO:
- Retorno ambulatorial agendado em 7 a 14 dias para reavaliação da ferida e discussão do resultado do anatomopatológico/pesquisa de espermatozoides.`,
    },
  },
  {
    id: "micro-tese",
    name: "Extração microcirúrgica de espermatozoides - micro-TESE",
    shortName: "micro-TESE",
    icon: "🔬",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio de cordão + Sedação"], defaultValue: "Raquianestesia" },
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Bilateral", "Direita", "Esquerda"], defaultValue: "Bilateral" },
      { id: "achados", label: "Achados intraoperatórios", type: "select", options: ["Túbulos seminíferos dilatados e opacos identificados", "Túbulos seminíferos escassos", "Ausência de túbulos dilatados evidentes"], defaultValue: "Túbulos seminíferos dilatados e opacos identificados" },
      { id: "sucesso_captacao", label: "Resultado da captação (sala)", type: "select", options: ["Espermatozoides móveis identificados a fresco", "Aguardando processamento laboratorial", "Espermatozoides não encontrados a fresco"], defaultValue: "Espermatozoides móveis identificados a fresco" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento leve controlado com cauterização bipolar", "Dificuldade de dissecção por fibrose"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Extração microcirúrgica de espermatozoides (micro-TESE) ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital e colocação de campos cirúrgicos estéreis.
3. Incisão mediana na rafe escrotal ou incisão transversa anterior no hemescroto, dissecção por planos até a túnica vaginal.
4. Abertura da túnica vaginal e exteriorização do testículo.
5. Posicionamento do microscópio cirúrgico (aumento de 15-25x).
6. Incisão equatorial ampla na túnica albugínea, poupando vasos subtunicais com auxílio de cautério bipolar.
7. Exploração minuciosa do parênquima testicular sob magnificação.
8. Achados: ${c.achados}.
9. Microdissecção e exérese de fragmentos contendo túbulos seminíferos com pinças de relojoeiro.
10. Envio imediato do material ao laboratório de reprodução humana presente em sala.
11. Resultado preliminar: ${c.sucesso_captacao}.
12. Hemostasia rigorosa do leito testicular com cautério bipolar.
13. Fechamento da túnica albugínea com fio inabsorvível (Prolene 5-0 ou 6-0) ou absorvível (Vicryl 5-0) em sutura contínua.
14. Reposicionamento do testículo, fechamento da túnica vaginal e dartos com Vicryl 4-0.
15. Fechamento da pele com Monocryl 4-0 ou categute cromado 4-0 intradérmico ou pontos separados.
16. Curativo compressivo e elevação escrotal.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre assim que o paciente estiver bem acordado.
2. Soro Fisiológico 0,9% 500 mL IV, se necessário para hidratação.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Suspensório escrotal ou cueca justa com curativo compressivo.
7. Gelo local (protegido) por 15-20 minutos a cada 2 horas.
8. Sinais vitais de rotina.
9. Alta hospitalar após recuperação anestésica, micção espontânea e controle adequado da dor.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g comprimido: Tomar 01 comprimido por via oral de 6/6 horas por 5 dias, em caso de dor.
2. Ibuprofeno 600mg comprimido: Tomar 01 comprimido por via oral de 8/8 horas por 3 a 5 dias (tomar após as refeições).
3. Cefalexina 500mg comprimido: Tomar 01 comprimido por via oral de 6/6 horas por 5 a 7 dias (se indicado profilaxia estendida).
4. Pantoprazol 40mg comprimido: Tomar 01 comprimido por via oral pela manhã, em jejum, enquanto estiver em uso do anti-inflamatório.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos, academia e esportes por 15 a 20 dias.
- Abstinência sexual por 10 a 14 dias.

CUIDADOS LOCAIS:
- Uso contínuo de suspensório escrotal ou cueca justa (tipo sunga) por 7 a 10 dias para elevação e conforto.
- Aplicação de compressas de gelo (envoltas em pano limpo) na região escrotal por 15-20 minutos, 4 a 6 vezes ao dia, nos primeiros 2 a 3 dias.
- Manter o curativo limpo e seco. Trocar diariamente após o banho.
- Os pontos da pele geralmente caem sozinhos em 10 a 15 dias (se utilizado fio absorvível).

SINAIS DE ALERTA:
Procurar o Pronto-Socorro em caso de:
- Aumento importante do volume escrotal (inchaço excessivo) ou hematoma volumoso.
- Dor intensa que não melhora com as medicações prescritas.
- Febre (temperatura > 37,8°C).
- Sangramento ativo e contínuo pela ferida operatória.
- Secreção purulenta ou vermelhidão intensa no local da incisão.

RETORNO:
- Retorno ambulatorial agendado em 7 a 10 dias para reavaliação da ferida operatória.
- Acompanhamento com a equipe de reprodução humana conforme orientação específica.`,
    },
  },
  {
    id: "pesa-tesa",
    name: "Aspiração de espermatozoides PESA/TESA",
    shortName: "PESA/TESA",
    icon: "🔬",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Local", "Local com sedação", "Bloqueio de cordão espermático"], defaultValue: "Local com sedação" },
      { id: "tecnica", label: "Técnica", type: "select", options: ["PESA (Aspiração Percutânea de Espermatozoides do Epidídimo)", "TESA (Aspiração Testicular de Espermatozoides)", "PESA e TESA combinadas"], defaultValue: "PESA (Aspiração Percutânea de Espermatozoides do Epidídimo)" },
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Bilateral", "À direita", "À esquerda"], defaultValue: "Bilateral" },
      { id: "sucesso_captacao", label: "Sucesso da Captação", type: "select", options: ["Espermatozoides móveis encontrados", "Espermatozoides imóveis encontrados", "Ausência de espermatozoides (encaminhado para TESE/microTESE)"], defaultValue: "Espermatozoides móveis encontrados" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva as intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Aspiração de espermatozoides (${c.tecnica}) ${c.lateralidade}
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal.
2. Antissepsia rigorosa da região genital com clorexidina alcoólica e colocação de campos estéreis.
3. Realizada anestesia tipo ${c.anestesia}.
4. Fixação manual do testículo e epidídimo.
5. Inserção de agulha fina (butterfly ou agulha 21G/23G) acoplada a seringa com meio de cultura.
6. Aspiração cuidadosa do fluido epididimário (PESA) e/ou tecido testicular (TESA) com pressão negativa.
7. Envio imediato do material aspirado ao laboratório de reprodução humana para análise a fresco.
8. Confirmação laboratorial: ${c.sucesso_captacao}.
9. Compressão local rigorosa para hemostasia.
10. Curativo compressivo local.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta oral livre assim que bem acordado.
2. Acesso venoso salinizado (se sedação).
3. Dipirona 1g IV se dor.
4. Ondansetrona 4mg IV se náuseas ou vômitos.
5. Gelo local contínuo.
6. Sinais vitais de rotina.
7. Alta hospitalar após recuperação anestésica e micção espontânea.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g comprimido: Tomar 01 comprimido via oral de 6/6 horas em caso de dor.
2. Ibuprofeno 600mg comprimido: Tomar 01 comprimido via oral de 8/8 horas por 3 dias.
3. Cefalexina 500mg comprimido: Tomar 01 comprimido via oral de 6/6 horas por 5 dias (profilaxia).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo por 2 a 3 dias.
- Evitar esforços físicos intensos, academia e esportes de contato por 7 a 10 dias.
- Abstinência sexual por 7 dias.

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Manter curativo limpo e seco.
- Aplicar bolsa de gelo no local (protegida por um pano) por 15-20 minutos a cada 2 horas nos primeiros 2 dias para reduzir o inchaço.
- Uso de suspensório escrotal ou cueca justa por 7 dias.

SINAIS DE ALERTA (Procurar PS):
- Aumento importante do volume escrotal (hematoma).
- Dor intensa que não melhora com as medicações prescritas.
- Febre (temperatura > 37,8°C).
- Sangramento ativo no local da punção.

RETORNO:
- Retorno ambulatorial agendado conforme orientação da equipe de reprodução humana e urologia.`,
    },
  },
  {
    id: "peyronie-plicatura",
    name: "Correção de Doença de Peyronie - plicatura de túnica (Nesbit/16 dot)",
    shortName: "Plicatura de Túnica",
    icon: "📐",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio Peniano com Sedação"], defaultValue: "Raquianestesia" },
      { id: "tecnica", label: "Técnica de Plicatura", type: "select", options: ["16-dot", "Nesbit", "Yachia", "Essed-Schröder"], defaultValue: "16-dot" },
      { id: "grau_curvatura", label: "Grau e Direção da Curvatura", type: "text", defaultValue: "60 graus dorsal", placeholder: "ex: 60 graus dorsal" },
      { id: "teste_erecao", label: "Teste de Ereção Artificial", type: "select", options: ["Soro Fisiológico", "Alprostadil intracavernoso"], defaultValue: "Soro Fisiológico" },
      { id: "fios_plicatura", label: "Fios da Plicatura", type: "select", options: ["Etibond 2-0", "Prolene 2-0", "PDS 2-0", "Nylon 2-0"], defaultValue: "Etibond 2-0" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Correção de Doença de Peyronie - plicatura de túnica
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da genitália e colocação de campos estéreis.
3. Realizado teste de ereção artificial com injeção intracavernosa de ${c.teste_erecao} e garroteamento na base do pênis.
4. Evidenciada curvatura peniana de aproximadamente ${c.grau_curvatura}.
5. Incisão circunferencial subcoronal e desnudamento do pênis até a base (degloving).
6. Dissecção cuidadosa do feixe neurovascular dorsal, quando necessário para a correção.
7. Marcação dos pontos de plicatura na túnica albugínea, no lado convexo da curvatura.
8. Realizada plicatura da túnica albugínea utilizando a técnica de ${c.tecnica} com fios de ${c.fios_plicatura}.
9. Novo teste de ereção artificial com ${c.teste_erecao}, confirmando a retificação completa do pênis.
10. Revisão da hemostasia, que se mostrou rigorosa.
11. Fechamento da fáscia de Buck e do tecido subcutâneo com fios absorvíveis.
12. Fechamento da pele com pontos separados de fio absorvível rápido.
13. Curativo compressivo leve ao redor do pênis.
14. Retirada do garrote e encaminhamento do paciente à RPA em boas condições.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre assim que bem acordado.
2. Soro Fisiológico 0,9% 500 mL IV se necessário.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Manter curativo compressivo.
7. Sinais vitais de rotina.
8. Alta hospitalar após recuperação anestésica, micção espontânea e ausência de sangramento ativo.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg - Tomar 01 comprimido via oral de 6/6 horas por 5 dias.
2. Dipirona 1g - Tomar 01 comprimido via oral de 6/6 horas em caso de dor.
3. Ibuprofeno 600mg - Tomar 01 comprimido via oral de 8/8 horas por 3 a 5 dias.
4. Tadalafila 5mg - Tomar 01 comprimido via oral à noite por 30 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos e atividades esportivas por 30 dias.
- Abstinência sexual (incluindo masturbação) rigorosa por 4 a 6 semanas, até liberação médica.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Manter o curativo compressivo por 24 a 48 horas, conforme orientado.
- Após a retirada do curativo, lavar o local diariamente com água e sabonete neutro durante o banho.
- Secar bem a ferida operatória e manter limpa.
- Os pontos da pele cairão sozinhos em 2 a 3 semanas.
- É normal apresentar inchaço (edema) e manchas roxas (equimose) no pênis e bolsa escrotal nos primeiros dias.
- Ereções noturnas podem causar desconforto leve a moderado; aplicar compressa fria (não gelo direto) na região inguinal pode ajudar.

SINAIS DE ALERTA:
Procurar o Pronto Socorro em caso de:
- Sangramento volumoso e contínuo pela ferida operatória.
- Aumento súbito e doloroso do volume peniano (hematoma em expansão).
- Febre (temperatura > 38°C).
- Dor intensa que não melhora com as medicações prescritas.
- Dificuldade ou impossibilidade de urinar.
- Saída de secreção purulenta (pus) com mau cheiro pela ferida.

RETORNO:
- Retorno agendado no consultório em 7 a 14 dias para reavaliação.`,
    },
  },
  {
    id: "peyronie-enxerto",
    name: "Correção de Doença de Peyronie - incisão/excisão de placa com enxerto",
    shortName: "Peyronie com Enxerto",
    icon: "🍌",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia + Sedação", "Anestesia Geral", "Raquianestesia"], defaultValue: "Raquianestesia + Sedação" },
      { id: "grau_curvatura", label: "Grau e Direção da Curvatura", type: "text", defaultValue: "60 graus dorsal", placeholder: "ex: 60 graus dorsal" },
      { id: "tecnica", label: "Técnica na Placa", type: "select", options: ["Incisão em H (Lue)", "Incisão dupla em Y", "Excisão parcial da placa", "Incisões múltiplas relaxantes"], defaultValue: "Incisão em H (Lue)" },
      { id: "tipo_enxerto", label: "Tipo de Enxerto", type: "select", options: ["Pericárdio bovino", "Mucosa oral", "Submucosa de intestino delgado (SIS)", "Derme acelular", "Veia safena"], defaultValue: "Pericárdio bovino" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Correção de Doença de Peyronie - incisão/excisão de placa com enxerto
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da genitália e colocação de campos estéreis.
3. Indução de ereção artificial com injeção intracavernosa de soro fisiológico (teste de Gittes) para avaliar a curvatura (${c.grau_curvatura}).
4. Incisão circunferencial subcoronal e desnudamento peniano até a base (degloving).
5. Dissecção cuidadosa do feixe neurovascular dorsal (FNVD) com preservação de sua integridade, isolando a túnica albugínea na área de maior curvatura/placa.
6. Realização de ${c.tecnica} na túnica albugínea no ponto de máxima curvatura, liberando a tensão e retificando o pênis.
7. Medição do defeito tunical criado.
8. Preparo e acomodação do enxerto de ${c.tipo_enxerto} sobre o defeito.
9. Sutura do enxerto à túnica albugínea com fio absorvível (PDS ou Monocryl 3-0/4-0) em pontos contínuos, garantindo fechamento hermético.
10. Novo teste de ereção artificial para confirmar a retificação peniana e ausência de vazamentos significativos.
11. Reposicionamento do feixe neurovascular dorsal.
12. Fechamento do prepúcio/pele com fio absorvível (Vicryl Rapide 4-0 ou Catgut simples 4-0).
13. Curativo compressivo leve (tipo Coban) deixando a glande exposta.
14. Posicionamento de sonda vesical de demora (SVD) 14F.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero até recuperação anestésica, depois dieta livre.
2. Soro Fisiológico 0,9% 500 mL IV, correr em 2 horas.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Tramadol 50mg IV de 8/8h se dor forte (resgate).
6. Ondansetrona 4mg IV de 8/8h se náuseas.
7. Cefazolina 1g IV de 8/8h (manter por 24h).
8. Manter SVD aberta para frasco coletor.
9. Manter curativo compressivo.
10. Sinais vitais de 4/4h.
11. Alta hospitalar prevista para o dia seguinte, após retirada da SVD e micção espontânea.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg: Tomar 01 comprimido VO de 6/6 horas por 7 dias.
2. Dipirona 1g: Tomar 01 comprimido VO de 6/6 horas em caso de dor.
3. Ibuprofeno 600mg: Tomar 01 comprimido VO de 8/8 horas por 5 dias.
4. Tadalafila 5mg: Tomar 01 comprimido VO à noite por 30 a 90 dias (conforme orientação médica, para reabilitação peniana).
5. Diazepam 5mg: Tomar 01 comprimido VO à noite por 10 dias (para evitar ereções noturnas dolorosas).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 7 a 10 dias.
- Evitar esforços físicos intensos, academia e carregar peso por 30 dias.
- Abstinência sexual (incluindo masturbação) rigorosa por 6 semanas.

CUIDADOS LOCAIS:
- Manter o curativo compressivo por 24 a 48 horas, conforme orientado na alta.
- Após a retirada do curativo, lavar a região diariamente com água e sabonete neutro durante o banho.
- Secar bem o local e aplicar antisséptico (ex: clorexidina aquosa ou spray) se recomendado.
- É normal apresentar inchaço (edema) e manchas roxas (equimose) no pênis e bolsa escrotal, que melhoram gradativamente.
- Os pontos caem sozinhos em 2 a 3 semanas.

SINAIS DE ALERTA:
Procurar o Pronto-Socorro em caso de:
- Sangramento ativo e contínuo pela ferida operatória.
- Dor intensa que não melhora com as medicações prescritas.
- Febre (temperatura > 37,8°C).
- Vermelhidão intensa, calor ou saída de pus na ferida.
- Dificuldade ou impossibilidade de urinar.

RETORNO:
- Retorno agendado no consultório em 7 a 14 dias para avaliação da ferida operatória.`,
    },
  },
  {
    id: "curvatura-congenita",
    name: "Curvatura peniana congênita - corporoplastia de plicatura",
    shortName: "Corporoplastia",
    icon: "🍆",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio Peniano com sedação"], defaultValue: "Raquianestesia" },
      { id: "grau_curvatura", label: "Grau da Curvatura", type: "text", defaultValue: "60 graus", placeholder: "Ex: 60 graus" },
      { id: "direcao_curvatura", label: "Direção da Curvatura", type: "select", options: ["Ventral", "Dorsal", "Lateral direita", "Lateral esquerda", "Ventrolateral direita", "Ventrolateral esquerda", "Dorsolateral direita", "Dorsolateral esquerda"], defaultValue: "Ventral" },
      { id: "tecnica", label: "Técnica de Plicatura", type: "select", options: ["Técnica de Nesbit", "Técnica de Yachia", "Plicatura simples (pontos de Essed-Schröder)", "Plicatura de 16 pontos", "Técnica de Baskin"], defaultValue: "Plicatura simples (pontos de Essed-Schröder)" },
      { id: "fios_plicatura", label: "Fios utilizados na plicatura", type: "select", options: ["Ethibond 2-0", "Prolene 2-0", "PDS 2-0", "Vicryl 2-0"], defaultValue: "Ethibond 2-0" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Curvatura peniana congênita - corporoplastia de plicatura
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da genitália e colocação de campos estéreis.
3. Indução de ereção artificial com injeção intracavernosa de soro fisiológico (teste de Gittes) ou alprostadil para avaliação da curvatura.
4. Constatada curvatura de ${c.grau_curvatura} de direção ${c.direcao_curvatura}.
5. Incisão circunferencial subcoronal e desnudamento peniano (degloving) até a base do pênis, preservando o feixe neurovascular dorsal.
6. Nova ereção artificial para demarcação do ponto de máxima curvatura e planejamento da correção no lado convexo.
7. Dissecção cuidadosa do feixe neurovascular (se plicatura dorsal/lateral) ou mobilização da uretra (se plicatura ventral), conforme a necessidade.
8. Realização da correção da curvatura utilizando a ${c.tecnica}, com aplicação de pontos inabsorvíveis ou de absorção lenta (${c.fios_plicatura}) na túnica albugínea.
9. Nova ereção artificial para confirmação da retificação peniana completa.
10. Revisão rigorosa da hemostasia.
11. Fechamento da fáscia de Buck e do tecido subcutâneo com fios absorvíveis.
12. Aproximação da pele e prepúcio com sutura contínua ou pontos separados de Monocryl 4-0 ou Catgut simples 4-0.
13. Curativo compressivo peniano deixando a glande exposta.
Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre assim que bem acordado.
2. Soro Fisiológico 0,9% 500 mL IV, correr em 2 horas.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Cefazolina 1g IV (dose adicional se cirurgia > 4h).
7. Manter curativo compressivo peniano.
8. Gelo local intermitente.
9. Sinais vitais de rotina.
10. Alta hospitalar após recuperação anestésica, micção espontânea e controle da dor.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg ---------- 1 caixa
Tomar 1 comprimido, via oral, de 6 em 6 horas, por 5 dias.

2. Dipirona 1g ---------- 1 caixa
Tomar 1 comprimido, via oral, de 6 em 6 horas, em caso de dor.

3. Ibuprofeno 600mg ---------- 1 caixa
Tomar 1 comprimido, via oral, de 8 em 8 horas, por 3 a 5 dias.

4. Cetoconazol 200mg ---------- 1 caixa
Tomar 1 comprimido, via oral, à noite, por 10 dias (para inibir ereções noturnas dolorosas).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos, academia e esportes por 30 dias.
- Abstinência sexual (incluindo masturbação) rigorosa por 4 a 6 semanas, para evitar deiscência dos pontos e falha na correção.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (água e sucos naturais).
- Manter o curativo compressivo por 24 a 48 horas, conforme orientação médica.
- Após a retirada do curativo, lavar a região com água e sabonete neutro durante o banho. Secar bem.
- É normal apresentar inchaço (edema) e manchas roxas (equimose) no pênis e bolsa escrotal, que melhoram gradativamente.
- Ereções noturnas podem ser dolorosas nos primeiros dias. O uso de gelo local (protegido por um pano) por 15 minutos pode ajudar a reduzir o desconforto e a ereção.
- Os pontos da pele geralmente caem sozinhos em 2 a 3 semanas.

SINAIS DE ALERTA:
Procurar o Pronto-Socorro se apresentar:
- Sangramento ativo e contínuo pela ferida operatória.
- Aumento súbito e doloroso do volume peniano (hematoma em expansão).
- Febre (temperatura > 38°C).
- Dificuldade ou impossibilidade de urinar.
- Secreção purulenta ou vermelhidão intensa na ferida.

RETORNO:
- Retornar ao consultório em 7 a 14 dias para reavaliação.`,
    },
  },
  {
    id: "alongamento-peniano",
    name: "Alongamento peniano - secção do ligamento suspensor (ligamentólise)",
    shortName: "Alongamento peniano",
    icon: "📏",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia com sedação", "Anestesia geral", "Anestesia local com sedação"], defaultValue: "Raquianestesia com sedação" },
      { id: "incisao", label: "Tipo de Incisão", type: "select", options: ["Incisão infrapúbica em V invertido", "Incisão infrapúbica transversa", "Incisão penoescrotal"], defaultValue: "Incisão infrapúbica em V invertido" },
      { id: "enxerto", label: "Uso de Enxerto/Espaçador", type: "select", options: ["Sem enxerto", "Retalho de gordura púbica", "Enxerto de derme acelular", "Enxerto de fáscia"], defaultValue: "Sem enxerto" },
      { id: "tracao", label: "Dispositivo de Tração", type: "select", options: ["Sem dispositivo de tração", "Colocação de dispositivo de tração no intraoperatório"], defaultValue: "Sem dispositivo de tração" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma complicação" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Alongamento peniano - secção do ligamento suspensor (ligamentólise)
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal horizontal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital, púbica e abdominal inferior com clorexidina alcoólica e colocação de campos estéreis.
3. Passagem de sonda vesical de demora 14 Fr (opcional, conforme preferência).
4. Realizada ${c.incisao} na região púbica/base do pênis.
5. Dissecção por planos até a identificação da fáscia de Buck e da base peniana.
6. Identificação e isolamento do ligamento suspensor do pênis e do ligamento fundiforme.
7. Secção cuidadosa do ligamento suspensor do pênis junto à sínfise púbica, mantendo hemostasia rigorosa e preservando o feixe neurovascular dorsal.
8. Liberação adicional das fixações laterais, permitindo o avanço do pênis.
9. Preenchimento do espaço morto criado com ${c.enxerto} para evitar a retração cicatricial e re-ancoragem do pênis.
10. Revisão da hemostasia.
11. Fechamento por planos: aproximação do tecido subcutâneo com fio absorvível (Vicryl 3-0 ou 4-0) e síntese da pele com Monocryl 4-0 ou Nylon 4-0.
12. Curativo compressivo na base do pênis.
13. ${c.tracao}.
14. Retirada da sonda vesical (se passada) e encaminhamento do paciente à RPA.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero até o completo despertar, evoluindo para dieta livre conforme aceitação.
2. Soro Fisiológico 0,9% 500 mL IV, correr em 2 horas.
3. Dipirona 1g IV de 6/6h se dor.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Cefazolina 1g IV (dose adicional se tempo cirúrgico prolongado).
7. Sinais vitais de 2/2h.
8. Gelo local na região púbica (protegido) por 15 minutos a cada 2 horas.
9. Alta hospitalar após recuperação anestésica, micção espontânea e controle álgico.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg ------ Tomar 01 comprimido, via oral, de 6/6 horas por 5 dias.
2. Dipirona 1g ------ Tomar 01 comprimido, via oral, de 6/6 horas em caso de dor.
3. Ibuprofeno 600mg ------ Tomar 01 comprimido, via oral, de 8/8 horas por 3 a 5 dias (junto às refeições).
4. Tadalafila 5mg ------ Tomar 01 comprimido, via oral, 1 vez ao dia, à noite, por 30 dias (para otimização da oxigenação tecidual e prevenção de retração, conforme orientação médica).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias. Evitar esforços físicos intensos, carregar peso ou atividades de impacto por 30 dias.
- Abstinência sexual (masturbação ou relação) por 4 a 6 semanas, conforme orientação no retorno.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (2 a 3 litros de água por dia).
- Manter a região da ferida operatória limpa e seca. Lavar com água e sabonete neutro durante o banho, secando suavemente com toalha limpa.
- Aplicar compressas de gelo (envoltas em um pano) na região púbica (não diretamente no pênis) por 15 minutos, 3 a 4 vezes ao dia, nos primeiros 3 dias para reduzir o inchaço.
- O uso de extensores penianos ou dispositivos de tração, se indicados, deve ser iniciado estritamente conforme a orientação médica (geralmente após 2 a 3 semanas) para evitar a retração cicatricial.
- É normal apresentar inchaço (edema) e áreas arroxeadas (equimose) na base do pênis e região púbica, que melhoram progressivamente.

SINAIS DE ALERTA:
- Procurar o Pronto Socorro em caso de: sangramento ativo e volumoso pela ferida, febre (temperatura > 38°C), dor intensa que não melhora com as medicações prescritas, vermelhidão excessiva ou saída de pus pela ferida operatória, ou incapacidade de urinar.

RETORNO:
- Retorno agendado no consultório em 7 a 14 dias para avaliação da ferida operatória e orientações sobre o uso de tração peniana.`,
    },
  },
  {
    id: "faloplastia-aumento",
    name: "Faloplastia de aumento - espessamento peniano com enxerto dérmico-gorduroso",
    shortName: "Espessamento Peniano",
    icon: "📏",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio peridural"], defaultValue: "Raquianestesia" },
      { id: "sitio_doadora", label: "Sítio da Área Doadora", type: "select", options: ["Região suprapúbica", "Sulco infraglúteo", "Região inguinal"], defaultValue: "Região suprapúbica" },
      { id: "fixacao_enxerto", label: "Fixação do Enxerto", type: "select", options: ["Fios absorvíveis 4-0", "Fios absorvíveis 5-0", "Fios inabsorvíveis"], defaultValue: "Fios absorvíveis 4-0" },
      { id: "dreno", label: "Uso de Dreno", type: "select", options: ["Sem dreno", "Dreno de Penrose", "Dreno de sucção fechada (Portovac)"], defaultValue: "Sem dreno" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Faloplastia de aumento - espessamento peniano com enxerto dérmico-gorduroso
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal horizontal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital e da área doadora (${c.sitio_doadora}) com clorexidina alcoólica e colocação de campos estéreis.
3. Passagem de sonda vesical de demora (Foley 14Fr) para esvaziamento vesical e proteção uretral.
4. Incisão na área doadora (${c.sitio_doadora}) e dissecção cuidadosa para captação do enxerto dérmico-gorduroso.
5. Desepitelização do enxerto e preparo do tecido adiposo para adequação ao leito receptor.
6. Hemostasia rigorosa da área doadora e fechamento por planos, com sutura intradérmica na pele.
7. Incisão peniana (circuncisão subcoronal ou incisão penoescrotal) e degloving peniano no plano subdartos, preservando o feixe neurovascular dorsal.
8. Posicionamento do enxerto dérmico-gorduroso ao redor da fáscia de Buck.
9. Fixação do enxerto com ${c.fixacao_enxerto} para evitar deslocamento e garantir a integração.
10. Revisão da hemostasia no leito receptor.
11. Posicionamento de dreno: ${c.dreno}.
12. Fechamento da pele peniana com fios absorvíveis 4-0 ou 5-0.
13. Curativo compressivo modelador no pênis e curativo oclusivo na área doadora.
14. Retirada da sonda vesical de demora ao final do procedimento (ou mantida conforme necessidade clínica).

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre assim que bem acordado.
2. Soro Fisiológico 0,9% 1000 mL IV em 24h.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Tramadol 50mg IV de 8/8h se dor forte (resgate).
6. Ondansetrona 4mg IV de 8/8h se náuseas ou vômitos.
7. Cefazolina 1g IV de 8/8h (manter por 24h).
8. Cuidados com o dreno (${c.dreno}), anotar débito.
9. Manter curativo compressivo peniano e curativo na área doadora (${c.sitio_doadora}).
10. Sinais vitais de 4/4h.
11. Alta hospitalar prevista para o dia seguinte, após avaliação médica.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg ------ 1 caixa
Tomar 1 comprimido via oral de 6/6 horas por 7 dias.

2. Dipirona 1g ------ 1 caixa
Tomar 1 comprimido via oral de 6/6 horas em caso de dor.

3. Ibuprofeno 600mg ------ 1 caixa
Tomar 1 comprimido via oral de 8/8 horas por 5 dias.

4. Tadalafila 5mg ------ 1 caixa
Tomar 1 comprimido via oral à noite por 30 dias (para otimizar vascularização do enxerto e evitar retrações).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 7 a 10 dias.
- Evitar esforços físicos intensos, academia e carregar peso por 30 a 45 dias.
- Abstinência sexual (incluindo masturbação) rigorosa por 6 semanas, para garantir a integração do enxerto e evitar deiscência de sutura.

HIDRATAÇÃO / CUIDADOS LOCAIS:
- Ingerir bastante líquido (água, sucos naturais).
- Manter o curativo conforme orientado pela equipe médica. Trocar o curativo da área doadora (${c.sitio_doadora}) diariamente após o banho.
- O curativo peniano deve ser mantido limpo e seco. Evitar manipular excessivamente o pênis.
- Os pontos da região peniana geralmente caem sozinhos em 2 a 3 semanas.
- Uso de dreno: ${c.dreno} (se houver dreno de Penrose, será retirado no retorno; se Portovac, esvaziar e medir o débito diariamente conforme orientação).

SINAIS DE ALERTA (Procurar PS):
Procurar o Pronto Socorro em caso de:
- Febre (temperatura > 37,8°C).
- Dor intensa que não melhora com as medicações prescritas.
- Sangramento volumoso ou saída de secreção purulenta (pus) com mau cheiro pelas feridas operatórias.
- Inchaço exagerado, vermelhidão intensa ou áreas escurecidas (necrose) na pele do pênis.
- Dificuldade ou incapacidade de urinar.

RETORNO:
- Retorno agendado no consultório em 7 a 10 dias para avaliação das feridas operatórias e retirada de pontos da área doadora (se necessário).`,
    },
  },
  {
    id: "aumento-glande-ah",
    name: "Aumento de glande com ácido hialurônico",
    shortName: "Aumento de Glande (AH)",
    icon: "💉",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Anestesia tópica + Bloqueio peniano", "Bloqueio peniano", "Anestesia local"], defaultValue: "Anestesia tópica + Bloqueio peniano" },
      { id: "volume_injetado", label: "Volume Injetado (mL)", type: "text", defaultValue: "2 mL", placeholder: "ex: 2 mL" },
      { id: "marca_ah", label: "Marca do Ácido Hialurônico", type: "select", options: ["Restylane", "Juvederm", "Rennova", "Outra"], defaultValue: "Restylane" },
      { id: "tecnica", label: "Técnica de Injeção", type: "select", options: ["Cânula", "Agulha", "Mista"], defaultValue: "Cânula" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Aumento de glande com ácido hialurônico
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, antissepsia da genitália com clorexidina alcoólica e colocação de campos estéreis.
2. Realizada ${c.anestesia}.
3. Inspeção da glande e demarcação dos pontos de injeção.
4. Introdução do ácido hialurônico (Marca: ${c.marca_ah}) utilizando técnica com ${c.tecnica}.
5. Injeção retrógrada em leque no plano subepitelial da glande, distribuindo o produto de forma homogênea.
6. Volume total injetado: ${c.volume_injetado}.
7. Massagem suave da glande para modelagem e distribuição uniforme do produto.
8. Curativo oclusivo leve, sem compressão excessiva.
Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO
1. Dieta livre.
2. Repouso no leito com cabeceira elevada.
3. Gelo local (protegido) por 15-20 minutos, se necessário.
4. Dipirona 1g VO se dor.
5. Alta ambulatorial após estabilidade clínica e micção espontânea.`,
      receitaAlta: (c) => `RECEITA DE ALTA
1. Dipirona 1g: Tomar 01 comprimido via oral de 6/6 horas em caso de dor.
2. Ibuprofeno 600mg: Tomar 01 comprimido via oral de 8/8 horas por 3 dias.
3. Cefalexina 500mg: Tomar 01 comprimido via oral de 6/6 horas por 3 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA
REPOUSO:
- Repouso relativo nos primeiros 2 a 3 dias.
- Evitar atividades físicas intensas por 7 dias.
- Abstinência sexual (masturbação e relação sexual) por 14 a 21 dias, conforme orientação médica.

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Manter a região limpa e seca. Lavar com água e sabonete neutro durante o banho.
- Pode ocorrer leve inchaço (edema) e equimose (roxo) na glande nos primeiros dias, o que é esperado.
- Não massagear ou apertar a glande vigorosamente.

SINAIS DE ALERTA (Procurar PS):
- Dor intensa não aliviada com as medicações prescritas.
- Alteração de coloração da glande (palidez extrema, arroxeamento intenso ou escurecimento).
- Sangramento ativo.
- Febre (temperatura > 37,8°C) ou saída de secreção purulenta.
- Dificuldade para urinar.

RETORNO:
- Retorno agendado em consultório em 7 a 14 dias para reavaliação estética e clínica.`,
    },
  },
  {
    id: "penis-enterrado",
    name: "Lipoaspiração suprapúbica e correção de pênis enterrado no adulto",
    shortName: "Correção Pênis Enterrado",
    icon: "✂️",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Raquianestesia com sedação"], defaultValue: "Raquianestesia" },
      { id: "tecnica_fixacao", label: "Técnica de Fixação", type: "select", options: ["Fixação da derme peniana à fáscia de Buck na base", "Fixação na sínfise púbica", "Fixação da fáscia de Buck à fáscia de Colles"], defaultValue: "Fixação da derme peniana à fáscia de Buck na base" },
      { id: "enxerto_pele", label: "Cobertura Cutânea", type: "select", options: ["Fechamento primário sem enxerto", "Enxerto de pele parcial", "Retalho cutâneo local (Z-plastia)"], defaultValue: "Fechamento primário sem enxerto" },
      { id: "dreno", label: "Drenagem", type: "select", options: ["Sem dreno", "Dreno de Penrose", "Dreno de sucção fechada (Portovac)"], defaultValue: "Dreno de sucção fechada (Portovac)" },
      { id: "sonda", label: "Sondagem Vesical", type: "select", options: ["Sonda vesical de demora 16Fr", "Sonda vesical de demora 14Fr", "Sem sonda"], defaultValue: "Sonda vesical de demora 16Fr" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Lipoaspiração suprapúbica e correção de pênis enterrado no adulto
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região abdominal inferior, púbica e genital com clorexidina alcoólica e colocação de campos estéreis.
3. Passagem de ${c.sonda} para esvaziamento vesical e proteção da uretra.
4. Infiltração da região suprapúbica com solução de soro fisiológico e adrenalina (1:500.000) para lipoaspiração.
5. Realização de lipoaspiração da gordura do monte de vênus/região suprapúbica utilizando cânulas adequadas, com retirada de volume satisfatório.
6. Incisão circular subcoronal ou incisão peno-escrotal, conforme necessidade de exposição.
7. Dissecção cuidadosa da haste peniana, liberando as aderências fibróticas e bandas disgenéticas entre a fáscia de Dartos e a fáscia de Buck até a base do pênis.
8. Exérese do excesso de tecido adiposo e tecido fibrótico na base do pênis.
9. Fixação da base do pênis para evitar retração: ${c.tecnica_fixacao} utilizando fios inabsorvíveis (ex: Prolene 3-0 ou 4-0) ou de absorção lenta (PDS 3-0).
10. Avaliação da viabilidade e quantidade de pele peniana remanescente. Cobertura cutânea realizada com: ${c.enxerto_pele}.
11. Posicionamento de ${c.dreno} na região suprapúbica/base peniana, fixado à pele.
12. Fechamento da pele e tecido subcutâneo com fios absorvíveis (Monocryl 4-0 ou Vicryl Rapide 4-0).
13. Curativo compressivo moderado na região suprapúbica e curativo ao redor da haste peniana para evitar edema e hematoma.
14. Procedimento finalizado com sucesso. Paciente encaminhado à RPA em boas condições.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero até total recuperação da consciência, após, dieta livre.
2. Soro Fisiológico 0,9% 1000 mL IV em 24 horas.
3. Dipirona 1g IV de 6/6 horas.
4. Cetoprofeno 100mg IV de 12/12 horas.
5. Tramadol 50mg IV de 8/8 horas se dor forte (resgate).
6. Ondansetrona 4mg IV de 8/8 horas se náuseas ou vômitos.
7. Cefazolina 1g IV de 8/8 horas (manter por 24h).
8. Profilaxia para TVP: Enoxaparina 40mg SC 1x/dia (iniciar 12h após o término da cirurgia, se indicado).
9. Manter ${c.sonda} aberta em bolsa coletora.
10. Manter ${c.dreno} em aspiração contínua, anotar débito.
11. Sinais vitais de 4/4 horas.
12. Repouso no leito com cabeceira elevada a 30 graus.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg ------ 1 caixa
Tomar 1 comprimido via oral de 6/6 horas por 7 dias.

2. Dipirona 1g ------ 1 caixa
Tomar 1 comprimido via oral de 6/6 horas em caso de dor.

3. Ibuprofeno 600mg ------ 1 caixa
Tomar 1 comprimido via oral de 8/8 horas por 5 dias.

4. Tylex 30mg (Paracetamol 500mg + Codeína 30mg) ------ 1 caixa
Tomar 1 comprimido via oral de 8/8 horas em caso de dor forte, não aliviada com as medicações anteriores.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 15 dias. Evitar esforços físicos intensos, carregar peso ou atividades de impacto por 30 a 45 dias.
- Abstinência sexual rigorosa por 45 a 60 dias, conforme orientação médica no retorno.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (2 a 3 litros de água por dia).
- Manter a ${c.sonda} (se houver alta com a mesma) sempre abaixo do nível da bexiga e esvaziar a bolsa regularmente.
- Cuidados com o ${c.dreno} (se houver alta com o mesmo): esvaziar o reservatório quando estiver pela metade e anotar o volume diário.
- Lavar a região cirúrgica com água e sabonete neutro durante o banho, secando bem com toalha limpa ou secador no modo frio.
- Aplicar o curativo conforme orientado pela equipe de enfermagem/médica.
- É normal apresentar inchaço (edema) e áreas arroxeadas (equimose) na região genital e suprapúbica, que melhoram progressivamente.

SINAIS DE ALERTA:
Procurar o Pronto-Socorro em caso de:
- Febre (temperatura maior que 37,8°C).
- Dor intensa que não melhora com as medicações prescritas.
- Sangramento ativo e em grande quantidade pela ferida operatória ou pelo dreno.
- Vermelhidão intensa, calor ou saída de secreção purulenta (pus) na ferida.
- Dificuldade para urinar ou parada de drenagem de urina pela sonda.

RETORNO:
- Retorno agendado no consultório em 7 a 10 dias para avaliação da ferida operatória, retirada do dreno e/ou sonda, e reavaliação clínica.`,
    },
  },
  {
    id: "escrotoplastia",
    name: "Escrotoplastia / scrotal lift (lifting escrotal estético)",
    shortName: "Escrotoplastia",
    icon: "✂️",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia local com sedação", "Anestesia geral"], defaultValue: "Raquianestesia" },
      { id: "tecnica", label: "Técnica de Ressecção", type: "select", options: ["Ressecção em fuso transversal", "Ressecção elíptica longitudinal", "Ressecção em cunha"], defaultValue: "Ressecção em fuso transversal" },
      { id: "sutura", label: "Fio de Sutura", type: "select", options: ["Monocryl 4-0", "Vicryl 4-0", "Catgut cromado 4-0"], defaultValue: "Monocryl 4-0" },
      { id: "dreno", label: "Uso de Dreno", type: "select", options: ["Sem dreno", "Dreno de Penrose", "Dreno de sucção (Porto-Vac)"], defaultValue: "Sem dreno" },
      { id: "complicacoes", label: "Complicações / Intercorrências", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Escrotoplastia / scrotal lift (lifting escrotal estético)
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região genital, perineal e face interna das coxas com clorexidina alcoólica ou aquosa.
3. Colocação de campos cirúrgicos estéreis.
4. Marcação prévia da pele escrotal excedente a ser ressecada, com caneta demográfica, planejando a ${c.tecnica}.
5. Infiltração local com anestésico (Ropivacaína 0,75% ou Bupivacaína 0,5% sem vasoconstritor) para analgesia pós-operatória e controle hemostático.
6. Incisão da pele e músculo dartos acompanhando a marcação prévia.
7. Dissecção cuidadosa e exérese do excesso de pele e tecido celular subcutâneo (dartos), preservando a túnica vaginal e as estruturas funiculares.
8. Hemostasia rigorosa com eletrocautério.
9. Revisão da hemostasia e verificação da simetria e aspecto estético do escroto.
10. Posicionamento de dreno: ${c.dreno}.
11. Fechamento da ferida operatória em planos, aproximando o músculo dartos com fios absorvíveis.
12. Síntese da pele com ${c.sutura}, garantindo eversão das bordas e bom resultado estético.
13. Curativo compressivo modelador com gaze e fita adesiva (ou suspensório escrotal).
14. Procedimento finalizado. Paciente encaminhado à sala de recuperação pós-anestésica em boas condições.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero até total recuperação da consciência, após, dieta livre.
2. Soro Fisiológico 0,9% 500 mL IV, correr em 2 horas.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Cefazolina 1g IV (se não realizada profilaxia pré-operatória adequada).
7. Gelo local (bolsa de gelo envolta em tecido) por 15-20 minutos a cada 2 horas.
8. Manter suspensório escrotal ou curativo compressivo.
9. Sinais vitais de 4/4h.
10. Alta hospitalar após micção espontânea, deambulação e controle álgico adequado (geralmente no mesmo dia).`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g: Tomar 01 comprimido por via oral de 6/6 horas por 5 dias, se dor.
2. Ibuprofeno 600mg: Tomar 01 comprimido por via oral de 8/8 horas por 3 a 5 dias (após as refeições).
3. Cefalexina 500mg: Tomar 01 comprimido por via oral de 6/6 horas por 5 a 7 dias (se indicado profilaxia estendida).
4. Suspensório escrotal: Uso contínuo por 15 a 30 dias, retirando apenas para banho.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias. Evitar caminhadas longas e ficar muito tempo em pé.
- Abstinência sexual (incluindo masturbação) por 3 a 4 semanas, ou conforme orientação médica.
- Evitar atividades físicas intensas, academia e esportes de contato por 30 dias.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (água, sucos naturais) para manter a urina clara.
- Aplicar compressas de gelo (envoltas em um pano limpo) na região escrotal por 15 a 20 minutos, 4 a 6 vezes ao dia, nos primeiros 2 a 3 dias, para reduzir o inchaço.
- Manter a região limpa e seca. Lavar com água e sabonete neutro durante o banho, secando suavemente com toalha limpa, sem esfregar.
- Uso obrigatório do suspensório escrotal ou cueca justa (tipo slip) para elevação da bolsa escrotal, reduzindo edema e dor.
- Os pontos geralmente são absorvíveis (${c.sutura}) e caem sozinhos em 2 a 4 semanas.

SINAIS DE ALERTA:
Procurar o Pronto-Socorro ou entrar em contato com a equipe médica se apresentar:
- Aumento súbito e doloroso do volume escrotal (suspeita de hematoma).
- Sangramento ativo e contínuo pela ferida operatória.
- Febre (temperatura maior que 37,8°C).
- Vermelhidão intensa, calor local ou saída de secreção purulenta (pus) pela ferida.
- Dor de forte intensidade que não melhora com as medicações prescritas.

RETORNO:
- Retorno agendado no consultório em 7 a 10 dias para avaliação da ferida operatória e evolução clínica.`,
    },
  },
  {
    id: "condilomas-hpv",
    name: "Ressecção de condilomas genitais (HPV) - exérese e eletrocauterização",
    shortName: "Ressecção de Condilomas",
    icon: "⚡",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Local", "Bloqueio peniano", "Sedação + Local", "Raquianestesia"], defaultValue: "Local" },
      { id: "localizacao", label: "Localização das Lesões", type: "select", options: ["Prepúcio", "Glande", "Corpo peniano", "Escroto", "Múltiplas áreas (prepúcio, glande e corpo)"], defaultValue: "Múltiplas áreas (prepúcio, glande e corpo)" },
      { id: "tecnica", label: "Técnica Utilizada", type: "select", options: ["Exérese tangencial e eletrocauterização da base", "Apenas eletrocauterização", "Exérese com tesoura e hemostasia compressiva"], defaultValue: "Exérese tangencial e eletrocauterização da base" },
      { id: "tamanho_lesoes", label: "Tamanho/Aspecto das Lesões", type: "select", options: ["Puntiformes e esparsas", "Menores que 5 mm", "Entre 5 e 10 mm", "Maiores que 10 mm / Confluentes"], defaultValue: "Menores que 5 mm" },
      { id: "complicacoes", label: "Complicações", type: "select", options: ["Sem intercorrências", "Sangramento puntiforme controlado com eletrocautério"], defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Ressecção de condilomas genitais (HPV) - exérese e eletrocauterização
Anestesia: ${c.anestesia}

1. Paciente posicionado em decúbito dorsal, antissepsia da genitália com clorexidina aquosa e colocação de campos estéreis.
2. Realizada anestesia tipo ${c.anestesia}.
3. Inspeção rigorosa da genitália externa, identificando lesões condilomatosas de aspecto ${c.tamanho_lesoes} localizadas em ${c.localizacao}.
4. Realizada ${c.tecnica} das lesões identificadas.
5. Hemostasia rigorosa do leito cruento com eletrocautério.
6. Revisão da hemostasia, que se mostrou satisfatória.
7. Limpeza da área operada e curativo local com pomada cicatrizante e gaze, quando aplicável.
8. Procedimento finalizado.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre.
2. Cabeceira elevada a 30 graus.
3. Sinais vitais de rotina.
4. Dipirona 1g IV ou VO se dor.
5. Alta hospitalar/ambulatorial após recuperação anestésica e micção espontânea.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g: Tomar 01 comprimido via oral a cada 6 horas, em caso de dor.
2. Cetoprofeno 100mg: Tomar 01 comprimido via oral a cada 12 horas, por 3 dias.
3. Pomada de Neomicina + Bacitracina (ou Colagenase): Aplicar fina camada sobre as áreas cauterizadas, 2 vezes ao dia, por 7 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 2 a 3 dias.
- Evitar atividades físicas intensas por 7 a 10 dias.
- Abstinência sexual até a completa cicatrização das lesões (geralmente 15 a 20 dias).

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Lavar a região diariamente com água e sabonete neutro durante o banho.
- Secar bem o local com toalha limpa ou secador no modo frio.
- Aplicar a pomada prescrita conforme orientação médica.
- É normal a formação de crostas escuras (casquinhas) nos locais cauterizados; não as arranque, elas cairão espontaneamente para evitar sangramentos e cicatrizes inestéticas.

SINAIS DE ALERTA (Procurar PS):
- Sangramento ativo e contínuo que não cessa com compressão local.
- Dor intensa não aliviada pelas medicações prescritas.
- Saída de secreção purulenta ou vermelhidão excessiva ao redor das feridas.
- Febre (temperatura > 37,8°C).

RETORNO:
- Retorno ambulatorial em 14 a 21 dias para reavaliação da cicatrização e resultado de anatomopatológico (se lesões enviadas para biópsia).
- Manter acompanhamento regular, pois o vírus HPV pode causar recidivas. Recomenda-se avaliação da(o) parceira(o).`,
    },
  },
  {
    id: "protese-peyronie",
    name: "Prótese peniana com remodelamento na Peyronie grave",
    shortName: "Prótese + Remodelamento",
    icon: "🦾",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Raquianestesia + Sedação"], defaultValue: "Raquianestesia" },
      { id: "tipo_protese", label: "Tipo de Prótese", type: "select", options: ["Maleável", "Inflável de 2 volumes", "Inflável de 3 volumes"], defaultValue: "Maleável" },
      { id: "tecnica_remodelamento", label: "Técnica de Remodelamento", type: "select", options: ["Modelagem manual (Modeling)", "Incisões de relaxamento múltiplas", "Incisão e Enxertia (Grafting)"], defaultValue: "Modelagem manual (Modeling)" },
      { id: "grau_curvatura", label: "Grau de Curvatura Inicial", type: "text", defaultValue: "60 graus", placeholder: "ex: 60 graus dorsal" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Prótese peniana com remodelamento na Peyronie grave
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da genitália, região pubiana e abdome inferior com clorexidina alcoólica e colocação de campos estéreis.
3. Passagem de sonda vesical de demora (Foley 14F).
4. Incisão penoescrotal (ou subcoronal) e dissecção por planos até a identificação da fáscia de Buck e túnica albugínea.
5. Abertura longitudinal das túnicas albugíneas bilateralmente (corporotomia).
6. Dilatação dos corpos cavernosos com dilatadores de Brooks sequenciais, com atenção à fibrose severa (Doença de Peyronie).
7. Medição dos corpos cavernosos para escolha do tamanho adequado da prótese.
8. Inserção dos cilindros da prótese peniana do tipo ${c.tipo_protese}.
9. Realização de teste de ereção artificial e avaliação da curvatura residual (curvatura inicial de ${c.grau_curvatura}).
10. Execução da técnica de remodelamento peniano: ${c.tecnica_remodelamento}, até retificação completa da haste peniana.
11. Fechamento das corporotomias com fio absorvível (PDS ou Vicryl 2-0 ou 3-0).
12. Revisão da hemostasia, que se mostrou adequada.
13. Fechamento por planos do subcutâneo e pele com fio absorvível rápido (Monocryl ou Vicryl Rapide 4-0).
14. Curativo compressivo tipo "múmia" ao redor do pênis.
Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero até recuperação anestésica, depois dieta livre.
2. Soro Fisiológico 0,9% 1000 mL IV em 24h.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Tramadol 50mg IV de 8/8h (se dor forte).
6. Ondansetrona 4mg IV de 8/8h (se náuseas).
7. Cefazolina 1g IV de 8/8h (manter profilaxia para prótese).
8. Gentamicina 5mg/kg IV dose única (se protocolo institucional para prótese).
9. Manter sonda vesical de demora (retirar no 1º PO).
10. Manter curativo compressivo.
11. Gelo local intermitente.
12. Sinais vitais de 4/4h.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Ciprofloxacino 500mg ----- 1 caixa
Tomar 1 comprimido via oral de 12/12h por 7 dias.

2. Dipirona 1g ----- 1 caixa
Tomar 1 comprimido via oral de 6/6h em caso de dor.

3. Cetoprofeno 150mg ----- 1 caixa
Tomar 1 comprimido via oral de 12/12h por 5 dias.

4. Pregabalina 75mg ----- 1 caixa
Tomar 1 cápsula via oral à noite por 14 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 7 a 10 dias.
- Evitar esforços físicos intensos, academia e carregar peso por 30 a 45 dias.
- Abstinência sexual (incluindo masturbação) por 6 semanas, até liberação médica.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir cerca de 2 a 3 litros de água por dia.
- Manter o pênis elevado em direção ao abdome (usar cueca justa ou suspensório escrotal) para reduzir o inchaço.
- Aplicar compressas de gelo na região perineal/escrotal (nunca diretamente sobre a pele) por 15 minutos, 4 vezes ao dia, nos primeiros 3 dias.
- O curativo compressivo geralmente é retirado entre 24h e 48h pós-operatórias. Após isso, lavar a ferida operatória diariamente com água e sabonete neutro durante o banho e secar bem.
- É normal apresentar inchaço (edema) e coloração arroxeada (equimose) no pênis e escroto nas primeiras semanas.
- Para prótese ${c.tipo_protese}, seguir as orientações específicas de manuseio que serão ensinadas no consultório após a cicatrização.

SINAIS DE ALERTA:
Procurar o Pronto-Socorro se apresentar:
- Febre (temperatura > 37,8°C).
- Dor intensa e contínua que não melhora com as medicações prescritas.
- Sangramento volumoso pela ferida operatória.
- Saída de secreção purulenta (pus) ou vermelhidão intensa e calor local.
- Dificuldade ou impossibilidade de urinar.

RETORNO:
- Retorno agendado no consultório em 7 a 14 dias para avaliação da ferida operatória e evolução clínica.`,
    },
  },
  {
    id: "penectomia-parcial",
    name: "Penectomia parcial (câncer de pênis)",
    shortName: "Penectomia Parcial",
    icon: "✂️",
    category: "Oncologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Bloqueio Peniano"], defaultValue: "Raquianestesia" },
      { id: "margem", label: "Margem de Segurança", type: "select", options: ["Margem cirúrgica de 2 cm", "Margem cirúrgica de 1 cm", "Congelação intraoperatória livre de neoplasia"], defaultValue: "Margem cirúrgica de 2 cm" },
      { id: "reconstrucao", label: "Reconstrução Uretral", type: "select", options: ["Espatulação uretral e sutura na pele (neo-meato)", "Avançamento uretral"], defaultValue: "Espatulação uretral e sutura na pele (neo-meato)" },
      { id: "sonda", label: "Sondagem Vesical", type: "select", options: ["Sonda vesical de demora 16Fr", "Sonda vesical de demora 18Fr", "Sonda vesical de demora 14Fr"], defaultValue: "Sonda vesical de demora 16Fr" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Penectomia parcial
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal horizontal, sob ${c.anestesia}.
2. Antissepsia rigorosa da genitália e colocação de campos cirúrgicos estéreis.
3. Aplicação de torniquete na base do pênis para controle hemostático.
4. Incisão circular na pele da haste peniana, respeitando ${c.margem} proximal à lesão tumoral.
5. Dissecção por planos até a identificação e secção dos corpos cavernosos e corpo esponjoso.
6. Secção da uretra com margem adequada, deixando-a mais longa que os corpos cavernosos para confecção do neo-meato.
7. Ligadura dos vasos dorsais do pênis e hemostasia rigorosa dos corpos cavernosos com fios absorvíveis (ex: Vicryl 2-0 ou 3-0).
8. Liberação do torniquete e revisão da hemostasia.
9. ${c.reconstrucao} com fio absorvível (ex: Monocryl 4-0 ou 5-0).
10. Fechamento da pele e tecido subcutâneo cobrindo as extremidades dos corpos cavernosos.
11. Passagem de ${c.sonda} e fixação adequada.
12. Curativo compressivo local.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO
1. Dieta: Zero até recuperação anestésica, após dieta livre.
2. Hidratação: Soro Fisiológico 0,9% 500ml IV de 8/8h.
3. Analgesia 1: Dipirona 1g IV de 6/6h.
4. Analgesia 2: Cetoprofeno 100mg IV de 12/12h.
5. Analgesia 3 (Resgate): Tramadol 50mg IV se dor forte.
6. Antiemético: Ondansetrona 4mg IV se náuseas ou vômitos.
7. Profilaxia: Cefazolina 1g IV 8/8h (manter por 24h).
8. Cuidados: Manter ${c.sonda} aberta em bolsa coletora.
9. Sinais vitais: Controle de SSVV conforme rotina.
10. Deambulação: Precoce assim que recuperar sensibilidade motora.`,
      receitaAlta: (c) => `RECEITA DE ALTA
1. Dipirona 1g comprimido: Tomar 01 comprimido via oral de 6/6 horas por 5 dias em caso de dor.
2. Ibuprofeno 600mg comprimido: Tomar 01 comprimido via oral de 8/8 horas por 3 a 5 dias.
3. Cefalexina 500mg comprimido: Tomar 01 comprimido via oral de 6/6 horas por 7 dias.
4. Brometo de Pinavério 100mg comprimido: Tomar 01 comprimido via oral de 12/12 horas se espasmos vesicais (relacionados à sonda).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 15 dias.
- Evitar esforços físicos intensos, carregar peso ou atividades esportivas por 30 a 45 dias.
- Abstinência sexual rigorosa por 45 a 60 dias.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (2 a 3 litros de água por dia).
- Manter a ${c.sonda} conectada à bolsa coletora. Esvaziar a bolsa quando atingir 2/3 da capacidade.
- Lavar a região cirúrgica e o neo-meato com água e sabonete neutro durante o banho.
- Secar bem o local após o banho, sem esfregar.
- É normal observar pequeno inchaço, áreas arroxeadas (equimose) e saída de pequena quantidade de secreção sanguinolenta nos primeiros dias.

SINAIS DE ALERTA (Procurar Pronto-Socorro):
- Sangramento vivo e em grande quantidade pela ferida operatória ou pela sonda.
- Febre (temperatura maior que 37,8°C).
- Dor intensa que não melhora com as medicações prescritas.
- Vermelhidão intensa, calor ou saída de pus na ferida operatória.
- Obstrução da sonda (parada da saída de urina) ou dor forte na bexiga.

RETORNO:
- Retorno agendado em 7 a 14 dias para avaliação da ferida, retirada da sonda e discussão do resultado do exame anatomopatológico (biópsia).`,
    },
  },
  {
    id: "linfadenectomia-inguinal",
    name: "Linfadenectomia inguinal no câncer de pênis",
    shortName: "Linfadenectomia Inguinal",
    icon: "🔪",
    category: "Oncologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia Geral", "Peridural"], defaultValue: "Raquianestesia" },
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["Bilateral", "Unilateral Direita", "Unilateral Esquerda"], defaultValue: "Bilateral" },
      { id: "extensao", label: "Extensão", type: "select", options: ["Superficial", "Superficial e Profunda", "Radical (Pélvica associada)"], defaultValue: "Superficial e Profunda" },
      { id: "dreno", label: "Drenagem", type: "select", options: ["Dreno de sucção fechada (Portovac) bilateral", "Dreno de sucção fechada (Portovac) unilateral", "Sem dreno"], defaultValue: "Dreno de sucção fechada (Portovac) bilateral" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva as intercorrências" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Linfadenectomia inguinal no câncer de pênis (${c.lateralidade})
Anestesia: ${c.anestesia}
Extensão: ${c.extensao}

1. Paciente em decúbito dorsal horizontal, sob ${c.anestesia}.
2. Antissepsia rigorosa da região inguinal, genitália e membros inferiores, seguida de colocação de campos estéreis.
3. Incisão oblíqua (ou em S itálico) na região inguinal ${c.lateralidade}, paralela ao ligamento inguinal.
4. Dissecção por planos até a fáscia de Scarpa, desenvolvendo retalhos cutâneos superiores e inferiores com espessura adequada para evitar necrose.
5. Identificação e preservação da veia safena magna (quando possível) ou ligadura da mesma, dependendo do grau de acometimento linfonodal.
6. Dissecção e ressecção em bloco do tecido linfático superficial delimitado superiormente pelo ligamento inguinal, lateralmente pelo músculo sartório e medialmente pelo músculo adutor longo.
7. Abertura da fáscia lata e dissecção dos linfonodos inguinais profundos no triângulo femoral (vasos femorais), com ligadura cuidadosa dos vasos linfáticos com fios inabsorvíveis ou clipes para prevenção de linfocele.
8. Envio do material para exame anatomopatológico (identificado como ${c.lateralidade} e ${c.extensao}).
9. Transposição do músculo sartório para cobertura dos vasos femorais (quando indicado/realizado).
10. Revisão rigorosa da hemostasia e linfostasia.
11. Posicionamento de ${c.dreno} exteriorizado por contra-abertura.
12. Fechamento do tecido subcutâneo com fio absorvível (ex: Vicryl 2-0 ou 3-0) para eliminação de espaço morto.
13. Síntese da pele com fio inabsorvível (ex: Mononylon 3-0 ou 4-0) ou grampeador cirúrgico.
14. Curativo compressivo na região inguinal.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta zero até recuperação anestésica, após, dieta livre.
2. Soro Fisiológico 0,9% 1000 mL IV em 24h.
3. Dipirona 1g IV de 6/6h.
4. Cetoprofeno 100mg IV de 12/12h.
5. Tramadol 50mg IV de 8/8h se dor forte (resgate).
6. Ondansetrona 4mg IV de 8/8h se náuseas ou vômitos.
7. Cefazolina 1g IV de 8/8h (manter por 24h).
8. Profilaxia para TVP: Enoxaparina 40mg SC 1x/dia (iniciar 12h após o término da cirurgia).
9. Cuidados com ${c.dreno}: manter em sucção contínua, anotar débito diário.
10. Repouso no leito com membros inferiores elevados.
11. Sinais vitais de 4/4h.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Dipirona 1g: Tomar 01 comprimido via oral de 6/6h em caso de dor.
2. Ibuprofeno 600mg: Tomar 01 comprimido via oral de 8/8h por 5 dias.
3. Cefalexina 500mg: Tomar 01 comprimido via oral de 6/6h por 7 dias (ou conforme orientação médica).
4. Profilaxia para TVP (se indicado): Enoxaparina 40mg SC 1x/dia por 28 dias.
5. Cuidados com o dreno: esvaziar e medir o débito diariamente (se alta com dreno).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 15 dias.
- Manter os membros inferiores elevados sempre que possível para reduzir o edema.
- Evitar esforços físicos intensos, carregar peso ou atividades de impacto por 30 a 45 dias.
- Uso de meias elásticas de compressão (se recomendado).

HIDRATAÇÃO/CUIDADOS LOCAIS:
- Ingerir pelo menos 2 a 3 litros de água por dia.
- Manter o curativo limpo e seco. Trocar diariamente após o banho.
- Se alta com ${c.dreno}, esvaziar o reservatório diariamente, anotar o volume e manter a sucção (sanfona fechada).
- Lavar a ferida operatória com água e sabão neutro durante o banho.

SINAIS DE ALERTA (Procurar PS):
- Febre (temperatura > 37,8°C).
- Vermelhidão intensa, calor, inchaço excessivo ou saída de secreção purulenta pela ferida operatória.
- Aumento súbito do volume drenado ou saída de sangue vivo pelo dreno.
- Dor intensa na perna, inchaço assimétrico ou falta de ar (sinais de TVP/TEP).
- Abertura dos pontos (deiscência).

RETORNO:
- Retorno ambulatorial em 7 a 10 dias para avaliação da ferida, retirada do dreno (se débito < 30-50 mL/24h) e checagem do resultado do anatomopatológico.`,
    },
  },
  {
    id: "circuncisao-estetica",
    name: "Circuncisão estética / revisão de circuncisão",
    shortName: "Circuncisão Estética",
    icon: "✂️",
    category: "Andrologia",
    configFields: [
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Local com sedação", "Bloqueio peniano", "Raquianestesia", "Anestesia geral"], defaultValue: "Local com sedação" },
      { id: "tecnica", label: "Técnica Cirúrgica", type: "select", options: ["Incisão dupla (sleeve)", "Técnica da guilhotina", "Técnica da fenda dorsal", "Revisão de cicatriz"], defaultValue: "Incisão dupla (sleeve)" },
      { id: "hemostasia", label: "Hemostasia", type: "select", options: ["Eletrocautério bipolar", "Eletrocautério monopolar", "Fios absorvíveis"], defaultValue: "Eletrocautério bipolar" },
      { id: "fios_sutura", label: "Fio de Sutura", type: "select", options: ["Monocryl 4-0", "Monocryl 5-0", "Vicryl Rapide 4-0", "Catgut simples 4-0"], defaultValue: "Monocryl 4-0" },
      { id: "curativo", label: "Curativo", type: "select", options: ["Gaze com pomada cicatrizante e Coban", "Gaze com pomada antibiótica", "Fita microporosa"], defaultValue: "Gaze com pomada cicatrizante e Coban" },
      { id: "complicacoes", label: "Complicações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Descreva se houve alguma intercorrência" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: Circuncisão estética / revisão de circuncisão
Anestesia: ${c.anestesia}

1. Paciente em decúbito dorsal, sob ${c.anestesia}.
2. Antissepsia rigorosa da genitália com clorexidina alcoólica e colocação de campos estéreis.
3. Marcação da pele para ressecção ou revisão, preservando a simetria e a estética peniana.
4. Realização da ${c.tecnica} com ressecção do excesso de pele prepucial e/ou tecido cicatricial prévio.
5. Dissecção cuidadosa do tecido subcutâneo (fáscia de Colles e Buck) preservando o feixe neurovascular dorsal.
6. Hemostasia rigorosa realizada com ${c.hemostasia}.
7. Aproximação das bordas da pele e mucosa com pontos separados utilizando ${c.fios_sutura}.
8. Revisão da hemostasia e do aspecto estético final, confirmando simetria e ausência de tensão na linha de sutura.
9. Limpeza local e confecção de curativo compressivo com ${c.curativo}.
10. Procedimento finalizado. Paciente encaminhado à sala de recuperação pós-anestésica em boas condições.

Intercorrências: ${c.complicacoes}.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO

1. Dieta livre após despertar completo.
2. Acesso venoso salinizado (se aplicável).
3. Dipirona 1g IV de 6/6h se dor.
4. Cetoprofeno 100mg IV de 12/12h se dor forte.
5. Ondansetrona 4mg IV se náuseas ou vômitos.
6. Manter curativo limpo e seco.
7. Sinais vitais de rotina.
8. Alta hospitalar após micção espontânea, deambulação e controle álgico adequado.`,
      receitaAlta: (c) => `RECEITA DE ALTA

1. Cefalexina 500mg ---------- 1 caixa
Tomar 1 comprimido via oral de 6/6 horas por 5 dias.

2. Dipirona 1g ---------- 1 caixa
Tomar 1 comprimido via oral de 6/6 horas em caso de dor.

3. Cetoprofeno 100mg ---------- 1 caixa
Tomar 1 comprimido via oral de 12/12 horas por 3 a 5 dias.

4. Pomada de Colagenase + Cloranfenicol (ou similar cicatrizante) ---------- 1 bisnaga
Aplicar fina camada na ferida operatória 2 vezes ao dia, após higiene local, por 7 a 10 dias.`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA

REPOUSO:
- Repouso relativo nos primeiros 3 a 5 dias.
- Evitar esforços físicos intensos, atividades esportivas e banhos de mar/piscina por 30 dias.
- Abstinência sexual (incluindo masturbação) por 30 a 45 dias, para evitar deiscência (abertura) dos pontos.

HIDRATAÇÃO E CUIDADOS LOCAIS:
- Ingerir bastante líquido (água, sucos naturais).
- Retirar o curativo inicial após 24 a 48 horas, durante o banho, com água morna para facilitar a remoção.
- Lavar a região diariamente com água e sabonete neutro, secando com toalha limpa ou gaze, sem esfregar.
- Aplicar a pomada prescrita conforme orientação.
- É normal apresentar inchaço (edema) e coloração arroxeada (equimose) na região peniana nos primeiros dias.
- Os pontos caem sozinhos em 2 a 4 semanas (fios absorvíveis).

SINAIS DE ALERTA:
Procurar o Pronto Socorro em caso de:
- Sangramento ativo e contínuo que não cessa com compressão local.
- Aumento progressivo e rápido do inchaço peniano (hematoma em expansão).
- Febre (temperatura maior que 37,8°C).
- Secreção purulenta e com mau cheiro na ferida operatória.
- Dificuldade ou impossibilidade de urinar.

RETORNO:
- Retorno agendado no consultório em 7 a 14 dias para reavaliação. Em caso de dúvidas, entrar em contato com a equipe médica.`,
    },
  },
];
