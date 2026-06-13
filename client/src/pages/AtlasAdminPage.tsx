// Painel administrativo do Atlas Cirúrgico — upload de imagens reais por figura.
// Acesso restrito a admin (role === 'admin'). As imagens ficam protegidas por login.

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/BrandLogo";
import { atlasEntries, type AtlasEntry } from "@/data/atlasData";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  ImageIcon,
  Lock,
  Check,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB por imagem

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AtlasAdminPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [entryId, setEntryId] = useState<string>(atlasEntries[0]?.id ?? "");

  const entry: AtlasEntry | undefined = useMemo(
    () => atlasEntries.find((e) => e.id === entryId),
    [entryId]
  );

  const utils = trpc.useUtils();
  const { data: images } = trpc.atlas.images.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const imageByKey = useMemo(() => {
    const map = new Map<string, { url: string; credit: string; sourceUrl: string | null }>();
    if (images) {
      for (const img of images) {
        if (img.atlasId === entryId) {
          map.set(`${img.figureIndex}`, {
            url: img.url,
            credit: img.credit,
            sourceUrl: img.sourceUrl,
          });
        }
      }
    }
    return map;
  }, [images, entryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="p-8 max-w-md text-center bg-card border-border">
          <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-foreground mb-2">
            Área administrativa
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            O envio de imagens do Atlas é restrito ao administrador do portal.
            {!isAuthenticated && " Faça login para continuar."}
          </p>
          <div className="flex gap-2 justify-center">
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button className="gap-2">Entrar</Button>
              </a>
            )}
            <Link href="/atlas">
              <Button variant="outline">Voltar ao Atlas</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="container py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo className="h-7 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                Atlas — Gestão de imagens
              </p>
              <p className="text-[11px] text-muted-foreground">
                Conteúdo protegido · uso pessoal/educacional
              </p>
            </div>
          </div>
          <Link href="/atlas">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Atlas
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-6 max-w-3xl">
        <div className="mb-5">
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Procedimento
          </Label>
          <select
            value={entryId}
            onChange={(e) => setEntryId(e.target.value)}
            className="w-full h-10 rounded-md bg-card border border-border px-3 text-sm text-foreground"
          >
            {atlasEntries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {entry && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {entry.figures.length} figura(s). Envie uma imagem real (atlas/artigo) com o
              crédito completo. As imagens só são exibidas para usuários autenticados.
            </p>
            {entry.figures.map((fig, i) => (
              <FigureUploader
                key={i}
                atlasId={entry.id}
                figureIndex={i}
                caption={fig.caption}
                searchTerms={fig.searchTerms}
                current={imageByKey.get(`${i}`)}
                onChanged={() => utils.atlas.images.invalidate()}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FigureUploader({
  atlasId,
  figureIndex,
  caption,
  searchTerms,
  current,
  onChanged,
}: {
  atlasId: string;
  figureIndex: number;
  caption: string;
  searchTerms: string;
  current?: { url: string; credit: string; sourceUrl: string | null };
  onChanged: () => void;
}) {
  const [credit, setCredit] = useState(current?.credit ?? "");
  const [sourceUrl, setSourceUrl] = useState(current?.sourceUrl ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const upload = trpc.atlas.uploadImage.useMutation();
  const remove = trpc.atlas.deleteImage.useMutation();

  const onSelect = async (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error("Imagem muito grande (máx. 8 MB).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSend = async () => {
    if (!file) {
      toast.error("Selecione uma imagem.");
      return;
    }
    if (!credit.trim()) {
      toast.error("Informe o crédito da fonte.");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      await upload.mutateAsync({
        atlasId,
        figureIndex,
        base64,
        mimeType: file.type || "image/jpeg",
        credit: credit.trim(),
        sourceUrl: sourceUrl.trim() || null,
        ext: (file.name.split(".").pop() || "").toLowerCase() || undefined,
      });
      toast.success("Imagem enviada.");
      setFile(null);
      setPreview(null);
      onChanged();
    } catch {
      toast.error("Falha ao enviar a imagem.");
    }
  };

  const onRemove = async () => {
    try {
      await remove.mutateAsync({ atlasId, figureIndex });
      toast.success("Imagem removida.");
      setPreview(null);
      setFile(null);
      onChanged();
    } catch {
      toast.error("Falha ao remover.");
    }
  };

  const shownImage = preview || current?.url;

  return (
    <Card className="p-3 bg-card border-border">
      <div className="flex items-start gap-2 mb-2">
        <Badge variant="outline" className="border-primary/30 text-primary shrink-0">
          Fig. {figureIndex + 1}
        </Badge>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{caption}</p>
          <p className="text-[11px] text-muted-foreground font-mono break-words">
            {searchTerms}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
        <div className="w-full aspect-video rounded-md overflow-hidden bg-nilo-dark/60 border border-border flex items-center justify-center">
          {shownImage ? (
            <img
              src={shownImage}
              alt={caption}
              className="w-full h-full object-contain"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          <Input
            placeholder="Crédito (autor, obra/artigo, ano, editora)"
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            className="text-xs"
          />
          <Input
            placeholder="Fonte (URL/DOI) — opcional"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="text-xs"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onSend}
              disabled={upload.isPending}
              className="gap-1.5"
            >
              {upload.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Enviar
            </Button>
            {current && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRemove}
                disabled={remove.isPending}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                {remove.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Remover
              </Button>
            )}
            {current && !preview && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <Check className="w-3.5 h-3.5" /> com imagem
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
