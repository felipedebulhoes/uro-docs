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
export const LOGO_SVG = `<svg class="brand-logo" width="44" height="44" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dr. Felipe Bulhões">
  <rect x="1" y="1" width="46" height="46" rx="10" fill="#1C3D5A" stroke="#B87333" stroke-width="2"/>
  <g transform="translate(15.4 11.5) scale(0.0092)">
    <path fill="#C4C4C4" d="M127.85 1888.96l-127.62 0 0 -711.2 127.62 0 0 711.2zm-127.62 -1191.64l0 -697.32 1160.42 0 0 122.25c-99.57,-59.5 -295,-95.38 -413.23,-95.38l-619.58 0 0 670.46 -127.62 0z"/>
    <path fill="#FEFEFE" d="M819.42 1888.79l-529.83 0 0 -711.02 126.81 0 0 684.16 406.78 0c63.68,-4.84 120.64,-27.67 171.42,-68.51 50.51,-40.84 90.81,-94.84 121.17,-162.01 30.09,-67.17 45.14,-141.59 45.14,-223 0,-83.29 -8.33,-163.32 -47.56,-228.11 -180.36,-297.88 -1115.39,-185.49 -1113.35,-163.98l0.22 -157.52c0,14.4 747.77,74.61 850.63,22.36 53.03,-26.94 95.97,-46.35 128.96,-105.76 33.11,-59.62 49.71,-127.62 49.71,-203.66 0,-65.56 -12.36,-125.2 -37.35,-178.94 -24.99,-53.74 -58.57,-96.99 -100.49,-129.23 -41.91,-32.24 -88.39,-48.36 -139.17,-48.36l-336.12 0 0 483.53 -126.81 0 0 -510.4 480.13 0c72,0 137.56,16.93 196.94,50.78 59.11,33.85 106.4,79.26 141.86,135.95 35.47,56.69 53.2,122.79 53.2,198.28 0,83.56 -24.63,157.51 -73.89,221.93 -49.35,64.55 -113.38,122.09 -192.1,150.03 76.04,12.09 144.24,27.9 204.2,70.02 60.14,42.24 107.74,95.38 142.94,159.33 35.2,64.21 52.66,133.8 52.66,209.57l0 48.63c0,84.1 -21.22,160.4 -64.21,229.45 -42.72,69.05 -100.22,124.13 -172.22,164.97 -72.27,40.84 -152.07,61.53 -239.66,61.53z"/>
  </g>
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
