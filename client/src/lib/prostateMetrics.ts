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
