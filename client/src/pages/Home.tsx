// Identidade Visual: felipebulhoes.com (dark mode)
// Background: oklch(18% .04 247.3) | Card: oklch(22% .045 247.3)
// Primary/Accent: oklch(61.8% .117 60.4) = Cobre #B87333

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { procedures, categories } from "@/data/procedures";
import { getFavorites, toggleFavorite, getRecents, getDJTimers } from "@/data/surgeryStore";
import { Search, Star, Clock, History, Timer, AlertTriangle, BookOpen } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useCloudSync } from "@/hooks/useCloudSync";
import { CloudSyncMenu } from "@/components/CloudSyncMenu";

export default function Home() {
  const cloud = useCloudSync();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const recents = useMemo(() => getRecents(), []);
  const activeTimers = useMemo(() => getDJTimers().filter((t) => !t.completed), []);

  const filtered = useMemo(() => {
    return procedures.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.shortName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === null || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

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
                    Passo a passo técnico de 55 procedimentos — endourologia, oncologia, próstata, andrologia, estética genital e saúde do homem, baseado em evidências.
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Favorites */}
        {favoriteProcedures.length > 0 && !search && !activeCategory && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              Favoritos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {favoriteProcedures.map((proc) => (
                <Link key={proc.id} href={`/procedimento/${proc.id}`}>
                  <Card className="p-2.5 bg-card border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{proc.icon}</span>
                      <span className="text-xs font-medium text-foreground truncate">{proc.shortName}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recents */}
        {recentProcedures.length > 0 && !search && !activeCategory && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Recentes
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentProcedures.map((proc) => proc && (
                <Link key={proc.id} href={`/procedimento/${proc.id}`}>
                  <Card className="p-2 px-3 bg-card border-border hover:border-primary/30 transition-all duration-150 cursor-pointer whitespace-nowrap">
                    <span className="text-xs text-foreground">{proc.icon} {proc.shortName}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar procedimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border h-11 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
          />
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
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] border-primary/20 text-primary/80 bg-primary/5"
                    >
                      {procedure.category}
                    </Badge>
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
