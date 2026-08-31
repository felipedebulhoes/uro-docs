import { useCloudSync, type SyncConflict } from "@/hooks/useCloudSync";
import { getLoginUrl } from "@/const";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertTriangle,
  LogIn,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { clearLocalClinicalData } from "@/data/surgeryStore";

/**
 * Header control that shows cloud sync status, a manual "Sincronizar agora"
 * button, and a conflict-resolution dialog when the same record diverges
 * between this device and the cloud.
 */
export function CloudSyncMenu() {
  const cloud = useCloudSync();
  const [open, setOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const syncing = cloud.status === "syncing";
  const hasConflicts = cloud.conflicts.length > 0;

  const formatTime = (iso: string | null) => {
    if (!iso) return "nunca";
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const handleSyncNow = async () => {
    const res = await cloud.syncNow();
    if (!res.ok) {
      toast.error("Não foi possível sincronizar. Verifique a conexão.");
      return;
    }
    if (res.conflicts > 0) {
      toast.warning(
        `${res.conflicts} conflito(s) encontrado(s). Revise para resolver.`
      );
      setConflictOpen(true);
    } else {
      toast.success("Tudo sincronizado com a nuvem.");
    }
  };

  const StatusIcon = () => {
    if (!cloud.isAuthenticated)
      return <CloudOff className="w-4 h-4 text-muted-foreground" />;
    if (syncing)
      return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
    if (hasConflicts)
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (cloud.status === "offline")
      return <CloudOff className="w-4 h-4 text-muted-foreground" />;
    return <Cloud className="w-4 h-4 text-primary" />;
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="relative w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150"
            title={cloud.isAuthenticated ? "Sincronização na nuvem" : "Privacidade e sincronização"}
          >
            <StatusIcon />
            {hasConflicts && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                {cloud.conflicts.length}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 bg-card border-border">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {cloud.isAuthenticated ? "Sincronização na nuvem" : "Dados neste aparelho"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cloud.isAuthenticated
                  ? `Última sincronização: ${formatTime(cloud.lastSyncedAt)}`
                  : "Entre para manter um backup na nuvem."}
              </p>
            </div>

            {cloud.isAuthenticated && hasConflicts && (
              <button
                onClick={() => {
                  setOpen(false);
                  setConflictOpen(true);
                }}
                className="w-full flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-left transition-colors hover:bg-destructive/15"
              >
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <span className="text-xs text-destructive font-medium">
                  {cloud.conflicts.length} conflito(s) — clique para resolver
                </span>
              </button>
            )}

            {cloud.isAuthenticated ? (
              <Button
                onClick={handleSyncNow}
                disabled={syncing}
                className="w-full bg-primary text-white hover:bg-primary/90"
                size="sm"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {syncing ? "Sincronizando..." : "Sincronizar agora"}
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full bg-primary text-white hover:bg-primary/90"
                size="sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar para sincronizar
              </Button>
            )}

            <div className="rounded-md border border-amber-400/25 bg-amber-400/5 p-2.5">
              <div className="flex gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <div>
                  <p className="text-[11px] font-medium text-amber-100">Dispositivo compartilhado?</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    Dados clínicos ficam neste navegador. Ao terminar, apague os dados locais para reduzir a exposição indevida.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setPrivacyOpen(true);
                    }}
                    className="mt-2 text-[11px] font-medium text-primary hover:text-primary/80"
                  >
                    Revisar privacidade deste aparelho
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <ConflictDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        conflicts={cloud.conflicts}
        onResolve={(id, choice) => {
          cloud.resolveConflict(id, choice);
          toast.success("Conflito resolvido.");
        }}
        onResolveAll={(choice) => {
          cloud.resolveAll(choice);
          toast.success("Todos os conflitos foram resolvidos.");
          setConflictOpen(false);
        }}
      />
      <DevicePrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  );
}

function DevicePrivacyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleClear = () => {
    clearLocalClinicalData();
    setConfirming(false);
    onOpenChange(false);
    toast.success("Dados clínicos deste navegador foram apagados.");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) setConfirming(false);
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-md bg-card border-border text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
            Privacidade deste aparelho
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Use este recurso ao trabalhar em computador compartilhado ou ao encerrar um atendimento fora do seu dispositivo habitual.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            A exclusão remove deste navegador o histórico cirúrgico, os timers de Duplo J e os registros de uso de documentos. Favoritos e presets são mantidos por não conterem identificação do paciente.
          </p>
          <p>
            Após a exclusão, a restauração automática da nuvem fica pausada neste aparelho. Uma sincronização manual volta a baixar os dados da conta.
          </p>
        </div>
        {confirming ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
            <p className="text-xs font-medium text-destructive">Confirmar exclusão dos dados clínicos locais?</p>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>Cancelar</Button>
              <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleClear}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Apagar deste aparelho
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => setConfirming(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Apagar dados clínicos locais
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConflictDialog({
  open,
  onOpenChange,
  conflicts,
  onResolve,
  onResolveAll,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conflicts: SyncConflict[];
  onResolve: (id: string, choice: "local" | "cloud") => void;
  onResolveAll: (choice: "local" | "cloud") => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Resolver conflitos de sincronização
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Estes registros existem neste aparelho e na nuvem com conteúdo
            diferente. Escolha qual versão manter.
          </DialogDescription>
        </DialogHeader>

        {conflicts.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Check className="w-6 h-6 text-primary" />
            Nenhum conflito pendente.
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-border bg-background"
                  onClick={() => onResolveAll("local")}
                >
                  Manter todos deste aparelho
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-border bg-background"
                  onClick={() => onResolveAll("cloud")}
                >
                  Manter todos da nuvem
                </Button>
              </div>
            )}

            {conflicts.map((c) => (
              <div
                key={c.localId}
                className="rounded-lg border border-border bg-background p-3 space-y-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  {c.title}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-md border border-border p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Este aparelho
                    </p>
                    <p className="text-xs text-foreground/90 break-words">
                      {c.localSummary}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 w-full bg-primary text-white hover:bg-primary/90"
                      onClick={() => onResolve(c.localId, "local")}
                    >
                      Manter este
                    </Button>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <Cloud className="w-3 h-3" /> Nuvem
                    </p>
                    <p className="text-xs text-foreground/90 break-words">
                      {c.cloudSummary}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full border-border bg-background"
                      onClick={() => onResolve(c.localId, "cloud")}
                    >
                      Manter da nuvem
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Keep unused icon import tree-shaken-safe.
void LogIn;
