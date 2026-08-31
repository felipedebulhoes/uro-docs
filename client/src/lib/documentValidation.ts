export type DocumentConfig = Record<string, string | undefined | null>;

export type RequiredDocumentField = {
  id: string;
  label: string;
};

const FIELD_LABELS: Record<string, string> = {
  paciente: "Nome do paciente",
  data_cirurgia: "Data da cirurgia",
  data_evolucao: "Data da evolução",
  convenio: "Convênio",
  carteirinha: "Número da carteirinha",
  cid: "CID-10",
  indicacao: "Indicação clínica",
};

const COMMON_REQUIRED_FIELDS = ["paciente", "data_cirurgia"];

const DOCUMENT_SPECIFIC_FIELDS: Record<string, readonly string[]> = {
  evolucaoD1: ["data_evolucao"],
  relatorioConvenio: ["convenio", "carteirinha", "cid", "indicacao"],
};

function hasValue(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function requiredFieldIds(documentId: string): string[] {
  return [
    ...COMMON_REQUIRED_FIELDS,
    ...(DOCUMENT_SPECIFIC_FIELDS[documentId] ?? []),
  ];
}

/**
 * Retorna os dados essenciais ausentes para uma saída clínica individual.
 * Toda emissão exige identificação do paciente e a data do procedimento;
 * documentos específicos podem incluir requisitos administrativos adicionais.
 */
export function getMissingDocumentFields(
  documentId: string,
  config: DocumentConfig
): RequiredDocumentField[] {
  return requiredFieldIds(documentId)
    .filter((fieldId) => !hasValue(config[fieldId]))
    .map((id) => ({ id, label: FIELD_LABELS[id] ?? id }));
}

/**
 * Consolida requisitos para uma saída com mais de um documento, preservando
 * a ordem de preenchimento e eliminando campos repetidos.
 */
export function getMissingFieldsForDocuments(
  documentIds: readonly string[],
  config: DocumentConfig
): RequiredDocumentField[] {
  const missing = new Map<string, RequiredDocumentField>();

  documentIds.forEach((documentId) => {
    getMissingDocumentFields(documentId, config).forEach((field) => {
      missing.set(field.id, field);
    });
  });

  return Array.from(missing.values());
}
