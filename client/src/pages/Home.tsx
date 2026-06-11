// Identidade Visual Oficial: Dr. Felipe de Bulhões (Agência POD)
// Azul do Nilo #1C3D5A (fundo) + Cobre #B87333 (accent)
// Dark mode premium, institucional, sofisticado
// Referência: felipebulhoes.com

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header — Azul do Nilo mais escuro */}
      <header className="border-b border-border bg-nilo-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-copper/15 flex items-center justify-center border border-copper/30">
                <Stethoscope className="w-5 h-5 text-copper" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-copper font-[family-name:var(--font-heading)]">
                  UroDocx
                </h1>
                <p className="text-xs text-foreground/60">
                  Dr. Felipe Bulhões — Urologia & Andrologia
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex text-xs text-copper border-copper/30 bg-copper/10 font-medium">
              IDOR · TCBC
            </Badge>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Buscar procedimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-nilo-dark/50 border-border h-11 text-foreground placeholder:text-foreground/40 focus:border-copper/50 focus:ring-copper/20"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              activeCategory === null
                ? "bg-copper text-white shadow-sm shadow-copper/20"
                : "bg-secondary text-secondary-foreground hover:bg-copper/15 hover:text-copper"
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
                  ? "bg-copper text-white shadow-sm shadow-copper/20"
                  : "bg-secondary text-secondary-foreground hover:bg-copper/15 hover:text-copper"
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
              <Card
                className="p-4 bg-card border-border hover:border-copper/40 hover:shadow-lg hover:shadow-copper/5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center text-lg shrink-0 group-hover:bg-copper/20 group-hover:scale-105 transition-all duration-150">
                    {procedure.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-copper transition-colors duration-150">
                      {procedure.shortName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {procedure.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] border-copper/20 text-copper/80"
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
      <footer className="border-t border-border py-4 bg-nilo-dark/50">
        <div className="container">
          <p className="text-xs text-foreground/50 text-center">
            Dr. Felipe Bulhões — Urologista (Instituto D'Or) · Cirurgião Geral TCBC · CRM-SP 202.291
          </p>
        </div>
      </footer>
    </div>
  );
}
