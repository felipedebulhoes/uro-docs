// AUTO-GERADO (build_extra_procedures.py): procedimentos do Atlas adicionados ao catálogo.
// Conteúdo clínico padronizado para o Dr. Felipe Bulhões. Fontes: EAU/AUA/SBU/Campbell-Walsh-Wein 13ª ed.
import type { Procedure } from "./procedures";

/**
 * Classificação hemodinâmica automática do estudo Doppler peniano a partir de PSV/EDV.
 * Faixas de referência (correlacionar sempre com a clínica):
 *  - PSV < 25 cm/s: insuficiência arterial.
 *  - PSV 25–35 cm/s: inflow arterial indeterminado/limítrofe.
 *  - PSV ≥ 35 cm/s + EDV > 5 cm/s: disfunção veno-oclusiva (venous leak).
 *  - PSV ≥ 35 cm/s + EDV ≤ 5 cm/s: hemodinâmica arterial e veno-oclusiva normais.
 * Fontes: Radiol Bras 2018 (CC BY); Sikka et al. J Sex Med 2013; EAU 2024.
 */
export function classificarDopplerPeniano(psvRaw?: string, edvRaw?: string): string {
  const parse = (v?: string): number | null => {
    if (v == null) return null;
    const s = String(v).trim().replace(",", ".").replace(/[^0-9.\-]/g, "");
    if (s === "" || s === "." || s === "-") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  const psv = parse(psvRaw);
  const edv = parse(edvRaw);

  if (psv == null) {
    return "Classificação automática indisponível (informe o PSV para gerar a interpretação hemodinâmica).";
  }
  if (psv < 25) {
    return `Padrão sugestivo de INSUFICIÊNCIA ARTERIAL (PSV ${psv} cm/s < 25 cm/s). Com inflow arterial reduzido, o EDV não permite avaliar de forma confiável o mecanismo veno-oclusivo.`;
  }
  if (psv < 35) {
    const compl = edv != null && edv > 5
      ? ` Observa-se EDV elevado (${edv} cm/s), porém o componente veno-oclusivo só é interpretável de forma fidedigna com PSV normal (≥ 35 cm/s).`
      : "";
    return `INFLOW ARTERIAL INDETERMINADO/LIMÍTROFE (PSV ${psv} cm/s, faixa 25–35 cm/s) — considerar redose/estimulação e correlação clínica.${compl}`;
  }
  // PSV >= 35
  if (edv == null) {
    return `Inflow arterial dentro da normalidade (PSV ${psv} cm/s ≥ 35 cm/s). Informe o EDV para avaliar o mecanismo veno-oclusivo.`;
  }
  if (edv > 5) {
    return `Inflow arterial normal (PSV ${psv} cm/s) com EDV elevado (${edv} cm/s > 5 cm/s): padrão SUGESTIVO DE DISFUNÇÃO VENO-OCLUSIVA (venous leak).`;
  }
  return `Hemodinâmica arterial e veno-oclusiva DENTRO DA NORMALIDADE (PSV ${psv} cm/s ≥ 35 cm/s e EDV ${edv} cm/s ≤ 5 cm/s).`;
}

/**
 * Monta a curva textual de fluxo arterial por fase do estudo dinâmico peniano,
 * a partir dos PSV (cm/s) medidos em 5, 10, 15, 20 e 25 minutos após a droga vasoativa.
 * Identifica automaticamente o PSV máximo e o tempo até o pico (time-to-peak).
 * Racional clínico: o PSV deve ser interpretado pelo seu valor MÁXIMO ao longo do
 * tempo; medir até 25-30 min evita falso-positivo de insuficiência arterial por
 * avaliação precoce/subdose (Radiol Bras 2018, CC BY; Sikka et al. J Sex Med 2013).
 */
export function curvaFluxoPeniano(
  psv5?: string,
  psv10?: string,
  psv15?: string,
  psv20?: string,
  psv25?: string,
): string {
  const parse = (v?: string): number | null => {
    if (v == null) return null;
    const s = String(v).trim().replace(",", ".").replace(/[^0-9.\-]/g, "");
    if (s === "" || s === "." || s === "-") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  const tempos: { min: number; psv: number | null }[] = [
    { min: 5, psv: parse(psv5) },
    { min: 10, psv: parse(psv10) },
    { min: 15, psv: parse(psv15) },
    { min: 20, psv: parse(psv20) },
    { min: 25, psv: parse(psv25) },
  ];
  const medidos = tempos.filter((t) => t.psv != null) as { min: number; psv: number }[];
  if (medidos.length === 0) {
    return "Curva de fluxo por fase indisponível (informe o PSV em pelo menos um tempo: 5, 10, 15, 20 ou 25 min).";
  }
  const linhas = tempos
    .map((t) => `    • ${t.min} min: ${t.psv != null ? `${t.psv} cm/s` : "— (não medido)"}`)
    .join("\n");
  let pico = medidos[0];
  for (const t of medidos) if (t.psv > pico.psv) pico = t;
  const resumo = `PSV MÁXIMO = ${pico.psv} cm/s, atingido aos ${pico.min} min (tempo até o pico).`;
  const nota =
    pico.min >= 20
      ? " Pico tardio (≥ 20 min) reforça a importância de prolongar a aquisição; avaliação precoce poderia subestimar o inflow arterial."
      : "";
  return `${linhas}\n  ${resumo}${nota}`;
}

/**
 * Classificação automatizada do laudo de USG escrotal/Doppler testicular
 * a partir dos principais cenários clínicos (torção, varícocele, microlitíase,
 * massa, normal). Gera o trecho de impressão correspondente ao achado selecionado.
 * Fontes: EAU Male Infertility 2024; consenso EFSUMB/EAA (Lotti et al.); revisões CC BY.
 */
export function classificarDopplerEscrotal(
  achado?: string,
  opts?: { fluxo?: string; grauVaricocele?: string; microlitiase?: string },
): string {
  switch (achado) {
    case "Torção do cordão espermático": {
      const fluxo = opts?.fluxo || "";
      if (fluxo === "Fluxo intratesticular presente e simétrico") {
        return "Fluxo arterial intratesticular PRESENTE e simétrico no momento do exame. Achado NÃO exclui torção intermitente/parcial — diante de quadro clínico sugestivo, a exploração cirúrgica não deve ser postergada.";
      }
      return "AUSÊNCIA/REDUÇÃO do fluxo arterial intratesticular em relação ao contralateral — padrão compatível com TORÇÃO DO CORDÃO ESPERMÁTICO. EMERGÊNCIA UROLÓGICA: indicar exploração cirúrgica imediata (janela de viabilidade ~6 h).";
    }
    case "Varícocele": {
      const grau = opts?.grauVaricocele || "não especificado";
      return `Veias do plexo pampiniforme dilatadas com refluxo venoso à manobra de Valsalva — VARÍCOCELE (grau ${grau}). Correlacionar com exame físico, espermograma e perfil hormonal; varicocelectomia em casos selecionados.`;
    }
    case "Microlitíase testicular": {
      const tipo = opts?.microlitiase || "";
      const def =
        tipo === "Clássica (≥ 5 focos)"
          ? "MICROLITÍASE TESTICULAR CLÁSSICA (≥ 5 microcalcificações por imagem)"
          : tipo === "Limitada (< 5 focos)"
            ? "Microlitíase testicular LIMITADA (< 5 microcalcificações por imagem)"
            : "Microlitíase testicular";
      return `${def}. Isoladamente não é pré-maligna; estratificar conforme fatores de risco (criptorquidia, atrofia, infertilidade, tumor prévio) e orientar autoexame/seguimento individualizado.`;
    }
    case "Massa testicular sólida":
      return "Lesão SÓLIDA intratesticular vascularizada — considerar potencialmente maligna até prova em contrário. Solicitar marcadores tumorais (AFP, beta-hCG, LDH) e encaminhar para conduta oncológica (orquiectomia radical inguinal quando indicada).";
    case "Normal":
      return "Testículos tópicos, de ecotextura homogênea e volumetria preservada, com fluxo arterial intratesticular presente e simétrico. Sem sinais de torção, varícocele, microlitíase ou lesões focais ao exame atual.";
    default:
      return "Selecione o achado principal para gerar a impressão automatizada.";
  }
}

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
  {
    id: "usg-doppler-peniano",
    name: "Ultrassonografia com Doppler peniano (estudo vascular)",
    shortName: "USG Doppler peniano",
    icon: "\uD83D\uDD0A",
    category: "Andrologia",
    configFields: [
      { id: "indicacao", label: "Indica\u00e7\u00e3o", type: "select", options: ["Disfun\u00e7\u00e3o er\u00e9til (estudo vascular)", "Doen\u00e7a de Peyronie", "Priapismo", "Trauma peniano / fratura", "Curvatura peniana"], defaultValue: "Disfun\u00e7\u00e3o er\u00e9til (estudo vascular)" },
      { id: "vasoativo", label: "Droga vasoativa", type: "select", options: ["Prostaglandina E1 (alprostadil) 10 \u00b5g", "Prostaglandina E1 (alprostadil) 20 \u00b5g", "Trimix (PGE1 + papaverina + fentolamina)", "Sem inje\u00e7\u00e3o (apenas modo-B)"], defaultValue: "Prostaglandina E1 (alprostadil) 10 \u00b5g" },
      { id: "transdutor", label: "Transdutor", type: "select", options: ["Linear de alta frequ\u00eancia (12-15 MHz)", "Linear (7-12 MHz)"], defaultValue: "Linear de alta frequ\u00eancia (12-15 MHz)" },
      { id: "psv", label: "PSV m\u00e1ximo (cm/s)", type: "text", defaultValue: "", placeholder: "Ex.: 38" },
      { id: "edv", label: "EDV (cm/s)", type: "text", defaultValue: "", placeholder: "Ex.: 3" },
      { id: "psv5", label: "PSV aos 5 min (cm/s)", type: "text", defaultValue: "", placeholder: "Ex.: 22" },
      { id: "psv10", label: "PSV aos 10 min (cm/s)", type: "text", defaultValue: "", placeholder: "Ex.: 30" },
      { id: "psv15", label: "PSV aos 15 min (cm/s)", type: "text", defaultValue: "", placeholder: "Ex.: 36" },
      { id: "psv20", label: "PSV aos 20 min (cm/s)", type: "text", defaultValue: "", placeholder: "Ex.: 38" },
      { id: "psv25", label: "PSV aos 25 min (cm/s)", type: "text", defaultValue: "", placeholder: "Ex.: 38" },
      { id: "ri", label: "\u00cdndice de resistividade (RI)", type: "text", defaultValue: "", placeholder: "Ex.: 0,95" },
      { id: "achados", label: "Achados relevantes", type: "text", defaultValue: "Sem altera\u00e7\u00f5es estruturais significativas", placeholder: "Placas, calcifica\u00e7\u00f5es, hematoma, f\u00edstula" },
    ],
    templates: {
      descricao: (c) => `LAUDO \u2014 ULTRASSONOGRAFIA PENIANA COM DOPPLER
Indica\u00e7\u00e3o: ${c.indicacao}
T\u00e9cnica: Estudo realizado com transdutor ${c.transdutor}, em cortes transversal e longitudinal, da glande \u00e0 base do p\u00eanis.${c.vasoativo === "Sem inje\u00e7\u00e3o (apenas modo-B)" ? "" : `\nFase din\u00e2mica: inje\u00e7\u00e3o intracavernosa de ${c.vasoativo}, com avalia\u00e7\u00f5es seriadas do fluxo das art\u00e9rias cavernosas a cada 5 minutos por 25-30 minutos.`}

MODO-B:
- Corpos cavernosos com ecotextura preservada e sim\u00e9trica.
- T\u00fanica albug\u00ednea \u00edntegra, sem solu\u00e7\u00e3o de continuidade.
- Corpo esponjoso e uretra sem altera\u00e7\u00f5es.
- ${c.achados}.
${c.vasoativo === "Sem inje\u00e7\u00e3o (apenas modo-B)" ? "" : `
DOPPLER ESPECTRAL (art\u00e9rias cavernosas, ap\u00f3s vasoativo):
- Pico sist\u00f3lico (PSV) m\u00e1ximo: ${c.psv || "____"} cm/s.
- Velocidade diast\u00f3lica final (EDV): ${c.edv || "____"} cm/s.
- \u00cdndice de resistividade (RI): ${c.ri || "____"}.

CURVA DE FLUXO ARTERIAL POR FASE (PSV das art\u00e9rias cavernosas ao longo do tempo):
${curvaFluxoPeniano(c.psv5, c.psv10, c.psv15, c.psv20, c.psv25)}

PAR\u00c2METROS DE REFER\u00caNCIA (correlacionar com a cl\u00ednica):
- PSV > 35 cm/s: ausência de doença arterial. PSV < 25 cm/s: insufici\u00eancia arterial. 25-35 cm/s: indeterminado.
- EDV > 5 cm/s com PSV normal: sugere disfun\u00e7\u00e3o veno-oclusiva (venous leak).

CLASSIFICA\u00c7\u00c3O HEMODIN\u00c2MICA (autom\u00e1tica, a partir de PSV/EDV informados):
- ${classificarDopplerPeniano(c.psv, c.edv)}`}

IMPRESS\u00c3O:
- Correlacionar os achados hemodin\u00e2micos com o quadro cl\u00ednico. Estudo a ser interpretado em conjunto com a avalia\u00e7\u00e3o do especialista.`,
      posOperatorio: (c) => `ORIENTA\u00c7\u00d5ES IMEDIATAS AP\u00d3S O EXAME${c.vasoativo === "Sem inje\u00e7\u00e3o (apenas modo-B)" ? " (modo-B, sem inje\u00e7\u00e3o)" : " COM DROGA VASOATIVA"}
${c.vasoativo === "Sem inje\u00e7\u00e3o (apenas modo-B)" ? "1. Exame n\u00e3o invasivo, sem restri\u00e7\u00f5es. Pode retomar atividades habituais imediatamente." : `1. Observa\u00e7\u00e3o do paciente at\u00e9 detumesc\u00eancia adequada antes da libera\u00e7\u00e3o.
2. Orientar que a ere\u00e7\u00e3o induzida pode persistir por algum tempo ap\u00f3s o exame.
3. ALERTA DE PRIAPISMO: se a ere\u00e7\u00e3o persistir por mais de 3-4 horas e/ou houver dor, procurar pronto-socorro imediatamente (emerg\u00eancia urol\u00f3gica).
4. Compress\u00e3o local breve no s\u00edtio de pun\u00e7\u00e3o; pequeno hematoma local \u00e9 poss\u00edvel.`}`,
      receitaAlta: (c) => `RECOMENDA\u00c7\u00d5ES
${c.vasoativo === "Sem inje\u00e7\u00e3o (apenas modo-B)" ? "Nenhuma medica\u00e7\u00e3o necess\u00e1ria ap\u00f3s o exame." : `Em caso de ere\u00e7\u00e3o prolongada (acima de 3-4 horas), procurar pronto atendimento. N\u00e3o utilizar medicamentos para detumesc\u00eancia por conta pr\u00f3pria.`}
Retornar com o resultado do exame para avalia\u00e7\u00e3o e defini\u00e7\u00e3o de conduta com o urologista.`,
      orientacoes: (c) => `ORIENTA\u00c7\u00d5ES SOBRE O EXAME \u2014 USG DOPPLER PENIANO
O QUE \u00c9:
- Exame de imagem que avalia a anatomia do p\u00eanis (modo-B) e, quando indicado, o fluxo sangu\u00edneo das art\u00e9rias do p\u00eanis (Doppler colorido e espectral).
- \u00c9 o m\u00e9todo de escolha para investigar a causa vascular da disfun\u00e7\u00e3o er\u00e9til, diferenciar tipos de priapismo, avaliar a doen\u00e7a de Peyronie e o trauma peniano.

COMO \u00c9 FEITO:
${c.vasoativo === "Sem inje\u00e7\u00e3o (apenas modo-B)" ? "- Estudo apenas com o transdutor sobre o p\u00eanis, sem inje\u00e7\u00f5es. Indolor e r\u00e1pido." : `- Para o estudo vascular, \u00e9 aplicada uma pequena inje\u00e7\u00e3o de medicamento (${c.vasoativo}) na lateral do p\u00eanis para induzir a ere\u00e7\u00e3o e permitir a medida do fluxo sangu\u00edneo.
- S\u00e3o feitas medidas seriadas por cerca de 25-30 minutos.`}

PREPARO:
- N\u00e3o \u00e9 necess\u00e1rio jejum. Manter as medica\u00e7\u00f5es de uso habitual, salvo orienta\u00e7\u00e3o m\u00e9dica.

AP\u00d3S O EXAME (PONTOS DE ATEN\u00c7\u00c3O):
${c.vasoativo === "Sem inje\u00e7\u00e3o (apenas modo-B)" ? "- Sem restri\u00e7\u00f5es. Pode retornar \u00e0s atividades normais." : `- Pode haver leve desconforto ou pequeno hematoma no local da inje\u00e7\u00e3o.
- SINAL DE ALERTA: se a ere\u00e7\u00e3o persistir por mais de 3-4 horas ou houver dor importante, procure um pronto-socorro imediatamente.`}`,
    },
  },
  {
    id: "usg-escrotal-doppler-testicular",
    name: "Ultrassonografia escrotal com Doppler testicular",
    shortName: "USG escrotal/Doppler",
    icon: "\uD83D\uDD0A",
    category: "Andrologia",
    configFields: [
      { id: "indicacao", label: "Indica\u00e7\u00e3o", type: "select", options: ["Dor escrotal aguda (escroto agudo)", "Investiga\u00e7\u00e3o de infertilidade", "Massa/n\u00f3dulo escrotal", "Trauma escrotal", "Seguimento de microlit\u00edase", "Var\u00edcocele"], defaultValue: "Investiga\u00e7\u00e3o de infertilidade" },
      { id: "transdutor", label: "Transdutor", type: "select", options: ["Linear de alta frequ\u00eancia (7,5-18 MHz)", "Linear (7-12 MHz)"], defaultValue: "Linear de alta frequ\u00eancia (7,5-18 MHz)" },
      { id: "volume_dir", label: "Volume test\u00edculo direito (mL)", type: "text", defaultValue: "", placeholder: "Ex.: 18" },
      { id: "volume_esq", label: "Volume test\u00edculo esquerdo (mL)", type: "text", defaultValue: "", placeholder: "Ex.: 17" },
      { id: "achado", label: "Achado principal", type: "select", options: ["Normal", "Tor\u00e7\u00e3o do cord\u00e3o esperm\u00e1tico", "Var\u00edcocele", "Microlit\u00edase testicular", "Massa testicular s\u00f3lida"], defaultValue: "Normal" },
      { id: "lateralidade", label: "Lateralidade do achado", type: "select", options: ["\u00e0 direita", "\u00e0 esquerda", "bilateral", "n\u00e3o se aplica"], defaultValue: "n\u00e3o se aplica" },
      { id: "fluxo", label: "Fluxo intratesticular (se escroto agudo)", type: "select", options: ["N\u00e3o avaliado", "Fluxo intratesticular presente e sim\u00e9trico", "Aus\u00eancia/redu\u00e7\u00e3o do fluxo intratesticular"], defaultValue: "N\u00e3o avaliado" },
      { id: "grau_varicocele", label: "Grau da var\u00edcocele (Sarteschi I-V)", type: "select", options: ["n\u00e3o especificado", "I", "II", "III", "IV", "V"], defaultValue: "n\u00e3o especificado" },
      { id: "microlitiase", label: "Padr\u00e3o de microlit\u00edase", type: "select", options: ["n\u00e3o se aplica", "Cl\u00e1ssica (\u2265 5 focos)", "Limitada (< 5 focos)"], defaultValue: "n\u00e3o se aplica" },
    ],
    templates: {
      descricao: (c) => `LAUDO \u2014 ULTRASSONOGRAFIA ESCROTAL COM DOPPLER TESTICULAR
Indica\u00e7\u00e3o: ${c.indicacao}
T\u00e9cnica: Estudo comparativo com transdutor ${c.transdutor}, em cortes longitudinal e transversal de ambos os test\u00edculos, com modo-B e Doppler colorido/espectral (ajuste para fluxos lentos).${c.indicacao === "Investiga\u00e7\u00e3o de infertilidade" || c.achado === "Var\u00edcocele" ? " Pesquisa de var\u00edcocele em repouso, ortostase e durante manobra de Valsalva." : ""}

MODO-B (VOLUMETRIA E ECOTEXTURA):
- Test\u00edculo direito: volume ${c.volume_dir || "____"} mL.
- Test\u00edculo esquerdo: volume ${c.volume_esq || "____"} mL.
- Ecotextura homog\u00eanea de granula\u00e7\u00e3o fina; t\u00fanica albug\u00ednea e mediastino preservados (salvo achado abaixo).
- Epid\u00eddimos e parede escrotal sem altera\u00e7\u00f5es significativas; ausente/presente hidrocele conforme exame.

DOPPLER (PERFUS\u00c3O INTRATESTICULAR):
- Fluxo arterial intratesticular: ${c.fluxo === "N\u00e3o avaliado" ? "avaliado de forma comparativa entre os lados" : c.fluxo.toLowerCase()}.

ACHADO PRINCIPAL: ${c.achado}${c.lateralidade !== "n\u00e3o se aplica" ? ` (${c.lateralidade})` : ""}.

IMPRESS\u00c3O (automatizada a partir do achado selecionado):
- ${classificarDopplerEscrotal(c.achado, { fluxo: c.fluxo, grauVaricocele: c.grau_varicocele, microlitiase: c.microlitiase })}

Observa\u00e7\u00e3o: laudo a ser interpretado em conjunto com a avalia\u00e7\u00e3o cl\u00ednica do especialista.`,
      posOperatorio: (c) => `ORIENTA\u00c7\u00d5ES IMEDIATAS AP\u00d3S O EXAME (USG ESCROTAL)
1. Exame n\u00e3o invasivo, indolor e sem necessidade de repouso. Pode retomar atividades habituais imediatamente.${c.achado === "Tor\u00e7\u00e3o do cord\u00e3o esperm\u00e1tico" && c.fluxo === "Aus\u00eancia/redu\u00e7\u00e3o do fluxo intratesticular" ? "\n2. ATEN\u00c7\u00c3O: achado compat\u00edvel com tor\u00e7\u00e3o \u2014 EMERG\u00caNCIA. Encaminhamento cir\u00fargico imediato." : ""}`,
      receitaAlta: (c) => `RECOMENDA\u00c7\u00d5ES
Nenhuma medica\u00e7\u00e3o necess\u00e1ria ap\u00f3s o exame.${c.achado === "Var\u00edcocele" ? "\nLevar o resultado ao urologista para correla\u00e7\u00e3o com espermograma e perfil hormonal." : ""}${c.achado === "Massa testicular s\u00f3lida" ? "\nProcurar o urologista com brevidade para investiga\u00e7\u00e3o complementar (marcadores tumorais)." : ""}
Retornar com o resultado do exame para avalia\u00e7\u00e3o e defini\u00e7\u00e3o de conduta com o urologista.`,
      orientacoes: (c) => `ORIENTA\u00c7\u00d5ES SOBRE O EXAME \u2014 USG ESCROTAL COM DOPPLER
O QUE \u00c9:
- Exame de imagem que avalia os test\u00edculos, epid\u00eddimos e a circula\u00e7\u00e3o da bolsa escrotal, sem radia\u00e7\u00e3o.
- \u00c9 o m\u00e9todo de escolha para investigar dor escrotal aguda (afastar tor\u00e7\u00e3o), n\u00f3dulos/massas, var\u00edcocele e na avalia\u00e7\u00e3o de fertilidade.

COMO \u00c9 FEITO:
- Aplica-se gel e o aparelho (transdutor) \u00e9 deslizado sobre a bolsa escrotal.${c.indicacao === "Investiga\u00e7\u00e3o de infertilidade" || c.achado === "Var\u00edcocele" ? "\n- Para pesquisar var\u00edcocele, parte do exame \u00e9 feita em p\u00e9 e pedindo que voc\u00ea \"force\" o abdome (manobra de Valsalva)." : ""}

PREPARO:
- N\u00e3o \u00e9 necess\u00e1rio jejum nem preparo especial.

AP\u00d3S O EXAME:
- Sem restri\u00e7\u00f5es. Retorne ao seu urologista com o laudo para a conduta.`,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MANEJO DO PRIAPISMO ISQUÊMICO
  // ═══════════════════════════════════════════════════════════════
  {
    id: "priapismo-isquemico",
    name: "Manejo do Priapismo Isqu\u00eamico",
    shortName: "Priapismo Isqu\u00eamico",
    icon: "\ud83d\udea8",
    category: "Andrologia",
    configFields: [
      { id: "duracao", label: "Dura\u00e7\u00e3o do Priapismo", type: "select", options: ["< 4 horas", "4\u20136 horas", "6\u201312 horas", "12\u201324 horas", "24\u201336 horas", "> 36 horas"], defaultValue: "4\u20136 horas" },
      { id: "etiologia", label: "Etiologia Prov\u00e1vel", type: "select", options: ["Idiop\u00e1tico", "P\u00f3s-IIC (alprostadil/trimix/bimix)", "Anemia falciforme", "Medicamentoso (antipsic\u00f3tico/anti-hipertensivo)", "Hematol\u00f3gico (outra causa)", "N\u00e3o identificada"], defaultValue: "Idiop\u00e1tico" },
      { id: "gasometria", label: "Gasometria Cavernosa", type: "select", options: ["Isqu\u00eamica (pO\u2082 < 30 mmHg, pCO\u2082 > 60 mmHg, pH < 7,25)", "Indeterminada", "N\u00e3o realizada"], defaultValue: "Isqu\u00eamica (pO\u2082 < 30 mmHg, pCO\u2082 > 60 mmHg, pH < 7,25)" },
      { id: "aspiracao", label: "Aspira\u00e7\u00e3o Cavernosa", type: "select", options: ["Realizada \u2014 sangue escuro aspirado", "Realizada + irriga\u00e7\u00e3o com SF 0,9%", "N\u00e3o realizada (< 4h, p\u00f3s-IIC)"], defaultValue: "Realizada \u2014 sangue escuro aspirado" },
      { id: "vasoconstritor", label: "Vasoconstritor Intracavernoso", type: "select", options: ["Fenilefrina 200 \u00b5g/mL (1\u00aa linha \u2014 AUA/EAU)", "Etilefrina 2,5 mg/mL \u2014 Flukka (alternativa dispon\u00edvel no Brasil)", "Adrenalina 1:100.000 (2 mL)", "Fenilefrina + Irriga\u00e7\u00e3o com SF"], defaultValue: "Fenilefrina 200 \u00b5g/mL (1\u00aa linha \u2014 AUA/EAU)" },
      { id: "resposta", label: "Resposta ao Tratamento Cl\u00ednico", type: "select", options: ["Detumesc\u00eancia completa", "Detumesc\u00eancia parcial", "Sem resposta ap\u00f3s 1 hora"], defaultValue: "Detumesc\u00eancia completa" },
      { id: "shunt", label: "Shunt Cir\u00fargico", type: "select", options: ["N\u00e3o necess\u00e1rio", "Shunt distal (Winter / Al-Ghorab)", "Shunt distal + tuneliza\u00e7\u00e3o (Lue)", "Shunt proximal (Quackels / Grayhack)"], defaultValue: "N\u00e3o necess\u00e1rio" },
      { id: "protese_precoce", label: "Pr\u00f3tese Peniana Precoce", type: "select", options: ["N\u00e3o indicada", "Discutida e aceita pelo paciente", "Implantada (pr\u00f3tese male\u00e1vel)", "Implantada (pr\u00f3tese infl\u00e1vel 3 volumes)"], defaultValue: "N\u00e3o indicada" },
    ],
    templates: {
      descricao: (c) => {
        const vasoFarmaco = c.vasoconstritor.includes("Fenilefrina") && !c.vasoconstritor.includes("Irriga\u00e7\u00e3o")
          ? "fenilefrina (200 \u00b5g/mL em SF 0,9%, al\u00edquotas de 1 mL a cada 3\u20135 min, dose m\u00e1xima 1 mg/h)"
          : c.vasoconstritor.includes("Etilefrina")
          ? "etilefrina 2,5 mg/mL intracavernosa (Flukka \u2014 formula\u00e7\u00e3o magistral)"
          : c.vasoconstritor.includes("Adrenalina")
          ? "adrenalina 1:100.000 (2 mL IC, repetida at\u00e9 5\u00d7 em 20 min)"
          : "fenilefrina + irriga\u00e7\u00e3o com SF 0,9%";
        return `MANEJO DO PRIAPISMO ISQU\u00caMICO\nDura\u00e7\u00e3o: ${c.duracao}. Etiologia: ${c.etiologia}.\nGasometria cavernosa: ${c.gasometria}.\n1. ASPIRA\u00c7\u00c3O: ${c.aspiracao}.\n2. VASOCONSTRITOR IC: Administrado ${vasoFarmaco}. Monitoriza\u00e7\u00e3o de PA e FC durante o procedimento.\n3. RESPOSTA: ${c.resposta}.\n${c.shunt !== "N\u00e3o necess\u00e1rio" ? `4. SHUNT CIR\u00daRGICO: ${c.shunt} realizado por falha do tratamento cl\u00ednico.\n` : ""}${c.protese_precoce !== "N\u00e3o indicada" ? `5. PR\u00d3TESE PENIANA: ${c.protese_precoce}.\n` : ""}\nREFER\u00caNCIAS: AUA/SMSNA Guideline \u2014 Acute Ischemic Priapism (J Urol 2021;206:1114); EAU Guidelines on Priapism 2015.`;
      },
      posOperatorio: (c) => {
        const urgente = c.duracao === "> 36 horas" || c.protese_precoce !== "N\u00e3o indicada";
        return `P\u00d3S-PROCEDIMENTO \u2014 PRIAPISMO ISQU\u00caMICO\n${urgente ? "ATEN\u00c7\u00c3O: Priapismo de longa dura\u00e7\u00e3o (> 36h) \u2014 risco elevado de disfun\u00e7\u00e3o er\u00e9til permanente. Acompanhamento androl\u00f3gico obrigat\u00f3rio.\n" : ""}MONITORIZA\u00c7\u00c3O:\n\u2022 Verificar detumesc\u00eancia e retorno do fluxo cavernoso (Doppler) ap\u00f3s o procedimento.\n\u2022 Monitorar PA e FC durante e ap\u00f3s uso de vasoconstritor.\n\u2022 Observar por 1\u20132h antes da alta hospitalar.\nANALGESIA: Dipirona 1 g IV/VO 6/6h + Ibuprofeno 600 mg VO 8/8h (se sem contraindica\u00e7\u00e3o).\nCUIDADOS LOCAIS: Compress\u00e3o suave do local de pun\u00e7\u00e3o por 5 min. Gelo local por 20 min.\n${c.shunt !== "N\u00e3o necess\u00e1rio" ? `P\u00d3S-SHUNT: Curativo compressivo. Manter sonda vesical 24h. Repouso relativo 48h.\n` : ""}`;
      },
      receitaAlta: (c) => {
        return `PRESCRI\u00c7\u00c3O DE ALTA \u2014 PRIAPISMO ISQU\u00caMICO\n1. Dipirona 500 mg \u2014 1 comprimido VO de 6/6h por 3 dias (se dor).\n2. Ibuprofeno 600 mg \u2014 1 comprimido VO de 8/8h por 3 dias (com alimento; se sem contraindica\u00e7\u00e3o).\n${c.etiologia === "Anemia falciforme" ? "3. Manter hidrata\u00e7\u00e3o oral adequada. Contato com hematologista para ajuste do protocolo de crise.\n" : ""}${c.shunt !== "N\u00e3o necess\u00e1rio" ? "3. Cefalexina 500 mg \u2014 1 comprimido VO de 6/6h por 5 dias (profilaxia p\u00f3s-shunt).\n" : ""}\nRETORNO: ${c.duracao === "> 36 horas" || c.resposta !== "Detumesc\u00eancia completa" ? "Em 48\u201372h para reavalia\u00e7\u00e3o cl\u00ednica e Doppler peniano." : "Em 7 dias ou antes se necess\u00e1rio."}`;
      },
      orientacoes: (c) => {
        const riscoDE = c.duracao === "> 36 horas" ? "ALTO (priapismo > 36h \u2014 fibrose cavernosa quase inevit\u00e1vel)"
          : c.duracao === "24\u201336 horas" ? "ELEVADO (priapismo 24\u201336h)"
          : c.duracao === "12\u201324 horas" ? "MODERADO"
          : "BAIXO A MODERADO";
        return `ORIENTA\u00c7\u00d5ES AO PACIENTE \u2014 PRIAPISMO ISQU\u00caMICO\n\nO QUE \u00c9:\nPriapismo isqu\u00eamico \u00e9 uma emerg\u00eancia urol\u00f3gica: ere\u00e7\u00e3o dolorosa prolongada (> 4h) sem est\u00edmulo sexual, causada pela interrup\u00e7\u00e3o do fluxo venoso do p\u00eanis. Sem tratamento r\u00e1pido, pode causar fibrose irrevers\u00edvel dos corpos cavernosos e disfun\u00e7\u00e3o er\u00e9til permanente.\n\nRISCO DE DISFUN\u00c7\u00c3O ER\u00c9TIL: ${riscoDE}.\n\u2022 Tratamento iniciado em < 4\u20136h: maior chance de preserva\u00e7\u00e3o da fun\u00e7\u00e3o er\u00e9til.\n\u2022 Ap\u00f3s 48h: quase 100% dos pacientes desenvolvem algum grau de fibrose.\n\nAP\u00d3S O TRATAMENTO:\n\u2022 Repouso relativo por 24\u201348h. Evitar atividade sexual por 2\u20134 semanas.\n\u2022 Manter o p\u00eanis elevado (travesseiro) para reduzir edema.\n\u2022 Compressas frias (20 min, 3\u00d7/dia) nos primeiros 2 dias.\n\u2022 Tomar os medicamentos prescritos conforme indicado.\n\nSINAIS DE ALERTA (Retornar imediatamente):\n\u2022 Ere\u00e7\u00e3o dolorosa recorrente (priapismo recorrente/intermitente).\n\u2022 Febre, secre\u00e7\u00e3o ou vermelhid\u00e3o no local de pun\u00e7\u00e3o.\n\u2022 Incapacidade de urinar.\n\nSEGUIMENTO:\n\u2022 Retornar conforme agendado para avalia\u00e7\u00e3o da fun\u00e7\u00e3o er\u00e9til.\n\u2022 Em casos de disfun\u00e7\u00e3o er\u00e9til p\u00f3s-priapismo, existem op\u00e7\u00f5es de reabilita\u00e7\u00e3o peniana e, se necess\u00e1rio, implante de pr\u00f3tese peniana.\n\nFONTES: AUA/SMSNA Guideline \u2014 Acute Ischemic Priapism (J Urol 2021;206:1114); EAU Guidelines on Priapism 2015.`;
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // TERAPIA EXPULSIVA PARA CÁLCULO URETERAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "terapia-expulsiva-calculo-ureteral",
    name: "Terapia Expulsiva \u2014 C\u00e1lculo Ureteral",
    shortName: "Terapia Expulsiva",
    icon: "\ud83d\udc8a",
    category: "Endourologia",
    configFields: [
      { id: "lateralidade", label: "Lateralidade", type: "select", options: ["\u00e0 direita", "\u00e0 esquerda"], defaultValue: "\u00e0 esquerda" },
      { id: "localizacao", label: "Localiza\u00e7\u00e3o do C\u00e1lculo", type: "select", options: ["ter\u00e7o distal (JUV)", "ter\u00e7o m\u00e9dio", "ter\u00e7o proximal"], defaultValue: "ter\u00e7o distal (JUV)" },
      { id: "tamanho", label: "Tamanho do C\u00e1lculo (mm)", type: "text", defaultValue: "6", placeholder: "Ex: 6" },
      { id: "composicao", label: "Composi\u00e7\u00e3o Prov\u00e1vel", type: "select", options: ["N\u00e3o determinada", "Oxalato de c\u00e1lcio", "\u00c1cido \u00farico", "Estruvita", "Cistina"], defaultValue: "N\u00e3o determinada" },
      { id: "obstrucao", label: "Grau de Obstru\u00e7\u00e3o", type: "select", options: ["Sem hidronefrose", "Hidronefrose leve", "Hidronefrose moderada"], defaultValue: "Hidronefrose leve" },
      { id: "farmaco", label: "F\u00e1rmaco de Escolha", type: "select", options: ["Tamsulosina 0,4 mg/dia (1\u00aa linha)", "Silodosina 8 mg/dia", "Nifedipina 30 mg/dia (alternativa)", "Tamsulosina 0,4 mg + Nifedipina 30 mg (combina\u00e7\u00e3o)"], defaultValue: "Tamsulosina 0,4 mg/dia (1\u00aa linha)" },
      { id: "duracao_prevista", label: "Dura\u00e7\u00e3o Prevista do Tratamento", type: "select", options: ["At\u00e9 4 semanas", "At\u00e9 6 semanas", "At\u00e9 8 semanas"], defaultValue: "At\u00e9 4 semanas" },
      { id: "analgesico", label: "Analgesia Associada", type: "select", options: ["AINE (ibuprofeno 600 mg 8/8h)", "Dipirona 1 g 6/6h", "AINE + Dipirona", "N\u00e3o necess\u00e1rio no momento"], defaultValue: "AINE (ibuprofeno 600 mg 8/8h)" },
      { id: "retorno", label: "Retorno para Reavalia\u00e7\u00e3o", type: "select", options: ["2 semanas", "4 semanas", "6 semanas"], defaultValue: "4 semanas" },
      {
        id: "calc_expulsao",
        label: "Calculadora de Expulsão",
        type: "calculated" as const,
        defaultValue: "",
        calculate: (c: Record<string, string>) => {
          const tam = parseFloat(c.tamanho) || 0;
          const loc = c.localizacao || "";

          // Evidence matrix: Hollingsworth JM et al. JAMA 2016;315(19):2104
          // EAU Urolithiasis Guidelines 2024 (Türk et al.)
          // Rows: size bands; Cols: location (distal/medio/proximal)
          type Band = { maxSize: number; distal: number; medio: number; proximal: number };
          const matrix: Band[] = [
            { maxSize: 4,  distal: 87, medio: 76, proximal: 63 },
            { maxSize: 6,  distal: 74, medio: 60, proximal: 48 },
            { maxSize: 8,  distal: 55, medio: 42, proximal: 32 },
            { maxSize: 10, distal: 40, medio: 30, proximal: 22 },
            { maxSize: 99, distal: 20, medio: 15, proximal: 10 },
          ];

          const isDistal  = loc.includes("distal") || loc.includes("JUV");
          const isProx    = loc.includes("proximal");
          const band      = matrix.find(b => tam <= b.maxSize) ?? matrix[matrix.length - 1];
          const prob      = isDistal ? band.distal : isProx ? band.proximal : band.medio;

          // Time estimate
          let timeEstimate = "";
          if (prob >= 75)      timeEstimate = "1–2 semanas";
          else if (prob >= 55) timeEstimate = "2–3 semanas";
          else if (prob >= 35) timeEstimate = "3–4 semanas";
          else                 timeEstimate = "> 4 semanas (baixa chance)";

          // Color
          const color: "green" | "yellow" | "orange" | "red" =
            prob >= 70 ? "green" : prob >= 50 ? "yellow" : prob >= 30 ? "orange" : "red";

          // Recommendation
          let recommendation = "";
          if (prob >= 70)
            recommendation = "Terapia expulsiva indicada. Alta probabilidade de passagem espontânea.";
          else if (prob >= 50)
            recommendation = "Terapia expulsiva razoável. Reavalie em 4 semanas com imagem.";
          else if (prob >= 30)
            recommendation = "Chance moderada. Considere intervenção se dor refratária ou obstrução progressiva.";
          else
            recommendation = "Baixa probabilidade de expulsão espontânea. Discutir intervenção precoce.";

          const locLabel = isDistal ? "distal (JUV)" : isProx ? "proximal" : "médio";

          return {
            probability: prob,
            probLabel: `~${prob}%`,
            timeEstimate,
            recommendation,
            color,
            details: [
              `Tamanho: ${tam > 0 ? tam + " mm" : "não informado"}`,
              `Localização: ureter ${locLabel}`,
              `Taxa de expulsão (Hollingsworth 2016 / EAU 2024): ~${prob}%`,
              `Tempo médio estimado: ${timeEstimate}`,
            ],
          };
        },
      },
    ],
    templates: {
      descricao: (c) => {
        const tam = parseFloat(c.tamanho) || 0;
        const chancePasso = tam <= 4 ? "~80%" : tam <= 6 ? "~60%" : tam <= 10 ? "~40\u201350%" : "< 25%";
        return `TERAPIA EXPULSIVA \u2014 C\u00c1LCULO URETERAL\nC\u00e1lculo ureteral ${c.lateralidade}, ${c.localizacao}, ${c.tamanho} mm.${c.composicao !== "N\u00e3o determinada" ? ` Composi\u00e7\u00e3o prov\u00e1vel: ${c.composicao}.` : ""}\nGrau de obstru\u00e7\u00e3o: ${c.obstrucao}.\nChance de passagem espont\u00e2nea estimada: ${chancePasso} (baseada no tamanho e localiza\u00e7\u00e3o).\nCrit\u00e9rios de elegibilidade para terapia expulsiva presentes: c\u00e1lculo \u2264 10 mm, sem infec\u00e7\u00e3o urin\u00e1ria, sem obstru\u00e7\u00e3o grave, dor control\u00e1vel, fun\u00e7\u00e3o renal preservada.\nF\u00e1rmaco prescrito: ${c.farmaco}. Dura\u00e7\u00e3o prevista: ${c.duracao_prevista}.\nAnalgesia: ${c.analgesico}.\nRetorno para reavalia\u00e7\u00e3o: ${c.retorno}.\nCrit\u00e9rios de falha da terapia expulsiva (indica\u00e7\u00e3o de interven\u00e7\u00e3o cir\u00fargica): aus\u00eancia de passagem ap\u00f3s ${c.duracao_prevista}; dor refrat\u00e1ria; infec\u00e7\u00e3o urin\u00e1ria associada; deteriora\u00e7\u00e3o da fun\u00e7\u00e3o renal; obstru\u00e7\u00e3o bilateral ou em rim \u00fanico.\nREFER\u00caNCIAS: EAU Guidelines on Urolithiasis 2024 (T\u00fcrk et al.); AUA/Endourology Society Guideline 2022; Hollingsworth JM et al. JAMA 2016;315(19):2104.`;
      },
      posOperatorio: (c) => `ACOMPANHAMENTO \u2014 TERAPIA EXPULSIVA\nN\u00e3o se aplica p\u00f3s-operat\u00f3rio (tratamento conservador).\nMonitorar:\n\u2022 Passagem do c\u00e1lculo (coar a urina com filtro/gaze).\n\u2022 Dor: se c\u00f3lica intensa ou refrat\u00e1ria, retornar ao pronto-socorro.\n\u2022 Febre ou calafrios: retornar imediatamente (suspeita de pielonefrite obstrutiva \u2014 EMERG\u00caNCIA).\n\u2022 Hemat\u00faria: esperada; se maci\u00e7a, retornar.\nRetorno agendado: ${c.retorno} com nova imagem (TC sem contraste ou RX simples de abdome).`,
      receitaAlta: (c) => {
        const farmaco = c.farmaco.includes("Tamsulosina") && c.farmaco.includes("Nifedipina")
          ? "1. Tamsulosina 0,4 mg \u2014 1 c\u00e1psula VO 1\u00d7/dia (preferencialmente \u00e0 noite, ap\u00f3s jantar).\n2. Nifedipina 30 mg \u2014 1 comprimido VO 1\u00d7/dia."
          : c.farmaco.includes("Tamsulosina")
          ? "1. Tamsulosina 0,4 mg \u2014 1 c\u00e1psula VO 1\u00d7/dia (preferencialmente \u00e0 noite, ap\u00f3s jantar)."
          : c.farmaco.includes("Silodosina")
          ? "1. Silodosina 8 mg \u2014 1 c\u00e1psula VO 1\u00d7/dia (com alimento)."
          : "1. Nifedipina 30 mg \u2014 1 comprimido VO 1\u00d7/dia.";
        const analgesico = c.analgesico.includes("AINE") && c.analgesico.includes("Dipirona")
          ? "\n2. Ibuprofeno 600 mg \u2014 1 comprimido VO de 8/8h com alimento (se dor; m\u00e1ximo 5 dias cont\u00ednuos).\n3. Dipirona 1 g \u2014 1 comprimido VO de 6/6h (se dor entre as doses do AINE)."
          : c.analgesico.includes("AINE")
          ? "\n2. Ibuprofeno 600 mg \u2014 1 comprimido VO de 8/8h com alimento (se dor; m\u00e1ximo 5 dias cont\u00ednuos)."
          : c.analgesico.includes("Dipirona")
          ? "\n2. Dipirona 1 g \u2014 1 comprimido VO de 6/6h (se dor)."
          : "";
        return `PRESCRI\u00c7\u00c3O \u2014 TERAPIA EXPULSIVA\n${farmaco}${analgesico}\n\nINGEST\u00c3O H\u00cdDRICA: Manter diurese > 2 L/dia (beber \u2265 2,5 L de \u00e1gua/dia).\nFILTRAR A URINA: Coar a urina com filtro de caf\u00e9 ou gaze para identificar a passagem do c\u00e1lculo.\nRETORNO: ${c.retorno} com nova imagem.`;
      },
      orientacoes: (c) => {
        const tam = parseFloat(c.tamanho) || 0;
        const chancePasso = tam <= 4 ? "~80%" : tam <= 6 ? "~60%" : tam <= 10 ? "~40\u201350%" : "< 25%";
        return `ORIENTA\u00c7\u00d5ES AO PACIENTE \u2014 TERAPIA EXPULSIVA PARA C\u00c1LCULO URETERAL\n\nO QUE \u00c9:\nVoc\u00ea tem um c\u00e1lculo (pedra) no ureter ${c.lateralidade}, localizado no ${c.localizacao}, medindo ${c.tamanho} mm.\nA terapia expulsiva usa medicamentos (relaxantes do ureter) para facilitar a sa\u00edda espont\u00e2nea do c\u00e1lculo pela urina.\n\nCHANCE DE SA\u00cdDA ESPONT\u00c2NEA: ${chancePasso} (estimativa baseada no tamanho e localiza\u00e7\u00e3o).\n\nMEDICAMENTO PRESCRITO:\n${c.farmaco.includes("Tamsulosina") ? "\u2022 Tamsulosina (bloqueador alfa-1): relaxa a musculatura do ureter, facilitando a passagem do c\u00e1lculo. Tome \u00e0 noite para reduzir o risco de tontura ao levantar." : ""}${c.farmaco.includes("Nifedipina") ? "\n\u2022 Nifedipina (bloqueador de canal de c\u00e1lcio): auxilia no relaxamento ureteral." : ""}\n\nO QUE FAZER:\n\u2022 Beber bastante \u00e1gua (\u2265 2,5 L/dia) para manter boa diurese.\n\u2022 Coar a urina com filtro de caf\u00e9 ou gaze para identificar quando o c\u00e1lculo sair.\n\u2022 Guardar o c\u00e1lculo (em frasco seco) para an\u00e1lise de composi\u00e7\u00e3o.\n\u2022 Atividade f\u00edsica moderada (caminhada) pode ajudar na mobiliza\u00e7\u00e3o do c\u00e1lculo.\n\nSINAIS DE ALERTA (Procurar emerg\u00eancia imediatamente):\n\u2022 Febre > 38\u00b0C ou calafrios (pode indicar infec\u00e7\u00e3o com obstru\u00e7\u00e3o \u2014 emerg\u00eancia).\n\u2022 Dor intensa que n\u00e3o melhora com os analg\u00e9sicos.\n\u2022 N\u00e1useas/v\u00f4mitos que impedem a alimenta\u00e7\u00e3o.\n\u2022 Aus\u00eancia de urina por > 8h.\n\nQUANDO A CIRURGIA PODE SER NECESS\u00c1RIA:\n\u2022 Se o c\u00e1lculo n\u00e3o sair dentro de ${c.duracao_prevista}.\n\u2022 Se a dor n\u00e3o for controlada com medicamentos.\n\u2022 Se houver infec\u00e7\u00e3o urin\u00e1ria associada.\n\u2022 Se a fun\u00e7\u00e3o do rim estiver comprometida.\n\nRETORNO: ${c.retorno} com nova imagem (tomografia ou raio-X).\n\nFONTES: EAU Guidelines on Urolithiasis 2024; AUA/Endourology Society Guideline 2022; Hollingsworth JM et al. JAMA 2016;315(19):2104.`;
      },
    },
  },

  {
    id: "investigacao-metabolica-litiase",
    name: "Investigação Metabólica — Litíase Recorrente",
    shortName: "Invest. Metabólica",
    icon: "🔬",
    category: "Endourologia",
    configFields: [
      { id: "nome", label: "Nome do Paciente", type: "text", defaultValue: "", placeholder: "Nome completo" },
      { id: "data", label: "Data da Consulta", type: "text", defaultValue: "", placeholder: "DD/MM/AAAA" },
      { id: "episodios", label: "Nº de Episódios de Litíase", type: "text", defaultValue: "", placeholder: "Ex: 2" },
      { id: "composicao", label: "Composição do Cálculo", type: "text", defaultValue: "não disponível", placeholder: "Ex: oxalato de cálcio" },
      { id: "ca_urina24", label: "Cálcio Urinário 24h (mg/dia)", type: "text", defaultValue: "", placeholder: "Ex: 320" },
      { id: "oxalato_urina24", label: "Oxalato Urinário 24h (mg/dia)", type: "text", defaultValue: "", placeholder: "Ex: 45" },
      { id: "citrato_urina24", label: "Citrato Urinário 24h (mg/dia)", type: "text", defaultValue: "", placeholder: "Ex: 280" },
      { id: "au_urina24", label: "Ácido Úrico Urinário 24h (mg/dia)", type: "text", defaultValue: "", placeholder: "Ex: 700" },
      { id: "sodio_urina24", label: "Sódio Urinário 24h (mEq/dia)", type: "text", defaultValue: "", placeholder: "Ex: 180" },
      { id: "fosfato_urina24", label: "Fosfato Urinário 24h (mg/dia)", type: "text", defaultValue: "", placeholder: "Ex: 900" },
      { id: "volume_urina24", label: "Volume Urinário 24h (mL)", type: "text", defaultValue: "", placeholder: "Ex: 1800" },
      { id: "ph_urina", label: "pH Urinário Médio", type: "text", defaultValue: "", placeholder: "Ex: 5,8" },
      { id: "ca_sangue", label: "Cálcio Sérico (mg/dL)", type: "text", defaultValue: "", placeholder: "Ex: 9,8" },
      { id: "pth", label: "PTH Intacto (pg/mL)", type: "text", defaultValue: "", placeholder: "Ex: 45" },
      { id: "au_sangue", label: "Ácido Úrico Sérico (mg/dL)", type: "text", defaultValue: "", placeholder: "Ex: 6,5" },
      { id: "creatinina", label: "Creatinina Sérica (mg/dL)", type: "text", defaultValue: "", placeholder: "Ex: 0,9" },
      { id: "vitamina_d", label: "25-OH Vitamina D (ng/mL)", type: "text", defaultValue: "", placeholder: "Ex: 28" },
      { id: "diagnostico_metabolico", label: "Diagnóstico Metabólico", type: "text", defaultValue: "", placeholder: "Ex: hipercalciúria absortiva + hipocitratúria" },
      { id: "conduta", label: "Conduta / Tratamento Proposto", type: "text", defaultValue: "", placeholder: "Ex: hidroclorotiazida 25 mg/dia + citrato de potássio 30 mEq/dia" },
    ],
    templates: {
      descricao: (c) => {
        const linhaU = (label: string, val: string, ref: string) =>
          val ? `• ${label}: ${val} (ref: ${ref})\n` : '';
        const linhaS = (label: string, val: string, ref: string) =>
          val ? `• ${label}: ${val} (ref: ${ref})\n` : '';
        const urineSection = [
          linhaU('Cálcio urinário 24h', c.ca_urina24, '< 250 mg/dia ♀ / < 300 mg/dia ♂'),
          linhaU('Oxalato urinário 24h', c.oxalato_urina24, '< 40 mg/dia'),
          linhaU('Citrato urinário 24h', c.citrato_urina24, '> 320 mg/dia ♀ / > 450 mg/dia ♂'),
          linhaU('Ácido úrico urinário 24h', c.au_urina24, '< 750 mg/dia ♀ / < 800 mg/dia ♂'),
          linhaU('Sódio urinário 24h', c.sodio_urina24, '< 150 mEq/dia'),
          linhaU('Fosfato urinário 24h', c.fosfato_urina24, '400–1.300 mg/dia'),
          linhaU('Volume urinário 24h', c.volume_urina24, '≥ 2.000 mL/dia'),
          linhaU('pH urinário médio', c.ph_urina, '5,8–6,2 ideal'),
        ].filter(Boolean).join('');
        const bloodSection = [
          linhaS('Cálcio sérico', c.ca_sangue, '8,5–10,2 mg/dL'),
          linhaS('PTH intacto', c.pth, '15–65 pg/mL'),
          linhaS('Ácido úrico sérico', c.au_sangue, '< 6,0 mg/dL ♀ / < 7,0 mg/dL ♂'),
          linhaS('Creatinina sérica', c.creatinina, '0,6–1,2 mg/dL'),
          linhaS('25-OH Vitamina D', c.vitamina_d, '30–60 ng/mL'),
        ].filter(Boolean).join('');
        return `RELATÓRIO DE INVESTIGAÇÃO METABÓLICA — LITÍASE URINÁRIA\n\nPaciente: ${c.nome || '___________'}\nData: ${c.data || '___/___/______'}\nEpisódios de litíase: ${c.episodios || 'não informado'}\nComposição do cálculo: ${c.composicao || 'não disponível'}\n\n` +
          (urineSection ? `URINA DE 24 HORAS:\n${urineSection}\n` : 'URINA DE 24 HORAS: aguardando resultado.\n\n') +
          (bloodSection ? `EXAMES DE SANGUE:\n${bloodSection}\n` : 'EXAMES DE SANGUE: aguardando resultado.\n\n') +
          (c.diagnostico_metabolico ? `DIAGNÓSTICO METABÓLICO:\n${c.diagnostico_metabolico}\n\n` : '') +
          (c.conduta ? `CONDUTA:\n${c.conduta}\n\n` : '') +
          `FONTES: EAU Guidelines on Urolithiasis 2024 (Türk et al.); Pearle MS et al. AUA/Endourology Society Guideline 2022; Goldfarb DS. Kidney Int 2019;96(1):26–33.`;
      },
      posOperatorio: (_c) =>
        `Protocolo de investigação metabólica para litíase recorrente. Aguardar resultados dos exames de urina de 24h e sangue para interpretação e definição da conduta preventiva individualizada.`,
      receitaAlta: (_c) =>
        `SOLICITAÇÃO DE EXAMES — INVESTIGAÇÃO METABÓLICA PARA LITÍASE\n\n1. URINA DE 24 HORAS:\n   • Cálcio, oxalato, citrato, ácido úrico, sódio, fosfato, creatinina, volume total\n   • pH urinário (3 amostras: manhã, tarde, noite)\n\n2. SANGUE (jejum de 8–12h):\n   • Cálcio sérico, PTH intacto, ácido úrico, creatinina, 25-OH Vitamina D, bicarbonato, glicemia\n\n3. URINA SIMPLES (EAS + urocultura)\n\nINSTRUÇÕES PARA COLETA DE URINA DE 24H:\n• Descartar a primeira urina da manhã\n• Coletar TODA a urina das próximas 24h no frasco fornecido\n• Incluir a primeira urina do dia seguinte\n• Manter o frasco refrigerado\n• Não alterar a dieta habitual durante a coleta\n\nFONTE: EAU Guidelines on Urolithiasis 2024.`,
      orientacoes: (c) =>
        `ORIENTAÇÕES — INVESTIGAÇÃO METABÓLICA PARA PEDRA NOS RINS\n\nPaciente: ${c.nome || '___________'}\n\nPOR QUE INVESTIGAR?\nPacientes com litíase recorrente (≥ 2 episódios) ou de alto risco (rim único, criança, hiperparatireoidismo, acidose tubular, cistinúria) devem ser investigados para identificar a causa metabólica e prevenir novos cálculos.\n\nEXAMES SOLICITADOS:\n\n1. URINA DE 24 HORAS (coletar em dia típico de alimentação e atividade habitual):\n   • Cálcio, oxalato, citrato, ácido úrico, sódio, fosfato\n   • Volume total (meta: ≥ 2 L/dia)\n   • pH urinário\n   Como coletar: descartar a primeira urina da manhã; coletar TODA a urina das próximas 24h (incluindo a primeira urina do dia seguinte) no frasco fornecido. Manter o frasco refrigerado. Não alterar a dieta habitual durante a coleta.\n\n2. SANGUE EM JEJUM:\n   • Cálcio, PTH intacto, ácido úrico, creatinina, 25-OH Vitamina D\n\n3. URINA SIMPLES (EAS + urocultura): avaliar pH, cristais e infecção.\n\nCUIDADOS DURANTE A COLETA:\n• Manter alimentação e hidratação habituais (não alterar para "parecer melhor")\n• Evitar suplementos de vitamina C ou cálcio no dia da coleta\n• Anotar qualquer medicamento em uso\n\nRETORNO: Trazer todos os resultados para interpretação e definição do tratamento individualizado.\n\nFONTES: EAU Guidelines on Urolithiasis 2024; AUA/Endourology Society Guideline 2022.`,
    },
  },
];
