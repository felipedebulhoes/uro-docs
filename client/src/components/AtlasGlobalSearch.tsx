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
import {
  filterAtlasGlobalResults,
  searchAtlasGlobally,
  type AtlasGlobalResult,
  type AtlasGlobalResultFilter,
  type AtlasGlobalResultKind,
} from "@/lib/atlasGlobalSearch";
import {
  appendRecentSearch,
  ATLAS_FAVORITE_RESULTS_KEY,
  ATLAS_RECENT_SEARCHES_KEY,
  clearFavoriteResults,
  clearRecentSearches,
  parseStoredFavorites,
  parseStoredSearches,
  toggleFavoriteResult,
} from "@/lib/atlasSearchHistory";
import { AlertTriangle, BookOpen, Clock3, Copy, FileText, Search, Star, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const kindMeta: Record<AtlasGlobalResultKind, { label: string; icon: typeof BookOpen; className: string }> = {
  procedure: { label: "Procedimento", icon: BookOpen, className: "text-primary" },
  complication: { label: "Complicação", icon: AlertTriangle, className: "text-amber-600" },
  section: { label: "Seção técnica", icon: FileText, className: "text-sky-500" },
  reference: { label: "Referência", icon: FileText, className: "text-muted-foreground" },
};

const resultFilters: { value: AtlasGlobalResultFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "procedure", label: "Procedimentos" },
  { value: "section", label: "Técnica" },
  { value: "complication", label: "Complicações" },
  { value: "reference", label: "Referências" },
];

export function AtlasGlobalSearch() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState<AtlasGlobalResultFilter>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<AtlasGlobalResult[]>([]);
  const results = useMemo(() => searchAtlasGlobally(atlasEntries, query), [query]);
  const visibleResults = useMemo(() => filterAtlasGlobalResults(results, resultFilter), [resultFilter, results]);

  useEffect(() => {
    setRecentSearches(parseStoredSearches(window.localStorage.getItem(ATLAS_RECENT_SEARCHES_KEY)));
    setFavorites(parseStoredFavorites(window.localStorage.getItem(ATLAS_FAVORITE_RESULTS_KEY)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ATLAS_RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    window.localStorage.setItem(ATLAS_FAVORITE_RESULTS_KEY, JSON.stringify(favorites));
  }, [favorites]);

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
    setRecentSearches((current) => appendRecentSearch(current, query));
    setLocation(`/atlas/${result.entryId}${hash}`);
    setOpen(false);
    setQuery("");
  };

  const copyResultLink = async (event: React.MouseEvent<HTMLButtonElement>, result: AtlasGlobalResult) => {
    event.preventDefault();
    event.stopPropagation();
    const hash = result.sectionIndex === null ? "" : `#section-${result.sectionIndex}`;
    await navigator.clipboard?.writeText(`${window.location.origin}/atlas/${result.entryId}${hash}`);
  };

  const updateFavorite = (event: React.MouseEvent<HTMLButtonElement>, result: AtlasGlobalResult) => {
    event.preventDefault();
    event.stopPropagation();
    setFavorites((current) => toggleFavoriteResult(current, result));
  };

  const renderResult = (result: AtlasGlobalResult, inFavorites = false) => {
    const meta = kindMeta[result.kind];
    const Icon = meta.icon;
    const isFavorite = favorites.some((item) => item.key === result.key);
    return (
      <CommandItem
        key={result.key}
        value={`${result.entryName} ${result.sectionTitle ?? ""} ${result.summary}`}
        onSelect={() => selectResult(result)}
        className="items-start py-3"
      >
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.className}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{result.entryName}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${meta.className}`}>{meta.label}</span>
          </div>
          {result.sectionTitle && <p className="mt-0.5 text-xs font-medium text-foreground/85">{result.sectionTitle}</p>}
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{result.summary}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={(event) => updateFavorite(event, result)}
            aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
            title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-amber-500"
          >
            {inFavorites ? <X className="h-3.5 w-3.5" /> : <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />}
          </button>
          <button
            type="button"
            onClick={(event) => void copyResultLink(event, result)}
            aria-label="Copiar link direto para este conteúdo"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </CommandItem>
    );
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
        <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">
          {resultFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setResultFilter(filter.value)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                resultFilter === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <CommandList>
          <CommandEmpty>Nenhum conteúdo correspondente foi encontrado.</CommandEmpty>
          {!query.trim() && favorites.length > 0 && (
            <CommandGroup heading="Favoritos">
              {filterAtlasGlobalResults(favorites, resultFilter).map((result) => renderResult(result, true))}
              <CommandItem
                value="limpar favoritos"
                onSelect={() => setFavorites(clearFavoriteResults())}
                className="mt-1 border-t border-border text-destructive data-[selected=true]:bg-destructive/10 data-[selected=true]:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar favoritos</span>
              </CommandItem>
            </CommandGroup>
          )}
          {!query.trim() && recentSearches.length > 0 && (
            <CommandGroup heading="Buscas recentes">
              {recentSearches.map((recent) => (
                <CommandItem key={recent} value={recent} onSelect={() => setQuery(recent)}>
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <span>{recent}</span>
                </CommandItem>
              ))}
              <CommandItem
                value="limpar histórico"
                onSelect={() => setRecentSearches(clearRecentSearches())}
                className="mt-1 border-t border-border text-destructive data-[selected=true]:bg-destructive/10 data-[selected=true]:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar histórico</span>
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading={query.trim() ? "Resultados" : "Procedimentos do Atlas"}>
            {visibleResults.map((result) => renderResult(result))}
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
