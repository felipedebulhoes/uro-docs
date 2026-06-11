// Export the surgery statistics panel (summary + bar charts + table) as a
// printable PDF. Runs entirely in the browser (offline): builds an HTML
// document with inline SVG bar charts and opens the native print dialog, where
// the user chooses "Save as PDF". Keeps the bundle light (no PDF libraries).

import {
  summarizeHistory,
  executiveSummary,
  type StatRecord,
} from "@/lib/historyStats";
import { openPrintableDocument } from "@/lib/printDocument";
import {
  institutionHeaderHtml,
  INSTITUTION_HEADER_CSS,
} from "@/lib/institution";

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
 * Build a monthly trend line chart as inline SVG. Plots the surgery count per
 * month chronologically, with a baseline axis, gridlines, points and value
 * labels. Prints reliably (no canvas/JS).
 */
function svgLineChart(rows: BarRow[]): string {
  if (rows.length === 0) {
    return `<p class="empty">Sem dados.</p>`;
  }
  if (rows.length === 1) {
    // A single month: a line needs at least two points, so show a labelled dot.
    return `<p class="empty">Apenas um mês com registros (${escapeHtml(
      rows[0].label
    )}: ${rows[0].count}). Tendência disponível a partir de dois meses.</p>`;
  }

  const W = 520;
  const H = 200;
  const padL = 32;
  const padR = 16;
  const padT = 16;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...rows.map((r) => r.count), 1);
  const n = rows.length;

  const x = (i: number) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  // Horizontal gridlines (4 steps)
  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (max / gridSteps) * i;
    const gy = y(v);
    return `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" class="grid" />
      <text x="${padL - 6}" y="${gy + 3}" text-anchor="end" class="axis">${Math.round(v)}</text>`;
  }).join("");

  const linePath = rows
    .map((r, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(r.count).toFixed(1)}`)
    .join(" ");

  // Area under the line (subtle fill)
  const areaPath =
    `M ${x(0).toFixed(1)} ${y(0).toFixed(1)} ` +
    rows.map((r, i) => `L ${x(i).toFixed(1)} ${y(r.count).toFixed(1)}`).join(" ") +
    ` L ${x(n - 1).toFixed(1)} ${y(0).toFixed(1)} Z`;

  // Show at most ~8 x labels to avoid clutter
  const labelEvery = Math.ceil(n / 8);
  const points = rows
    .map((r, i) => {
      const cx = x(i);
      const cy = y(r.count);
      const showLabel = i % labelEvery === 0 || i === n - 1;
      const xLabel = showLabel
        ? `<text x="${cx}" y="${H - padB + 16}" text-anchor="middle" class="xlbl">${escapeHtml(
            r.label
          )}</text>`
        : "";
      return `<circle cx="${cx}" cy="${cy}" r="3" class="pt" />
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="ptval">${r.count}</text>
        ${xLabel}`;
    })
    .join("");

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMinYMin meet" role="img">
    ${grid}
    <path d="${areaPath}" class="area" />
    <path d="${linePath}" class="line" fill="none" />
    ${points}
  </svg>`;
}

export interface StatsPdfOptions {
  /** Human label of the active filter (e.g. "jun/2026" or "2026"). */
  periodLabel?: string;
  /** Procedure name when the export is scoped to a single procedure. */
  procedureLabel?: string;
  /** Period-over-period summary line (totals + percentage). */
  comparisonText?: string;
  /** Per-procedure movers line (e.g. "RTU-P +2, Vasectomia -1"). */
  procedureDeltaText?: string;
  /** Monthly goal: when set, renders attainment vs. the busiest/last month. */
  monthlyGoal?: number;
}

/**
 * Generate and open the statistics PDF.
 * @param records Already-filtered records (so the PDF matches the on-screen period).
 * @param options Optional labels and analytics (period, scope, comparison, deltas, goal).
 */
export function exportStatsPDF(
  records: StatRecord[],
  options: StatsPdfOptions = {}
): void {
  const {
    periodLabel,
    procedureLabel,
    comparisonText,
    procedureDeltaText,
    monthlyGoal,
  } = options;
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

  const summaryText = executiveSummary(summary, { periodLabel, procedureLabel });

  // Monthly goal attainment: compare the busiest month's volume to the goal.
  let goalBlock = "";
  if (typeof monthlyGoal === "number" && monthlyGoal > 0) {
    const ref = summary.busiestMonth;
    const achieved = ref?.count ?? 0;
    const pct = Math.round((achieved / monthlyGoal) * 100);
    const barPct = Math.min(pct, 100);
    const refLabel = ref ? ref.label : "—";
    const status = pct >= 100 ? "Meta atingida" : `${100 - Math.min(pct, 100)}% restante`;
    goalBlock = `<div class="goal"><span class="k">Meta mensal</span>` +
      `Meta de ${monthlyGoal} cirurgias/mês · melhor mês (${escapeHtml(refLabel)}): ` +
      `${achieved} (${pct}% da meta — ${status}).` +
      `<div class="bar"><span style="width:${barPct}%"></span></div></div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Estatísticas de Cirurgias — UroDocx</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 32px; }
${INSTITUTION_HEADER_CSS}
  h2 { font-size: 14px; color: #8a5523; margin: 24px 0 8px; }
  .cards { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0 8px; }
  .card { flex: 1 1 130px; border: 1px solid #e0d4c5; border-radius: 8px; padding: 10px 12px; background: #faf6f1; }
  .card .k { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #8a5523; }
  .card .v { font-size: 20px; font-weight: 700; margin-top: 2px; }
  .card .s { font-size: 10px; color: #888; }
  .exec-summary { margin: 16px 0 4px; padding: 12px 14px; background: #faf6f1; border-left: 3px solid #B87333; border-radius: 4px; font-size: 12.5px; line-height: 1.5; color: #333; }
  .exec-summary .k { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #8a5523; margin-bottom: 4px; font-weight: 700; }
  .comparison { margin: 8px 0 4px; padding: 10px 14px; background: #f3f7f3; border-left: 3px solid #4b8b5a; border-radius: 4px; font-size: 12.5px; line-height: 1.5; color: #2c4a33; }
  .comparison .k { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #3a6b46; margin-bottom: 4px; font-weight: 700; }
  .deltas { margin: 8px 0 4px; padding: 10px 14px; background: #faf6f1; border-left: 3px solid #8a5523; border-radius: 4px; font-size: 12.5px; line-height: 1.5; color: #3a2c20; }
  .deltas .k { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #8a5523; margin-bottom: 4px; font-weight: 700; }
  .goal { margin: 8px 0 4px; padding: 10px 14px; background: #f5f2fb; border-left: 3px solid #6d4b91; border-radius: 4px; font-size: 12.5px; color: #3a2c4a; }
  .goal .k { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #6d4b91; margin-bottom: 6px; font-weight: 700; }
  .goal .bar { height: 10px; background: #e6ddf2; border-radius: 6px; overflow: hidden; margin-top: 4px; }
  .goal .bar > span { display: block; height: 100%; background: #6d4b91; border-radius: 6px; }
  svg .lbl { font-size: 11px; fill: #444; }
  svg .val { font-size: 11px; fill: #1a1a1a; font-weight: 600; }
  svg .track { fill: #efe6db; }
  svg .bar { fill: #B87333; }
  svg .grid { stroke: #eee; stroke-width: 1; }
  svg .axis { font-size: 9px; fill: #aaa; }
  svg .xlbl { font-size: 9px; fill: #777; }
  svg .line { stroke: #B87333; stroke-width: 2; }
  svg .area { fill: rgba(184, 115, 51, 0.10); }
  svg .pt { fill: #8a5523; }
  svg .ptval { font-size: 9px; fill: #1a1a1a; font-weight: 600; }
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
  ${institutionHeaderHtml(
    procedureLabel
      ? `Estatísticas — ${escapeHtml(procedureLabel)}`
      : "Estatísticas de Cirurgias",
    `Gerado em ${stamp} &middot; ${periodText}`
  )}

  <div class="exec-summary">
    <span class="k">Resumo executivo</span>
    ${escapeHtml(summaryText)}
  </div>

  ${
    comparisonText
      ? `<div class="comparison"><span class="k">Comparativo entre períodos</span>${escapeHtml(
          comparisonText
        )}</div>`
      : ""
  }

  ${
    procedureDeltaText
      ? `<div class="deltas"><span class="k">Variação por procedimento</span>${escapeHtml(
          procedureDeltaText
        )}</div>`
      : ""
  }

  ${goalBlock}

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
    <h2>Tendência mensal</h2>
    ${svgLineChart(monthRows)}
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
