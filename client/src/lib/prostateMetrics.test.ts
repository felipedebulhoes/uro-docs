import { describe, expect, it } from "vitest";
import { calculatePsaDensity, calculatePsaVelocity } from "./prostateMetrics";

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
});
