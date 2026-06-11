import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderTrendPng } from "./exportTrendImage";
import type { MonthlyStat } from "./historyStats";

// The vitest environment is `node` (no real DOM/canvas), so we stub a minimal
// canvas + 2D context to exercise the pure rendering branches.
function installCanvasStub() {
  const ctx = {
    scale: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    lineJoin: "",
    font: "",
    textAlign: "",
    textBaseline: "",
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    toDataURL: () => "data:image/png;base64,STUBDATA",
  };
  // @ts-expect-error minimal stub for the test environment
  globalThis.document = {
    createElement: (tag: string) => {
      if (tag === "canvas") return canvas;
      throw new Error(`unexpected createElement(${tag})`);
    },
  };
  return { canvas, ctx };
}

const months = (counts: number[]): MonthlyStat[] =>
  counts.map((count, i) => ({
    key: `2026-${String(i + 1).padStart(2, "0")}`,
    label: `m${i + 1}/26`,
    count,
  }));

describe("renderTrendPng", () => {
  let restore: typeof globalThis.document | undefined;

  beforeEach(() => {
    restore = globalThis.document;
    installCanvasStub();
  });

  afterEach(() => {
    // @ts-expect-error restoring test environment
    globalThis.document = restore;
  });

  it("returns null when there are fewer than two months", () => {
    expect(renderTrendPng([])).toBeNull();
    expect(renderTrendPng(months([3]))).toBeNull();
  });

  it("returns a PNG data URL when there are at least two months", () => {
    const url = renderTrendPng(months([2, 5, 3]));
    expect(url).toBe("data:image/png;base64,STUBDATA");
  });

  it("scales the canvas by the device-pixel ratio", () => {
    const { canvas } = installCanvasStub();
    renderTrendPng(months([1, 2]), { scale: 3 });
    expect(canvas.width).toBe(720 * 3);
    expect(canvas.height).toBe(380 * 3);
  });
});
