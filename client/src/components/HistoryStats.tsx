import { useEffect, useMemo, useState } from "react";
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
import { exportStatsPDF } from "@/lib/exportStats";
import { exportTrendPng } from "@/lib/exportTrendImage";
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
} from "lucide-react";
import { toast } from "sonner";

const GOAL_KEY = "urodocx_monthly_goal";

interface HistoryStatsProps {
  records: StatRecord[];
  periodLabel?: string;
  /** Full unfiltered record set, used to compute the previous comparison period. */
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

  // Persisted monthly goal (number of surgeries/month). 0/empty = disabled.
  const [goal, setGoal] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(GOAL_KEY);
      const n = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch {
      return 0;
    }
  });
  useEffect(() => {
    try {
      if (goal > 0) localStorage.setItem(GOAL_KEY, String(goal));
      else localStorage.removeItem(GOAL_KEY);
    } catch {
      /* ignore storage errors */
    }
  }, [goal]);

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

  // Goal attainment vs. the busiest month in the current view.
  const goalInfo = useMemo(() => {
    if (goal <= 0) return null;
    const achieved = summary.busiestMonth?.count ?? 0;
    const pct = Math.round((achieved / goal) * 100);
    return {
      achieved,
      pct,
      barPct: Math.min(pct, 100),
      refLabel: summary.busiestMonth?.label ?? "—",
      reached: pct >= 100,
    };
  }, [goal, summary]);

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

      if (exportProc === "all") {
        exportStatsPDF(records, {
          periodLabel,
          comparisonText,
          procedureDeltaText,
          monthlyGoal: goal > 0 ? goal : undefined,
        });
      } else {
        const scoped = records.filter((r) => r.procedureId === exportProc);
        const label =
          summary.byType.find((t) => t.procedureId === exportProc)
            ?.procedureName ?? undefined;
        exportStatsPDF(scoped, {
          periodLabel,
          procedureLabel: label,
          monthlyGoal: goal > 0 ? goal : undefined,
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
          {/* Monthly goal */}
          <div
            className="flex items-center gap-1.5 h-8 px-2 rounded-md border border-border bg-card"
            title="Meta de cirurgias por mês (deixe vazio para desativar)"
          >
            <Target className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Meta/mês
            </span>
            <Input
              type="number"
              min={0}
              value={goal > 0 ? goal : ""}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setGoal(Number.isFinite(n) && n > 0 ? n : 0);
              }}
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
            PNG
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

      {/* Executive summary (auto-generated, copy-ready) */}
      <Card className="p-3 bg-primary/5 border-primary/20">
        <p className="text-[13px] leading-relaxed text-foreground/90">
          {summaryText}
        </p>
      </Card>

      {/* Monthly goal attainment */}
      {goalInfo && (
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-primary flex items-center gap-1.5 font-bold">
              <Target className="w-3 h-3" />
              Meta mensal
            </span>
            <span
              className={`text-xs font-bold ${
                goalInfo.reached ? "text-emerald-400" : "text-foreground"
              }`}
            >
              {goalInfo.pct}% da meta
            </span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                goalInfo.reached ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${goalInfo.barPct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Meta de {goal} cirurgias/mês · melhor mês ({goalInfo.refLabel}):{" "}
            {goalInfo.achieved} ·{" "}
            {goalInfo.reached ? "meta atingida" : `${100 - goalInfo.barPct}% restante`}
          </p>
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
  );
}
