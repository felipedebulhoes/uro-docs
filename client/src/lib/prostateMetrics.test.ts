import { describe, expect, it } from "vitest";
import {
  calculatePsaDensity,
  calculatePsaDoublingTimeMonths,
  calculatePsaVelocity,
  isPersistentPostProstatectomyPsa,
} from "./prostateMetrics";

describe("prostateMetrics", () => {
  it("calcula PSA density a partir de PSA e volume", () => {
    expect(calculatePsaDensity(6, 40)).toBeCloseTo(0.15, 6);
    expect(calculatePsaDensity(4.2, 30)).toBeCloseTo(0.14, 6);
  });

  it("não calcula PSA density com dados inválidos", () => {
    expect(calculatePsaDensity(4, 0)).toBeNull();
    expect(calculatePsaDensity(0, 40)).toBeNull();
  });

  it("calcula PSA velocity anualizada entre duas dosagens", () => {
    expect(
      calculatePsaVelocity({
        previousPsaNgMl: 2,
        previousDate: "2025-01-01",
        currentPsaNgMl: 3,
        currentDate: "2026-01-01",
      })
    ).toBeCloseTo(1, 2);
  });

  it("retorna nulo quando as datas não formam um intervalo válido", () => {
    expect(
      calculatePsaVelocity({
        previousPsaNgMl: 2,
        previousDate: "2026-01-01",
        currentPsaNgMl: 3,
        currentDate: "2025-01-01",
      })
    ).toBeNull();
  });

  it("estima PSA-DT com três dosagens ascendentes", () => {
    const result = calculatePsaDoublingTimeMonths([
      { psaNgMl: 0.1, date: "2024-01-01" },
      { psaNgMl: 0.2, date: "2025-01-01" },
      { psaNgMl: 0.4, date: "2026-01-01" },
    ]);

    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(11);
    expect(result!).toBeLessThan(13);
  });

  it("retorna nulo em séries estáveis, decrescentes ou com datas repetidas", () => {
    expect(
      calculatePsaDoublingTimeMonths([
        { psaNgMl: 0.1, date: "2024-01-01" },
        { psaNgMl: 0.1, date: "2025-01-01" },
        { psaNgMl: 0.1, date: "2026-01-01" },
      ])
    ).toBeNull();
    expect(
      calculatePsaDoublingTimeMonths([
        { psaNgMl: 0.1, date: "2024-01-01" },
        { psaNgMl: 0.2, date: "2025-01-01" },
        { psaNgMl: 0.4, date: "2025-01-01" },
      ])
    ).toBeNull();
  });

  it("identifica PSA persistente após seis semanas da prostatectomia", () => {
    expect(
      isPersistentPostProstatectomyPsa({
        surgeryDate: "2026-01-01",
        firstPsaDate: "2026-02-12",
        firstPsaNgMl: 0.1,
      })
    ).toBe(true);
    expect(
      isPersistentPostProstatectomyPsa({
        surgeryDate: "2026-01-01",
        firstPsaDate: "2026-02-11",
        firstPsaNgMl: 0.1,
      })
    ).toBe(false);
    expect(
      isPersistentPostProstatectomyPsa({
        surgeryDate: "2026-01-01",
        firstPsaDate: "2026-02-12",
        firstPsaNgMl: 0.09,
      })
    ).toBe(false);
  });
});
