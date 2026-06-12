import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHistory, removeFromHistory, clearHistory, type SurgeryRecord } from "@/data/surgeryStore";
import { procedures } from "@/data/procedures";
import { ArrowLeft, Trash2, Search, Calendar, User, ClipboardList, FileSpreadsheet, FileDown, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { toast } from "sonner";
import { useCloudSync } from "@/hooks/useCloudSync";
import { exportHistoryCSV, exportHistoryPDF } from "@/lib/exportHistory";
import { HistoryStats } from "@/components/HistoryStats";
import { PaceBadge } from "@/components/PaceBadge";
import {
  availableYears as yearsOf,
  availableMonths as monthsOf,
  filterByPeriod,
  periodLabelOf,
  filterByDateRange,
  rangeLabelOf,
  presetRange,
  PERIOD_PRESETS,
  MONTH_LABELS,
} from "@/lib/periodFilter";

export default function HistoryPage() {
  const cloud = useCloudSync();
  const [history, setHistory] = useState<SurgeryRecord[]>(getHistory());
  const [search, setSearch] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filterMode, setFilterMode] = useState<"month" | "range">("month");
  const [periodYear, setPeriodYear] = useState("all");
  const [periodMonth, setPeriodMonth] = useState("all");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  // Years present in the history, descending.
  const availableYears = useMemo(() => yearsOf(history), [history]);

  // Months present for the selected year (or all years), ascending.
  const availableMonths = useMemo(
    () => monthsOf(history, periodYear),
    [history, periodYear]
  );

  const byPeriod = useMemo(
    () =>
      filterMode === "range"
        ? filterByDateRange(history, rangeFrom, rangeTo)
        : filterByPeriod(history, periodYear, periodMonth),
    [history, filterMode, periodYear, periodMonth, rangeFrom, rangeTo]
  );

  const periodLabel = useMemo(
    () =>
      filterMode === "range"
        ? rangeLabelOf(rangeFrom, rangeTo)
        : periodLabelOf(periodYear, periodMonth),
    [filterMode, periodYear, periodMonth, rangeFrom, rangeTo]
  );

  const filtered = useMemo(() => {
    if (!search) return byPeriod;
    const q = search.toLowerCase();
    return byPeriod.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.procedureName.toLowerCase().includes(q) ||
        r.date.includes(q)
    );
  }, [byPeriod, search]);

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    setHistory(getHistory());
    cloud.syncSurgeries();
    toast.success("Registro removido.");
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    cloud.syncSurgeries();
    setClearOpen(false);
    toast.success("Histórico limpo.");
  };

  const handleExportCSV = () => {
    if (byPeriod.length === 0) return;
    try {
      exportHistoryCSV(byPeriod);
      toast.success("CSV exportado.");
    } catch {
      toast.error("Falha ao exportar CSV.");
    }
  };

  const handleExportPDF = () => {
    if (byPeriod.length === 0) return;
    try {
      exportHistoryPDF(byPeriod, periodLabel);
    } catch (err) {
      if (err instanceof Error && err.message === "popup-blocked") {
        toast.error("Permita pop-ups para gerar o PDF.");
      } else {
        toast.error("Falha ao gerar PDF.");
      }
    }
  };

  const applyPreset = (preset: "last30" | "last90" | "currentYear") => {
    const { from, to } = presetRange(preset);
    setFilterMode("range");
    setRangeFrom(from);
    setRangeTo(to);
  };

  const activePreset = useMemo(() => {
    if (filterMode !== "range" || (!rangeFrom && !rangeTo)) return null;
    for (const p of PERIOD_PRESETS) {
      const r = presetRange(p.key);
      if (r.from === rangeFrom && r.to === rangeTo) return p.key;
    }
    return null;
  }, [filterMode, rangeFrom, rangeTo]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-md bg-background/90">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
            </Link>
            <div>
              <h1 className="text-sm font-bold text-foreground">Histórico de Cirurgias</h1>
              <p className="text-xs text-muted-foreground">
                {periodLabel ? `${byPeriod.length} de ${history.length} registros` : `${history.length} registros`}
              </p>
            </div>
            {history.length > 0 && (
              <div className="ml-auto flex items-center gap-1.5">
                <PaceBadge records={history} />
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10 ${showStats ? "border-primary/50 text-primary bg-primary/10" : ""}`}
                  onClick={() => setShowStats((s) => !s)}
                  title="Estatísticas"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Estatísticas</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10"
                  onClick={handleExportCSV}
                  title="Exportar CSV (Excel)"
                >
                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-border bg-card hover:border-primary/40 hover:bg-primary/10"
                  onClick={handleExportPDF}
                  title="Exportar PDF"
                >
                  <FileDown className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setClearOpen(true)}
                  title="Limpar histórico"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4">
        {showStats && byPeriod.length > 0 && (
          <HistoryStats
            records={byPeriod}
            periodLabel={periodLabel}
            allRecords={history}
            rangeFrom={filterMode === "range" ? rangeFrom : ""}
            rangeTo={filterMode === "range" ? rangeTo : ""}
          />
        )}
        {history.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, procedimento ou data..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border h-10 text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Mode toggle: month/year vs free date range */}
              <div className="flex rounded-md border border-border bg-card overflow-hidden h-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterMode("month")}
                  className={`px-3 text-xs font-medium transition-colors ${
                    filterMode === "month"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Filtrar por mês/ano"
                >
                  Mês/Ano
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("range")}
                  className={`px-3 text-xs font-medium border-l border-border transition-colors ${
                    filterMode === "range"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Filtrar por intervalo de datas"
                >
                  Intervalo
                </button>
              </div>

              {filterMode === "month" ? (
                <>
                  <Select
                    value={periodMonth}
                    onValueChange={(v) => setPeriodMonth(v)}
                  >
                    <SelectTrigger className="h-10 w-[110px] bg-card border-border text-sm">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo mês</SelectItem>
                      {availableMonths.map((mm) => (
                        <SelectItem key={mm} value={mm}>
                          {MONTH_LABELS[parseInt(mm, 10) - 1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={periodYear}
                    onValueChange={(v) => {
                      setPeriodYear(v);
                      setPeriodMonth("all");
                    }}
                  >
                    <SelectTrigger className="h-10 w-[110px] bg-card border-border text-sm">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo ano</SelectItem>
                      {availableYears.map((yy) => (
                        <SelectItem key={yy} value={yy}>
                          {yy}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <div className="flex flex-wrap items-end gap-1.5">
                  <div className="flex items-center gap-1">
                    {PERIOD_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => applyPreset(p.key)}
                        className={`h-8 px-2.5 rounded-md text-[11px] font-medium border transition-colors ${
                          activePreset === p.key
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                        title={`Definir intervalo: ${p.label}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70 px-0.5">De</span>
                    <Input
                      type="date"
                      value={rangeFrom}
                      max={rangeTo || undefined}
                      onChange={(e) => setRangeFrom(e.target.value)}
                      className="h-8 w-[150px] bg-card border-border text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70 px-0.5">Até</span>
                    <Input
                      type="date"
                      value={rangeTo}
                      min={rangeFrom || undefined}
                      onChange={(e) => setRangeTo(e.target.value)}
                      className="h-8 w-[150px] bg-card border-border text-sm"
                    />
                  </div>
                  {(rangeFrom || rangeTo) && (
                    <button
                      type="button"
                      onClick={() => {
                        setRangeFrom("");
                        setRangeTo("");
                      }}
                      className="self-end h-8 px-2 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                      title="Limpar intervalo"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {history.length === 0
                ? "Nenhuma cirurgia registrada ainda."
                : "Nenhum resultado encontrado."}
            </p>
            {history.length === 0 && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Ao salvar documentos de um procedimento, ele aparecerá aqui.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record) => {
              const proc = procedures.find((p) => p.id === record.procedureId);
              return (
                <Card key={record.id} className="p-3 bg-card border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-base shrink-0">
                        {proc?.icon || "📋"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {record.procedureName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            {record.patientName || "Sem nome"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.date)}
                          </span>
                        </div>
                        {record.config.lateralidade && (
                          <Badge variant="outline" className="mt-1.5 text-[10px] border-primary/20 text-primary/80">
                            {record.config.lateralidade}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todo o histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove todos os registros de cirurgias salvos localmente. Se você estiver logado, a remoção também será sincronizada na nuvem. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
