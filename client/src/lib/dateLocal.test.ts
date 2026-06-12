import { describe, it, expect } from "vitest";
import {
  toLocalISODate,
  parseLocalISODate,
  addDaysISO,
  formatBR,
} from "@/lib/dateLocal";

describe("dateLocal — sem deslocamento de fuso (UTC)", () => {
  it("toLocalISODate usa a data do calendário local, não UTC", () => {
    // 12/06/2026 23:30 no horário local. Em GMT-3, toISOString() daria 2026-06-13.
    const d = new Date(2026, 5, 12, 23, 30, 0);
    expect(toLocalISODate(d)).toBe("2026-06-12");
  });

  it("toLocalISODate preserva o dia em horários de início do dia", () => {
    const d = new Date(2026, 0, 1, 0, 15, 0);
    expect(toLocalISODate(d)).toBe("2026-01-01");
  });

  it("parseLocalISODate retorna a data local correta (sem voltar um dia)", () => {
    const d = parseLocalISODate("2026-06-12");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5); // junho (0-indexed)
    expect(d.getDate()).toBe(12);
  });

  it("addDaysISO soma dias sem drift (DJ +21 dias)", () => {
    expect(addDaysISO("2026-06-12", 21)).toBe("2026-07-03");
    expect(addDaysISO("2026-12-25", 21)).toBe("2027-01-15");
  });

  it("formatBR exibe a mesma data informada", () => {
    expect(formatBR("2026-06-12")).toBe("12/06/2026");
    expect(formatBR("2026-01-01")).toBe("01/01/2026");
  });

  it("formatBR com string vazia retorna vazio", () => {
    expect(formatBR("")).toBe("");
  });
});

describe("dateLocal — round-trip de 'hoje'", () => {
  it("todayLocalISO + formatBR preservam o dia local do usuário", async () => {
    const { todayLocalISO } = await import("@/lib/dateLocal");
    const iso = todayLocalISO();
    // O ISO de hoje deve bater com a data local atual, sem drift de UTC.
    const now = new Date();
    const expectedIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(iso).toBe(expectedIso);
    // E formatar de volta deve manter o mesmo dia.
    expect(formatBR(iso)).toBe(now.toLocaleDateString("pt-BR"));
  });
});
