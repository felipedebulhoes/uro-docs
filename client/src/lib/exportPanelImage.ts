// Render the full statistics panel as a PNG image, fully client-side, by drawing
// directly on a Canvas from the summarized data (NOT by rasterizing the DOM).
// This avoids the "tainted canvas" SecurityError that occurs when serializing
// DOM with cross-origin icons/fonts via <foreignObject>. CSP-safe (no
// document.write / inline HTML / external resources).

import type { HistorySummary, MonthlyStat, TypeStat } from "@/lib/historyStats";

export interface PanelImageOptions {
  /** Subtitle below the title (e.g. the active period). */
  subtitle?: string;
  /** Executive summary sentence. */
  summaryText?: string;
  /** Monthly goal status line (optional). */
  monthlyGoalText?: string;
  /** Annual goal status line (optional). */
  annualGoalText?: string;
  /** Pace alert line (optional). */
  alertText?: string;
  /** Device-pixel scale for crisp output. */
  scale?: number;
  /** Output file name (without extension). */
  fileName?: string;
}

const C = {
  bg: "#ffffff",
  panel: "#f6f3ef",
  border: "#e6ddd2",
  copper: "#B87333",
  copperDark: "#8a5523",
  track: "#ece4da",
  text: "#1a1a1a",
  muted: "#777777",
  title: "#8a5523",
  alertBg: "#fdf4e7",
  alertText: "#8a5523",
};

const FONT = "-apple-system, Segoe UI, Roboto, Arial, sans-serif";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Wrap text to a max width, returning the lines. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function pctFromText(t?: string): number {
  if (!t) return 0;
  const m = t.match(/(\d+)\s*%/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Draw the statistics panel and return a PNG data URL. Returns null when the
 * canvas context is unavailable. Pure w.r.t. the DOM besides an in-memory canvas.
 */
export function renderPanelPng(
  summary: HistorySummary,
  opts: PanelImageOptions = {},
): string | null {
  const scale = opts.scale ?? 2;
  const W = 820;
  const padX = 28;
  const innerW = W - padX * 2;

  // ---- First pass: measure required height with a throwaway canvas ----
  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d");
  if (!mctx) return null;

  mctx.font = `13px ${FONT}`;
  const summaryLines = opts.summaryText
    ? wrapText(mctx, opts.summaryText, innerW - 28)
    : [];
  mctx.font = `12px ${FONT}`;
  const alertLines = opts.alertText
    ? wrapText(mctx, opts.alertText, innerW - 28)
    : [];

  const months = summary.byMonth;
  const types = summary.byType;

  let H = 0;
  H += 64; // header
  if (summaryLines.length) H += summaryLines.length * 18 + 16 + 14;
  if (opts.monthlyGoalText) H += 54;
  if (opts.annualGoalText) H += 54;
  if (alertLines.length) H += alertLines.length * 16 + 16 + 14;
  H += 78 + 16; // KPI cards row
  const barRowH = 26;
  if (months.length) H += 26 + months.length * barRowH + 14;
  if (types.length) H += 26 + types.length * barRowH + 14;
  H += 40; // footer
  H = Math.max(H, 360);

  // ---- Second pass: real draw ----
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  let y = 26;

  // Header
  ctx.fillStyle = C.title;
  ctx.font = `bold 20px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("Estatísticas cirúrgicas", padX, y);
  if (opts.subtitle) {
    ctx.fillStyle = C.muted;
    ctx.font = `12px ${FONT}`;
    ctx.fillText(opts.subtitle, padX, y + 26);
  }
  y += 64;

  // Executive summary
  if (summaryLines.length) {
    const blockH = summaryLines.length * 18 + 16;
    ctx.fillStyle = C.panel;
    roundRect(ctx, padX, y, innerW, blockH, 10);
    ctx.fill();
    ctx.fillStyle = C.text;
    ctx.font = `13px ${FONT}`;
    summaryLines.forEach((ln, i) => {
      ctx.fillText(ln, padX + 14, y + 10 + i * 18);
    });
    y += blockH + 14;
  }

  // Goal bars
  const drawGoalBar = (label: string, pct: number, sub: string) => {
    ctx.fillStyle = C.text;
    ctx.font = `bold 12px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, padX, y);
    ctx.textAlign = "right";
    ctx.fillStyle = C.copperDark;
    ctx.fillText(`${pct}%`, padX + innerW, y);
    ctx.textAlign = "left";
    const trackY = y + 20;
    ctx.fillStyle = C.track;
    roundRect(ctx, padX, trackY, innerW, 10, 5);
    ctx.fill();
    const fillW = Math.max(0, Math.min(1, pct / 100)) * innerW;
    if (fillW > 0) {
      ctx.fillStyle = C.copper;
      roundRect(ctx, padX, trackY, fillW, 10, 5);
      ctx.fill();
    }
    ctx.fillStyle = C.muted;
    ctx.font = `11px ${FONT}`;
    ctx.fillText(truncate(sub, 90), padX, trackY + 16);
    y += 54;
  };

  if (opts.monthlyGoalText) {
    drawGoalBar(
      "Meta mensal (mês corrente)",
      pctFromText(opts.monthlyGoalText),
      opts.monthlyGoalText.replace(/\s*\d+%\s*$/, "").trim(),
    );
  }
  if (opts.annualGoalText) {
    drawGoalBar(
      "Meta anual — acumulado",
      pctFromText(opts.annualGoalText),
      opts.annualGoalText.replace(/\s*\d+%\s*$/, "").trim(),
    );
  }

  // Alert
  if (alertLines.length) {
    const blockH = alertLines.length * 16 + 16;
    ctx.fillStyle = C.alertBg;
    roundRect(ctx, padX, y, innerW, blockH, 10);
    ctx.fill();
    ctx.fillStyle = C.alertText;
    ctx.font = `12px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    alertLines.forEach((ln, i) => ctx.fillText(ln, padX + 14, y + 9 + i * 16));
    y += blockH + 14;
  }

  // KPI cards
  const cardLabels = [
    { k: "Total", v: String(summary.total), s: "cirurgias" },
    { k: "Tipos", v: String(summary.distinctTypes), s: "procedimentos" },
    {
      k: "Mais frequente",
      v: summary.topType ? truncate(summary.topType.procedureName, 14) : "—",
      s: summary.topType ? `${summary.topType.count}x` : "",
    },
    {
      k: "Mês mais ativo",
      v: summary.busiestMonth ? summary.busiestMonth.label : "—",
      s: summary.busiestMonth ? `${summary.busiestMonth.count} cir.` : "",
    },
  ];
  const gap = 12;
  const cardW = (innerW - gap * 3) / 4;
  const cardH = 78;
  cardLabels.forEach((c, i) => {
    const cx = padX + i * (cardW + gap);
    ctx.fillStyle = C.panel;
    roundRect(ctx, cx, y, cardW, cardH, 10);
    ctx.fill();
    ctx.fillStyle = C.muted;
    ctx.font = `10px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(c.k.toUpperCase(), cx + 12, y + 12);
    ctx.fillStyle = C.copperDark;
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillText(c.v, cx + 12, y + 30);
    ctx.fillStyle = C.muted;
    ctx.font = `10px ${FONT}`;
    ctx.fillText(c.s, cx + 12, y + 56);
  });
  y += cardH + 16;

  // Bar chart helper
  const drawBars = (
    heading: string,
    rows: { label: string; count: number }[],
  ) => {
    if (!rows.length) return;
    ctx.fillStyle = C.title;
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(heading, padX, y);
    y += 26;
    const max = Math.max(...rows.map((r) => r.count), 1);
    const labelW = 150;
    const barX = padX + labelW;
    const barMaxW = innerW - labelW - 36;
    rows.forEach((r) => {
      ctx.fillStyle = C.text;
      ctx.font = `11px ${FONT}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(truncate(r.label, 22), padX, y + 9);
      ctx.fillStyle = C.track;
      roundRect(ctx, barX, y + 3, barMaxW, 12, 6);
      ctx.fill();
      const w = (r.count / max) * barMaxW;
      ctx.fillStyle = C.copper;
      roundRect(ctx, barX, y + 3, Math.max(w, 2), 12, 6);
      ctx.fill();
      ctx.fillStyle = C.copperDark;
      ctx.font = `bold 11px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillText(String(r.count), barX + barMaxW + 8, y + 9);
      ctx.textBaseline = "top";
      y += 26;
    });
    y += 14;
  };

  drawBars(
    "Cirurgias por mês",
    months.map((m: MonthlyStat) => ({ label: m.label, count: m.count })),
  );
  drawBars(
    "Cirurgias por tipo",
    types.map((t: TypeStat) => ({ label: t.procedureName, count: t.count })),
  );

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = `10px ${FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(
    `UroDocx · Dr. Felipe Bulhões · ${new Date().toLocaleDateString("pt-BR")}`,
    padX,
    H - 14,
  );

  return canvas.toDataURL("image/png");
}

/** Render the panel and trigger a PNG download. Throws when context unavailable. */
export function exportPanelPng(
  summary: HistorySummary,
  opts: PanelImageOptions = {},
): void {
  const dataUrl = renderPanelPng(summary, opts);
  if (!dataUrl) throw new Error("no-canvas");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${opts.fileName ?? "painel-estatisticas"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
