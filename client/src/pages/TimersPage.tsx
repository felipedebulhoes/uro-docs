import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  completeDJTimer,
  getDJTimers,
  markDJTimerContacted,
  removeDJTimer,
  type DJTimer,
} from "@/data/surgeryStore";
import {
  filterDJTimers,
  getDaysUntilRemoval,
  getFollowUpStatus,
  getTimerUrgency,
  type DJTimerFilter,
} from "@/lib/djTimerTracking";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  PhoneCall,
  Timer,
  Trash2,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { formatBR } from "@/lib/dateLocal";
import { useCloudSync } from "@/hooks/useCloudSync";

const FILTERS: Array<{ value: DJTimerFilter; label: string }> = [
  { value: "all", label: "Ativos" },
  { value: "overdue", label: "Atrasados" },
  { value: "due_soon", label: "Até 3 dias" },
  { value: "awaiting_contact", label: "Aguardando contato" },
  { value: "contacted", label: "Contato realizado" },
  { value: "completed", label: "Retirados" },
];

function formatDate(dateStr: string) {
  try {
    return formatBR(dateStr);
  } catch {
    return dateStr;
  }
}

function formatRecordedAt(dateStr?: string) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TimersPage() {
  const cloud = useCloudSync();
  const [timers, setTimers] = useState<DJTimer[]>(getDJTimers());
  const [filter, setFilter] = useState<DJTimerFilter>("all");

  const referenceDate = new Date();
  const activeTimers = useMemo(() => timers.filter((timer) => !timer.completed), [timers]);
  const visibleTimers = useMemo(
    () => filterDJTimers(timers, filter, referenceDate),
    [timers, filter, referenceDate]
  );

  const getFilterCount = (value: DJTimerFilter) =>
    filterDJTimers(timers, value, referenceDate).length;

  const handleContact = (id: string) => {
    markDJTimerContacted(id);
    setTimers(getDJTimers());
    cloud.syncTimers();
    toast.success("Contato registrado no acompanhamento do DJ.");
  };

  const handleComplete = (id: string) => {
    completeDJTimer(id);
    setTimers(getDJTimers());
    cloud.syncTimers();
    toast.success("Retirada do DJ confirmada e registrada.");
  };

  const handleDelete = (id: string) => {
    removeDJTimer(id);
    setTimers(getDJTimers());
    cloud.syncTimers();
    toast.success("Timer removido.");
  };

  const getUrgencyBadge = (timer: DJTimer) => {
    const daysRemaining = getDaysUntilRemoval(timer.removalDate, referenceDate);
    const urgency = getTimerUrgency(timer, referenceDate);

    if (urgency === "overdue") {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">
          <AlertTriangle className="w-3 h-3 mr-1" />
          ATRASADO {Math.abs(daysRemaining ?? 0)}d
        </Badge>
      );
    }
    if (urgency === "due_soon") {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[10px]">
          <Clock className="w-3 h-3 mr-1" />
          {daysRemaining ?? 0}d restantes
        </Badge>
      );
    }
    return (
      <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">
        <Timer className="w-3 h-3 mr-1" />
        {daysRemaining === null ? "Data a revisar" : `${daysRemaining}d restantes`}
      </Badge>
    );
  };

  const getFollowUpBadge = (timer: DJTimer) => {
    const followUpStatus = getFollowUpStatus(timer);
    const contactedAt = formatRecordedAt(timer.contactedAt);
    const removalConfirmedAt = formatRecordedAt(timer.removalConfirmedAt);

    if (followUpStatus === "removed") {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
          <CalendarCheck2 className="w-3 h-3 mr-1" />
          Retirada confirmada{removalConfirmedAt ? ` em ${removalConfirmedAt}` : ""}
        </Badge>
      );
    }
    if (followUpStatus === "contacted") {
      return (
        <Badge className="bg-sky-500/15 text-sky-300 border-sky-500/30 text-[10px]">
          <PhoneCall className="w-3 h-3 mr-1" />
          Contato realizado{contactedAt ? ` em ${contactedAt}` : ""}
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border-border text-[10px]">
        <PhoneCall className="w-3 h-3 mr-1" />
        Aguardando contato
      </Badge>
    );
  };

  const selectedFilter = FILTERS.find((item) => item.value === filter)?.label ?? "Pendências";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-md bg-background/90">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150" aria-label="Voltar ao início">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-nilo-dark flex items-center justify-center border border-primary/30 shadow-sm">
              <BrandLogo className="h-4 w-auto" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Pendências de Duplo J</h1>
              <p className="text-xs text-muted-foreground">{activeTimers.length} ativo{activeTimers.length === 1 ? "" : "s"} para acompanhamento</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4">
        {timers.length === 0 ? (
          <div className="text-center py-16">
            <Timer className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum timer de DJ ativo.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Ao registrar uma cirurgia com DJ, o acompanhamento aparecerá aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <Card className="p-3 bg-card border-border">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Fila de acompanhamento</p>
              <div className="flex flex-wrap gap-2" aria-label="Filtros de pendências de Duplo J">
                {FILTERS.map((item) => {
                  const count = getFilterCount(item.value);
                  const selected = filter === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      aria-pressed={selected}
                      className={`rounded-md border px-2.5 py-1.5 text-xs transition-all duration-150 ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {item.label} <span className="ml-1 tabular-nums opacity-80">{count}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {visibleTimers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/60 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum registro em “{selectedFilter}”.</p>
              </div>
            ) : (
              <section>
                <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                  {selectedFilter} ({visibleTimers.length})
                </h2>
                <div className="space-y-3">
                  {visibleTimers.map((timer) => {
                    const followUpStatus = getFollowUpStatus(timer);
                    const isCompleted = timer.completed;
                    return (
                      <Card
                        key={timer.id}
                        className={`p-3 border-border ${isCompleted ? "bg-card/50 opacity-70" : "bg-card"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className={`text-sm font-semibold text-foreground ${isCompleted ? "line-through" : ""}`}>
                              {timer.patientName || "Paciente"}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              DJ {timer.lateralidade} — inserido em {formatDate(timer.insertionDate)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Retirada prevista: {formatDate(timer.removalDate)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {!isCompleted && getUrgencyBadge(timer)}
                              {getFollowUpBadge(timer)}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {!isCompleted && followUpStatus === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0 border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
                                onClick={() => handleContact(timer.id)}
                                title="Registrar contato com o paciente"
                                aria-label="Registrar contato com o paciente"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {!isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0 border-green-500/30 text-green-400 hover:bg-green-500/10"
                                onClick={() => handleComplete(timer.id)}
                                title="Confirmar retirada do Duplo J"
                                aria-label="Confirmar retirada do Duplo J"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(timer.id)}
                              title="Remover timer"
                              aria-label="Remover timer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
