// Modelos de prescrição personalizáveis por procedimento.
// Permite salvar a receita atual como modelo, aplicar, favoritar, editar nome e excluir.

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  BookMarked,
  Star,
  Trash2,
  Plus,
  Check,
  Pencil,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  getTemplatesForProcedure,
  saveTemplate,
  updateTemplate,
  toggleTemplateFavorite,
  deleteTemplate,
  type PrescriptionTemplate,
} from "@/data/prescriptionTemplates";

interface Props {
  procedureId: string;
  /** Current rendered text of the prescription tab (to save as a new model). */
  currentContent: string;
  /** Apply a template's content into the active document (sets edited text). */
  onApply: (content: string) => void;
  /** Notify parent so it can push templates to the cloud. */
  onChange?: () => void;
}

export function PrescriptionTemplates({
  procedureId,
  currentContent,
  onApply,
  onChange,
}: Props) {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>(() =>
    getTemplatesForProcedure(procedureId)
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTemplates(getTemplatesForProcedure(procedureId));
    onChange?.();
  }, [procedureId, onChange]);

  const handleSave = useCallback(() => {
    const name = newName.trim();
    if (!name) {
      toast.error("Digite um nome para o modelo.");
      return;
    }
    if (!currentContent.trim()) {
      toast.error("A receita está vazia.");
      return;
    }
    saveTemplate({ procedureId, name, content: currentContent });
    setNewName("");
    setSaveOpen(false);
    refresh();
    toast.success(`Modelo "${name}" salvo.`);
  }, [newName, currentContent, procedureId, refresh]);

  const handleApply = useCallback(
    (t: PrescriptionTemplate) => {
      onApply(t.content);
      toast.success(`Modelo "${t.name}" aplicado.`);
    },
    [onApply]
  );

  const handleToggleFav = useCallback(
    (id: string) => {
      toggleTemplateFavorite(id);
      refresh();
    },
    [refresh]
  );

  const handleRename = useCallback(() => {
    if (!renameId) return;
    const name = renameValue.trim();
    if (!name) {
      toast.error("O nome não pode ficar vazio.");
      return;
    }
    updateTemplate(renameId, { name });
    setRenameId(null);
    setRenameValue("");
    refresh();
    toast.success("Modelo renomeado.");
  }, [renameId, renameValue, refresh]);

  const handleOverwrite = useCallback(
    (t: PrescriptionTemplate) => {
      updateTemplate(t.id, { content: currentContent });
      refresh();
      toast.success(`Modelo "${t.name}" atualizado com o texto atual.`);
    },
    [currentContent, refresh]
  );

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteTemplate(deleteId);
    setDeleteId(null);
    refresh();
    toast.info("Modelo removido.");
  }, [deleteId, refresh]);

  return (
    <div className="px-3 py-2.5 border-b border-border bg-[oklch(20%_.04_247.3)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-primary flex items-center gap-1.5">
          <BookMarked className="w-3.5 h-3.5" />
          Meus modelos de prescrição
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => setSaveOpen(true)}
        >
          <Plus className="w-3 h-3" />
          Salvar atual
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="text-[10px] text-muted-foreground py-1">
          Nenhum modelo salvo para este procedimento. Edite a receita ao seu
          gosto e clique em "Salvar atual".
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-0.5 rounded-md border border-border bg-card pl-1"
            >
              <button
                onClick={() => handleToggleFav(t.id)}
                title={t.favorite ? "Remover dos favoritos" : "Favoritar"}
                className="w-5 h-5 flex items-center justify-center"
              >
                <Star
                  className={`w-3 h-3 transition-colors ${
                    t.favorite
                      ? "text-primary fill-primary"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                />
              </button>
              <button
                onClick={() => handleApply(t)}
                className="text-[10px] px-1.5 py-1 text-foreground hover:text-primary transition-colors max-w-[160px] truncate"
                title={`Aplicar "${t.name}"`}
              >
                {t.name}
              </button>
              <button
                onClick={() => handleOverwrite(t)}
                title="Atualizar este modelo com o texto atual"
                className="w-5 h-5 flex items-center justify-center text-muted-foreground/50 hover:text-green-400 transition-colors"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setRenameId(t.id);
                  setRenameValue(t.name);
                }}
                title="Renomear"
                className="w-5 h-5 flex items-center justify-center text-muted-foreground/50 hover:text-primary transition-colors"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDeleteId(t.id)}
                title="Excluir modelo"
                className="w-5 h-5 flex items-center justify-center text-red-400/50 hover:text-red-400 transition-colors mr-0.5"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save new template dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Salvar modelo de prescrição
            </DialogTitle>
            <DialogDescription>
              O texto atual da receita (incluindo suas edições) será salvo como
              um modelo reutilizável para este procedimento.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do modelo (ex: Receita padrão pós-RTU)"
            className="bg-secondary border-border text-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleSave}
            >
              Salvar modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={renameId !== null}
        onOpenChange={(open) => !open && setRenameId(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Renomear modelo</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="bg-secondary border-border text-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleRename}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir modelo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O modelo será removido deste
              dispositivo e da nuvem na próxima sincronização.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
