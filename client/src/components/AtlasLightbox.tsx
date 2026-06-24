// AtlasLightbox — visualizador de figuras cirúrgicas em tela cheia.
// Recebe a lista de figuras (que possuem imagem) e o índice ativo, permitindo
// navegar entre elas por botões e teclado (setas), fechar por ESC/backdrop/X,
// e exibe legenda, descrição, crédito e link da fonte.

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

export type LightboxFigure = {
  url: string;
  caption: string;
  description?: string;
  credit?: string;
  sourceUrl?: string | null;
};

export function AtlasLightbox({
  figures,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: {
  figures: LightboxFigure[];
  index: number;
  onIndexChange: (i: number) => void;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  // garante que o índice fique sempre dentro dos limites
  const total = figures.length;
  const safeIndex = total > 0 ? ((index % total) + total) % total : 0;
  const fig = figures[safeIndex];

  // estado de erro de carregamento da imagem ativa
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [safeIndex, open]);

  const goPrev = useCallback(() => {
    if (total > 1) onIndexChange((safeIndex - 1 + total) % total);
  }, [safeIndex, total, onIndexChange]);

  const goNext = useCallback(() => {
    if (total > 1) onIndexChange((safeIndex + 1) % total);
  }, [safeIndex, total, onIndexChange]);

  // navegação por teclado (setas) enquanto o lightbox está aberto
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goPrev, goNext]);

  if (!fig) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[96vw] sm:max-w-[92vw] md:max-w-5xl w-full p-0 bg-nilo-dark border-border overflow-hidden gap-0"
      >
        {/* títulos acessíveis (lidos por leitores de tela) */}
        <DialogTitle className="sr-only">{fig.caption}</DialogTitle>
        <DialogDescription className="sr-only">
          {fig.description || fig.caption}
        </DialogDescription>

        {/* botão fechar */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-background/70 backdrop-blur border border-border flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-background transition-colors duration-150"
          title="Fechar (Esc)"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* área da imagem */}
        <div className="relative flex items-center justify-center bg-black min-h-[40vh] max-h-[78vh]">
          {imgError ? (
            <div className="py-20 text-center text-muted-foreground/70 text-sm px-6">
              Não foi possível carregar esta imagem.
            </div>
          ) : (
            <img
              src={fig.url}
              alt={fig.caption}
              className="max-h-[78vh] w-auto max-w-full object-contain select-none"
              onError={() => setImgError(true)}
            />
          )}

          {/* setas de navegação */}
          {total > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 backdrop-blur border border-border flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-background transition-colors duration-150"
                title="Anterior (←)"
                aria-label="Figura anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 backdrop-blur border border-border flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-background transition-colors duration-150"
                title="Próxima (→)"
                aria-label="Próxima figura"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* rodapé com legenda/descrição/crédito */}
        <div className="p-4 border-t border-border bg-card/60 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-foreground leading-snug">
              {fig.caption}
            </p>
            {total > 1 && (
              <span className="shrink-0 text-[11px] font-mono text-muted-foreground/70 mt-0.5">
                {safeIndex + 1} / {total}
              </span>
            )}
          </div>
          {fig.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {fig.description}
            </p>
          )}
          {fig.credit && (
            <p className="text-[10px] text-muted-foreground/70 italic">
              Crédito: {fig.credit}
            </p>
          )}
          {fig.sourceUrl && (
            <a
              href={fig.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline w-fit"
            >
              <ExternalLink className="w-3 h-3" />
              Ver fonte original
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
