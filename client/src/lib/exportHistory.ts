import type { SurgeryRecord } from "@/data/surgeryStore";
import { procedures } from "@/data/procedures";

/**
 * Export helpers for the surgery history.
 *
 * Both run entirely in the browser (no network), so they work offline:
 *  - CSV: assembled as a UTF-8 Blob and downloaded.
 *  - PDF: rendered into a print window; the user picks "Save as PDF" in the
 *    native print dialog. This avoids heavy PDF libraries and keeps the
 *    bundle small while producing a clean, printable layout.
 */

function procIcon(procedureId: string): string {
  return procedures.find((p) => p.id === procedureId)?.icon || "";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

/** Collect the union of all config keys present across records (stable order). */
function collectConfigKeys(records: SurgeryRecord[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const r of records) {
    for (const k of Object.keys(r.config || {})) {
      if (!seen.has(k)) {
        seen.add(k);
        order.push(k);
      }
    }
  }
  return order;
}

function csvEscape(value: string): string {
  const v = value ?? "";
  if (/[",\n;]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function exportHistoryCSV(records: SurgeryRecord[]): void {
  const configKeys = collectConfigKeys(records);
  const header = [
    "Procedimento",
    "Paciente",
    "Data",
    "Registrado em",
    ...configKeys,
  ];

  const lines = records.map((r) => {
    const base = [
      r.procedureName || "",
      r.patientName || "",
      formatDate(r.date),
      r.createdAt ? new Date(r.createdAt).toLocaleString("pt-BR") : "",
    ];
    const extra = configKeys.map((k) => (r.config?.[k] ?? "").toString());
    return [...base, ...extra].map(csvEscape).join(",");
  });

  // BOM so Excel opens UTF-8 correctly (acentos).
  const csv = "\uFEFF" + [header.map(csvEscape).join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `historico-cirurgias-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportHistoryPDF(records: SurgeryRecord[]): void {
  const stamp = new Date().toLocaleDateString("pt-BR");
  const rows = records
    .map((r) => {
      const config = Object.entries(r.config || {})
        .map(
          ([k, v]) =>
            `<span class="tag"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(
              String(v)
            )}</span>`
        )
        .join(" ");
      return `
        <tr>
          <td class="proc">${procIcon(r.procedureId)} ${escapeHtml(
        r.procedureName || ""
      )}</td>
          <td>${escapeHtml(r.patientName || "—")}</td>
          <td>${formatDate(r.date) || "—"}</td>
          <td class="cfg">${config || "—"}</td>
        </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Histórico de Cirurgias — UroDocx</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 32px; }
  header { border-bottom: 2px solid #B87333; padding-bottom: 12px; margin-bottom: 20px; }
  h1 { font-size: 20px; margin: 0 0 4px; color: #8a5523; }
  .meta { font-size: 12px; color: #666; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; background: #f5efe8; color: #8a5523; padding: 8px; border-bottom: 2px solid #e0d4c5; }
  td { padding: 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  td.proc { font-weight: 600; white-space: nowrap; }
  .cfg { color: #444; }
  .tag { display: inline-block; background: #f5efe8; border-radius: 4px; padding: 1px 6px; margin: 1px 2px; font-size: 11px; }
  footer { margin-top: 24px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
  @media print { body { margin: 12mm; } }
</style>
</head>
<body>
  <header>
    <h1>Histórico de Cirurgias</h1>
    <div class="meta">Dr. Felipe Bulhões — Urologia &middot; Gerado em ${stamp} &middot; ${
    records.length
  } registro(s)</div>
  </header>
  <table>
    <thead>
      <tr><th>Procedimento</th><th>Paciente</th><th>Data</th><th>Configuração</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <footer>UroDocx — documento gerado para registro pessoal. Confira os dados antes de uso clínico ou acadêmico.</footer>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) {
    throw new Error("popup-blocked");
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
