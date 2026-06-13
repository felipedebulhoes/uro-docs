// Exportação de um dossiê do Atlas Cirúrgico em PDF (via janela de impressão),
// com cabeçalho institucional padronizado para impressão/estudo.

import { marked } from "marked";
import type { AtlasEntry } from "@/data/atlasData";
import { LOGO_SVG } from "@/lib/institution";
import { openPrintableDocument } from "@/lib/printDocument";

/** Imagem (já resolvida em data URI) para uma figura específica. */
export type AtlasPdfImage = {
  /** data URI (data:image/...;base64,...) pronto para embutir no PDF */
  dataUrl: string;
  credit?: string | null;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdToHtml(md: string): string {
  // marked.parse é síncrono quando async:false (padrão para strings simples)
  return marked.parse(md, { async: false }) as string;
}

/**
 * Monta o dossiê formatado (HTML) para impressão / "Salvar como PDF".
 * Função pura (sem efeitos colaterais) para ser testada em ambiente node.
 *
 * `images` mapeia figureIndex (0-based) → imagem em data URI. Quando presente,
 * a imagem é embutida no item da figura; caso contrário, mantém-se a sugestão
 * com termos de busca (placeholder textual).
 */
export function buildAtlasPdfHtml(
  entry: AtlasEntry,
  images?: Map<number, AtlasPdfImage>
): string {
  const refIndex = entry.sections.findIndex((s) =>
    s.title.toLowerCase().includes("refer")
  );
  const technical = entry.sections.filter((_, i) => i !== refIndex);
  const references = refIndex >= 0 ? entry.sections[refIndex] : undefined;

  const sectionsHtml = technical
    .map(
      (s) =>
        `<section class="block"><h2>${esc(s.title)}</h2><div class="md">${mdToHtml(
          s.body
        )}</div></section>`
    )
    .join("");

  const figuresHtml =
    entry.figures.length > 0
      ? `<section class="block"><h2>Figuras de referência (${
          entry.figures.length
        })</h2>
        <p class="note">Figuras com imagem cadastrada são reproduzidas para uso pessoal/educacional, com crédito da fonte. Para as demais, use os termos de busca em inglês para localizar a ilustração em atlas/livros (ClinicalKey) ou artigos (Portal CAPES). Respeite os direitos autorais.</p>
        <ol class="figs">${entry.figures
          .map((f, i) => {
            const img = images?.get(i);
            const imgCredit = img?.credit || f.credit;
            const imageBlock = img
              ? `<img class="fig-img" src="${img.dataUrl}" alt="${esc(
                  f.caption
                )}" />`
              : "";
            const termsBlock = img
              ? ""
              : `<span class="fig-terms"><strong>Buscar:</strong> ${esc(
                  f.searchTerms
                )}</span>`;
            return `<li>${imageBlock}<span class="fig-cap">${esc(
              f.caption
            )}</span>${
              f.description
                ? `<span class="fig-desc">${esc(f.description)}</span>`
                : ""
            }${termsBlock}${
              imgCredit
                ? `<span class="fig-credit">Crédito: ${esc(imgCredit)}</span>`
                : ""
            }</li>`;
          })
          .join("")}</ol></section>`
      : "";

  const referencesHtml = references
    ? `<section class="block"><h2>${esc(
        references.title
      )}</h2><div class="md refs">${mdToHtml(references.body)}</div></section>`
    : "";

  const today = new Date().toLocaleDateString("pt-BR");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Atlas — ${esc(entry.name)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Roboto',sans-serif; color:#1a1a1a; line-height:1.6; font-size:11pt; padding:40px; }
    .doc-header { border-bottom:2px solid #B87333; padding-bottom:12px; margin-bottom:18px; }
    .doc-header .brand { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
    .doc-header .brand-logo { width:40px; height:40px; flex:0 0 auto; }
    .doc-header .brand-mark { font-size:22px; font-weight:800; color:#8a5523; letter-spacing:-.5px; }
    .doc-header .brand-mark span { color:#B87333; }
    .doc-header .brand-info { border-left:2px solid #e0d4c5; padding-left:12px; line-height:1.35; }
    .doc-header .phys-name { font-size:13px; font-weight:700; color:#1a1a1a; }
    .doc-header .phys-cred { font-size:10.5px; color:#555; }
    .doc-header .phys-aff { font-size:10px; color:#8a5523; }
    .doc-title { font-size:18px; color:#1C3D5A; margin:6px 0 2px; }
    .doc-sub { font-size:11px; color:#666; }
    .meta { font-size:10.5px; color:#555; margin:10px 0 4px; padding:8px 12px; background:#f6f1ea; border-radius:6px; }
    .meta strong { color:#8a5523; }
    .block { margin-top:16px; page-break-inside:avoid; }
    h2 { font-size:13.5pt; color:#8a5523; border-bottom:1px solid #e6dccd; padding-bottom:4px; margin-bottom:8px; }
    .md { font-size:10.5pt; }
    .md p { margin:6px 0; }
    .md ul, .md ol { margin:6px 0 6px 22px; }
    .md li { margin:3px 0; }
    .md strong { color:#1C3D5A; }
    .md table { border-collapse:collapse; width:100%; margin:8px 0; font-size:9.5pt; }
    .md th, .md td { border:1px solid #ddd; padding:5px 7px; text-align:left; }
    .md th { background:#f3f3f3; }
    .note { font-size:9.5pt; color:#777; font-style:italic; margin-bottom:8px; }
    ol.figs { margin-left:18px; }
    ol.figs li { margin:10px 0; page-break-inside:avoid; }
    .fig-img { display:block; max-width:100%; max-height:340px; object-fit:contain; border:1px solid #ddd; border-radius:6px; margin:4px 0 6px; background:#fafafa; }
    .fig-cap { display:block; font-weight:600; color:#1C3D5A; }
    .fig-desc { display:block; font-size:10pt; color:#444; margin:2px 0; }
    .fig-terms { display:block; font-size:9.5pt; color:#666; font-family:monospace; }
    .fig-credit { display:block; font-size:9pt; color:#999; font-style:italic; }
    .refs { font-size:10pt; }
    .footer { margin-top:28px; padding-top:10px; border-top:1px solid #ddd; font-size:8.5pt; color:#888; text-align:center; }
    @media print { body { padding:22px; } }
  </style>
</head>
<body>
  <header class="doc-header">
    <div class="brand">
      ${LOGO_SVG}
      <div class="brand-mark">Uro<span>Docx</span></div>
      <div class="brand-info">
        <div class="phys-name">Dr. Felipe Bulhões</div>
        <div class="phys-cred">Urologista (Instituto D'Or) · Cirurgião Geral TCBC · CRM-SP 202.291</div>
        <div class="phys-aff">Membro da AUA (International Resident in Training), EAU (Junior International Member) e SBU</div>
      </div>
    </div>
    <h1 class="doc-title">Atlas Cirúrgico — ${esc(entry.name)}</h1>
    <div class="doc-sub">${esc(entry.category)} · Gerado em ${today}</div>
  </header>

  <div class="meta"><strong>Base de evidência:</strong> ${esc(entry.evidence)}</div>

  ${sectionsHtml}
  ${figuresHtml}
  ${referencesHtml}

  <div class="footer">
    Dr. Felipe Bulhões — CRM-SP 202.291 — Urologia &amp; Andrologia — Instituto D'Or de Ensino e Pesquisa<br/>
    Material de apoio à prática (uso pessoal/educacional) — não substitui o julgamento clínico individual.
  </div>
  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;

  return html;
}

/**
 * Baixa uma imagem (URL assinada/relativa) e converte em data URI base64.
 * Retorna null em caso de falha (CORS, 404 etc.) — o PDF cai no placeholder.
 */
async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return null;
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Imagem do Atlas (vinda do backend) usada para resolver as figuras do PDF. */
export type AtlasImageInput = {
  figureIndex: number;
  url: string;
  credit?: string | null;
};

/**
 * Resolve as imagens (data URI) para uso no PDF. As que falharem são omitidas
 * (mantêm o placeholder textual no PDF).
 */
export async function resolveAtlasPdfImages(
  imgs: AtlasImageInput[]
): Promise<Map<number, AtlasPdfImage>> {
  const out = new Map<number, AtlasPdfImage>();
  await Promise.all(
    imgs.map(async (img) => {
      const dataUrl = await fetchAsDataUrl(img.url);
      if (dataUrl) out.set(img.figureIndex, { dataUrl, credit: img.credit });
    })
  );
  return out;
}

/**
 * Abre o dossiê em nova aba para impressão / "Salvar como PDF". Usa Blob URL
 * (openPrintableDocument) para ser seguro sob CSP Trusted Types e tratar popup
 * bloqueado com fallback de âncora.
 *
 * Se `imgs` for fornecido (usuário autenticado com imagens cadastradas), as
 * imagens são embutidas no PDF; caso contrário, mantém-se o placeholder textual.
 */
export async function exportAtlasPdf(
  entry: AtlasEntry,
  imgs?: AtlasImageInput[]
): Promise<void> {
  let images: Map<number, AtlasPdfImage> | undefined;
  if (imgs && imgs.length > 0) {
    images = await resolveAtlasPdfImages(imgs);
  }
  openPrintableDocument(buildAtlasPdfHtml(entry, images));
}
