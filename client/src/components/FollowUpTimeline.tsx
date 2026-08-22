import { CalendarClock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { FollowUpMilestone } from "@/lib/atlasVisual";

export function FollowUpTimeline({ milestones }: { milestones: FollowUpMilestone[] }) {
  if (milestones.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <CalendarClock className="w-3.5 h-3.5" />
        Linha do tempo de seguimento
      </h3>
      <Card className="p-4 bg-card border-primary/20">
        <ol className="space-y-4">
          {milestones.map((milestone, index) => (
            <li key={`${milestone.timing}-${milestone.title}`} className="relative flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/40 text-primary flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3" />
                </span>
                {index < milestones.length - 1 && <span className="w-px flex-1 bg-primary/20 my-1" />}
              </div>
              <div className="pb-1 min-w-0">
                <p className="text-[11px] font-semibold text-primary">{milestone.timing}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{milestone.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground mt-1">{milestone.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
