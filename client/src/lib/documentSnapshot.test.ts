import { describe, expect, it } from "vitest";
import {
  DOCUMENT_TEMPLATE_VERSION,
  createDocumentSnapshot,
  isDocumentSnapshot,
} from "@/lib/documentSnapshot";

describe("documentSnapshot", () => {
  it("preserva o conteúdo e a versão do modelo no momento do salvamento", () => {
    const documents = {
      descricao: "Texto original",
      orientacoes: "Retornar em 7 dias",
    };

    const snapshot = createDocumentSnapshot(documents, "2026-08-30T12:00:00.000Z");
    documents.descricao = "Texto alterado posteriormente";

    expect(snapshot).toEqual({
      templateVersion: DOCUMENT_TEMPLATE_VERSION,
      capturedAt: "2026-08-30T12:00:00.000Z",
      documents: [
        { id: "descricao", label: "Descrição", content: "Texto original" },
        { id: "orientacoes", label: "Orientações", content: "Retornar em 7 dias" },
      ],
    });
  });

  it("reconhece apenas instantâneos documentais completos", () => {
    expect(
      isDocumentSnapshot({
        templateVersion: "2026.08.31",
        capturedAt: "2026-08-30T12:00:00.000Z",
        documents: [{ id: "descricao", label: "Descrição", content: "Texto" }],
      })
    ).toBe(true);
    expect(isDocumentSnapshot({ templateVersion: "2026.08.31" })).toBe(false);
  });
});
