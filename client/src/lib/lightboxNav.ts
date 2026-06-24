// Lógica pura de navegação do lightbox de figuras do Atlas, extraída para
// permitir cobertura por testes sem depender de React/DOM.

export type FigureLike = {
  imageUrl?: string;
  caption: string;
  description?: string;
  credit?: string;
  sourceUrl?: string | null;
};

export type DbImageLike = {
  url: string;
  credit?: string;
  sourceUrl?: string | null;
};

export type LightboxItem = {
  figIndex: number;
  url: string;
  caption: string;
  description?: string;
  credit?: string;
  sourceUrl?: string | null;
};

/**
 * Constrói a lista de figuras que possuem imagem efetiva, preferindo a imagem
 * protegida do banco (dbImage) sobre a imageUrl estática. Mantém o índice
 * original da figura (figIndex) para mapear cliques.
 */
export function buildLightboxFigures(
  figures: FigureLike[],
  dbByIndex: Map<number, DbImageLike> = new Map()
): LightboxItem[] {
  const list: LightboxItem[] = [];
  figures.forEach((f, i) => {
    const db = dbByIndex.get(i);
    const url = db?.url || f.imageUrl;
    if (url) {
      list.push({
        figIndex: i,
        url,
        caption: f.caption,
        description: f.description,
        credit: db?.credit || f.credit,
        sourceUrl: db?.sourceUrl ?? f.sourceUrl ?? null,
      });
    }
  });
  return list;
}

/** Normaliza um índice para o intervalo [0, total) de forma circular. */
export function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

/** Próximo índice circular. */
export function nextIndex(index: number, total: number): number {
  return wrapIndex(index + 1, total);
}

/** Índice anterior circular. */
export function prevIndex(index: number, total: number): number {
  return wrapIndex(index - 1, total);
}

/** Posição no lightbox correspondente ao índice ORIGINAL da figura clicada. */
export function positionForFigure(
  items: LightboxItem[],
  figIndex: number
): number {
  return items.findIndex((l) => l.figIndex === figIndex);
}
