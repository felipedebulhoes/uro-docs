import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  summarizeHistory,
  executiveSummary,
  comparePeriods,
  comparisonLabel,
  compareProcedures,
  procedureDeltaLabel,
  type StatRecord,
} from "@/lib/historyStats";
import {
  filterByDateRange,
  previousRange,
  rangeLabelOf,
} from "@/lib/periodFilter";
import {
  loadGoals,
  saveGoals,
  annualPace,
  annualPaceAlert,
  monthlyGoalAlert,
  monthlyPace,
  perProcedureMonthlyPaces,
  type GoalConfig,
} from "@/lib/goals";
import { exportStatsPDF } from "@/lib/exportStats";
import { exportTrendPng } from "@/lib/exportTrendImage";
import { exportPanelPng } from "@/lib/exportPanelImage";
import {
  BarChart3,
  CalendarRange,
  Layers,
  TrendingUp,
  FileDown,
  ImageDown,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

interface HistoryStatsProps {
  records: StatRecord[];
  periodLabel?: string;
  /** Full unfiltered record set, used to compute the previous comparison period
   *  and the year-to-date annual progress (independent of the active filter). */
  allRecords?: StatRecord[];
  /** Active free-range bounds (YYYY-MM-DD); enables period-over-period comparison. */
  rangeFrom?: string;
  rangeTo?: string;
}

export function HistoryStats({
  records,
  periodLabel,
  allRecords,
  rangeFrom,
  rangeTo,
}: HistoryStatsProps) {
  const summary = useMemo(() => summarizeHistory(records), [records]);
  // "all" = export every procedure; otherwise a specific procedureId.
  const [exportProc, setExportProc] = useState("all");
  const [copied, setCopied] = useState(false);
  const [exportingPanel, setExportingPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Persisted goals (monthly + annual). 0/empty = disabled.
  const [goals, setGoals] = useState<GoalConfig>(() => loadGoals());
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const updateGoal = (key: keyof GoalConfig, value: string) => {
    const n = parseInt(value, 10);
    setGoals((g) => ({ ...g, [key]: Number.isFinite(n) && n > 0 ? n : undefined }));
  };

  // Stable reference date so memos don't refetch on every render.
  const [refDate] = useState(() => new Date());

  // Records used for year-to-date / monthly pace: prefer the full set so goals
  // reflect real production regardless of the active view filter.
  const goalRecords = allRecords && allRecords.length > 0 ? allRecords : records;

  // Period-over-period comparison: only when a complete free range is active.
  const comparison = useMemo(() => {
    if (!allRecords || !rangeFrom || !rangeTo) return null;
    const prev = previousRange(rangeFrom, rangeTo);
    if (!prev) return null;
    const previousRecords = filterByDateRange(allRecords, prev.from, prev.to);
    return {
      cmp: comparePeriods(records, previousRecords),
      deltas: compareProcedures(records, previousRecords),
      prevLabel: rangeLabelOf(prev.from, prev.to),
    };
  }, [allRecords, rangeFrom, rangeTo, records]);

  const summaryText = useMemo(
    () => executiveSummary(summary, { periodLabel }),
    [summary, periodLabel],
  );

  // Monthly goal attainment (current calendar month, from the full set).
  const monthlyAlert = useMemo(() => {
    if (!goals.monthly) return null;
    return monthlyGoalAlert(goalRecords, goals.monthly, refDate);
  }, [goals.monthly, goalRecords, refDate]);

  const monthlyProgress = useMemo(() => {
    if (!goals.monthly) return null;
    const y = String(refDate.getFullYear());
    const mo = String(refDate.getMonth() + 1).padStart(2, "0");
    const achieved = goalRecords.filter((r) => r.date.startsWith(`${y}-${mo}`)).length;
    const pct = Math.round((achieved / goals.monthly) * 100);
    return { achieved, target: goals.monthly, pct, barPct: Math.min(pct, 100), reached: pct >= 100 };
  }, [goals.monthly, goalRecords, refDate]);

  // Annual pace + accumulated progress (year-to-date).
  const annual = useMemo(() => {
    if (!goals.annual) return null;
    return annualPace(goalRecords, goals.annual, refDate);
  }, [goals.annual, goalRecords, refDate]);

  // Per-procedure monthly goals: paces for each configured procedure.
  const procedurePaces = useMemo(
    () => perProcedureMonthlyPaces(goalRecords, goals.perProcedureMonthly, refDate),
    [goalRecords, goals.perProcedureMonthly, refDate],
  );

  // Draft inputs for adding a new per-procedure monthly goal.
  const [newProcId, setNewProcId] = useState("");
  const [newProcTarget, setNewProcTarget] = useState("");
  const [editProcId, setEditProcId] = useState<string | null>(null);
  const [editProcTarget, setEditProcTarget] = useState("");

  // Monthly pace status drives the color of the highlighted PDF banner.
  const monthlyAlertStatus = useMemo<
    "ahead" | "on" | "behind" | "reached" | undefined
  >(() => {
    if (!goals.monthly) return undefined;
    const pace = monthlyPace(goalRecords, goals.monthly, refDate);
    return pace.progress.reached ? "reached" : pace.status;
  }, [goals.monthly, goalRecords, refDate]);

  if (summary.total === 0) return null;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      toast.success("Resumo copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o resumo.");
    }
  };

  // Goal text for the PDF "Metas" block — annual only (monthly pace now has its
  // own highlighted banner at the top of the PDF).
  const buildGoalText = (): string | undefined => {
    const lines: string[] = [];
    if (annual) {
      const a = annualPaceAlert(annual);
      if (a) lines.push(a);
    }
    return lines.length > 0 ? lines.join(" ") : undefined;
  };

  const addProcedureGoal = () => {
    const target = parseInt(newProcTarget, 10);
    if (!newProcId || !Number.isFinite(target) || target <= 0) {
      toast.error("Escolha um procedimento e uma meta válida (> 0).");
      return;
    }
    setGoals((g) => ({
      ...g,
      perProcedureMonthly: { ...(g.perProcedureMonthly ?? {}), [newProcId]: target },
    }));
    setNewProcId("");
    setNewProcTarget("");
    toast.success("Meta mensal do procedimento adicionada.");
  };

  const startEditProcedureGoal = (procedureId: string, current: number) => {
    setEditProcId(procedureId);
    setEditProcTarget(String(current));
  };

  const cancelEditProcedureGoal = () => {
    setEditProcId(null);
    setEditProcTarget("");
  };

  const saveEditProcedureGoal = (procedureId: string) => {
    const target = parseInt(editProcTarget, 10);
    if (!Number.isFinite(target) || target <= 0) {
      toast.error("Informe uma meta válida (> 0).");
      return;
    }
    setGoals((g) => ({
      ...g,
      perProcedureMonthly: { ...(g.perProcedureMonthly ?? {}), [procedureId]: target },
    }));
    setEditProcId(null);
    setEditProcTarget("");
    toast.success("Meta mensal do procedimento atualizada.");
  };

  const removeProcedureGoal = (procedureId: string) => {
    setGoals((g) => {
      const next = { ...(g.perProcedureMonthly ?? {}) };
      delete next[procedureId];
      return {
        ...g,
        perProcedureMonthly: Object.keys(next).length > 0 ? next : undefined,
      };
    });
  };

  const handleExportPDF = () => {
    try {
      const comparisonText = comparison
        ? `${comparisonLabel(comparison.cmp)}${
            comparison.prevLabel
              ? ` (período anterior: ${comparison.prevLabel})`
              : ""
          }`
        : undefined;
      const procedureDeltaText = comparison
        ? procedureDeltaLabel(comparison.deltas)
        : undefined;
      const goalText = buildGoalText();

      if (exportProc === "all") {
        exportStatsPDF(records, {
          periodLabel,
          comparisonText,
          procedureDeltaText,
          goalText,
          monthlyAlertText: monthlyAlert ?? undefined,
          monthlyAlertStatus,
        });
      } else {
        const scoped = records.filter((r) => r.procedureId === exportProc);
        const label =
          summary.byType.find((t) => t.procedureId === exportProc)
            ?.procedureName ?? undefined;
        exportStatsPDF(scoped, {
          periodLabel,
          procedureLabel: label,
          goalText,
          monthlyAlertText: monthlyAlert ?? undefined,
          monthlyAlertStatus,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message === "popup-blocked") {
        toast.error("Permita pop-ups para gerar o PDF.");
      } else {
        toast.error("Falha ao gerar PDF de estatísticas.");
      }
    }
  };

  const handleExportPng = () => {
    try {
      exportTrendPng(summary.byMonth, {
        subtitle: periodLabel ? `Período: ${periodLabel}` : undefined,
      });
      toast.success("Imagem da tendência baixada (PNG).");
    } catch (err) {
      if (err instanceof Error && err.message === "no-data") {
        toast.error("A tendência precisa de pelo menos dois meses com registros.");
      } else {
        toast.error("Falha ao gerar a imagem da tendência.");
      }
    }
  };

  const handleExportPanelPng = () => {
    setExportingPanel(true);
    try {
      const monthlyGoalText = monthlyProgress
        ? `${monthlyProgress.achieved} de ${monthlyProgress.target} cirurgias neste mês · ${monthlyProgress.pct}%`
        : undefined;
      const annualGoalText = annual
        ? `${annual.progress.achieved} de ${annual.progress.target} cirurgias no ano · ${annual.progress.pct}%`
        : undefined;
      exportPanelPng(summary, {
        subtitle: periodLabel ? `Período: ${periodLabel}` : undefined,
        summaryText,
        monthlyGoalText,
        annualGoalText,
        alertText: buildGoalText(),
        fileName: "painel-estatisticas",
      });
      toast.success("Painel exportado como imagem (PNG).");
    } catch {
      toast.error("Falha ao exportar o painel como imagem.");
    } finally {
      setExportingPanel(false);
    }
  };

  const maxMonth = Math.max(...summary.byMonth.map((m) => m.count), 1);
  const maxType = Math.max(...summary.byType.map((t) => t.count), 1);
  const months = summary.byMonth.slice(-12);
  const topTypes = summary.byType.slice(0, 8);
  const movers = comparison
    ? comparison.deltas.filter((d) => d.delta !== 0).slice(0, 6)
    : [];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" />
          Estatísticas{periodLabel ? ` — ${periodLabel}` : ""}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Goals: monthly + annual */}
          <div
            className="flex items-center gap-1.5 h-8 px-2 rounded-md border border-border bg-card"
            title="Meta de cirurgias por mês (vazio = desativar)"
          >
            <Target className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Meta/mês
            </span>
            <Input
              type="number"
              min={0}
              value={goals.monthly ?? ""}
              onChange={(e) => updateGoal("monthly", e.target.value)}
              placeholder="—"
              className="h-6 w-12 px-1 text-xs text-center border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
          <div
            className="flex items-center gap-1.5 h-8 px-2 rounded-md border border-border bg-card"
            title="Meta de cirurgias por ano (vazio = desativar)"
          >
            <CalendarClock className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Meta/ano
            </span>
            <Input
              type="number"
              min={0}
              value={goals.annual ?? ""}
              onChange={(e) => updateGoal("annual", e.target.value)}
              placeholder="—"
              className="h-6 w-14 px-1 text-xs text-center border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
          {/* Scope the PDF export to a single procedure (or all) */}
          <Select value={exportProc} onValueChange={setExportProc}>
            <SelectTrigger
              className="h-8 w-[170px] bg-card border-border text-xs"
              title="Escolher procedimento para o PDF"
            >
              <SelectValue placeholder="Procedimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os procedimentos</SelectItem>
              {summary.byType.map((t) => (
                <SelectItem key={t.procedureId} value={t.procedureId}>
                  {t.procedureName} ({t.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10"
            onClick={handleCopySummary}
            title="Copiar o resumo executivo como texto"
          >
            {copied ? (
              <Check className="w-3 h-3 mr-1 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 mr-1" />
            )}
            Copiar resumo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10"
            onClick={handleExportPng}
            title="Baixar a tendência mensal como imagem PNG"
          >
            <ImageDown className="w-3 h-3 mr-1" />
            Tendência PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10"
            onClick={handleExportPanelPng}
            disabled={exportingPanel}
            title="Exportar todo o painel como imagem PNG"
          >
            <ImageDown className="w-3 h-3 mr-1" />
            {exportingPanel ? "Gerando…" : "Painel PNG"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10"
            onClick={handleExportPDF}
            title="Exportar estatísticas em PDF"
          >
            <FileDown className="w-3 h-3 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Everything inside panelRef is captured by "Painel PNG" */}
      <div ref={panelRef} className="space-y-4 bg-background p-1 rounded-lg">
        {/* Executive summary (auto-generated, copy-ready) */}
        <Card className="p-3 bg-primary/5 border-primary/20">
          <p className="text-[13px] leading-relaxed text-foreground/90">
            {summaryText}
          </p>
        </Card>

        {/* Monthly goal attainment (current month) */}
        {monthlyProgress && (
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-primary flex items-center gap-1.5 font-bold">
                <Target className="w-3 h-3" />
                Meta mensal (mês corrente)
              </span>
              <span
                className={`text-xs font-bold ${
                  monthlyProgress.reached ? "text-emerald-400" : "text-foreground"
                }`}
              >
                {monthlyProgress.pct}%
              </span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  monthlyProgress.reached ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${monthlyProgress.barPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {monthlyProgress.achieved} de {monthlyProgress.target} cirurgias neste mês ·{" "}
              {monthlyProgress.reached
                ? "meta atingida"
                : `faltam ${monthlyProgress.target - monthlyProgress.achieved}`}
            </p>
            {/* Daily-pace alert (explicitly flags when behind for the month) */}
            {monthlyAlert && (
              <div
                className={`mt-2 flex items-start gap-1.5 px-2 py-1.5 rounded text-[11px] leading-snug ${
                  monthlyProgress.reached || monthlyAlert.includes("acima")
                    ? "bg-emerald-500/10 text-emerald-300"
                    : monthlyAlert.includes("abaixo")
                    ? "bg-amber-500/10 text-amber-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {monthlyProgress.reached || monthlyAlert.includes("acima") ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-px" />
                ) : monthlyAlert.includes("abaixo") ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                ) : (
                  <Minus className="w-3.5 h-3.5 shrink-0 mt-px" />
                )}
                <span>{monthlyAlert}</span>
              </div>
            )}
          </Card>
        )}

        {/* Per-procedure monthly goals (e.g. a specific RTU-P target) */}
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-primary flex items-center gap-1.5 font-bold">
              <Target className="w-3 h-3" />
              Metas mensais por procedimento
            </span>
          </div>

          {/* Add a new per-procedure monthly goal */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Select value={newProcId} onValueChange={setNewProcId}>
              <SelectTrigger
                className="h-8 flex-1 min-w-[160px] bg-background border-border text-xs"
                title="Escolher procedimento"
              >
                <SelectValue placeholder="Escolher procedimento…" />
              </SelectTrigger>
              <SelectContent>
                {summary.byType
                  .filter((t) => !goals.perProcedureMonthly?.[t.procedureId])
                  .map((t) => (
                    <SelectItem key={t.procedureId} value={t.procedureId}>
                      {t.procedureName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={newProcTarget}
              onChange={(e) => setNewProcTarget(e.target.value)}
              placeholder="Meta/mês"
              className="h-8 w-24 px-2 text-xs text-center bg-background border-border"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10"
              onClick={addProcedureGoal}
              title="Adicionar meta mensal para o procedimento"
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>

          {procedurePaces.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Nenhuma meta por procedimento definida. Útil para acompanhar um
              procedimento específico (ex.: RTU-P para o mestrado).
            </p>
          ) : (
            <div className="space-y-2.5">
              {procedurePaces.map(({ procedureId, procedureName, pace }) => {
                const reached = pace.progress.reached;
                const behind = pace.status === "behind";
                const barColor = reached
                  ? "bg-emerald-500"
                  : behind
                  ? "bg-amber-500"
                  : "bg-primary";
                return (
                  <div key={procedureId} className="rounded-md border border-border/60 bg-background/60 p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-foreground truncate">
                        {procedureName}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {editProcId === procedureId ? (
                          <>
                            <Input
                              type="number"
                              min={1}
                              value={editProcTarget}
                              onChange={(e) => setEditProcTarget(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditProcedureGoal(procedureId);
                                if (e.key === "Escape") cancelEditProcedureGoal();
                              }}
                              autoFocus
                              className="h-6 w-16 text-[11px] px-1.5"
                              aria-label={`Nova meta mensal de ${procedureName}`}
                            />
                            <button
                              type="button"
                              onClick={() => saveEditProcedureGoal(procedureId)}
                              className="text-emerald-500 hover:text-emerald-400 transition-colors"
                              title="Salvar meta"
                              aria-label={`Salvar meta de ${procedureName}`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditProcedureGoal}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Cancelar"
                              aria-label="Cancelar edição"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditProcedureGoal(procedureId, pace.progress.target)}
                              className={`text-[11px] font-bold hover:underline ${
                                reached ? "text-emerald-400" : "text-foreground"
                              }`}
                              title="Editar meta"
                              aria-label={`Editar meta de ${procedureName}`}
                            >
                              {pace.progress.achieved}/{pace.progress.target} ({pace.progress.pct}%)
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditProcedureGoal(procedureId, pace.progress.target)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="Editar meta"
                              aria-label={`Editar meta de ${procedureName}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProcedureGoal(procedureId)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title="Remover meta"
                              aria-label={`Remover meta de ${procedureName}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                        style={{ width: `${Math.min(pace.progress.pct, 100)}%` }}
                      />
                      {!reached && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-foreground/60"
                          style={{
                            left: `${Math.min(
                              Math.round((pace.expected / pace.progress.target) * 100),
                              100,
                            )}%`,
                          }}
                          title={`Ritmo esperado até o dia ${pace.dayOfMonth}/${pace.daysInMonth}: ${pace.expected}`}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {reached
                        ? "Meta do mês atingida."
                        : behind
                        ? `Abaixo do ritmo: ${pace.progress.achieved} de ${pace.expected} previstos até o dia ${pace.dayOfMonth}/${pace.daysInMonth} (faltam ${pace.progress.remaining}).`
                        : `No ritmo: ${pace.progress.achieved} de ${pace.expected} previstos até o dia ${pace.dayOfMonth}/${pace.daysInMonth} (faltam ${pace.progress.remaining}).`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Annual goal: accumulated progress + pace alert */}
        {annual && (
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-primary flex items-center gap-1.5 font-bold">
                <CalendarClock className="w-3 h-3" />
                Meta anual ({refDate.getFullYear()}) — acumulado
              </span>
              <span
                className={`text-xs font-bold ${
                  annual.progress.reached ? "text-emerald-400" : "text-foreground"
                }`}
              >
                {annual.progress.pct}%
              </span>
            </div>
            {/* Accumulated bar with an "expected pace" marker */}
            <div className="relative h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  annual.progress.reached
                    ? "bg-emerald-500"
                    : annual.status === "behind"
                    ? "bg-amber-500"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(annual.progress.pct, 100)}%` }}
              />
              {/* Expected-pace marker */}
              {!annual.progress.reached && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground/60"
                  style={{
                    left: `${Math.min(
                      Math.round((annual.expected / annual.progress.target) * 100),
                      100,
                    )}%`,
                  }}
                  title={`Ritmo esperado até aqui: ${annual.expected}`}
                />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {annual.progress.achieved} de {annual.progress.target} cirurgias no ano ·{" "}
              esperado até aqui: {annual.expected} ·{" "}
              {annual.progress.reached
                ? "meta atingida"
                : `faltam ${annual.progress.remaining}`}
            </p>
            {/* Pace alert */}
            <div
              className={`mt-2 flex items-start gap-1.5 px-2 py-1.5 rounded text-[11px] leading-snug ${
                annual.progress.reached || annual.status === "ahead"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : annual.status === "behind"
                  ? "bg-amber-500/10 text-amber-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {annual.progress.reached || annual.status === "ahead" ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-px" />
              ) : annual.status === "behind" ? (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
              ) : (
                <Minus className="w-3.5 h-3.5 shrink-0 mt-px" />
              )}
              <span>{annualPaceAlert(annual)}</span>
            </div>
          </Card>
        )}

        {/* Period-over-period comparison (only with an active date range) */}
        {comparison && (
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold shrink-0 ${
                  comparison.cmp.direction === "up"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : comparison.cmp.direction === "down"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {comparison.cmp.direction === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : comparison.cmp.direction === "down" ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {comparison.cmp.pct === null
                  ? comparison.cmp.previous === 0 && comparison.cmp.current > 0
                    ? "Novo"
                    : "—"
                  : `${comparison.cmp.delta > 0 ? "+" : ""}${comparison.cmp.pct
                      .toFixed(1)
                      .replace(".", ",")}%`}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] text-foreground/90 leading-snug">
                  {comparisonLabel(comparison.cmp)}
                </p>
                {comparison.prevLabel && (
                  <p className="text-[10px] text-muted-foreground">
                    Período anterior: {comparison.prevLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Per-procedure movers */}
            {movers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Variação por procedimento
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {movers.map((d) => (
                    <span
                      key={d.procedureId}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        d.delta > 0
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                      title={`${d.procedureName}: ${d.previous} → ${d.current}`}
                    >
                      {d.delta > 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {d.procedureName} {d.delta > 0 ? "+" : ""}
                      {d.delta}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.total}</p>
            <p className="text-[10px] text-muted-foreground">cirurgias registradas</p>
          </Card>
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-wider">Tipos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.distinctTypes}</p>
            <p className="text-[10px] text-muted-foreground">procedimentos distintos</p>
          </Card>
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-wider">Mais frequente</span>
            </div>
            <p className="text-sm font-bold text-foreground truncate" title={summary.topType?.procedureName}>
              {summary.topType?.procedureName ?? "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {summary.topType ? `${summary.topType.count}x` : ""}
            </p>
          </Card>
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CalendarRange className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-wider">Mês mais ativo</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {summary.busiestMonth?.label ?? "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {summary.busiestMonth ? `${summary.busiestMonth.count} cirurgias` : ""}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* By month */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5" />
              Cirurgias por mês
            </h3>
            <div className="space-y-2">
              {months.map((m) => (
                <div key={m.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-16 shrink-0 text-right">
                    {m.label}
                  </span>
                  <div className="flex-1 h-5 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded transition-all duration-500 ease-out"
                      style={{ width: `${(m.count / maxMonth) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-foreground w-5 shrink-0">
                    {m.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* By type */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Cirurgias por tipo
            </h3>
            <div className="space-y-2">
              {topTypes.map((t) => (
                <div key={t.procedureId} className="flex items-center gap-2">
                  <span
                    className="text-[10px] text-muted-foreground w-24 shrink-0 text-right truncate"
                    title={t.procedureName}
                  >
                    {t.procedureName}
                  </span>
                  <div className="flex-1 h-5 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded transition-all duration-500 ease-out"
                      style={{ width: `${(t.count / maxType) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-foreground w-5 shrink-0">
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
