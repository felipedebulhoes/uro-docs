import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeDJTimer,
  getDJTimers,
  markDJTimerContacted,
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
