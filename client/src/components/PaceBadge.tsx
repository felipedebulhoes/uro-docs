import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import {
  GOALS_CHANGED_EVENT,
  loadGoals,
  monthlyPace,
  paceSignal,
  type GoalConfig,
} from "@/lib/goals";
import type { StatRecord } from "@/lib/historyStats";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PaceBadgeProps {
  /** Full record set (current month is derived from the reference date). */
  records: StatRecord[];
  /** Optional explicit reference date (for tests / determinism). */
  refDate?: Date;
}

type Signal = "green" | "amber" | "red";

/**
 * Compact "traffic-light" indicator of the current month's surgical pace
 * versus the configured monthly goal. Renders nothing when there is no
 * monthly goal, so the header stays clean for users who don't use goals.
 *
 * Three explicit levels (see `paceSignal`):
 * - green → goal reached, ahead, or on the expected daily pace
 * - amber → moderately behind the expected daily pace
 * - red   → severely behind (less than half of what was expected so far)
 *
 * Reacts immediately to goal edits via the GOALS_CHANGED_EVENT (same tab) and
 * the native `storage` event (other tabs).
 */
export function PaceBadge({ records, refDate }: PaceBadgeProps) {
  // Stable reference date so the memo doesn't recompute every render.
  const [fallbackDate] = useState(() => new Date());
  const ref = refDate ?? fallbackDate;

  // Track goals in state so the badge updates when the user changes the goal.
  const [goals, setGoals] = useState<GoalConfig>(() => loadGoals());
  useEffect(() => {
    const refresh = () => setGoals(loadGoals());
    window.addEventListener(GOALS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(GOALS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const view = useMemo(() => {
    if (!goals.monthly) return null;
    const pace = monthlyPace(records, goals.monthly, ref);
    return { pace, signal: paceSignal(pace) as Signal };
  }, [records, ref, goals.monthly]);

  if (!view) return null;

  const { pace, signal } = view;
  const { progress, expected, dayOfMonth, daysInMonth, reachedHelper } = {
    ...pace,
    reachedHelper: pace.progress.reached,
  };

  const toneClasses: Record<Signal, string> = {
    green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    red: "border-red-500/40 bg-red-500/10 text-red-300",
  };

  const Icon = reachedHelper
    ? CheckCircle2
    : signal === "green"
      ? TrendingUp
      : signal === "amber"
        ? Activity
        : AlertTriangle;

  const label = reachedHelper
    ? "Meta do mês atingida"
    : signal === "green"
      ? "No ritmo"
      : signal === "amber"
        ? "Abaixo do ritmo"
        : "Muito abaixo";

  const detail = reachedHelper
    ? `${progress.achieved} de ${progress.target} cirurgias neste mês (${progress.pct}%).`
    : `${progress.achieved} realizada(s) vs. ${expected} prevista(s) até o dia ${dayOfMonth}/${daysInMonth} (meta ${progress.target}). Faltam ${progress.remaining}` +
      (signal !== "green" && pace.neededPerRemainingDay != null
        ? ` — ~${pace.neededPerRemainingDay} cirurgia(s)/dia no restante do mês.`
        : ".");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1.5 h-7 px-2 rounded-full border text-[11px] font-semibold transition-colors duration-150 ${toneClasses[signal]}`}
            aria-label={`Ritmo da meta mensal: ${label}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="tabular-nums">
              {progress.achieved}/{progress.target}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-xs leading-snug">
          <p className="font-semibold mb-0.5">Ritmo da meta mensal</p>
          <p>{detail}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
