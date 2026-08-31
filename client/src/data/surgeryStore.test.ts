import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLocalClinicalData,
  completeDJTimer,
  getMostUsedDocuments,
  getDJTimers,
  isCloudRestorePaused,
  markDJTimerContacted,
  recordDocumentUse,
  resumeCloudRestore,
} from "@/data/surgeryStore";

const TIMERS_KEY = "urodocx_dj_timers";

class LocalStorageMock {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const baseTimer = {
  id: "timer-1",
  patientName: "Paciente de teste",
  insertionDate: "2026-08-01",
  removalDate: "2026-08-22",
  lateralidade: "à esquerda",
  procedureId: "ureterolitotripsia-rigida",
  completed: false,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-30T10:00:00.000Z"));
  vi.stubGlobal("localStorage", new LocalStorageMock());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("surgeryStore — acompanhamento de Duplo J", () => {
  it("normaliza registros legados sem status de acompanhamento", () => {
    localStorage.setItem(TIMERS_KEY, JSON.stringify([baseTimer]));

    expect(getDJTimers()[0]).toMatchObject({
      ...baseTimer,
      followUpStatus: "pending",
    });
  });

  it("registra contato sem apagar os demais dados do timer", () => {
    localStorage.setItem(TIMERS_KEY, JSON.stringify([baseTimer]));

    markDJTimerContacted("timer-1");

    expect(getDJTimers()[0]).toMatchObject({
      ...baseTimer,
      followUpStatus: "contacted",
      contactedAt: "2026-08-30T10:00:00.000Z",
    });
  });

  it("confirma a retirada e registra o momento da confirmação", () => {
    localStorage.setItem(TIMERS_KEY, JSON.stringify([baseTimer]));

    completeDJTimer("timer-1");

    expect(getDJTimers()[0]).toMatchObject({
      ...baseTimer,
      completed: true,
      followUpStatus: "removed",
      removalConfirmedAt: "2026-08-30T10:00:00.000Z",
    });
  });
});

describe("surgeryStore — uso de documentos", () => {
  it("ordena documentos por frequência e usa a data como critério de desempate", () => {
    recordDocumentUse({
      procedureId: "ult",
      documentId: "receitaAlta",
      documentLabel: "Receita",
    });
    vi.setSystemTime(new Date("2026-08-30T10:01:00.000Z"));
    recordDocumentUse({
      procedureId: "rtu-p",
      documentId: "orientacoes",
      documentLabel: "Orientações",
    });
    vi.setSystemTime(new Date("2026-08-30T10:02:00.000Z"));
    recordDocumentUse({
      procedureId: "ult",
      documentId: "receitaAlta",
      documentLabel: "Receita de alta",
    });

    expect(getMostUsedDocuments()).toEqual([
      expect.objectContaining({
        key: "ult:receitaAlta",
        documentLabel: "Receita de alta",
        count: 2,
        lastUsedAt: "2026-08-30T10:02:00.000Z",
      }),
      expect.objectContaining({
        key: "rtu-p:orientacoes",
        count: 1,
        lastUsedAt: "2026-08-30T10:01:00.000Z",
      }),
    ]);
  });
});

describe("surgeryStore — descarte de dados clínicos", () => {
  it("remove registros identificáveis e pausa a restauração automática da nuvem", () => {
    localStorage.setItem("urodocx_history", JSON.stringify([{ patientName: "Paciente" }]));
    localStorage.setItem("urodocx_dj_timers", JSON.stringify([{ patientName: "Paciente" }]));
    localStorage.setItem("urodocx_document_usage", JSON.stringify([{ documentLabel: "Receita" }]));
    localStorage.setItem("urodocx_favorites", JSON.stringify(["ult"]));

    clearLocalClinicalData();

    expect(localStorage.getItem("urodocx_history")).toBeNull();
    expect(localStorage.getItem("urodocx_dj_timers")).toBeNull();
    expect(localStorage.getItem("urodocx_document_usage")).toBeNull();
    expect(localStorage.getItem("urodocx_favorites")).toBe(JSON.stringify(["ult"]));
    expect(isCloudRestorePaused()).toBe(true);

    resumeCloudRestore();
    expect(isCloudRestorePaused()).toBe(false);
  });
});
