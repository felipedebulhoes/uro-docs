// Export the surgery statistics panel (summary + bar charts + table) as a
// printable PDF. Runs entirely in the browser (offline): builds an HTML
// document with inline SVG bar charts and opens the native print dialog, where
// the user chooses "Save as PDF". Keeps the bundle light (no PDF libraries).

import { summarizeHistory, type StatRecord } from "@/lib/historyStats";
import { openPrintableDocument } from "@/lib/printDocument";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface BarRow {
  label: string;
  count: number;
}

/** Build a horizontal bar chart as inline SVG (prints reliably, no canvas). */
function svgBarChart(rows: BarRow[], opts: { labelWidth?: number } = {}): string {
  if (rows.length === 0) {
    return `<p class="empty">Sem dados.</p>`;
  }
  const labelWidth = opts.labelWidth ?? 130;
  const rowH = 26;
  const gap = 8;
  const chartW = 520;
  const barAreaW = chartW - labelWidth - 40; // room for value at the end
  const max = Math.max(...rows.map((r) => r.count), 1);
  const height = rows.length * (rowH + gap);

  const bars = rows
    .map((r, i) => {
      const y = i * (rowH + gap);
      const w = Math.max((r.count / max) * barAreaW, 2);
      const barX = labelWidth + 6;
      return `
        <g>
          <text x="${labelWidth}" y="${y + rowH / 2 + 4}" text-anchor="end" class="lbl">${escapeHtml(
        r.label
      )}</text>
          <rect x="${barX}" y="${y + 3}" width="${barAreaW}" height="${rowH - 6}" rx="4" class="track" />
          <rect x="${barX}" y="${y + 3}" width="${w}" height="${rowH - 6}" rx="4" class="bar" />
          <text x="${barX + w + 6}" y="${y + rowH / 2 + 4}" class="val">${r.count}</text>
        </g>`;
    })
    .join("");

  return `<svg viewBox="0 0 ${chartW} ${height}" width="100%" preserveAspectRatio="xMinYMin meet" role="img">
    ${bars}
  </svg>`;
}

/**
 * Generate and open the statistics PDF.
 * @param records Already-filtered records (so the PDF matches the on-screen period).
 * @param periodLabel Optional human label of the active filter (e.g. "jun/2026" or "2026").
 */
export function exportStatsPDF(records: StatRecord[], periodLabel?: string): void {
  const summary = summarizeHistory(records);
  const stamp = new Date().toLocaleDateString("pt-BR");

  const monthRows: BarRow[] = summary.byMonth
    .slice(-24)
    .map((m) => ({ label: m.label, count: m.count }));
  const typeRows: BarRow[] = summary.byType
    .slice(0, 15)
    .map((t) => ({ label: t.procedureName, count: t.count }));

  const typeTableRows = summary.byType
    .map(
      (t) => `
      <tr>
        <td>${escapeHtml(t.procedureName)}</td>
        <td class="num">${t.count}</td>
        <td class="num">${summary.total ? ((t.count / summary.total) * 100).toFixed(1) : "0"}%</td>
      </tr>`
    )
    .join("");

  const periodText = periodLabel
    ? `Período: ${escapeHtml(periodLabel)}`
    : "Período: todos os registros";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Estatísticas de Cirurgias — UroDocx</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 32px; }
  header { border-bottom: 2px solid #B87333; padding-bottom: 12px; margin-bottom: 20px; }
  h1 { font-size: 20px; margin: 0 0 4px; color: #8a5523; }
  h2 { font-size: 14px; color: #8a5523; margin: 24px 0 8px; }
  .meta { font-size: 12px; color: #666; }
  .cards { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0 8px; }
  .card { flex: 1 1 130px; border: 1px solid #e0d4c5; border-radius: 8px; padding: 10px 12px; background: #faf6f1; }
  .card .k { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #8a5523; }
  .card .v { font-size: 20px; font-weight: 700; margin-top: 2px; }
  .card .s { font-size: 10px; color: #888; }
  svg .lbl { font-size: 11px; fill: #444; }
  svg .val { font-size: 11px; fill: #1a1a1a; font-weight: 600; }
  svg .track { fill: #efe6db; }
  svg .bar { fill: #B87333; }
  .empty { font-size: 12px; color: #999; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
  th { text-align: left; background: #f5efe8; color: #8a5523; padding: 7px 8px; border-bottom: 2px solid #e0d4c5; }
  td { padding: 7px 8px; border-bottom: 1px solid #eee; }
  td.num, th.num { text-align: right; }
  footer { margin-top: 28px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
  .chart-block { page-break-inside: avoid; }
  @media print { body { margin: 12mm; } }
</style>
</head>
<body>
  <header>
    <h1>Estatísticas de Cirurgias</h1>
    <div class="meta">Dr. Felipe Bulhões — Urologia &middot; Gerado em ${stamp} &middot; ${periodText}</div>
  </header>

  <div class="cards">
    <div class="card"><div class="k">Total</div><div class="v">${summary.total}</div><div class="s">cirurgias</div></div>
    <div class="card"><div class="k">Tipos</div><div class="v">${summary.distinctTypes}</div><div class="s">procedimentos distintos</div></div>
    <div class="card"><div class="k">Mais frequente</div><div class="v" style="font-size:13px">${escapeHtml(
      summary.topType?.procedureName ?? "—"
    )}</div><div class="s">${summary.topType ? summary.topType.count + "x" : ""}</div></div>
    <div class="card"><div class="k">Mês mais ativo</div><div class="v" style="font-size:13px">${escapeHtml(
      summary.busiestMonth?.label ?? "—"
    )}</div><div class="s">${summary.busiestMonth ? summary.busiestMonth.count + " cirurgias" : ""}</div></div>
  </div>

  <div class="chart-block">
    <h2>Cirurgias por mês</h2>
    ${svgBarChart(monthRows, { labelWidth: 90 })}
  </div>

  <div class="chart-block">
    <h2>Cirurgias por tipo</h2>
    ${svgBarChart(typeRows, { labelWidth: 180 })}
  </div>

  <div class="chart-block">
    <h2>Detalhamento por tipo</h2>
    <table>
      <thead>
        <tr><th>Procedimento</th><th class="num">Quantidade</th><th class="num">% do total</th></tr>
      </thead>
      <tbody>${typeTableRows || '<tr><td colspan="3" class="empty">Sem dados.</td></tr>'}</tbody>
    </table>
  </div>

  <footer>UroDocx — documento gerado para registro pessoal e acadêmico. Confira os dados antes de uso clínico ou em relatórios.</footer>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;

  openPrintableDocument(html);
}
