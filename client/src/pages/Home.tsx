// Identidade Visual: felipebulhoes.com (dark mode)
// Background: oklch(18% .04 247.3) | Card: oklch(22% .045 247.3)
// Primary/Accent: oklch(61.8% .117 60.4) = Cobre #B87333

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { procedures, categories } from "@/data/procedures";
import { procedureHasCalculator, searchCatalog } from "@/lib/catalogSearch";
import { getFavorites, toggleFavorite, getRecents, getDJTimers, getMostUsedDocuments } from "@/data/surgeryStore";
import { Search, Star, Clock, History, Timer, AlertTriangle, BookOpen, Calculator, X, FileText } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useCloudSync } from "@/hooks/useCloudSync";
import { CloudSyncMenu } from "@/components/CloudSyncMenu";

export default function Home() {
  const cloud = useCloudSync();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [calculatorsOnly, setCalculatorsOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recents = useMemo(() => getRecents(), []);
  const frequentDocuments = useMemo(() => getMostUsedDocuments(), []);
  const activeTimers = useMemo(() => getDJTimers().filter((t) => !t.completed), []);
  const calculatorCount = useMemo(
    () => procedures.filter(procedureHasCalculator).length,
    []
  );

  const filtered = useMemo(
    () => searchCatalog(procedures, { query: search, category: activeCategory, calculatorsOnly }),
    [search, activeCategory, calculatorsOnly]
  );

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const favoriteProcedures = useMemo(
    () => procedures.filter((p) => favorites.includes(p.id)),
    [favorites]
  );

  const recentProcedures = useMemo(
    () => recents.map((id) => procedures.find((p) => p.id === id)).filter(Boolean),
    [recents]
  );

  const handleToggleFavorite = (e: React.MouseEvent, procedureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isFav = toggleFavorite(procedureId);
    setFavorites(getFavorites());
    cloud.syncFavorites();
    toast.success(isFav ? "Adicionado aos favoritos" : "Removido dos favoritos");
  };

  const overdueTimers = activeTimers.filter((t) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const removal = new Date(t.removalDate);
    removal.setHours(0, 0, 0, 0);
    return removal.getTime() < today.getTime();
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-md bg-background/90">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-nilo-dark flex items-center justify-center border border-primary/30 shadow-sm">
                <BrandLogo className="h-5 w-auto" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-primary">
                  UroDocx
                </h1>
                <p className="text-xs text-muted-foreground">
                  Dr. Felipe Bulhões — Urologia & Andrologia
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CloudSyncMenu />
              <Link href="/atlas">
                <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150" title="Atlas Cirúrgico">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>
              <Link href="/timers">
                <button className="relative w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150" title="Timers DJ">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  {activeTimers.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center">
                      {activeTimers.length}
                    </span>
                  )}
                </button>
              </Link>
              <Link href="/historico">
                <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150" title="Histórico">
                  <History className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {/* Alert for overdue timers */}
        {overdueTimers.length > 0 && (
          <Link href="/timers">
            <Card className="p-3 mb-4 bg-destructive/10 border-destructive/30 cursor-pointer hover:bg-destructive/15 transition-colors">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive font-medium">
                  {overdueTimers.length} DJ{overdueTimers.length > 1 ? "s" : ""} com retirada atrasada!
                </p>
              </div>
            </Card>
          </Link>
        )}

        {/* Atlas entry banner */}
        {!search && !activeCategory && (
          <Link href="/atlas">
            <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
	                  <h2 className="text-base font-bold text-primary">Atlas Cirúrgico</h2>
	                  <p className="text-xs text-muted-foreground mt-0.5">
	                    Passo a passo técnico de {procedures.length} procedimentos — endourologia, oncologia, próstata, andrologia, imagem (USG/Doppler), estética genital e saúde do homem, baseado em evidências.
	                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {(favoriteProcedures.length > 0 || recentProcedures.length > 0 || frequentDocuments.length > 0) && !search && !activeCategory && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Acesso rápido
            </h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {favoriteProcedures.length > 0 && (
                <Card className="p-3 bg-card border-primary/20">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary"><Star className="h-3.5 w-3.5" />Favoritos</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {favoriteProcedures.slice(0, 6).map((proc) => (
                      <Link key={proc.id} href={`/procedimento/${proc.id}`}>
                        <span className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] text-foreground transition-colors hover:border-primary/40 hover:text-primary">{proc.icon} {proc.shortName}</span>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
              {recentProcedures.length > 0 && (
                <Card className="p-3 bg-card border-border">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><History className="h-3.5 w-3.5" />Recentes</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {recentProcedures.slice(0, 6).map((proc) => proc && (
                      <Link key={proc.id} href={`/procedimento/${proc.id}`}>
                        <span className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-1 text-[11px] text-foreground transition-colors hover:border-primary/40 hover:text-primary">{proc.icon} {proc.shortName}</span>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
              {frequentDocuments.length > 0 && (
                <Card className="p-3 bg-card border-border">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><FileText className="h-3.5 w-3.5" />Documentos mais usados</h3>
                  <div className="space-y-1.5">
                    {frequentDocuments.map((document) => {
                      const procedure = procedures.find((item) => item.id === document.procedureId);
                      return (
                        <Link key={document.key} href={`/procedimento/${document.procedureId}`}>
                          <span className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-2 py-1.5 text-[11px] transition-colors hover:border-primary/40">
                            <span className="min-w-0 truncate text-foreground">{document.documentLabel}<span className="text-muted-foreground"> · {procedure?.shortName ?? "Procedimento"}</span></span>
                            <span className="shrink-0 text-primary">{document.count}×</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          </section>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Pesquisar procedimento, categoria ou calculadora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-20 bg-card border-border h-11 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
            aria-label="Pesquisar no catálogo"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              title="Limpar pesquisa"
              aria-label="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ⌘/Ctrl K
            </kbd>
          )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            Pesquise por nome, abreviação, categoria ou campo clínico. {calculatorCount} calculadora{calculatorCount === 1 ? "" : "s"} disponíve{calculatorCount === 1 ? "l" : "is"}.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              activeCategory === null
                ? "bg-primary text-white"
                : "bg-card text-foreground/70 border border-border hover:border-primary/40 hover:text-primary"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setCalculatorsOnly((current) => !current)}
            aria-pressed={calculatorsOnly}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
              calculatorsOnly
                ? "bg-primary text-white"
                : "bg-card text-foreground/70 border border-border hover:border-primary/40 hover:text-primary"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculadoras
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-card text-foreground/70 border border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Procedure Grid */}
        {(search || activeCategory || calculatorsOnly) && (
          <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
            {filtered.length} resultado{filtered.length === 1 ? "" : "s"} encontrado{filtered.length === 1 ? "" : "s"}.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((procedure) => (
            <Link key={procedure.id} href={`/procedimento/${procedure.id}`}>
              <Card className="p-4 bg-card border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group relative">
                <button
                  onClick={(e) => handleToggleFavorite(e, procedure.id)}
                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
                  title={favorites.includes(procedure.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-colors ${
                      favorites.includes(procedure.id)
                        ? "text-primary fill-primary"
                        : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    }`}
                  />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-150">
                    {procedure.icon}
                  </div>
                  <div className="min-w-0 pr-6">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-150">
                      {procedure.shortName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {procedure.name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-primary/20 text-primary/80 bg-primary/5"
                      >
                        {procedure.category}
                      </Badge>
                      {procedureHasCalculator(procedure) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                        >
                          <Calculator className="mr-1 w-2.5 h-2.5" />
                          Calculadora
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhum procedimento encontrado.</p>
          </div>
        )}
      </main>

      {/* Footer */}
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
