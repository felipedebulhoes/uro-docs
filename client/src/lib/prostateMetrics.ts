export function calculatePsaDensity(
  psaNgMl: number,
  prostateVolumeMl: number
): number | null {
  if (
    !Number.isFinite(psaNgMl) ||
    !Number.isFinite(prostateVolumeMl) ||
    psaNgMl <= 0 ||
    prostateVolumeMl <= 0
  ) {
    return null;
  }

  return psaNgMl / prostateVolumeMl;
}

export function calculatePsaVelocity(params: {
  currentPsaNgMl: number;
  currentDate: string;
  previousPsaNgMl: number;
  previousDate: string;
}): number | null {
  const {
    currentPsaNgMl,
    currentDate,
    previousPsaNgMl,
    previousDate,
  } = params;

  if (
    !Number.isFinite(currentPsaNgMl) ||
    !Number.isFinite(previousPsaNgMl) ||
    currentPsaNgMl < 0 ||
    previousPsaNgMl < 0 ||
    !currentDate ||
    !previousDate
  ) {
    return null;
  }

  const currentMs = Date.parse(`${currentDate}T00:00:00Z`);
  const previousMs = Date.parse(`${previousDate}T00:00:00Z`);
  const elapsedDays = (currentMs - previousMs) / 86_400_000;

  if (!Number.isFinite(elapsedDays) || elapsedDays <= 0) return null;

  return (currentPsaNgMl - previousPsaNgMl) / (elapsedDays / 365.25);
}

export type PsaMeasurement = {
  psaNgMl: number;
  date: string;
};

/**
 * Estima o tempo de duplicação do PSA (PSA-DT) em meses usando regressão
 * linear de ln(PSA) em função do tempo. Requer, no mínimo, três dosagens
 * positivas em datas distintas. Retorna null para dados inválidos ou para
 * tendência estável/decrescente, cenário em que não há duplicação estimável.
 */
export function calculatePsaDoublingTimeMonths(
  measurements: PsaMeasurement[]
): number | null {
  if (measurements.length < 3) return null;

  const points = measurements
    .map((measurement) => ({
      ...measurement,
      timestamp: Date.parse(`${measurement.date}T00:00:00Z`),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (
    points.some(
      (point) =>
        !Number.isFinite(point.psaNgMl) ||
        point.psaNgMl <= 0 ||
        !Number.isFinite(point.timestamp)
    )
  ) {
    return null;
  }

  const earliestTimestamp = points[0].timestamp;
  const elapsedYears = points.map(
    (point) => (point.timestamp - earliestTimestamp) / 86_400_000 / 365.25
  );

  if (new Set(elapsedYears).size !== elapsedYears.length) return null;

  const logPsa = points.map((point) => Math.log(point.psaNgMl));
  const meanTime = elapsedYears.reduce((sum, value) => sum + value, 0) / elapsedYears.length;
  const meanLogPsa = logPsa.reduce((sum, value) => sum + value, 0) / logPsa.length;
  const varianceTime = elapsedYears.reduce(
    (sum, value) => sum + (value - meanTime) ** 2,
    0
  );

  if (varianceTime === 0) return null;

  const covariance = elapsedYears.reduce(
    (sum, value, index) =>
      sum + (value - meanTime) * (logPsa[index] - meanLogPsa),
    0
  );
  const slopePerYear = covariance / varianceTime;

  if (!Number.isFinite(slopePerYear) || slopePerYear <= 0) return null;

  return (Math.LN2 / slopePerYear) * 12;
}

/**
 * Identifica PSA persistentemente detectável para o alerta do Atlas.
 * O limiar operacional usado é PSA >= 0,1 ng/mL em dosagem obtida a
 * partir de seis semanas após a prostatectomia.
 */
export function isPersistentPostProstatectomyPsa(params: {
  surgeryDate: string;
  firstPsaDate: string;
  firstPsaNgMl: number;
}): boolean {
  const surgeryTimestamp = Date.parse(`${params.surgeryDate}T00:00:00Z`);
  const psaTimestamp = Date.parse(`${params.firstPsaDate}T00:00:00Z`);

  if (
    !Number.isFinite(surgeryTimestamp) ||
    !Number.isFinite(psaTimestamp) ||
    !Number.isFinite(params.firstPsaNgMl)
  ) {
    return false;
  }

  const daysAfterSurgery = (psaTimestamp - surgeryTimestamp) / 86_400_000;
  return daysAfterSurgery >= 42 && params.firstPsaNgMl >= 0.1;
}
