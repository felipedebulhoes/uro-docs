export const DOCUMENT_TEMPLATE_VERSION = "2026.08.31";

export type IssuedDocumentSnapshot = {
  id: string;
  label: string;
  content: string;
};

export type DocumentSnapshot = {
  templateVersion: string;
  capturedAt: string;
  documents: IssuedDocumentSnapshot[];
};

const DOCUMENT_LABELS: Record<string, string> = {
  descricao: "Descrição",
  posOperatorio: "PO Imediato",
  receitaAlta: "Receita",
  orientacoes: "Orientações",
  preOperatorio: "Pré-Op",
  tcle: "TCLE",
  evolucaoD1: "Evolução D1",
  materiaisOPME: "OPME",
  examesPosOp: "Exames",
  relatorioConvenio: "Convênio",
};

/**
 * Constrói uma cópia independente do conteúdo exibido no momento do
 * salvamento. Assim, atualizações futuras do modelo não modificam registros
 * clínicos já criados.
 */
export function createDocumentSnapshot(
  documents: Record<string, string>,
  capturedAt = new Date().toISOString()
): DocumentSnapshot {
  return {
    templateVersion: DOCUMENT_TEMPLATE_VERSION,
    capturedAt,
    documents: Object.entries(documents).map(([id, content]) => ({
      id,
      label: DOCUMENT_LABELS[id] ?? id,
      content,
    })),
  };
}

export function isDocumentSnapshot(value: unknown): value is DocumentSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<DocumentSnapshot>;
  return (
    typeof snapshot.templateVersion === "string" &&
    typeof snapshot.capturedAt === "string" &&
    Array.isArray(snapshot.documents) &&
    snapshot.documents.every(
      (document) =>
        typeof document?.id === "string" &&
        typeof document?.label === "string" &&
        typeof document?.content === "string"
    )
  );
}
