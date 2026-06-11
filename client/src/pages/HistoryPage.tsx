import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHistory, removeFromHistory, clearHistory, type SurgeryRecord } from "@/data/surgeryStore";
import { procedures } from "@/data/procedures";
import { ArrowLeft, Trash2, Search, Calendar, User, ClipboardList, FileSpreadsheet, FileDown } from "lucide-react";
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

export default function HistoryPage() {
  const cloud = useCloudSync();
  const [history, setHistory] = useState<SurgeryRecord[]>(getHistory());
  const [search, setSearch] = useState("");
  const [clearOpen, setClearOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return history;
    const q = search.toLowerCase();
    return history.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.procedureName.toLowerCase().includes(q) ||
        r.date.includes(q)
    );
  }, [history, search]);

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
    if (history.length === 0) return;
    try {
      exportHistoryCSV(history);
      toast.success("CSV exportado.");
    } catch {
      toast.error("Falha ao exportar CSV.");
    }
  };

  const handleExportPDF = () => {
    if (history.length === 0) return;
    try {
      exportHistoryPDF(history);
    } catch (err) {
      if (err instanceof Error && err.message === "popup-blocked") {
        toast.error("Permita pop-ups para gerar o PDF.");
      } else {
        toast.error("Falha ao gerar PDF.");
      }
    }
  };

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
              <p className="text-xs text-muted-foreground">{history.length} registros</p>
            </div>
            {history.length > 0 && (
              <div className="ml-auto flex items-center gap-1.5">
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
        {history.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, procedimento ou data..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border h-10 text-foreground placeholder:text-muted-foreground text-sm"
            />
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
