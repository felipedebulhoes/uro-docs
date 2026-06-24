// AUTO-GERADO (build_extra_procedures.py): procedimentos do Atlas adicionados ao catálogo.
// Conteúdo clínico padronizado para o Dr. Felipe Bulhões. Fontes: EAU/AUA/SBU/Campbell-Walsh-Wein 13ª ed.
import type { Procedure } from "./procedures";
import {
  calcExpulsao,
  calcExpulsaoProbabilidade,
  calcIpss,
  calcIpssScore,
  calcRiscoLitiase,
  calcIndicacaoCirurgicaHPB,
} from "../lib/calculators";

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
        calculate: (c: Record<string, string>) => calcExpulsao(c),
      },
    ],
    templates: {
      descricao: (c) => {
        const tam = parseFloat(c.tamanho) || 0;
        // Mesma matriz do painel calc_expulsao (lib/calculators.ts).
        const chancePasso = `~${calcExpulsaoProbabilidade(tam, c.localizacao || "").probability}%`;
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
        const loc = c.localizacao || "";

        // Mesma fonte de verdade do painel calc_expulsao (lib/calculators.ts) —
        // evita que este documento mostre uma probabilidade diferente da
        // exibida na calculadora.
        const { probability: prob, riskLabel, timeEstimate: timeEst } = calcExpulsaoProbabilidade(tam, loc);

        return `ORIENTAÇÕES AO PACIENTE — TERAPIA EXPULSIVA PARA CÁLCULO URETERAL

O QUE É:
Você tem um cálculo (pedra) no ureter ${c.lateralidade}, localizado no ${c.localizacao}, medindo ${c.tamanho} mm.
A terapia expulsiva usa medicamentos (relaxantes do ureter) para facilitar a saída espontânea do cálculo pela urina.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBABILIDADE DE SAÍDA ESPONTÂNEA: ~${prob}% — CHANCE ${riskLabel}
Tempo estimado: ${timeEst}
Tamanho: ${c.tamanho} mm | Localização: ${c.localizacao}
Fonte: Hollingsworth JM et al. JAMA 2016;315(19):2104; EAU Guidelines on Urolithiasis 2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEDICAMENTO PRESCRITO:
${c.farmaco.includes("Tamsulosina") ? "• Tamsulosina (bloqueador alfa-1): relaxa a musculatura do ureter, facilitando a passagem do cálculo. Tome à noite para reduzir o risco de tontura ao levantar." : ""}${c.farmaco.includes("Nifedipina") ? "\n• Nifedipina (bloqueador de canal de cálcio): auxilia no relaxamento ureteral." : ""}

O QUE FAZER:
• Beber bastante água (≥ 2,5 L/dia) para manter boa diurese.
• Coar a urina com filtro de café ou gaze para identificar quando o cálculo sair.
• Guardar o cálculo (em frasco seco) para análise de composição.
• Atividade física moderada (caminhada) pode ajudar na mobilização do cálculo.

SINAIS DE ALERTA (Procurar emergência imediatamente):
• Febre > 38°C ou calafrios (pode indicar infecção com obstrução — emergência).
• Dor intensa que não melhora com os analgésicos.
• Náuseas/vômitos que impedem a alimentação.
• Ausência de urina por > 8h.

QUANDO A CIRURGIA PODE SER NECESSÁRIA:
• Se o cálculo não sair dentro de ${c.duracao_prevista}.
• Se a dor não for controlada com medicamentos.
• Se houver infecção urinária associada.
• Se a função do rim estiver comprometida.

RETORNO: ${c.retorno} com nova imagem (tomografia ou raio-X).

FONTES: EAU Guidelines on Urolithiasis 2024; AUA/Endourology Society Guideline 2022; Hollingsworth JM et al. JAMA 2016;315(19):2104.`;
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
      {
        id: "calc_risco_litiase",
        label: "Calculadora de Risco de Recorrência",
        type: "calculated" as const,
        defaultValue: "",
        calculate: (c: Record<string, string>) => calcRiscoLitiase(c),
      },
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

  // ═══════════════════════════════════════════════════════════════
  // HPB — TRATAMENTO CLÍNICO (protocolo #58)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "hpb-tratamento-clinico",
    name: "HPB — Tratamento Clínico (Alfa-bloqueadores, 5-ARIs, Antimuscarínicos, Beta-3)",
    shortName: "HPB Clínico",
    icon: "💊",
    category: "Próstata",
    configFields: [
      {
        id: "ipss_q1", label: "IPSS Q1 — Esvaziamento incompleto (0–5)", type: "select",
        options: ["0 — Nunca", "1 — < 1 em 5 vezes", "2 — < metade das vezes", "3 — Metade das vezes", "4 — > metade das vezes", "5 — Quase sempre"],
        defaultValue: "0 — Nunca",
      },
      {
        id: "ipss_q2", label: "IPSS Q2 — Frequência (0–5)", type: "select",
        options: ["0 — Nunca", "1 — < 1 em 5 vezes", "2 — < metade das vezes", "3 — Metade das vezes", "4 — > metade das vezes", "5 — Quase sempre"],
        defaultValue: "0 — Nunca",
      },
      {
        id: "ipss_q3", label: "IPSS Q3 — Intermitência (0–5)", type: "select",
        options: ["0 — Nunca", "1 — < 1 em 5 vezes", "2 — < metade das vezes", "3 — Metade das vezes", "4 — > metade das vezes", "5 — Quase sempre"],
        defaultValue: "0 — Nunca",
      },
      {
        id: "ipss_q4", label: "IPSS Q4 — Urgência (0–5)", type: "select",
        options: ["0 — Nunca", "1 — < 1 em 5 vezes", "2 — < metade das vezes", "3 — Metade das vezes", "4 — > metade das vezes", "5 — Quase sempre"],
        defaultValue: "0 — Nunca",
      },
      {
        id: "ipss_q5", label: "IPSS Q5 — Jato fraco (0–5)", type: "select",
        options: ["0 — Nunca", "1 — < 1 em 5 vezes", "2 — < metade das vezes", "3 — Metade das vezes", "4 — > metade das vezes", "5 — Quase sempre"],
        defaultValue: "0 — Nunca",
      },
      {
        id: "ipss_q6", label: "IPSS Q6 — Esforço para iniciar (0–5)", type: "select",
        options: ["0 — Nunca", "1 — < 1 em 5 vezes", "2 — < metade das vezes", "3 — Metade das vezes", "4 — > metade das vezes", "5 — Quase sempre"],
        defaultValue: "0 — Nunca",
      },
      {
        id: "ipss_q7", label: "IPSS Q7 — Noctúria (0–5)", type: "select",
        options: ["0 — Nenhuma vez", "1 — 1 vez", "2 — 2 vezes", "3 — 3 vezes", "4 — 4 vezes", "5 — 5 ou mais vezes"],
        defaultValue: "0 — Nenhuma vez",
      },
      {
        id: "ipss_qol", label: "IPSS QoL — Qualidade de vida (0–6)", type: "select",
        options: ["0 — Ótima", "1 — Satisfeito", "2 — Razoavelmente satisfeito", "3 — Indiferente", "4 — Razoavelmente insatisfeito", "5 — Infeliz", "6 — Péssima"],
        defaultValue: "3 — Indiferente",
      },
      {
        id: "calc_ipss",
        label: "Escore IPSS e Classificação",
        type: "calculated" as const,
        defaultValue: "",
        calculate: (c: Record<string, string>) => calcIpss(c),
      },
      { id: "volume_prostatico", label: "Volume Prostático (mL)", type: "text", defaultValue: "", placeholder: "Ex: 45" },
      { id: "psa", label: "PSA Total (ng/mL)", type: "text", defaultValue: "", placeholder: "Ex: 2,8" },
      { id: "qmax", label: "Qmáx — Fluxo Máximo (mL/s)", type: "text", defaultValue: "", placeholder: "Ex: 12" },
      { id: "rpvm", label: "Resíduo Pós-Miccional (mL)", type: "text", defaultValue: "", placeholder: "Ex: 80" },
      {
        id: "farmaco_classe", label: "Classe Farmacológica", type: "select",
        options: [
          "Alfa-bloqueador isolado",
          "5-ARI isolado",
          "Alfa-bloqueador + 5-ARI (terapia combinada)",
          "Alfa-bloqueador + Antimuscarínico",
          "Alfa-bloqueador + Beta-3 agonista",
          "Alfa-bloqueador + 5-ARI + Beta-3 agonista (tripla terapia)",
          "Inibidor de PDE-5 (tadalafila 5 mg/dia)",
        ],
        defaultValue: "Alfa-bloqueador isolado",
      },
      {
        id: "farmaco_escolha", label: "Fármaco Específico", type: "select",
        options: [
          "Tansulosina 0,4 mg 1×/dia (após jantar)",
          "Silodosina 8 mg 1×/dia (com alimento)",
          "Alfuzosina 10 mg 1×/dia (após jantar)",
          "Doxazosina 4 mg 1×/dia",
          "Finasterida 5 mg 1×/dia (5-ARI)",
          "Dutasterida 0,5 mg 1×/dia (5-ARI)",
          "Dutasterida 0,5 mg + Tansulosina 0,4 mg (Combodart) 1×/dia",
          "Solifenacina 5 mg 1×/dia (antimuscarínico)",
          "Mirabegron 50 mg 1×/dia (beta-3)",
          "Tadalafila 5 mg 1×/dia (iPDE-5)",
        ],
        defaultValue: "Tansulosina 0,4 mg 1×/dia (após jantar)",
      },
      { id: "duracao_prevista", label: "Duração Prevista do Tratamento", type: "select", options: ["3 meses (reavaliação)", "6 meses", "12 meses", "Contínuo (manutenção)"], defaultValue: "3 meses (reavaliação)" },
      { id: "retorno", label: "Retorno para Reavaliação", type: "select", options: ["4 semanas", "6 semanas", "3 meses", "6 meses"], defaultValue: "6 semanas" },
      { id: "complicacoes", label: "Complicações / Observações", type: "text", defaultValue: "Sem intercorrências", placeholder: "Observações clínicas" },
    ],
    templates: {
      descricao: (c) => {
        // Mesma fonte de verdade do painel calc_ipss (lib/calculators.ts).
        const ipssScore = calcIpssScore(c);
        const total = ipssScore.total;
        const sev = ipssScore.severity.toLowerCase();
        const qolN = ipssScore.qol;
        return `CONSULTA — HPB / SINTOMAS DO TRATO URINÁRIO INFERIOR (STUI)

Paciente com STUI secundários a HPB. IPSS total: ${total}/35 (sintomas ${sev}s). QoL: ${qolN}/6.
Volume prostático: ${c.volume_prostatico||"—"} mL. PSA: ${c.psa||"—"} ng/mL. Qmáx: ${c.qmax||"—"} mL/s. RPM: ${c.rpvm||"—"} mL.

CONDUTA FARMACOLÓGICA:
Classe: ${c.farmaco_classe}.
Fármaco prescrito: ${c.farmaco_escolha}.
Duração prevista: ${c.duracao_prevista}.
Retorno para reavaliação: ${c.retorno}.

Critérios de indicação cirúrgica (se presentes): retenção urinária aguda recorrente, ITU recorrente por HPB, litíase vesical, hematúria macroscópica refratária, insuficiência renal obstrutiva, falha do tratamento clínico adequado.

REFERÊNCIAS: EAU Guidelines on Benign Prostatic Hyperplasia (BPH) 2024; AUA/SUFU Guideline on Benign Prostatic Hyperplasia 2023; Barry MJ et al. J Urol 1992;148(5):1549–1557 (IPSS).`;
      },
      posOperatorio: (_c) => `Não se aplica (tratamento clínico ambulatorial). Monitorar resposta sintomática com IPSS em 4–6 semanas. Solicitar urofluxometria + RPM em 3 meses.`,
      receitaAlta: (c) => `RECEITA — HPB / STUI

${c.farmaco_escolha}.
Uso contínuo. Não suspender sem orientação médica.

ORIENTAÇÕES GERAIS:
• Evitar anti-histamínicos, descongestionantes nasais e anticolinérgicos sem orientação (podem agravar retenção).
• Reduzir ingestão de líquidos à noite (após 18h) para diminuir noctúria.
• Retorno em ${c.retorno} com IPSS preenchido.`,
      orientacoes: (c) => {
        // Mesma fonte de verdade do painel calc_ipss (lib/calculators.ts).
        const total = calcIpssScore(c).total;
        const sev = calcIpssScore(c).severity.toUpperCase();
        return `ORIENTAÇÕES — HPB (PRÓSTATA AUMENTADA) E TRATAMENTO

DIAGNÓSTICO:
Você foi diagnosticado com HPB (Hiperplasia Prostática Benigna) — aumento benigno da próstata que causa dificuldade para urinar. Seu escore IPSS é ${total}/35 (sintomas ${sev}s).

MEDICAMENTO PRESCRITO:
${c.farmaco_escolha}.
Tome conforme indicado. O efeito máximo pode levar 4–6 semanas para aparecer.

CUIDADOS NO DIA A DIA:
• Beba pelo menos 1,5–2 L de água por dia, mas reduza líquidos após as 18h.
• Evite bebidas alcoólicas e cafeína em excesso (pioram os sintomas).
• Urine regularmente — não segure a urina por muito tempo.
• Evite medicamentos que podem piorar a urina: anti-histamínicos (para alergia), descongestionantes nasais, alguns antidepressivos.

SINAIS DE ALERTA (Procurar PS imediatamente):
• Impossibilidade total de urinar (retenção urinária aguda).
• Febre com dificuldade para urinar (suspeita de infecção).
• Sangue na urina.

RETORNO:
Retorne em ${c.retorno} com o questionário IPSS preenchido novamente para avaliar a resposta ao tratamento.

FONTES: EAU Guidelines on BPH 2024; AUA/SUFU Guideline 2023.`;
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // HPB — TRATAMENTO CIRÚRGICO (protocolo #59)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "hpb-tratamento-cirurgico",
    name: "HPB — Tratamento Cirúrgico (RTU-P / HoLEP / Enucleação)",
    shortName: "HPB Cirúrgico",
    icon: "🔬",
    category: "Próstata",
    configFields: [
      {
        id: "calc_indicacao_cirurgica",
        label: "Recomendação de Técnica Cirúrgica",
        type: "calculated" as const,
        defaultValue: "",
        calculate: (c: Record<string, string>) => calcIndicacaoCirurgicaHPB(c),
      },
      { id: "tecnica", label: "Técnica Cirúrgica", type: "select", options: ["RTU-P (ressecção transuretral bipolar)", "HoLEP (enucleação a laser de hólmio)", "ThuLEP (enucleação a laser de túlio)", "Enucleação aberta (Millin/HoLAP)", "Vaporização a laser (GreenLight PVP)", "Rezūm (vapor d'água)", "UroLift (implante prostático)"], defaultValue: "RTU-P (ressecção transuretral bipolar)" },
      { id: "anestesia", label: "Anestesia", type: "select", options: ["Raquianestesia", "Anestesia geral", "Bloqueio peridural"], defaultValue: "Raquianestesia" },
      { id: "volume_prostatico", label: "Volume Prostático (mL)", type: "text", defaultValue: "", placeholder: "Ex: 60" },
      { id: "ipss_pre", label: "IPSS Pré-operatório", type: "text", defaultValue: "", placeholder: "Ex: 22" },
      { id: "qmax_pre", label: "Qmáx Pré-operatório (mL/s)", type: "text", defaultValue: "", placeholder: "Ex: 8" },
      { id: "indicacao", label: "Indicação Cirúrgica", type: "select", options: ["Falha do tratamento clínico", "Retenção urinária aguda recorrente", "ITU recorrente por HPB", "Litíase vesical por HPB", "Hematúria macroscópica refratária", "Insuficiência renal obstrutiva", "Preferência do paciente"], defaultValue: "Falha do tratamento clínico" },
      { id: "sonda_pos", label: "Sonda Vesical Pós-operatória", type: "select", options: ["Sonda de Foley 3 vias 22Fr (irrigação contínua)", "Sonda de Foley 2 vias 18Fr", "Sonda de Foley 3 vias 20Fr"], defaultValue: "Sonda de Foley 3 vias 22Fr (irrigação contínua)" },
      { id: "irrigacao", label: "Irrigação Vesical", type: "select", options: ["Soro fisiológico 0,9% contínua", "Água destilada estéril contínua (RTU monopolar)", "Não necessária"], defaultValue: "Soro fisiológico 0,9% contínua" },
      { id: "retirada_sonda", label: "Retirada da Sonda Prevista", type: "select", options: ["24–48 horas", "48–72 horas", "72–96 horas", "5–7 dias"], defaultValue: "48–72 horas" },
      { id: "complicacoes", label: "Intercorrências Intraoperatórias", type: "text", defaultValue: "Sem intercorrências", placeholder: "Ex: perfuração capsular, sangramento" },
    ],
    templates: {
      descricao: (c) => `DESCRIÇÃO CIRÚRGICA
Procedimento: ${c.tecnica}
Anestesia: ${c.anestesia}
Indicação: ${c.indicacao}. Volume prostático pré-operatório: ${c.volume_prostatico||"—"} mL. IPSS pré-op: ${c.ipss_pre||"—"}/35. Qmáx pré-op: ${c.qmax_pre||"—"} mL/s.

1. Paciente posicionado em posição de litotomia, sob ${c.anestesia}.
2. Antissepsia perineal e colocação de campos estéreis.
3. Introdução do resectoscópio/cistoscópio operatório com óptica 0° e 30°.
4. Avaliação endoscópica: uretra, colo vesical, trígono, meatos ureterais e lóbulos prostáticos.
5. Realização de ${c.tecnica} com ressecção/enucleação sistemática dos lóbulos lateral direito, lateral esquerdo e mediano.
6. Hemostasia endoscópica rigorosa.
7. Lavagem vesical com soro fisiológico até efluente claro.
8. Introdução de ${c.sonda_pos} com balonete insuflado com 30–50 mL.
9. Início de ${c.irrigacao}.

Intercorrências: ${c.complicacoes}.
REFERÊNCIAS: EAU Guidelines on BPH 2024; Gravas S et al. Eur Urol 2021.`,
      posOperatorio: (c) => `PRESCRIÇÃO DE PÓS-OPERATÓRIO IMEDIATO — ${c.tecnica.split(" ")[0]}

1. Dieta líquida, progredir conforme tolerância.
2. Acesso venoso periférico — SF 0,9% 500 mL EV em 6h.
3. Dipirona 1g EV de 6/6h (ou VO se tolerando).
4. Cetoprofeno 100 mg EV de 12/12h por 24h.
5. ${c.irrigacao} pela sonda de 3 vias — manter até efluente claro.
6. Controle de diurese e aspecto da urina de 4/4h.
7. Monitorar sinais de síndrome de ressecção (confusão, hiponatremia) nas primeiras 6h.
8. Retirada da sonda prevista: ${c.retirada_sonda} após cirurgia.
9. Alta hospitalar após retirada da sonda e micção espontânea satisfatória.`,
      receitaAlta: (_c) => `RECEITA DE ALTA — PÓS-OPERATÓRIO DE HPB CIRÚRGICO

1. Dipirona 1g — 1 comprimido VO de 6/6h se dor por 5 dias.
2. Ibuprofeno 600 mg — 1 comprimido VO de 8/8h por 5 dias (com alimento).
3. Ciprofloxacino 500 mg — 1 comprimido VO de 12/12h por 7 dias (profilaxia).
4. Tansulosina 0,4 mg — 1 cápsula VO 1×/dia por 4–6 semanas (facilita micção pós-op).`,
      orientacoes: (c) => `ORIENTAÇÕES PÓS-ALTA — CIRURGIA DE PRÓSTATA (${c.tecnica.split(" ")[0]})

REPOUSO E ATIVIDADES:
• Repouso relativo nos primeiros 7–10 dias. Evitar esforços físicos intensos por 4–6 semanas.
• Não dirigir por 48–72h após a alta.
• Retorno ao trabalho leve: 1–2 semanas. Trabalho pesado: 4–6 semanas.

HIDRATAÇÃO:
• Beba 2–3 L de água por dia para manter a urina clara e prevenir coágulos.
• Evite álcool e cafeína nas primeiras 2 semanas.

SINTOMAS ESPERADOS:
• Ardência ao urinar, urgência e frequência aumentada nas primeiras 4–6 semanas — são normais.
• Urina com leve coloração rosada pode ocorrer por até 4–6 semanas.
• Ejaculação retrógrada (sêmen vai para a bexiga) é comum — não é perigosa.

SINAIS DE ALERTA (Procurar PS):
• Impossibilidade de urinar (retenção urinária).
• Sangramento intenso com coágulos.
• Febre > 38°C.
• Dor intensa não controlada.

RETORNO:
Retorne em 4–6 semanas com urofluxometria + RPM e IPSS para avaliação do resultado cirúrgico.

FONTES: EAU Guidelines on BPH 2024; AUA/SUFU Guideline 2023.`,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // USG RENAL — LAUDO ESTRUTURADO
  // ═══════════════════════════════════════════════════════════════
  {
    id: "usg-renal",
    name: "Ultrassonografia Renal",
    shortName: "USG Renal",
    icon: "🫘",
    category: "Imagem",
    configFields: [
      { id: "indicacao", label: "Indicação", type: "select", options: ["Cólica renal / litíase", "Hematúria", "Infecção urinária de repetição", "Investigação de HAS", "Massa renal", "Seguimento pós-cirúrgico", "Rastreamento (rim único, transplante)"], defaultValue: "Cólica renal / litíase" },
      { id: "rim_dir_dim", label: "Dimensões rim direito (cm)", type: "text", defaultValue: "", placeholder: "Ex.: 10,5 × 5,2 × 4,8" },
      { id: "rim_esq_dim", label: "Dimensões rim esquerdo (cm)", type: "text", defaultValue: "", placeholder: "Ex.: 11,0 × 5,4 × 5,0" },
      { id: "ecogenicidade", label: "Ecogenicidade cortical", type: "select", options: ["Normal (isoecogênica ao parênquima hepático/esplênico)", "Hiperecogênica (nefropatia parenquimatosa)", "Heterogênea"], defaultValue: "Normal (isoecogênica ao parênquima hepático/esplênico)" },
      { id: "hidronefrose_dir", label: "Hidronefrose direita (SFU)", type: "select", options: ["Ausente (grau 0)", "Grau I — pelve levemente dilatada", "Grau II — cálices visíveis, sem afinamento cortical", "Grau III — cálices dilatados, afinamento cortical leve", "Grau IV — afinamento cortical grave"], defaultValue: "Ausente (grau 0)" },
      { id: "hidronefrose_esq", label: "Hidronefrose esquerda (SFU)", type: "select", options: ["Ausente (grau 0)", "Grau I — pelve levemente dilatada", "Grau II — cálices visíveis, sem afinamento cortical", "Grau III — cálices dilatados, afinamento cortical leve", "Grau IV — afinamento cortical grave"], defaultValue: "Ausente (grau 0)" },
      { id: "calculo", label: "Cálculo renal", type: "select", options: ["Ausente", "Cálculo único — especificar localização e tamanho", "Múltiplos cálculos", "Nefrocalcinose"], defaultValue: "Ausente" },
      { id: "calculo_local", label: "Localização do cálculo (se presente)", type: "text", defaultValue: "", placeholder: "Ex.: polo inferior direito, 8 mm, sombra acústica posterior" },
      { id: "massa", label: "Massa renal", type: "select", options: ["Ausente", "Cisto simples (Bosniak I)", "Cisto minimamente complexo (Bosniak II)", "Cisto complexo (Bosniak IIF/III)", "Massa sólida suspeita (Bosniak IV)", "Massa sólida — angiomiolipoma (hiperecogênica)"], defaultValue: "Ausente" },
      { id: "doppler", label: "Doppler renal (se realizado)", type: "select", options: ["Não realizado", "Fluxo intrarrenal preservado bilateralmente", "IR elevado (> 0,70) — sugestivo de nefropatia parenquimatosa", "Assimetria de fluxo — investigar estenose de artéria renal"], defaultValue: "Não realizado" },
    ],
    templates: {
      descricao: (c) => {
        const calcStr = c.calculo !== "Ausente" && c.calculo_local
          ? `\n- ${c.calculo}: ${c.calculo_local}.`
          : c.calculo !== "Ausente"
          ? `\n- ${c.calculo}.`
          : "";
        const massaStr = c.massa !== "Ausente" ? `\n- ${c.massa}.` : "";
        const dopStr = c.doppler !== "Não realizado" ? `\nDOPPLER RENAL:\n- ${c.doppler}.` : "";
        return `LAUDO — ULTRASSONOGRAFIA RENAL
Indicação: ${c.indicacao}
Técnica: Estudo em modo-B com transdutor convexo de 3,5–5 MHz, cortes longitudinais e transversais de ambos os rins em decúbito dorsal e lateral. Bexiga avaliada em repleção moderada.

RIM DIREITO:
- Dimensões: ${c.rim_dir_dim || "____"} cm. Relação córtex/medula preservada.
- Ecogenicidade: ${c.ecogenicidade}.
- Sistema coletor: ${c.hidronefrose_dir}.${c.hidronefrose_dir !== "Ausente (grau 0)" ? " Ureter proximal não visualizado." : ""}

RIM ESQUERDO:
- Dimensões: ${c.rim_esq_dim || "____"} cm. Relação córtex/medula preservada.
- Ecogenicidade: ${c.ecogenicidade}.
- Sistema coletor: ${c.hidronefrose_esq}.${c.hidronefrose_esq !== "Ausente (grau 0)" ? " Ureter proximal não visualizado." : ""}
${calcStr}${massaStr}${dopStr}

BEXIGA: Paredes regulares, espessura normal (< 3 mm em repleção). Sem lesões endoluminais.

CONCLUSÃO:
${c.hidronefrose_dir !== "Ausente (grau 0)" || c.hidronefrose_esq !== "Ausente (grau 0)" ? `Hidronefrose ${c.hidronefrose_dir !== "Ausente (grau 0)" ? "direita: " + c.hidronefrose_dir : ""}${c.hidronefrose_dir !== "Ausente (grau 0)" && c.hidronefrose_esq !== "Ausente (grau 0)" ? " / " : ""}${c.hidronefrose_esq !== "Ausente (grau 0)" ? "esquerda: " + c.hidronefrose_esq : ""}. ` : ""}${c.calculo !== "Ausente" ? c.calculo + (c.calculo_local ? " (" + c.calculo_local + ")." : ".") + " " : ""}${c.massa !== "Ausente" ? c.massa + ". " : ""}${c.hidronefrose_dir === "Ausente (grau 0)" && c.hidronefrose_esq === "Ausente (grau 0)" && c.calculo === "Ausente" && c.massa === "Ausente" ? "Rins de dimensões, ecogenicidade e sistema coletor normais. Bexiga sem alterações." : ""}

REFERÊNCIAS: EAU Guidelines on Urolithiasis 2024; ACR Appropriateness Criteria — Renal Colic 2022.`;
      },
      posOperatorio: (c) => `ORIENTAÇÕES PÓS-EXAME — USG RENAL
${c.hidronefrose_dir !== "Ausente (grau 0)" || c.hidronefrose_esq !== "Ausente (grau 0)" ? "⚠️ HIDRONEFROSE DETECTADA: Encaminhar para avaliação urológica. Solicitar uroTC sem contraste se suspeita de litíase obstrutiva.\n" : ""}${c.calculo !== "Ausente" ? "⚠️ CÁLCULO RENAL: Correlacionar com quadro clínico. Considerar uroTC para melhor caracterização.\n" : ""}${c.massa !== "Ausente" ? "⚠️ MASSA RENAL: Encaminhar para uroTC com contraste para estadiamento (Bosniak). Não retardar investigação.\n" : ""}${c.doppler.includes("IR elevado") ? "⚠️ IR ELEVADO: Correlacionar com função renal (creatinina, TFG). Considerar nefrologista.\n" : ""}
Hidratação adequada (2–3 L/dia de água). Retorno conforme orientação do urologista.`,
      receitaAlta: () => `PRESCRIÇÃO — USG RENAL
Exame de imagem — sem prescrição medicamentosa específica.
Encaminhar resultado ao médico solicitante para correlação clínica.`,
      orientacoes: (c) => `ORIENTAÇÕES AO PACIENTE — USG RENAL

O QUE É:
A ultrassonografia renal é um exame de imagem que utiliza ondas sonoras para avaliar os rins, a bexiga e as estruturas adjacentes. Não utiliza radiação ionizante.

RESULTADO:
${c.hidronefrose_dir !== "Ausente (grau 0)" || c.hidronefrose_esq !== "Ausente (grau 0)" ? "Foi identificada dilatação do sistema coletor renal (hidronefrose). Isso pode indicar obstrução por cálculo, estreitamento ou outra causa. Seu médico avaliará a necessidade de exames complementares.\n" : ""}${c.calculo !== "Ausente" ? "Foi identificado cálculo renal. Dependendo do tamanho e localização, pode ser necessário tratamento específico.\n" : ""}${c.massa !== "Ausente" ? "Foi identificada massa/cisto renal que necessita de investigação complementar com tomografia computadorizada.\n" : ""}${c.hidronefrose_dir === "Ausente (grau 0)" && c.hidronefrose_esq === "Ausente (grau 0)" && c.calculo === "Ausente" && c.massa === "Ausente" ? "Os rins apresentam aparência normal ao ultrassom.\n" : ""}
FONTES: EAU Guidelines on Urolithiasis 2024; ACR Appropriateness Criteria 2022.`,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // USG PRÓSTATA TRANSABDOMINAL — LAUDO ESTRUTURADO
  // ═══════════════════════════════════════════════════════════════
  {
    id: "usg-prostata-transabdominal",
    name: "Ultrassonografia de Próstata Transabdominal",
    shortName: "USG Próstata (TA)",
    icon: "🔵",
    category: "Imagem",
    configFields: [
      { id: "indicacao", label: "Indicação", type: "select", options: ["LUTS / HPB", "Elevação de PSA", "Seguimento de HPB", "Retenção urinária", "Infecção urinária de repetição", "Pré-operatório de RTU-P / HoLEP"], defaultValue: "LUTS / HPB" },
      { id: "dim_ap", label: "Diâmetro AP da próstata (cm)", type: "text", defaultValue: "", placeholder: "Ex.: 4,2" },
      { id: "dim_tl", label: "Diâmetro transverso (cm)", type: "text", defaultValue: "", placeholder: "Ex.: 5,0" },
      { id: "dim_cc", label: "Diâmetro craniocaudal (cm)", type: "text", defaultValue: "", placeholder: "Ex.: 4,5" },
      { id: "ipp", label: "IPP — Intravesical Prostatic Protrusion (mm)", type: "text", defaultValue: "", placeholder: "Ex.: 12" },
      { id: "ecotextura", label: "Ecotextura prostática", type: "select", options: ["Homogênea", "Heterogênea — nódulos hipoecogênicos", "Heterogênea — calcificações", "Heterogênea — mista (nódulos + calcificações)"], defaultValue: "Homogênea" },
      { id: "zona_transicional", label: "Zona de transição", type: "select", options: ["Normal", "Aumentada (HPB) — nódulos hiperplásicos", "Cisto de zona de transição"], defaultValue: "Normal" },
      { id: "cistos", label: "Cistos prostáticos", type: "select", options: ["Ausentes", "Cisto de utrículo prostático (linha média)", "Cisto de ducto ejaculatório", "Cisto de retenção"], defaultValue: "Ausentes" },
      { id: "suspeita_neo", label: "Área suspeita de neoplasia", type: "select", options: ["Ausente", "Nódulo hipoecogênico periférico — suspeito", "Assimetria de zona periférica"], defaultValue: "Ausente" },
      { id: "rpm", label: "Resíduo pós-miccional (mL)", type: "text", defaultValue: "", placeholder: "Ex.: 45" },
    ],
    templates: {
      descricao: (c) => {
        const vol = (c.dim_ap && c.dim_tl && c.dim_cc)
          ? (parseFloat(c.dim_ap) * parseFloat(c.dim_tl) * parseFloat(c.dim_cc) * 0.523).toFixed(1)
          : "____";
        const ippNum = parseFloat(c.ipp);
        const ippClass = !isNaN(ippNum)
          ? ippNum < 5 ? "Grau I (< 5 mm — sem obstrução significativa)"
          : ippNum < 10 ? "Grau II (5–9 mm — obstrução leve)"
          : "Grau III (≥ 10 mm — obstrução significativa, alto risco de retenção)"
          : "";
        const rpmNum = parseFloat(c.rpm);
        const rpmClass = !isNaN(rpmNum)
          ? rpmNum < 50 ? "normal (< 50 mL)"
          : rpmNum < 100 ? "limítrofe (50–100 mL)"
          : "elevado (> 100 mL — significativo)"
          : "";
        return `LAUDO — ULTRASSONOGRAFIA DE PRÓSTATA TRANSABDOMINAL
Indicação: ${c.indicacao}
Técnica: Estudo em modo-B com transdutor convexo de 3,5–5 MHz, com bexiga em repleção moderada. Avaliação em cortes longitudinais e transversais. Biometria prostática pelo método elipsoide (V = AP × TL × CC × 0,523).

PRÓSTATA:
- Dimensões: AP ${c.dim_ap || "____"} × TL ${c.dim_tl || "____"} × CC ${c.dim_cc || "____"} cm.
- Volume estimado: ${vol} mL.
- Ecotextura: ${c.ecotextura}.
- Zona de transição: ${c.zona_transicional}.
- Zona periférica: ${c.suspeita_neo}.
- Cistos: ${c.cistos}.
${c.ipp ? `- IPP (Intravesical Prostatic Protrusion): ${c.ipp} mm — ${ippClass}.` : "- IPP: não mensurado."}

BEXIGA:
- Paredes regulares. Espessura da parede: ____mm.
- Sem lesões endoluminais.
${c.rpm ? `- Resíduo pós-miccional: ${c.rpm} mL — ${rpmClass}.` : "- Resíduo pós-miccional: não avaliado."}

CONCLUSÃO:
Próstata com volume de ${vol} mL.${parseFloat(vol) > 30 ? " Aumento prostático benigno (HPB)." : ""}${c.ipp && parseFloat(c.ipp) >= 10 ? " IPP grau III — alto risco de retenção urinária e falha do tratamento clínico (EAU 2024)." : ""}${c.suspeita_neo !== "Ausente" ? " " + c.suspeita_neo + " — correlacionar com PSA e considerar biópsia guiada (TRUS/fusão)." : ""}${c.rpm && parseFloat(c.rpm) > 100 ? " Resíduo pós-miccional elevado (> 100 mL) — considerar intervenção." : ""}

REFERÊNCIAS: EAU Guidelines on BPH 2024; AUA/SUFU Guideline on BPH 2023; Eur Urol 2020 (IPP como preditor de falha clínica).`;
      },
      posOperatorio: (c) => {
        const vol = (c.dim_ap && c.dim_tl && c.dim_cc)
          ? (parseFloat(c.dim_ap) * parseFloat(c.dim_tl) * parseFloat(c.dim_cc) * 0.523).toFixed(1)
          : "____";
        return `ORIENTAÇÕES PÓS-EXAME — USG PRÓSTATA
${parseFloat(vol) > 80 ? "⚠️ PRÓSTATA > 80 mL: Considerar HoLEP/prostatectomia aberta. Inibidores da 5-alfa-redutase indicados (dutasterida/finasterida).\n" : ""}${c.ipp && parseFloat(c.ipp) >= 10 ? "⚠️ IPP ≥ 10 mm: Alto risco de retenção urinária. Reavaliação urológica prioritária. Considerar intervenção cirúrgica.\n" : ""}${c.suspeita_neo !== "Ausente" ? "⚠️ ÁREA SUSPEITA: Correlacionar com PSA total/livre e densidade de PSA. Considerar biópsia prostática guiada.\n" : ""}${c.rpm && parseFloat(c.rpm) > 100 ? "⚠️ RPM > 100 mL: Risco de infecção urinária e lesão renal obstrutiva. Considerar cateterismo intermitente ou intervenção cirúrgica.\n" : ""}
Encaminhar resultado ao urologista para correlação clínica e decisão terapêutica.`;
      },
      receitaAlta: () => `PRESCRIÇÃO — USG PRÓSTATA TRANSABDOMINAL
Exame de imagem — sem prescrição medicamentosa específica.
Encaminhar resultado ao médico solicitante para correlação clínica.`,
      orientacoes: (c) => {
        const vol = (c.dim_ap && c.dim_tl && c.dim_cc)
          ? (parseFloat(c.dim_ap) * parseFloat(c.dim_tl) * parseFloat(c.dim_cc) * 0.523).toFixed(1)
          : "____";
        return `ORIENTAÇÕES AO PACIENTE — USG PRÓSTATA

O QUE É:
A ultrassonografia de próstata transabdominal é um exame de imagem que avalia o tamanho, a forma e a ecotextura da próstata através da parede abdominal, com a bexiga cheia. Não utiliza radiação.

RESULTADO:
Volume prostático: ${vol} mL.${parseFloat(vol) > 30 ? " Sua próstata está aumentada (HPB — Hiperplasia Prostática Benigna), o que é comum com o envelhecimento." : " Tamanho dentro da normalidade."}
${c.ipp && parseFloat(c.ipp) >= 10 ? `IPP: ${c.ipp} mm — A próstata está projetando-se para dentro da bexiga, o que pode dificultar a saída de urina.\n` : ""}${c.suspeita_neo !== "Ausente" ? "Foi identificada uma área suspeita que necessita de investigação adicional com PSA e possivelmente biópsia.\n" : ""}

FONTES: EAU Guidelines on BPH 2024; AUA/SUFU Guideline 2023.`;
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // USG ESCROTAL / DOPPLER TESTICULAR — LAUDO ESTRUTURADO
  // ═══════════════════════════════════════════════════════════════
  {
    id: "usg-escrotal-doppler-testicular",
    name: "Ultrassonografia Escrotal com Doppler Testicular",
    shortName: "USG Escrotal/Doppler",
    icon: "🔊",
    category: "Imagem",
    configFields: [
      { id: "indicacao", label: "Indicação", type: "select", options: ["Dor escrotal aguda", "Massa escrotal / testicular", "Investigação de infertilidade", "Trauma escrotal", "Varicocele", "Seguimento de microlitíase", "Pós-orquiectomia (testículo contralateral)"], defaultValue: "Massa escrotal / testicular" },
      { id: "vol_dir", label: "Volume testículo direito (mL)", type: "text", defaultValue: "", placeholder: "Ex.: 18,5" },
      { id: "vol_esq", label: "Volume testículo esquerdo (mL)", type: "text", defaultValue: "", placeholder: "Ex.: 17,2" },
      { id: "ecotextura_dir", label: "Ecotextura testículo direito", type: "select", options: ["Homogênea", "Heterogênea difusa", "Nódulo hipoecogênico", "Nódulo hiperecogênico", "Microlitíase clássica (≥ 5 focos)", "Microlitíase limitada (< 5 focos)"], defaultValue: "Homogênea" },
      { id: "ecotextura_esq", label: "Ecotextura testículo esquerdo", type: "select", options: ["Homogênea", "Heterogênea difusa", "Nódulo hipoecogênico", "Nódulo hiperecogênico", "Microlitíase clássica (≥ 5 focos)", "Microlitíase limitada (< 5 focos)"], defaultValue: "Homogênea" },
      { id: "doppler_dir", label: "Doppler testículo direito", type: "select", options: ["Fluxo intratesticular preservado", "Fluxo reduzido (assimetria)", "Fluxo ausente", "Hiperemia (epididimite/orquite)"], defaultValue: "Fluxo intratesticular preservado" },
      { id: "doppler_esq", label: "Doppler testículo esquerdo", type: "select", options: ["Fluxo intratesticular preservado", "Fluxo reduzido (assimetria)", "Fluxo ausente", "Hiperemia (epididimite/orquite)"], defaultValue: "Fluxo intratesticular preservado" },
      { id: "epididimo_dir", label: "Epidídimo direito", type: "select", options: ["Normal", "Aumentado / hipoecogênico (epididimite)", "Cisto de epidídimo", "Espermatocele"], defaultValue: "Normal" },
      { id: "epididimo_esq", label: "Epidídimo esquerdo", type: "select", options: ["Normal", "Aumentado / hipoecogênico (epididimite)", "Cisto de epidídimo", "Espermatocele"], defaultValue: "Normal" },
      { id: "varicocele", label: "Varicocele", type: "select", options: ["Ausente", "Grau I — refluxo só à Valsalva (< 2,5 mm em repouso)", "Grau II — veias 2,5–3,5 mm, refluxo à Valsalva", "Grau III — veias > 3,5 mm, refluxo espontâneo"], defaultValue: "Ausente" },
      { id: "hidrocele", label: "Hidrocele", type: "select", options: ["Ausente", "Hidrocele direita", "Hidrocele esquerda", "Hidrocele bilateral"], defaultValue: "Ausente" },
      { id: "massa", label: "Massa / lesão focal", type: "select", options: ["Ausente", "Nódulo sólido intratesticular suspeito", "Cisto simples intratesticular", "Cisto epidermoide (aspecto em alvo)", "Massa extratesticular benigna"], defaultValue: "Ausente" },
    ],
    templates: {
      descricao: (c) => {
        const volDir = parseFloat(c.vol_dir);
        const volEsq = parseFloat(c.vol_esq);
        const atrofiaDir = !isNaN(volDir) && volDir < 12 ? " — atrofia testicular (< 12 mL)" : "";
        const atrofiaEsq = !isNaN(volEsq) && volEsq < 12 ? " — atrofia testicular (< 12 mL)" : "";
        const assimetria = !isNaN(volDir) && !isNaN(volEsq) && Math.abs(volDir - volEsq) / Math.max(volDir, volEsq) > 0.2
          ? `\nObs.: Assimetria de volume testicular > 20% (D: ${c.vol_dir} mL / E: ${c.vol_esq} mL) — correlacionar com função hormonal e seminal.`
          : "";
        return `LAUDO — ULTRASSONOGRAFIA ESCROTAL COM DOPPLER TESTICULAR
Indicação: ${c.indicacao}
Técnica: Transdutor linear de alta frequência (7,5–18 MHz), paciente em decúbito dorsal. Modo-B comparativo + Doppler colorido com mesmos parâmetros em ambos os testículos. Pesquisa de varicocele em repouso e durante manobra de Valsalva em ortostase.

TESTÍCULO DIREITO:
- Volume: ${c.vol_dir || "____"} mL${atrofiaDir}.
- Ecotextura: ${c.ecotextura_dir}.
- Epidídimo: ${c.epididimo_dir}.
- Doppler: ${c.doppler_dir}.

TESTÍCULO ESQUERDO:
- Volume: ${c.vol_esq || "____"} mL${atrofiaEsq}.
- Ecotextura: ${c.ecotextura_esq}.
- Epidídimo: ${c.epididimo_esq}.
- Doppler: ${c.doppler_esq}.

VARICOCELE: ${c.varicocele}.
HIDROCELE: ${c.hidrocele}.
MASS/LESÃO FOCAL: ${c.massa}.${assimetria}

CONCLUSÃO:
${c.doppler_dir === "Fluxo ausente" || c.doppler_esq === "Fluxo ausente" ? "⚠️ FLUXO AUSENTE — SUSPEITA DE TORSÃO: Encaminhar para exploração cirúrgica de urgência imediatamente. Não aguardar exames adicionais.\n" : ""}${c.massa !== "Ausente" ? c.massa + " — correlacionar com marcadores tumorais (AFP, β-hCG, LDH) e considerar orquiectomia radical inguinal.\n" : ""}${c.varicocele !== "Ausente" ? c.varicocele + ".\n" : ""}${c.epididimo_dir.includes("epididimite") || c.epididimo_esq.includes("epididimite") ? "Sinais de epididimite — tratamento clínico (antibioticoterapia).\n" : ""}${c.doppler_dir === "Fluxo intratesticular preservado" && c.doppler_esq === "Fluxo intratesticular preservado" && c.massa === "Ausente" && c.varicocele === "Ausente" && !c.epididimo_dir.includes("epididimite") && !c.epididimo_esq.includes("epididimite") ? "Testículos de volume, ecotextura e vascularização normais. Epidídimos sem alterações." : ""}

REFERÊNCIAS: EAU Guidelines on Sexual & Reproductive Health 2024; Consenso EFSUMB/EAA (Lotti F et al. Int Braz J Urol 2026).`;
      },
      posOperatorio: (c) => `ORIENTAÇÕES PÓS-EXAME — USG ESCROTAL
${c.doppler_dir === "Fluxo ausente" || c.doppler_esq === "Fluxo ausente" ? "⚠️ FLUXO AUSENTE: Encaminhar para cirurgia de urgência imediatamente (torsão testicular).\n" : ""}${c.massa !== "Ausente" ? "⚠️ MASSA TESTICULAR: Solicitar AFP, β-hCG, LDH. Encaminhar para urologista com urgência.\n" : ""}${c.varicocele !== "Ausente" ? "⚠️ VARICOCELE: Correlacionar com espermograma e FSH/LH. Considerar varicocelectomia em casos selecionados.\n" : ""}${c.ecotextura_dir.includes("Microlitíase") || c.ecotextura_esq.includes("Microlitíase") ? "⚠️ MICROLITÍASE: Avaliar fatores de risco (criptorquidia, infertilidade, tumor prévio). Seguimento anual se fatores de risco presentes.\n" : ""}
Encaminhar resultado ao urologista para correlação clínica.`,
      receitaAlta: () => `PRESCRIÇÃO — USG ESCROTAL COM DOPPLER
Exame de imagem — sem prescrição medicamentosa específica.
Encaminhar resultado ao médico solicitante para correlação clínica.`,
      orientacoes: (c) => `ORIENTAÇÕES AO PACIENTE — USG ESCROTAL COM DOPPLER

O QUE É:
A ultrassonografia escrotal com Doppler avalia os testículos, epidídimos e a vascularização da bolsa testicular. Não utiliza radiação ionizante.

RESULTADO:
${c.doppler_dir === "Fluxo ausente" || c.doppler_esq === "Fluxo ausente" ? "ATENÇÃO: Foi identificada ausência de fluxo sanguíneo em um testículo. Isso pode indicar torsão testicular, que é uma emergência médica. Procure atendimento cirúrgico imediatamente.\n" : ""}${c.massa !== "Ausente" ? "Foi identificada uma lesão testicular que necessita de investigação adicional com exames de sangue e avaliação do urologista.\n" : ""}${c.varicocele !== "Ausente" ? "Foi identificada varicocele (dilatação das veias do testículo). Seu urologista avaliará se há necessidade de tratamento.\n" : ""}${c.doppler_dir === "Fluxo intratesticular preservado" && c.doppler_esq === "Fluxo intratesticular preservado" && c.massa === "Ausente" ? "Os testículos apresentam vascularização e ecotextura normais ao ultrassom.\n" : ""}
FONTES: EAU Guidelines on Sexual & Reproductive Health 2024.`,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // USG VIAS URINÁRIAS INFERIORES — LAUDO ESTRUTURADO
  // ═══════════════════════════════════════════════════════════════
  {
    id: "usg-vias-urinarias-inferiores",
    name: "Ultrassonografia das Vias Urinárias Inferiores",
    shortName: "USG VUI",
    icon: "💧",
    category: "Imagem",
    configFields: [
      { id: "indicacao", label: "Indicação", type: "select", options: ["LUTS / HPB", "Hematúria", "Infecção urinária de repetição", "Retenção urinária", "Bexiga hiperativa", "Incontinuência urinária", "Pós-operatório"], defaultValue: "LUTS / HPB" },
      { id: "vol_pre", label: "Volume pré-miccional (mL)", type: "text", defaultValue: "", placeholder: "Ex.: 280" },
      { id: "rpm", label: "Resíduo pós-miccional (mL)", type: "text", defaultValue: "", placeholder: "Ex.: 85" },
      { id: "epv", label: "Espessura da parede vesical (mm)", type: "text", defaultValue: "", placeholder: "Ex.: 4,2" },
      { id: "ipp", label: "IPP — Intravesical Prostatic Protrusion (mm)", type: "text", defaultValue: "", placeholder: "Ex.: 11" },
      { id: "parede", label: "Paredes vesicais", type: "select", options: ["Regulares", "Irregulares / espessadas difusamente", "Espessamento focal suspeito"], defaultValue: "Regulares" },
      { id: "diverticulo", label: "Divertículos vesicais", type: "select", options: ["Ausentes", "Divertículo único (descrever)", "Múltiplos divertículos"], defaultValue: "Ausentes" },
      { id: "calculo", label: "Cálculo vesical", type: "select", options: ["Ausente", "Cálculo único móvel", "Múltiplos cálculos", "Cálculo fixo (em divertículo)"], defaultValue: "Ausente" },
      { id: "lesao", label: "Lesão endoluminal", type: "select", options: ["Ausente", "Pólipo / lesão sólida suspeita", "Coagulo (sem vascularização ao Doppler)"], defaultValue: "Ausente" },
    ],
    templates: {
      descricao: (c) => {
        const rpmNum = parseFloat(c.rpm);
        const rpmClass = !isNaN(rpmNum)
          ? rpmNum < 50 ? "normal (< 50 mL)"
          : rpmNum < 100 ? "limitórofe (50–100 mL)"
          : rpmNum < 300 ? "elevado (> 100 mL)"
          : "retenção crônica (> 300 mL)"
          : "";
        const epvNum = parseFloat(c.epv);
        const epvClass = !isNaN(epvNum)
          ? epvNum <= 3 ? "normal (≤ 3 mm)"
          : epvNum <= 5 ? "limitórofe (3–5 mm)"
          : "aumentada (> 5 mm — hipertrofia do detrusor)"
          : "";
        const ippNum = parseFloat(c.ipp);
        const ippClass = !isNaN(ippNum)
          ? ippNum < 5 ? "Grau I (< 5 mm)"
          : ippNum < 10 ? "Grau II (5–9 mm)"
          : "Grau III (≥ 10 mm — alto risco de retenção)"
          : "";
        return `LAUDO — ULTRASSONOGRAFIA DAS VIAS URINÁRIAS INFERIORES
Indicação: ${c.indicacao}
Técnica: Estudo em modo-B com transdutor convexo de 3,5–5 MHz, com bexiga em replecão moderada. Cortes longitudinais e transversais. Após a micção, avaliação do resíduo pós-miccional.

BEXIGA (pré-miccional):
- Volume pré-miccional: ${c.vol_pre || "____"} mL.
- Paredes: ${c.parede}. Espessura: ${c.epv || "____"} mm${epvClass ? " — " + epvClass : ""}.
- Conteúdo: anecoico.${c.calculo !== "Ausente" ? " " + c.calculo + "." : ""}
- Divertículos: ${c.diverticulo}.
- Lesão endoluminal: ${c.lesao}.
${c.ipp ? `- IPP: ${c.ipp} mm — ${ippClass}.` : "- IPP: não mensurado."}

BEXIGA (pós-miccional):
- Resíduo pós-miccional: ${c.rpm || "____"} mL${rpmClass ? " — " + rpmClass : ""}.

CONCLUSÃO:
${c.lesao !== "Ausente" && c.lesao !== "Coagulo (sem vascularização ao Doppler)" ? c.lesao + " — cistoscopia indicada para investigação.\n" : ""}${c.ipp && parseFloat(c.ipp) >= 10 ? "IPP grau III (≥ 10 mm) — alto risco de retenção urinária e falha do tratamento clínico (EAU 2024).\n" : ""}${!isNaN(rpmNum) && rpmNum > 100 ? "RPM elevado (> 100 mL) — risco de infecção e lesão renal obstrutiva.\n" : ""}${!isNaN(epvNum) && epvNum > 5 ? "EPV aumentada (> 5 mm) — hipertrofia do detrusor por obstrução ou bexiga hiperativa.\n" : ""}${c.lesao === "Ausente" && c.diverticulo === "Ausentes" && c.calculo === "Ausente" && (isNaN(rpmNum) || rpmNum < 50) && (isNaN(ippNum) || ippNum < 5) && (isNaN(epvNum) || epvNum <= 3) ? "Bexiga sem alterações morfológicas. RPM dentro da normalidade." : ""}

REFERÊNCIAS: EAU Guidelines on Non-neurogenic Male LUTS 2024; Cetrus — Curso de Ultrassonografia em Urologia.`;
      },
      posOperatorio: (c) => {
        const rpmNum = parseFloat(c.rpm);
        const ippNum = parseFloat(c.ipp);
        return `ORIENTAÇÕES PÓS-EXAME — USG VUI
${c.lesao !== "Ausente" && c.lesao !== "Coagulo (sem vascularização ao Doppler)" ? "⚠️ LESÃO ENDOLUMINAL: Cistoscopia obrigatória para investigação. Não retardar.\n" : ""}${!isNaN(ippNum) && ippNum >= 10 ? "⚠️ IPP ≥ 10 mm: Alto risco de retenção urinária. Reavaliação urológica prioritária. Considerar intervenção cirúrgica.\n" : ""}${!isNaN(rpmNum) && rpmNum > 100 ? "⚠️ RPM > 100 mL: Risco de infecção urinária e lesão renal obstrutiva. Considerar cateterismo intermitente.\n" : ""}
Encaminhar resultado ao urologista para correlação clínica e decisão terapêutica.`;
      },
      receitaAlta: () => `PRESCRIÇÃO — USG VIAS URINÁRIAS INFERIORES
Exame de imagem — sem prescrição medicamentosa específica.
Encaminhar resultado ao médico solicitante para correlação clínica.`,
      orientacoes: (c) => {
        const rpmNum = parseFloat(c.rpm);
        return `ORIENTAÇÕES AO PACIENTE — USG VIAS URINÁRIAS INFERIORES

O QUE É:
A ultrassonografia das vias urinárias inferiores avalia a bexiga e as estruturas adjacentes. Não utiliza radiação ionizante.

RESULTADO:
${!isNaN(rpmNum) && rpmNum > 100 ? `Resíduo pós-miccional elevado (${c.rpm} mL). Isso significa que após urinar, ainda resta urina na bexiga, o que pode causar infecções ou danos renais.\n` : ""}${c.lesao !== "Ausente" && c.lesao !== "Coagulo (sem vascularização ao Doppler)" ? "Foi identificada uma lesão na bexiga que necessita de investigação adicional com cistoscopia.\n" : ""}${c.lesao === "Ausente" && (isNaN(rpmNum) || rpmNum < 50) ? "A bexiga apresenta aparência normal ao ultrassom.\n" : ""}
FONTES: EAU Guidelines on Non-neurogenic Male LUTS 2024.`;
      },
    },
  },
  {
    id: "investigacao-hematuria",
    name: "Investigação da Hematúria",
    shortName: "Hematúria",
    icon: "🔴",
    category: "Diagnóstico",
    configFields: [
      { id: "tipo", label: "Tipo de hematúria", type: "select" as const, options: ["Macroscópica (HM)", "Microscópica (HMi)"], defaultValue: "" },
      { id: "episodios", label: "Número de episódios", type: "text" as const, placeholder: "ex: 1, 2, recorrente", defaultValue: "" },
      { id: "duracao", label: "Duração do episódio", type: "text" as const, placeholder: "ex: 1 dia, 3 dias", defaultValue: "" },
      { id: "coagulos", label: "Cóagulos", type: "select" as const, options: ["Ausentes", "Presentes"], defaultValue: "" },
      { id: "tabagismo", label: "Tabagismo", type: "select" as const, options: ["Não", "Ex-tabagista", "Tabagista ativo"], defaultValue: "" },
      { id: "anos_maco", label: "Anos-maço (se tabagista)", type: "text" as const, placeholder: "ex: 20", defaultValue: "" },
      { id: "exposicao_ocupacional", label: "Exposição ocupacional (aminas aromáticas)", type: "select" as const, options: ["Não", "Sim"], defaultValue: "" },
      { id: "radiacao_pelvica", label: "Irradiação pélvica prévia", type: "select" as const, options: ["Não", "Sim"], defaultValue: "" },
      { id: "ciclofosfamida", label: "Uso de ciclofosfamida ou pioglitazona", type: "select" as const, options: ["Não", "Sim"], defaultValue: "" },
      { id: "idade", label: "Idade", type: "text" as const, placeholder: "ex: 58", defaultValue: "" },
      { id: "usg_resultado", label: "Resultado USG renal", type: "text" as const, placeholder: "ex: Cálculo renal direito 8mm", defaultValue: "" },
      { id: "cistoscopia_resultado", label: "Resultado cistoscopia", type: "text" as const, placeholder: "ex: Mucosa vesical normal", defaultValue: "" },
      { id: "citologia_resultado", label: "Resultado citologia urinária", type: "text" as const, placeholder: "ex: Negativa para malignidade", defaultValue: "" },
      { id: "diagnostico", label: "Diagnóstico provável", type: "text" as const, placeholder: "ex: Litíase renal", defaultValue: "" },
    ],
    templates: {
      descricao: (c: Record<string, string>) => {
        const fatoresRisco = [
          c.tabagismo !== "Não" ? `Tabagismo (${c.anos_maco || "?"} anos-maço)` : "",
          c.exposicao_ocupacional === "Sim" ? "Exposição ocupacional a aminas aromáticas" : "",
          c.radiacao_pelvica === "Sim" ? "Irradiação pélvica prévia" : "",
          c.ciclofosfamida === "Sim" ? "Uso de ciclofosfamida/pioglitazona" : "",
          parseInt(c.idade) > 60 ? "Idade > 60 anos" : "",
        ].filter(Boolean);
        const nFatores = fatoresRisco.length;
        const risco = c.tipo === "Macroscópica (HM)" && parseInt(c.idade) > 35
          ? "alto"
          : c.tipo === "Microscópica (HMi)" && nFatores >= 2
          ? "alto"
          : nFatores === 1
          ? "intermediário"
          : "baixo";
        const conduta = risco === "alto"
          ? "TC urográfica (3 fases) + cistoscopia (EAU 2024, Grau A)"
          : risco === "intermediário"
          ? "USG renal + cistoscopia"
          : "USG renal + cistoscopia flexível";
        return `AVALIAÇÃO CLÍNICA — HEMATÚRIA

Tipo: ${c.tipo || "Não informado"}
Episódios: ${c.episodios || "Não informado"} | Duração: ${c.duracao || "Não informado"}
Cóagulos: ${c.coagulos || "Não informado"}

FATORES DE RISCO:
${fatoresRisco.length > 0 ? fatoresRisco.map((f: string) => `- ${f}`).join("\n") : "- Nenhum fator de risco identificado"}

ESTRATIFICAÇÃO DE RISCO: ${risco.toUpperCase()}
Conduta: ${conduta}

EXAMES SOLICITADOS:
- Urinálise com microscopia + urocultura
- Citologia urinária (3 amostras)
- Creatinina + TFG${parseInt(c.idade) > 40 ? "\n- PSA" : ""}
${risco === "alto" ? "- TC urográfica (3 fases)" : "- USG renal bilateral"}
- Cistoscopia flexível

RESULTADOS:
USG renal: ${c.usg_resultado || "Pendente"}
Cistoscopia: ${c.cistoscopia_resultado || "Pendente"}
Citologia: ${c.citologia_resultado || "Pendente"}

DIAGNÓSTICO PROVÁVEL: ${c.diagnostico || "A definir após investigação completa"}

REFERÊNCIAS: EAU Guidelines on Haematuria 2024; AUA/SUFU Guideline on Microhematuria 2020.`;
      },
      posOperatorio: (c: Record<string, string>) => `ORIENTAÇÕES PÓS-CONSULTA — HEMATÚRIA
${c.tipo === "Macroscópica (HM)" && c.coagulos === "Presentes" ? "⚠️ ATENÇÃO: Hematúria com cóagulos. Se houver retenção urinária, procure pronto-socorro imediatamente.\n" : ""}
Aguardar resultados dos exames solicitados. Retornar em consulta após obter todos os resultados.
Em caso de novo episódio de hematúria macroscópica, procurar atendimento médico.`,
      receitaAlta: () => `SOLICITAÇÃO DE EXAMES — HEMATÚRIA
- Urinálise com microscopia
- Urocultura com antibiograma
- Citologia urinária (3 amostras em dias consecutivos)
- Creatinina sérica e TFG estimada
- PSA total (homens > 40 anos)
- Ultrassonografia renal bilateral com Doppler
- Cistoscopia flexível`,
      orientacoes: (c: Record<string, string>) => `ORIENTAÇÕES AO PACIENTE — HEMATÚRIA
O QUE É HEMATÚRIA:
Hematúria é a presença de sangue na urina. Pode ser visível (macroscópica) ou detectada apenas em exames (microscópica). Sempre deve ser investigada.

O QUE FAZER:
- Realize todos os exames solicitados
- Evite esforço físico intenso até a investigação completa
- Mantenha hidratação adequada (2L de água/dia)
- Retorne para consulta com os resultados
${c.tipo === "Macroscópica (HM)" ? "\nPROCURE PRONTO-SOCORRO IMEDIATAMENTE SE:\n- A urina ficar muito escura ou com cóagulos grandes\n- Tiver dificuldade para urinar\n- Tiver dor intensa" : ""}

FONTES: EAU Guidelines on Haematuria 2024.`,
    },
  },
  {
    id: "investigacao-cancer-prostata",
    name: "Investigação do Câncer de Próstata",
    shortName: "Ca Próstata",
    icon: "🔬",
    category: "Diagnóstico",
    configFields: [
      { id: "paciente", label: "Nome do Paciente", type: "text", defaultValue: "" },
      { id: "data", label: "Data da Consulta", type: "text", defaultValue: "" },
      { id: "idade", label: "Idade (anos)", type: "text", defaultValue: "" },
      { id: "psa", label: "PSA Total (ng/mL)", type: "text", defaultValue: "" },
      { id: "psad", label: "Densidade do PSA (ng/mL/mL)", type: "text", defaultValue: "" },
      { id: "psav", label: "Velocidade do PSA (ng/mL/ano)", type: "text", defaultValue: "" },
      { id: "dre", label: "Toque Retal (DRE)", type: "select", defaultValue: "Normal", options: ["Normal", "Suspeito (nódulo/assimetria)", "Não realizado"] },
      { id: "historico_familiar", label: "Histórico Familiar 1º Grau", type: "select", defaultValue: "Não", options: ["Não", "Sim (pai ou irmão)"] },
      { id: "biopsia_previa", label: "Biópsia Prévia", type: "select", defaultValue: "Nenhuma", options: ["Nenhuma", "Negativa", "Positiva"] },
      { id: "pirads", label: "PIRADS (mpRM)", type: "select", defaultValue: "Não realizada", options: ["Não realizada", "PIRADS 1", "PIRADS 2", "PIRADS 3", "PIRADS 4", "PIRADS 5"] },
      { id: "gleason", label: "Gleason / ISUP (biópsia)", type: "select", defaultValue: "Não realizada", options: ["Não realizada", "ISUP 1 (3+3=6)", "ISUP 2 (3+4=7)", "ISUP 3 (4+3=7)", "ISUP 4 (4+4=8)", "ISUP 5 (9-10)"] },
      { id: "estadio_t", label: "Estágio T (TNM)", type: "select", defaultValue: "Não estadiado", options: ["Não estadiado", "cT1a", "cT1b", "cT1c", "cT2a", "cT2b", "cT2c", "cT3a", "cT3b", "cT4"] },
      { id: "estadio_n", label: "Estágio N", type: "select", defaultValue: "Não avaliado", options: ["Não avaliado", "cN0", "cN1"] },
      { id: "estadio_m", label: "Estágio M", type: "select", defaultValue: "Não avaliado", options: ["Não avaliado", "cM0", "cM1a", "cM1b", "cM1c"] },
      { id: "grupo_risco", label: "Grupo de Risco (EAU 2024)", type: "select", defaultValue: "A definir", options: ["A definir", "Baixo risco", "Risco intermediário favorável", "Risco intermediário desfavorável", "Alto risco", "Muito alto risco / Metastático"] },
      { id: "observacoes", label: "Observações Clínicas", type: "text", defaultValue: "" },
    ],
    templates: {
      descricao: (c: Record<string, string>) => `AVALIAÇÃO ONCOLÓGICA — CÂNCER DE PRÓSTATA
Data: ${c.data || "___/___/______"}
Paciente: ${c.paciente || "_______________________________"}, ${c.idade || "___"} anos

DADOS LABORATORIAIS E DE IMAGEM:
- PSA Total: ${c.psa || "___"} ng/mL
- Densidade do PSA (PSAD): ${c.psad || "___"} ng/mL/mL
- Velocidade do PSA (PSAV): ${c.psav || "___"} ng/mL/ano
- Toque Retal (DRE): ${c.dre || "___"}
- Histórico Familiar 1º Grau: ${c.historico_familiar || "___"}
- Biópsia Prévia: ${c.biopsia_previa || "___"}
- mpRM / PIRADS: ${c.pirads || "___"}

RESULTADO DA BIÓPSIA:
- Gleason / ISUP: ${c.gleason || "___"}

ESTADIAMENTO ONCOLÓGICO (TNM 2017):
- T: ${c.estadio_t || "___"}
- N: ${c.estadio_n || "___"}
- M: ${c.estadio_m || "___"}

GRUPO DE RISCO (EAU 2024): ${c.grupo_risco || "___"}

OBSERVAÇÕES:
${c.observacoes || "___"}

CONDUTA PROPOSTA:
${c.grupo_risco === "Baixo risco" ? "Vigílância ativa (PSA a cada 3–6 meses, biópsia confirmatória em 6–12 meses). Discutir prostatectomia radical ou radioterapia conforme preferência do paciente." : c.grupo_risco === "Risco intermediário favorável" || c.grupo_risco === "Risco intermediário desfavorável" ? "Tratamento curativo: prostatectomia radical (laparoscópica/robótica) ou radioterapia com braquiterapia. Discutir em equipe multidisciplinar." : c.grupo_risco === "Alto risco" ? "Tratamento curativo intensificado: prostatectomia radical + linfadenectomia pélvica estendida, ou radioterapia + deprivação androgênica (2–3 anos). PSMA-PET/CT para estadiamento." : c.grupo_risco === "Muito alto risco / Metastático" ? "Tratamento sistêmico: deprivação androgênica + docetaxel ou abiraterona (LATITUDE/STAMPEDE). Encaminhar para oncologia." : "A definir após discussão multidisciplinar."}

FONTES: EAU Guidelines 2024 (Prostate Cancer); AUA/ASTRO/SUO 2022.`,
      posOperatorio: (c: Record<string, string>) => `SOLICITAÇÃO DE BIÓPSIA DE PRÓSTATA
Paciente: ${c.paciente || "_______________________________"}
Data: ${c.data || "___/___/______"}

INDICAÇÃO:
- PSA: ${c.psa || "___"} ng/mL
- DRE: ${c.dre || "___"}
- PIRADS: ${c.pirads || "___"}
- Grupo de risco ERSPC RC4: ${c.grupo_risco || "___"}

SOLICITO:
Biópsia de próstata transperineal guiada por ultrassom (12 fragmentos sistemáticos + biópsia-alvo se PIRADS ≥ 3)

Preparo:
- Enema retal na noite anterior
- Antibioticoprofilaxia: ciprofloxacino 500 mg VO 1h antes
- Suspender anticoagulantes conforme protocolo
- Anestesia local transperineal ou sedação

Após o procedimento:
- Encaminhar material para anatomopatológico com imuno-histoquímica
- Retorno em 2–3 semanas com resultado

Dr. Felipe de Bulhões | CRM-SP 202.291 | RQE 146538`,
      receitaAlta: (c: Record<string, string>) => `SOLICITAÇÃO DE EXAMES — INVESTIGAÇÃO DE CÂNCER DE PRÓSTATA
Paciente: ${c.paciente || "_______________________________"}

EXAMES LABORATORIAIS:
- PSA total e livre
- Testosterona total
- Hemograma completo, creatinina, TGO, TGP, fosfatase alcalina
- Fosfatase ácida prostática (se suspeita de metástase)

EXAMES DE IMAGEM:
${c.pirads === "Não realizada" ? "- Ressonância Magnética Multiparamétrica (mpRM) de próstata com contraste (PI-RADS v2.1)" : ""}
${c.grupo_risco === "Alto risco" || c.grupo_risco === "Muito alto risco / Metastático" ? "- Cintilografia óssea (pesquisa de metástases)\n- TC de abdome e pelve com contraste\n- Considerar PSMA-PET/CT (preferêncial, EAU 2024)" : ""}

Dr. Felipe de Bulhões | CRM-SP 202.291 | RQE 146538`,
      orientacoes: (c: Record<string, string>) => `ORIENTAÇÕES AO PACIENTE — INVESTIGAÇÃO DO CÂNCER DE PRÓSTATA

SEU PSA ATUAL: ${c.psa || "___"} ng/mL

O QUE É O PSA:
O PSA (ânteno prostático específico) é uma proteína produzida pela próstata. Valores elevados podem indicar câncer, mas também infecção, inflação ou aumento benigno da próstata.

PRÓXIMOS PASSOS:
${c.pirads === "Não realizada" ? "1. Realizar ressonância magnética da próstata (mpRM) antes da biópsia\n" : ""}${c.gleason === "Não realizada" ? "2. Biópsia de próstata conforme indicação clínica\n" : ""}3. Retornar com todos os resultados para definição da conduta

IMPORTANTE:
- Não realize atividade física intensa, ejaculacão ou cistoscopia 48h antes do PSA
- Traga todos os exames anteriores na próxima consulta

FONTES: EAU Guidelines 2024 (Prostate Cancer); AUA Early Detection of Prostate Cancer 2023.`,
    },
  },
];
