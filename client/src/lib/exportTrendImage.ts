// Render the monthly surgery trend as a PNG image, fully client-side, so it can
// be pasted directly into slides/reports. Draws on a Canvas (no dependencies)
// and triggers a download. CSP-safe (no document.write / inline HTML).

import type { MonthlyStat } from "@/lib/historyStats";

export interface TrendImageOptions {
  /** Subtitle below the chart title (e.g. the active period). */
  subtitle?: string;
  /** Device-pixel scale for crisp output. */
  scale?: number;
  /** Output file name (without extension). */
  fileName?: string;
}

const COLORS = {
  bg: "#ffffff",
  axis: "#cccccc",
  grid: "#eeeeee",
  line: "#B87333",
  area: "rgba(184, 115, 51, 0.12)",
  point: "#8a5523",
  text: "#1a1a1a",
  muted: "#777777",
  title: "#8a5523",
};

/**
 * Build a PNG data URL for the monthly trend. Returns null when there are fewer
 * than two months (a line needs at least two points). Pure w.r.t. the DOM
 * besides creating an in-memory canvas.
 */
export function renderTrendPng(
  months: MonthlyStat[],
  opts: TrendImageOptions = {},
): string | null {
  if (months.length < 2) return null;
  const scale = opts.scale ?? 2;

  const W = 720;
  const H = 380;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = COLORS.title;
  ctx.font = "bold 18px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("Tendência mensal de cirurgias", 24, 20);
  if (opts.subtitle) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = "12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.fillText(opts.subtitle, 24, 44);
  }

  const padL = 44;
  const padR = 24;
  const padT = 72;
  const padB = 52;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...months.map((m) => m.count), 1);
  const n = months.length;

  const x = (i: number) => padL + (i / (n - 1)) * plotW;
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  // Gridlines + y labels
  const steps = 4;
  ctx.textBaseline = "middle";
  for (let i = 0; i <= steps; i++) {
    const v = (max / steps) * i;
    const gy = y(v);
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, gy);
    ctx.lineTo(W - padR, gy);
    ctx.stroke();
    ctx.fillStyle = COLORS.muted;
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(Math.round(v)), padL - 8, gy);
  }

  // Area fill
  ctx.beginPath();
  ctx.moveTo(x(0), y(0));
  months.forEach((m, i) => ctx.lineTo(x(i), y(m.count)));
  ctx.lineTo(x(n - 1), y(0));
  ctx.closePath();
  ctx.fillStyle = COLORS.area;
  ctx.fill();

  // Line
  ctx.beginPath();
  months.forEach((m, i) => {
    const px = x(i);
    const py = y(m.count);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Points + value labels + x labels
  const labelEvery = Math.ceil(n / 8);
  months.forEach((m, i) => {
    const px = x(i);
    const py = y(m.count);
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.point;
    ctx.fill();

    ctx.fillStyle = COLORS.text;
    ctx.font = "bold 11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(String(m.count), px, py - 6);

    if (i % labelEvery === 0 || i === n - 1) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "10px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(m.label, px, H - padB + 10);
    }
  });

  // Footer attribution
  ctx.fillStyle = COLORS.muted;
  ctx.font = "10px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("UroDocx", W - padR, H - 12);

  return canvas.toDataURL("image/png");
}

/** Render the trend and trigger a PNG download. Throws "no-data" when < 2 months. */
export function exportTrendPng(
  months: MonthlyStat[],
  opts: TrendImageOptions = {},
): void {
  const dataUrl = renderTrendPng(months, opts);
  if (!dataUrl) throw new Error("no-data");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${opts.fileName ?? "tendencia-cirurgias"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
