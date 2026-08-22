import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { atlasEntries } from "@/data/atlasData";
import { searchAtlasGlobally, type AtlasGlobalResult, type AtlasGlobalResultKind } from "@/lib/atlasGlobalSearch";
import { AlertTriangle, BookOpen, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const kindMeta: Record<AtlasGlobalResultKind, { label: string; icon: typeof BookOpen; className: string }> = {
  procedure: { label: "Procedimento", icon: BookOpen, className: "text-primary" },
  complication: { label: "Complicação", icon: AlertTriangle, className: "text-amber-600" },
  section: { label: "Seção técnica", icon: FileText, className: "text-sky-500" },
  reference: { label: "Referência", icon: FileText, className: "text-muted-foreground" },
};

export function AtlasGlobalSearch() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchAtlasGlobally(atlasEntries, query), [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectResult = (result: AtlasGlobalResult) => {
    const hash = result.sectionIndex === null ? "" : `#section-${result.sectionIndex}`;
    setLocation(`/atlas/${result.entryId}${hash}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-10 gap-2 border-primary/40 bg-card/95 px-3 text-xs text-foreground shadow-lg backdrop-blur hover:bg-primary/10 sm:bottom-6 sm:right-6"
        aria-label="Abrir pesquisa global do Atlas"
      >
        <Search className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Buscar no Atlas</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">⌘K</kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Pesquisa global do Atlas"
        description="Localize procedimentos, seções técnicas, complicações e referências."
        className="max-w-2xl"
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Buscar procedimento, complicação, técnica ou referência…"
          autoFocus
        />
        <CommandList>
          <CommandEmpty>Nenhum conteúdo correspondente foi encontrado.</CommandEmpty>
          <CommandGroup heading={query.trim() ? "Resultados" : "Procedimentos do Atlas"}>
            {results.map((result) => {
              const meta = kindMeta[result.kind];
              const Icon = meta.icon;
              return (
                <CommandItem
                  key={result.key}
                  value={`${result.entryName} ${result.sectionTitle ?? ""} ${result.summary}`}
                  onSelect={() => selectResult(result)}
                  className="items-start py-3"
                >
                  <Icon className={`mt-0.5 h-4 w-4 ${meta.className}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{result.entryName}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${meta.className}`}>{meta.label}</span>
                    </div>
                    {result.sectionTitle && <p className="mt-0.5 text-xs font-medium text-foreground/85">{result.sectionTitle}</p>}
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{result.summary}</p>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-muted-foreground">
            <span>Inclui títulos, conteúdo técnico, complicações e referências.</span>
            <CommandShortcut>↵ abrir</CommandShortcut>
          </div>
        </CommandList>
      </CommandDialog>
    </>
  );
}
