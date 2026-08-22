import { AlertTriangle, CalendarDays, HeartPulse, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { aestheticComparison, getAestheticAftercare } from "@/lib/aestheticGuidance";

const steps = [
  { key: "immediate", label: "Primeiros dias", icon: ShieldCheck },
  { key: "firstWeek", label: "1ª semana", icon: CalendarDays },
  { key: "recovery", label: "Recuperação", icon: HeartPulse },
  { key: "release", label: "Retorno", icon: CalendarDays },
] as const;

export function AestheticGuidance({ entryId }: { entryId: string }) {
  const aftercare = getAestheticAftercare(entryId);
  if (!aftercare) return null;

  return (
    <section className="space-y-4" aria-label="Orientação visual pós-operatória">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.07] to-transparent p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Orientação visual</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Seguimento após {aftercare.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Resumo educacional. A prescrição e as orientações individualizadas do cirurgião prevalecem.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ key, label, icon: Icon }, index) => (
            <div key={key} className="relative rounded-xl border border-border/70 bg-card/80 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{index + 1}</span>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{aftercare[key]}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-relaxed text-foreground/90">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p><strong>Sinais de alerta:</strong> {aftercare.warning}</p>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {aestheticComparison.map((item) => (
          <Card key={item.title} className={item.accent === "dourado" ? "border-amber-500/25 bg-amber-500/[0.05] p-4" : "border-sky-500/25 bg-sky-500/[0.05] p-4"}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Indicação {item.title.toLowerCase()}</p>
            <h3 className="mt-1 text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">Gatilho:</strong> {item.trigger}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">Objetivo:</strong> {item.goal}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
