// Atlas Cirúrgico — índice por categoria
// Identidade visual: azul petróleo (background/card) + cobre (primary) + Roboto + isótipo FB

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/BrandLogo";
import {
  atlasEntries,
  atlasGroupedByCategory,
  type AtlasEntry,
} from "@/data/atlasData";
import { categoryMeta, evidenceBadge } from "@/lib/atlasMeta";
import { ArrowLeft, BookOpen, Search, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function AtlasIndexPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const groups = useMemo(() => atlasGroupedByCategory(), []);
  const categories = useMemo(() => groups.map((g) => g.category), [groups]);

  const term = search.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return groups
      .filter((g) => activeCategory === null || g.category === activeCategory)
      .map((g) => ({
        category: g.category,
        entries: g.entries.filter((e) => {
          if (term === "") return true;
          return (
            e.name.toLowerCase().includes(term) ||
            e.category.toLowerCase().includes(term) ||
            e.evidence.toLowerCase().includes(term)
          );
        }),
      }))
      .filter((g) => g.entries.length > 0);
  }, [groups, activeCategory, term]);

  const totalShown = filteredGroups.reduce((acc, g) => acc + g.entries.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-md bg-background/90">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/">
                <button
                  className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150 shrink-0"
                  title="Voltar ao início"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
              </Link>
              <div className="w-10 h-10 rounded-lg bg-nilo-dark flex items-center justify-center border border-primary/30 shadow-sm shrink-0">
                <BrandLogo className="h-5 w-auto" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Atlas Cirúrgico
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Passo a passo técnico baseado em evidências — uso educacional
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {/* Intro */}
        <Card className="p-4 mb-6 bg-card border-border">
          <p className="text-sm text-foreground/80 leading-relaxed">
            Coletânea técnica de {atlasEntries.length} procedimentos de andrologia,
            estética genital, saúde do homem, oncologia e urgência. Cada procedimento
            reúne indicações, anatomia, passo a passo detalhado, complicações,
            desfechos e referências, com sugestões de figuras didáticas.
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">
            Fontes priorizadas: EAU, AUA, SBU, ISSM e Campbell-Walsh-Wein (13ª ed.).
            Material de apoio à prática — não substitui o julgamento clínico individual.
          </p>
        </Card>

        {/* Busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar procedimento, categoria ou evidência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border h-11 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        {/* Filtros de categoria */}
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

        {/* Grupos */}
        {filteredGroups.map((group) => (
          <section key={group.category} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">
                {group.category}
              </h2>
              <span className="text-[10px] text-muted-foreground">
                ({group.entries.length})
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.entries.map((entry) => (
                <AtlasCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))}

        {totalShown === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhum procedimento encontrado.</p>
          </div>
        )}
      </main>

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

function AtlasCard({ entry }: { entry: AtlasEntry }) {
  const cat = categoryMeta(entry.category);
  const ev = evidenceBadge(entry.evidence);
  return (
    <Link href={`/atlas/${entry.id}`}>
      <Card className="p-4 h-full bg-card border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group flex flex-col">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-150">
            {entry.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-150 leading-snug">
              {entry.name}
            </h3>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <Badge
            variant="outline"
            className={`text-[10px] ${cat.badgeClass}`}
          >
            {cat.shortLabel ?? entry.category}
          </Badge>
          <Badge variant="outline" className={`text-[10px] ${ev.className}`}>
            {ev.label}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
