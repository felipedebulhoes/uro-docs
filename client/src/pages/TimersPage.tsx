import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDJTimers, completeDJTimer, removeDJTimer, type DJTimer } from "@/data/surgeryStore";
import { ArrowLeft, Clock, CheckCircle2, Trash2, AlertTriangle, Timer } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { formatBR } from "@/lib/dateLocal";
import { useCloudSync } from "@/hooks/useCloudSync";

export default function TimersPage() {
  const cloud = useCloudSync();
  const [timers, setTimers] = useState<DJTimer[]>(getDJTimers());

  const activeTimers = useMemo(() => timers.filter((t) => !t.completed), [timers]);
  const completedTimers = useMemo(() => timers.filter((t) => t.completed), [timers]);

  const handleComplete = (id: string) => {
    completeDJTimer(id);
    setTimers(getDJTimers());
    cloud.syncTimers();
    toast.success("DJ marcado como retirado!");
  };

  const handleDelete = (id: string) => {
    removeDJTimer(id);
    setTimers(getDJTimers());
    cloud.syncTimers();
    toast.success("Timer removido.");
  };

  const getDaysRemaining = (removalDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const removal = new Date(removalDate);
    removal.setHours(0, 0, 0, 0);
    return Math.ceil((removal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">
          <AlertTriangle className="w-3 h-3 mr-1" />
          ATRASADO {Math.abs(daysRemaining)}d
        </Badge>
      );
    }
    if (daysRemaining <= 3) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
          <Clock className="w-3 h-3 mr-1" />
          {daysRemaining}d restantes
        </Badge>
      );
    }
    return (
      <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">
        <Timer className="w-3 h-3 mr-1" />
        {daysRemaining}d restantes
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatBR(dateStr);
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
            <div className="w-8 h-8 rounded-lg bg-nilo-dark flex items-center justify-center border border-primary/30 shadow-sm">
              <BrandLogo className="h-4 w-auto" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Timers de Duplo J</h1>
              <p className="text-xs text-muted-foreground">{activeTimers.length} ativos</p>
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
              Ao registrar uma cirurgia com DJ, o timer aparecerá aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTimers.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                  Ativos ({activeTimers.length})
                </h2>
                <div className="space-y-3">
                  {activeTimers.map((timer) => {
                    const daysRemaining = getDaysRemaining(timer.removalDate);
                    return (
                      <Card key={timer.id} className="p-3 bg-card border-border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground">
                              {timer.patientName || "Paciente"}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              DJ {timer.lateralidade} — Inserido: {formatDate(timer.insertionDate)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Retirada prevista: {formatDate(timer.removalDate)}
                            </p>
                            <div className="mt-2">
                              {getStatusBadge(daysRemaining)}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-green-500/30 text-green-400 hover:bg-green-500/10"
                              onClick={() => handleComplete(timer.id)}
                              title="Marcar como retirado"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(timer.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {completedTimers.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Retirados ({completedTimers.length})
                </h2>
                <div className="space-y-2">
                  {completedTimers.map((timer) => (
                    <Card key={timer.id} className="p-3 bg-card/50 border-border/50 opacity-60">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm text-foreground line-through">
                            {timer.patientName || "Paciente"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            DJ {timer.lateralidade} — {formatDate(timer.insertionDate)} → {formatDate(timer.removalDate)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(timer.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
