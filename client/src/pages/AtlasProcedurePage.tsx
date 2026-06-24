// Atlas Cirúrgico — página de um procedimento
// Seções técnicas em accordion (markdown via Streamdown), galeria de figuras
// (cards informativos com legenda, descrição e termos de busca) e referências.

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrandLogo } from "@/components/BrandLogo";
import { AtlasLightbox } from "@/components/AtlasLightbox";
import {
  buildLightboxFigures,
  positionForFigure,
} from "@/lib/lightboxNav";
import {
  getAtlasEntry,
  atlasToProcedure,
  type AtlasFigure,
} from "@/data/atlasData";
import { procedures } from "@/data/procedures";
import { categoryMeta, evidenceBadge } from "@/lib/atlasMeta";
import {
  ArrowLeft,
  BookOpen,
  ImageIcon,
  Search,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Printer,
  ImagePlus,
  Maximize2,
} from "lucide-react";
import {
  clinicalKeySearchUrl,
  capesSearchUrl,
  openInNewTab,
} from "@/lib/atlasSearch";
import { exportAtlasPdf } from "@/lib/atlasPdf";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCallback, useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

type AtlasImage = {
  atlasId: string;
  figureIndex: number;
  url: string;
  credit: string;
  sourceUrl: string | null;
  mimeType: string | null;
};

export default function AtlasProcedurePage() {
  const params = useParams<{ id: string }>();
  const entry = params.id ? getAtlasEntry(params.id) : undefined;

  const linkedProcedureId = entry ? atlasToProcedure[entry.id] : undefined;
  const linkedProcedure = useMemo(
    () =>
      linkedProcedureId
        ? procedures.find((p) => p.id === linkedProcedureId)
        : undefined,
    [linkedProcedureId]
  );

  const { isAuthenticated, user } = useAuth();
  // Imagens reais (protegidas): só buscamos quando o usuário está logado.
  const { data: atlasImages } = trpc.atlas.images.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  const imageByIndex = useMemo(() => {
    const map = new Map<number, AtlasImage>();
    if (entry && atlasImages) {
      for (const img of atlasImages as AtlasImage[]) {
        if (img.atlasId === entry.id) map.set(img.figureIndex, img);
      }
    }
    return map;
  }, [entry, atlasImages]);

  // Lista de figuras que possuem imagem efetiva (banco protegido > estático),
  // usada para o lightbox em tela cheia. Guardamos também o índice original
  // da figura para mapear o clique no card à posição correta no lightbox.
  const lightboxFigures = useMemo(
    () => (entry ? buildLightboxFigures(entry.figures, imageByIndex) : []),
    [entry, imageByIndex]
  );

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // abre o lightbox a partir do índice ORIGINAL da figura clicada
  const openLightbox = useCallback(
    (figIndex: number) => {
      const pos = positionForFigure(lightboxFigures, figIndex);
      if (pos >= 0) {
        setLightboxIndex(pos);
        setLightboxOpen(true);
      }
    },
    [lightboxFigures]
  );

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Procedimento do Atlas não encontrado.
          </p>
          <Link href="/atlas">
            <Button variant="outline">Voltar ao Atlas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cat = categoryMeta(entry.category);
  const ev = evidenceBadge(entry.evidence);

  // a seção de referências é renderizada à parte, no final
  const refIndex = entry.sections.findIndex((s) =>
    s.title.toLowerCase().includes("refer")
  );
  const technicalSections = entry.sections.filter((_, i) => i !== refIndex);
  const referencesSection =
    refIndex >= 0 ? entry.sections[refIndex] : undefined;

  // abrir a primeira seção por padrão
  const defaultOpen = technicalSections.length > 0 ? "section-0" : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-md bg-background/90">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/atlas">
              <button
                className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150 shrink-0"
                title="Voltar ao Atlas"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{entry.icon}</span>
              <div className="min-w-0">
                <h1 className="text-sm font-bold truncate text-foreground">
                  {entry.name}
                </h1>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Atlas Cirúrgico
                </p>
              </div>
            </div>
            <div className="ml-auto w-8 h-8 rounded-lg bg-nilo-dark hidden sm:flex items-center justify-center border border-primary/30 shrink-0">
              <BrandLogo className="h-4 w-auto" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 max-w-4xl">
        {/* Cabeçalho do procedimento */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className={`text-[11px] ${cat.badgeClass}`}>
              {entry.category}
            </Badge>
            <Badge variant="outline" className={`text-[11px] ${ev.className}`}>
              {ev.label}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-tight">
            {entry.name}
          </h2>
          <Card className="p-3 mt-3 bg-primary/5 border-primary/20">
            <p className="text-xs text-foreground/80">
              <span className="font-semibold text-primary">Base de evidência:</span>{" "}
              {entry.evidence}
            </p>
          </Card>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {linkedProcedure && (
              <Link href={`/procedimento/${linkedProcedure.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Gerar documentos deste procedimento
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => {
                const imgs = Array.from(imageByIndex.values()).map((im) => ({
                  figureIndex: im.figureIndex,
                  url: im.url,
                  credit: im.credit,
                }));
                void exportAtlasPdf(entry, imgs);
                toast.success(
                  imgs.length > 0
                    ? "Preparando dossiê com imagens…"
                    : "Dossiê aberto para impressão/PDF"
                );
              }}
            >
              <Printer className="w-3.5 h-3.5" />
              Exportar PDF
            </Button>
            {user?.role === "admin" && (
              <Link href="/atlas/admin">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Gerenciar imagens
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Seções técnicas */}
        <section className="mb-8">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            Conteúdo técnico
          </h3>
          <Card className="bg-card border-border px-4">
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultOpen}
              className="w-full"
            >
              {technicalSections.map((section, i) => (
                <AccordionItem
                  key={i}
                  value={`section-${i}`}
                  className="border-border/60"
                >
                  <AccordionTrigger className="text-foreground hover:no-underline hover:text-primary text-[15px] font-semibold">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm prose-invert max-w-none prose-headings:text-primary prose-strong:text-foreground prose-a:text-primary prose-li:marker:text-primary/60 prose-p:text-foreground/85 prose-li:text-foreground/85 prose-table:text-foreground/85">
                      <Streamdown>{section.body}</Streamdown>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        {/* Galeria de figuras */}
        {entry.figures.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Figuras de referência ({entry.figures.length})
            </h3>
            <p className="text-[11px] text-muted-foreground mb-3">
              Sugestões de figuras didáticas. Use os termos de busca em inglês para
              localizar a ilustração em atlas, livros (ClinicalKey/VitalSource) ou
              artigos (Portal CAPES). Respeite os direitos autorais — uso educacional.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entry.figures.map((fig, i) => (
                <FigureCard
                  key={i}
                  fig={fig}
                  index={i + 1}
                  dbImage={imageByIndex.get(i)}
                  onOpenLightbox={() => openLightbox(i)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Referências */}
        {referencesSection && (
          <section className="mb-8">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              {referencesSection.title}
            </h3>
            <Card className="p-4 bg-card border-border">
              <div className="prose prose-sm prose-invert max-w-none prose-strong:text-foreground prose-a:text-primary prose-li:marker:text-primary/60 prose-p:text-foreground/80 prose-li:text-foreground/80">
                <Streamdown>{referencesSection.body}</Streamdown>
              </div>
            </Card>
          </section>
        )}

        <div className="flex justify-center pb-4">
          <Link href="/atlas">
            <Button
              variant="outline"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Atlas
            </Button>
          </Link>
        </div>
      </main>

      <AtlasLightbox
        figures={lightboxFigures}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      <footer className="border-t border-border/50 py-4">
        <div className="container">
          <p className="text-xs text-muted-foreground text-center">
            Dr. Felipe Bulhões — Urologista (Instituto D'Or) · Cirurgião Geral TCBC · CRM-SP 202.291
          </p>
        </div>
      </footer>
    </div>
  );
}

function FigureCard({
  fig,
  index,
  dbImage,
  onOpenLightbox,
}: {
  fig: AtlasFigure;
  index: number;
  dbImage?: AtlasImage;
  onOpenLightbox?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // se a imagem (quando houver) falhar ao carregar, cai no placeholder informativo
  const [imgError, setImgError] = useState(false);
  // Preferência: imagem real do banco (protegida) > imageUrl estático do dado.
  const effectiveUrl = dbImage?.url || fig.imageUrl;
  const effectiveCredit = dbImage?.credit || fig.credit;
  const effectiveSourceUrl = dbImage?.sourceUrl || fig.sourceUrl;
  const showImage = Boolean(effectiveUrl) && !imgError;

  const copyTerms = () => {
    navigator.clipboard
      .writeText(fig.searchTerms)
      .then(() => {
        setCopied(true);
        toast.success("Termos de busca copiados");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.error("Não foi possível copiar"));
  };

  return (
    <Card className="overflow-hidden bg-card border-border flex flex-col">
      {/* Espaço da imagem (placeholder informativo) */}
      {showImage ? (
        <button
          type="button"
          onClick={onOpenLightbox}
          className="group relative w-full aspect-video bg-nilo-dark overflow-hidden cursor-zoom-in"
          title="Ampliar imagem"
          aria-label={`Ampliar figura: ${fig.caption}`}
        >
          <img
            src={effectiveUrl}
            alt={fig.caption}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-2 right-2 w-7 h-7 rounded-md bg-background/70 backdrop-blur border border-border flex items-center justify-center text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </button>
      ) : (
        <div className="w-full aspect-video bg-nilo-dark/60 border-b border-border flex flex-col items-center justify-center text-muted-foreground/60 gap-1">
          <ImageIcon className="w-7 h-7" />
          <span className="text-[10px] uppercase tracking-wider">
            Figura {index}
          </span>
        </div>
      )}
      <div className="p-3 flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground leading-snug">
          {fig.caption}
        </p>
        {fig.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {fig.description}
          </p>
        )}
        {effectiveCredit && (
          <p className="text-[10px] text-muted-foreground/70 italic">
            Crédito: {effectiveCredit}
          </p>
        )}
        <div className="mt-1 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-primary/80 font-medium flex items-center gap-1">
              <Search className="w-3 h-3 shrink-0" />
              Buscar:
            </p>
            <p className="text-[11px] text-foreground/70 font-mono break-words">
              {fig.searchTerms}
            </p>
          </div>
          <button
            onClick={copyTerms}
            className="shrink-0 w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
            title="Copiar termos de busca"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-primary" />
            )}
          </button>
        </div>

        {/* Abrir busca direto nas plataformas (uso pessoal/educacional) */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => openInNewTab(clinicalKeySearchUrl(fig.searchTerms))}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
            title="Abrir estes termos no ClinicalKey (requer login institucional)"
          >
            <ExternalLink className="w-3 h-3" />
            ClinicalKey
          </button>
          <button
            onClick={() => openInNewTab(capesSearchUrl(fig.searchTerms))}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
            title="Abrir estes termos no Portal de Periódicos CAPES (login via CAFe)"
          >
            <ExternalLink className="w-3 h-3" />
            CAPES
          </button>
          {effectiveSourceUrl && (
            <button
              onClick={() => openInNewTab(effectiveSourceUrl!)}
              className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-card border border-border text-[10px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary transition-colors"
              title="Abrir a fonte original desta figura"
            >
              <ExternalLink className="w-3 h-3" />
              Fonte
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
