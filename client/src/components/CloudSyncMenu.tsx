import { useCloudSync, type SyncConflict } from "@/hooks/useCloudSync";
import { getLoginUrl } from "@/const";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertTriangle,
  LogIn,
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

/**
 * Header control that shows cloud sync status, a manual "Sincronizar agora"
 * button, and a conflict-resolution dialog when the same record diverges
 * between this device and the cloud.
 */
export function CloudSyncMenu() {
  const cloud = useCloudSync();
  const [open, setOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);

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

  // Not authenticated → invite to log in for cross-device backup.
  if (!cloud.isAuthenticated) {
    return (
      <button
        onClick={() => (window.location.href = getLoginUrl())}
        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150"
        title="Entrar para sincronizar na nuvem"
      >
        <CloudOff className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  const StatusIcon = () => {
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
            title="Sincronização na nuvem"
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
                Sincronização na nuvem
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Última sincronização: {formatTime(cloud.lastSyncedAt)}
              </p>
            </div>

            {hasConflicts && (
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

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Seus dados ficam salvos neste aparelho e são copiados para a nuvem
              quando você está conectado, permitindo acesso em outros
              dispositivos.
            </p>
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
    </>
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
