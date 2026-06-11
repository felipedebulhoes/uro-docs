import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { summarizeHistory, type StatRecord } from "@/lib/historyStats";
import { exportStatsPDF } from "@/lib/exportStats";
import { BarChart3, CalendarRange, Layers, TrendingUp, FileDown } from "lucide-react";
import { toast } from "sonner";

interface HistoryStatsProps {
  records: StatRecord[];
  periodLabel?: string;
}

export function HistoryStats({ records, periodLabel }: HistoryStatsProps) {
  const summary = useMemo(() => summarizeHistory(records), [records]);
  // "all" = export every procedure; otherwise a specific procedureId.
  const [exportProc, setExportProc] = useState("all");

  if (summary.total === 0) return null;

  const handleExportPDF = () => {
    try {
      if (exportProc === "all") {
        exportStatsPDF(records, periodLabel);
      } else {
        const scoped = records.filter((r) => r.procedureId === exportProc);
        const label =
          summary.byType.find((t) => t.procedureId === exportProc)
            ?.procedureName ?? undefined;
        exportStatsPDF(scoped, periodLabel, label);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "popup-blocked") {
        toast.error("Permita pop-ups para gerar o PDF.");
      } else {
        toast.error("Falha ao gerar PDF de estatísticas.");
      }
    }
  };

  const maxMonth = Math.max(...summary.byMonth.map((m) => m.count), 1);
  const maxType = Math.max(...summary.byType.map((t) => t.count), 1);
  // Show most recent 12 months chronologically
  const months = summary.byMonth.slice(-12);
  const topTypes = summary.byType.slice(0, 8);

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" />
          Estatísticas{periodLabel ? ` — ${periodLabel}` : ""}
        </h2>
        <div className="flex items-center gap-2">
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
            onClick={handleExportPDF}
            title="Exportar estatísticas em PDF"
          >
            <FileDown className="w-3 h-3 mr-1" />
            PDF
          </Button>
        </div>
      </div>

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
