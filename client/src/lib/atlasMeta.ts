// Metadados visuais do Atlas Cirúrgico — cores e rótulos por categoria,
// e badge de nível de evidência derivado do texto de evidência da entrada.

export interface CategoryMeta {
  /** Classe de cor para o badge/realce da categoria (Tailwind). */
  badgeClass: string;
  /** Rótulo curto opcional para exibição compacta. */
  shortLabel?: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Andrologia / Fertilidade": {
    badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    shortLabel: "Fertilidade",
  },
  "Andrologia / Prótese": {
    badgeClass: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    shortLabel: "Prótese",
  },
  "Andrologia / Peyronie": {
    badgeClass: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
    shortLabel: "Peyronie",
  },
  "Andrologia / Estética": {
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    shortLabel: "Estética",
  },
  "Estética Genital": {
    badgeClass: "bg-pink-500/10 text-pink-300 border-pink-500/30",
  },
  "Saúde do Homem": {
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  Oncologia: {
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  Urgência: {
    badgeClass: "bg-red-500/10 text-red-300 border-red-500/30",
  },
};

const DEFAULT_CATEGORY_META: CategoryMeta = {
  badgeClass: "bg-primary/10 text-primary border-primary/30",
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? DEFAULT_CATEGORY_META;
}

export interface EvidenceBadge {
  label: string;
  className: string;
}

/**
 * Classifica o grau de evidência a partir do texto livre de evidência.
 * Prioridade: Grade A / Nível 1 (forte) > Grade B / Nível 2 > Grade C / Nível 3-4
 * > Diretriz de sociedade / livro-texto (consenso/opinião de especialista).
 */
export function evidenceBadge(evidence: string): EvidenceBadge {
  const t = (evidence || "").toLowerCase();

  const strong =
    /grade a\b/.test(t) ||
    /n[ií]vel 1/.test(t) ||
    /n[ií]vel\s*1a/.test(t) ||
    /meta-?an[aá]lise/.test(t) ||
    /revis[aã]o sistem[aá]tica/.test(t) ||
    /ensaio cl[ií]nico randomizado|rct\b/.test(t);

  const moderate =
    /grade b\b/.test(t) ||
    /n[ií]vel 2/.test(t) ||
    /coorte|caso-?controle/.test(t);

  const limited =
    /grade c\b/.test(t) ||
    /n[ií]vel 3|n[ií]vel 4/.test(t) ||
    /s[eé]rie de casos|relato de caso/.test(t);

  if (strong) {
    return {
      label: "Evidência alta",
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    };
  }
  if (moderate) {
    return {
      label: "Evidência moderada",
      className: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    };
  }
  if (limited) {
    return {
      label: "Evidência limitada",
      className: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    };
  }
  // Diretrizes de sociedade / livros-texto / consenso
  return {
    label: "Diretriz / consenso",
    className: "bg-slate-400/15 text-slate-300 border-slate-400/40",
  };
}
