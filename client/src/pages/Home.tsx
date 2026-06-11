// Design: "Dark Clinical Dashboard — Surgical Command Center"
// Typography: Space Grotesk (headings) + Inter (body)
// Colors: Dark bg (#0F1419), cyan accent (#58A6FF), amber alerts

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { procedures, categories } from "@/data/procedures";
import { Search, Stethoscope } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight font-[family-name:var(--font-heading)]">
                  UroDocx
                </h1>
                <p className="text-xs text-muted-foreground">
                  Dr. Felipe Bulhões — Urologia / Andrologia
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex text-xs text-muted-foreground border-border/50">
              IDOR / TCBC
            </Badge>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar procedimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border/50 h-11"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Procedure Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((procedure, index) => (
            <Link key={procedure.id} href={`/procedimento/${procedure.id}`}>
              <Card
                className="p-4 bg-card border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform duration-150">
                    {procedure.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-150 font-[family-name:var(--font-heading)]">
                      {procedure.shortName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {procedure.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] border-border/50 text-muted-foreground"
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
            Dr. Felipe Bulhões — Urologista (Instituto D'Or) · Cirurgião Geral TCBC · Foco em Andrologia
          </p>
        </div>
      </footer>
    </div>
  );
}
