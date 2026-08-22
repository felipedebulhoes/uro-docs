import { Card } from "@/components/ui/card";
import { getPenileFillerGuidance } from "@/lib/penileFillerGuidance";
import { CircleAlert, Crosshair, Layers3, ShieldCheck } from "lucide-react";

const sharedDiagram = "/manus-storage/penile-filler-shaft-vs-glans-comparison_f02eb1f4.png";

export function PenileFillerComparison({ entryId }: { entryId: string }) {
  const active = getPenileFillerGuidance(entryId);
  const shaft = getPenileFillerGuidance("aumento-peniano-com-preenchimento-de-acido-hialuronico");
  const glans = getPenileFillerGuidance("aumento-de-glande-com-acido-hialuronico");

  if (!active || !shaft || !glans) return null;

  return (
    <section aria-label="Comparativo didático entre preenchimento de haste e de glande" className="mb-8">
      <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-transparent p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Mapa anatomotécnico</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Haste e glande são alvos diferentes</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            A mesma denominação “preenchimento peniano” pode ocultar diferenças relevantes de objetivo, plano de segurança e risco. O painel abaixo deve ser interpretado junto ao dossiê técnico e às referências de cada entrada.
          </p>
        </div>

        <img
          src={sharedDiagram}
          alt="Esquema comparativo entre o plano superficial de preenchimento da haste e o plano subepitelial da glande"
          className="mb-5 w-full rounded-xl border border-border/70 bg-white object-contain"
          loading="lazy"
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {[shaft, glans].map((item) => {
            const isActive = item.target === active.target;
            return (
              <article
                key={item.target}
                className={`rounded-xl border p-4 ${isActive ? "border-primary/50 bg-primary/[0.09]" : "border-border/70 bg-card/70"}`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">{item.label}</h3>
                  {isActive && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">Entrada atual</span>}
                </div>
                <ComparisonRow icon={Crosshair} label="Objetivo" value={item.objective} />
                <ComparisonRow icon={Layers3} label="Plano / alvo" value={item.anatomicalPlane} />
                <ComparisonRow icon={ShieldCheck} label="Distribuição" value={item.distribution} />
                <ComparisonRow icon={CircleAlert} label="Risco crítico" value={item.mainRisk} warning />
                <p className="mt-3 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Não confundir:</strong> {item.shouldNotBeConfusedWith}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-foreground/90">
          <strong className="text-amber-600">Regra didática:</strong> circunferência da haste e proporção/sensibilidade da glande são objetivos distintos; planos, volumes, instrumentos e manejo de isquemia não são intercambiáveis.
        </div>
      </Card>
    </section>
  );
}

function ComparisonRow({
  icon: Icon,
  label,
  value,
  warning = false,
}: {
  icon: typeof Crosshair;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="mb-2 flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${warning ? "text-amber-600" : "text-primary"}`} />
      <p><strong className="text-foreground">{label}:</strong> {value}</p>
    </div>
  );
}
