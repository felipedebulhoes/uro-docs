import { describe, expect, it } from "vitest";
import {
  getMissingDocumentFields,
  getMissingFieldsForDocuments,
} from "@/lib/documentValidation";

describe("documentValidation", () => {
  it("exige identificação e data do procedimento em toda saída clínica", () => {
    expect(getMissingDocumentFields("receitaAlta", {})).toEqual([
      { id: "paciente", label: "Nome do paciente" },
      { id: "data_cirurgia", label: "Data da cirurgia" },
    ]);
  });

  it("considera espaços em branco como campo não preenchido", () => {
    expect(
      getMissingDocumentFields("orientacoes", {
        paciente: "   ",
        data_cirurgia: "2026-08-30",
      })
    ).toEqual([{ id: "paciente", label: "Nome do paciente" }]);
  });

  it("inclui os requisitos administrativos do relatório de convênio", () => {
    expect(
      getMissingDocumentFields("relatorioConvenio", {
        paciente: "Joana Silva",
        data_cirurgia: "2026-08-30",
        convenio: "",
        carteirinha: "123",
        cid: "",
        indicacao: "Cólica renal",
      })
    ).toEqual([
      { id: "convenio", label: "Convênio" },
      { id: "cid", label: "CID-10" },
    ]);
  });

  it("consolida campos repetidos ao exportar vários documentos", () => {
    expect(
      getMissingFieldsForDocuments(["orientacoes", "evolucaoD1"], {
        paciente: "Joana Silva",
        data_cirurgia: "",
        data_evolucao: "",
      })
    ).toEqual([
      { id: "data_cirurgia", label: "Data da cirurgia" },
      { id: "data_evolucao", label: "Data da evolução" },
    ]);
  });

  it("libera a saída quando todos os campos requeridos estão completos", () => {
    expect(
      getMissingDocumentFields("evolucaoD1", {
        paciente: "Joana Silva",
        data_cirurgia: "2026-08-30",
        data_evolucao: "2026-08-31",
      })
    ).toEqual([]);
  });
});
