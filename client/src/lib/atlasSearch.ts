// Helpers para abrir os termos de busca de uma figura diretamente nas
// plataformas de referência do Dr. Felipe Bulhões (uso pessoal/educacional).

/**
 * Extrai o DOI de uma URL de artigo (PMC, DOI direto, Springer, BMC, etc.).
 * Retorna null se não conseguir extrair.
 */
export function extractDoi(url: string): string | null {
  if (!url) return null;
  // doi.org/10.xxx
  const doiDirect = url.match(/doi\.org\/(10\.\S+)/);
  if (doiDirect) return doiDirect[1];
  // Springer/BMC: /articles/10.xxx ou /article/10.xxx
  const springer = url.match(/\/articles?\/(10\.\S+)/);
  if (springer) return springer[1];
  // PMC: extrai PMCID mas não tem DOI — retorna null
  return null;
}

/**
 * Portal de Periódicos CAPES — link direto para um artigo via SFX/DOI.
 * Usa o proxy ez24 (UFF) para acesso autenticado via CAFe.
 * Se não houver DOI, cai para busca por termos.
 */
export function capesArticleUrl(sourceUrl: string | null | undefined, fallbackTerms?: string): string {
  if (sourceUrl) {
    const doi = extractDoi(sourceUrl);
    if (doi) {
      const sfx = encodeURIComponent(`https://doi.org/${doi}`);
      return `https://www-periodicos-capes-gov-br.ez24.periodicos.capes.gov.br/index.php?option=com_pmetabusca&mn=88&smn=88&base=find-db-1&type=b&Itemid=109&sfx=${sfx}`;
    }
    // PMC ou outro link direto — redireciona para a fonte original
    if (sourceUrl.includes('pmc.ncbi.nlm.nih.gov') || sourceUrl.includes('pubmed')) {
      return sourceUrl;
    }
  }
  // Fallback: busca por termos no portal CAPES
  if (fallbackTerms) return capesSearchUrl(fallbackTerms);
  return 'https://www.periodicos.capes.gov.br/';
}

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
