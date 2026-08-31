import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculatePsaDoublingTimeMonths,
  isPersistentPostProstatectomyPsa,
} from "@/lib/prostateMetrics";
import { Calculator, CircleAlert, Info, TrendingUp } from "lucide-react";

type MeasurementInput = {
  psa: string;
  date: string;
};

const initialMeasurements: MeasurementInput[] = [
  { psa: "", date: "" },
  { psa: "", date: "" },
  { psa: "", date: "" },
];

function dateDifferenceInDays(laterDate: string, earlierDate: string): number | null {
  const later = Date.parse(`${laterDate}T00:00:00Z`);
  const earlier = Date.parse(`${earlierDate}T00:00:00Z`);
  if (!Number.isFinite(later) || !Number.isFinite(earlier)) return null;
  return (later - earlier) / 86_400_000;
}

export function PsaDoublingTimeCalculator() {
  const [surgeryDate, setSurgeryDate] = useState("");
  const [measurements, setMeasurements] = useState<MeasurementInput[]>(
    initialMeasurements
  );

  const parsedMeasurements = useMemo(
    () =>
      measurements.map((measurement) => ({
        psaNgMl: Number(measurement.psa),
        date: measurement.date,
      })),
    [measurements]
  );

  const completeMeasurements = parsedMeasurements.every(
    (measurement) =>
      Number.isFinite(measurement.psaNgMl) &&
      measurement.psaNgMl > 0 &&
      Boolean(measurement.date)
  );

  const orderedMeasurements = useMemo(
    () =>
      [...parsedMeasurements].sort(
        (a, b) =>
          Date.parse(`${a.date}T00:00:00Z`) - Date.parse(`${b.date}T00:00:00Z`)
      ),
    [parsedMeasurements]
  );

  const psaDtMonths = useMemo(
    () =>
      completeMeasurements
        ? calculatePsaDoublingTimeMonths(parsedMeasurements)
        : null,
    [completeMeasurements, parsedMeasurements]
  );

  const firstMeasurement = completeMeasurements ? orderedMeasurements[0] : null;
  const daysAfterSurgery =
    surgeryDate && firstMeasurement
      ? dateDifferenceInDays(firstMeasurement.date, surgeryDate)
      : null;
  const persistentPsa = Boolean(
    firstMeasurement &&
      surgeryDate &&
      isPersistentPostProstatectomyPsa({
        surgeryDate,
        firstPsaDate: firstMeasurement.date,
        firstPsaNgMl: firstMeasurement.psaNgMl,
      })
  );

  const updateMeasurement = (
    index: number,
    field: keyof MeasurementInput,
    value: string
  ) => {
    setMeasurements((current) =>
      current.map((measurement, measurementIndex) =>
        measurementIndex === index
          ? { ...measurement, [field]: value }
          : measurement
      )
    );
  };

  return (
    <Card className="mt-4 border-primary/25 bg-card/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-primary">
          Calculadora de PSA-DT — três dosagens
        </h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Estima o tempo de duplicação do PSA por regressão log-linear. Insira três
        dosagens positivas em datas distintas; o cálculo apoia, mas não substitui,
        a avaliação oncológica individualizada.
      </p>

      <div className="mb-4 max-w-xs space-y-1">
        <Label htmlFor="rp-surgery-date" className="text-xs text-muted-foreground">
          Data da prostatectomia (opcional, para alerta de PSA persistente)
        </Label>
        <Input
          id="rp-surgery-date"
          type="date"
          value={surgeryDate}
          onChange={(event) => setSurgeryDate(event.target.value)}
          className="h-8 bg-background text-sm"
        />
      </div>

      <div className="space-y-2">
        {measurements.map((measurement, index) => (
          <div
            key={`psa-measurement-${index}`}
            className="grid grid-cols-1 gap-2 rounded-md border border-border/70 bg-background/40 p-2 sm:grid-cols-[auto_1fr_1fr] sm:items-end"
          >
            <span className="pb-2 text-xs font-semibold text-foreground">
              PSA {index + 1}
            </span>
            <div className="space-y-1">
              <Label htmlFor={`psa-value-${index}`} className="text-[11px] text-muted-foreground">
                Valor (ng/mL)
              </Label>
              <Input
                id={`psa-value-${index}`}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder="Ex.: 0,18"
                value={measurement.psa}
                onChange={(event) => updateMeasurement(index, "psa", event.target.value)}
                className="h-8 bg-background text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`psa-date-${index}`} className="text-[11px] text-muted-foreground">
                Data da dosagem
              </Label>
              <Input
                id={`psa-date-${index}`}
                type="date"
                value={measurement.date}
                onChange={(event) => updateMeasurement(index, "date", event.target.value)}
                className="h-8 bg-background text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {persistentPsa && firstMeasurement && (
        <Alert variant="destructive" className="mt-4 border-red-500/50 bg-red-500/10 text-foreground">
          <CircleAlert className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-300">PSA persistentemente detectável</AlertTitle>
          <AlertDescription className="text-foreground/85">
            PSA de {firstMeasurement.psaNgMl.toFixed(2)} ng/mL em {Math.round(daysAfterSurgery! / 7)} semanas após a cirurgia. Confirme a tendência, revise os dados anatomopatológicos e discuta estadiamento e tratamento multimodal precoce; não aguarde progressão clínica para encaminhamento especializado.
          </AlertDescription>
        </Alert>
      )}

      {completeMeasurements && psaDtMonths !== null && (
        <div className="mt-4 rounded-md border border-primary/25 bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground">PSA-DT estimado</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-primary">
            {psaDtMonths.toFixed(1)} meses
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {psaDtMonths <= 12
              ? "PSA-DT ≤ 12 meses: perfil de maior risco de progressão/recidiva conforme estratificação EAU; priorize discussão precoce de imagem e resgate."
              : "PSA-DT > 12 meses: interpretar junto a ISUP, pT, margens, PSA persistente, tempo até a elevação e expectativa de vida."}
          </p>
        </div>
      )}

      {completeMeasurements && psaDtMonths === null && (
        <div className="mt-4 flex gap-2 rounded-md border border-border bg-muted/20 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Não foi possível estimar PSA-DT porque a série é estável ou decrescente, ou as datas não são válidas/distintas. Acompanhe a trajetória de PSA conforme o contexto clínico.
          </p>
        </div>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground/80">
        Fonte: EAU Guidelines on Prostate Cancer 2026; Van den Broeck et al., Eur Urol Focus 2020. Ferramenta de apoio à decisão clínica.
      </p>
    </Card>
  );
}
