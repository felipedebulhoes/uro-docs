// Institutional identity used to standardize the header of exported PDFs
// (history and statistics), so the documents look consistent when attached to
// academic/master's reports.

export interface InstitutionInfo {
  name: string;
  credentials: string; // CRM + main title line
  affiliations: string; // memberships / societies
}

export const INSTITUTION: InstitutionInfo = {
  name: "Dr. Felipe Bulhões",
  credentials: "Urologista (Instituto D'Or) · Cirurgião Geral TCBC · CRM-SP 202.291",
  affiliations:
    "Membro da AUA (International Resident in Training), EAU (Junior International Member) e SBU",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build the standardized institutional header block (HTML) shared by the PDF
 * exporters. `title` is the document title; `subline` is a short context line
 * (e.g. "Gerado em 11/06/2026 · Período: jun/2026").
 */
export function institutionHeaderHtml(title: string, subline: string): string {
  const i = INSTITUTION;
  return `
  <header class="doc-header">
    <div class="brand">
      <div class="brand-mark">Uro<span>Docx</span></div>
      <div class="brand-info">
        <div class="phys-name">${esc(i.name)}</div>
        <div class="phys-cred">${esc(i.credentials)}</div>
        <div class="phys-aff">${esc(i.affiliations)}</div>
      </div>
    </div>
    <h1 class="doc-title">${esc(title)}</h1>
    <div class="doc-sub">${subline}</div>
  </header>`;
}

/** CSS for the shared institutional header (paste inside the document <style>). */
export const INSTITUTION_HEADER_CSS = `
  .doc-header { border-bottom: 2px solid #B87333; padding-bottom: 12px; margin-bottom: 20px; }
  .doc-header .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .doc-header .brand-mark { font-size: 22px; font-weight: 800; color: #8a5523; letter-spacing: -.5px; }
  .doc-header .brand-mark span { color: #B87333; }
  .doc-header .brand-info { border-left: 2px solid #e0d4c5; padding-left: 12px; line-height: 1.35; }
  .doc-header .phys-name { font-size: 13px; font-weight: 700; color: #1a1a1a; }
  .doc-header .phys-cred { font-size: 10.5px; color: #555; }
  .doc-header .phys-aff { font-size: 10px; color: #8a5523; }
  .doc-header .doc-title { font-size: 19px; margin: 4px 0 2px; color: #8a5523; }
  .doc-header .doc-sub { font-size: 11.5px; color: #666; }
`;
