// Helpers para abrir os termos de busca de uma figura diretamente nas
// plataformas de referência do Dr. Felipe Bulhões (uso pessoal/educacional).

/**
 * ClinicalKey — busca de conteúdo (livros, atlas, imagens) por termos.
 * A plataforma exige login institucional; o link abre a página de resultados
 * já com a query preenchida.
 */
export function clinicalKeySearchUrl(terms: string): string {
  const q = encodeURIComponent(terms.trim());
  return `https://www.clinicalkey.com/#!/search/${q}`;
}

/**
 * Portal de Periódicos CAPES — busca no acervo por termos.
 * O acesso ao texto completo depende do login via CAFe (acionado pela própria
 * plataforma quando necessário).
 */
export function capesSearchUrl(terms: string): string {
  const q = encodeURIComponent(terms.trim());
  return `https://www.periodicos.capes.gov.br/index.php/acervo/buscador.html?q=${q}`;
}

/** Abre uma URL em nova aba de forma segura. */
export function openInNewTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}
