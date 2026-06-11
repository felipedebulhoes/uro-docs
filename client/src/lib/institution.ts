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
 * Graphic logo (inline SVG) used in the PDF header. A copper-toned circular
 * badge with a stethoscope mark, matching the app identity. Inlined as SVG so
 * it always renders in the printed PDF without external file dependencies.
 */
export const LOGO_SVG = `<svg class="brand-logo" width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="UroDocx">
  <circle cx="24" cy="24" r="22" fill="#fbf3ea" stroke="#B87333" stroke-width="2"/>
  <path d="M17 12v6a6 6 0 0 0 12 0v-6" fill="none" stroke="#8a5523" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="17" y1="12" x2="17" y2="14" stroke="#8a5523" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="29" y1="12" x2="29" y2="14" stroke="#8a5523" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M23 30v3a6 6 0 0 0 12 0v-2" fill="none" stroke="#8a5523" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="35" cy="29" r="3.2" fill="none" stroke="#B87333" stroke-width="2.4"/>
</svg>`;

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
      ${LOGO_SVG}
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
  .doc-header .brand-logo { flex: 0 0 auto; width: 40px; height: 40px; }
  .doc-header .brand-mark { font-size: 22px; font-weight: 800; color: #8a5523; letter-spacing: -.5px; }
  .doc-header .brand-mark span { color: #B87333; }
  .doc-header .brand-info { border-left: 2px solid #e0d4c5; padding-left: 12px; line-height: 1.35; }
  .doc-header .phys-name { font-size: 13px; font-weight: 700; color: #1a1a1a; }
  .doc-header .phys-cred { font-size: 10.5px; color: #555; }
  .doc-header .phys-aff { font-size: 10px; color: #8a5523; }
  .doc-header .doc-title { font-size: 19px; margin: 4px 0 2px; color: #8a5523; }
  .doc-header .doc-sub { font-size: 11.5px; color: #666; }
`;
