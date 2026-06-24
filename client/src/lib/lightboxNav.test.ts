import { describe, it, expect } from "vitest";
import {
  buildLightboxFigures,
  wrapIndex,
  nextIndex,
  prevIndex,
  positionForFigure,
  type FigureLike,
} from "./lightboxNav";

const figs: FigureLike[] = [
  { caption: "Sem imagem", searchTerms: "x" } as any,
  { caption: "Com estática", imageUrl: "/manus-storage/a.jpg" },
  { caption: "Sem imagem 2" },
  { caption: "Com estática 2", imageUrl: "/manus-storage/b.jpg", credit: "C", sourceUrl: "https://e.com" },
];

describe("buildLightboxFigures", () => {
  it("inclui apenas figuras com imagem efetiva e preserva o índice original", () => {
    const list = buildLightboxFigures(figs);
    expect(list.length).toBe(2);
    expect(list[0].figIndex).toBe(1);
    expect(list[1].figIndex).toBe(3);
    expect(list[0].url).toBe("/manus-storage/a.jpg");
    expect(list[1].credit).toBe("C");
    expect(list[1].sourceUrl).toBe("https://e.com");
  });

  it("prefere a imagem do banco (dbImage) sobre a estática", () => {
    const db = new Map([
      [1, { url: "/manus-storage/protegida.jpg", credit: "DB", sourceUrl: "https://db.com" }],
    ]);
    const list = buildLightboxFigures(figs, db);
    const item = list.find((l) => l.figIndex === 1)!;
    expect(item.url).toBe("/manus-storage/protegida.jpg");
    expect(item.credit).toBe("DB");
    expect(item.sourceUrl).toBe("https://db.com");
  });

  it("retorna lista vazia quando não há imagens", () => {
    expect(buildLightboxFigures([{ caption: "nada" }]).length).toBe(0);
  });
});

describe("navegação circular", () => {
  it("wrapIndex normaliza para [0,total)", () => {
    expect(wrapIndex(0, 3)).toBe(0);
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(4, 3)).toBe(1);
  });

  it("wrapIndex lida com total 0 sem quebrar", () => {
    expect(wrapIndex(5, 0)).toBe(0);
  });

  it("nextIndex e prevIndex dão a volta corretamente", () => {
    expect(nextIndex(2, 3)).toBe(0);
    expect(prevIndex(0, 3)).toBe(2);
    expect(nextIndex(0, 3)).toBe(1);
    expect(prevIndex(2, 3)).toBe(1);
  });
});

describe("positionForFigure", () => {
  it("mapeia o índice original da figura para a posição no lightbox", () => {
    const list = buildLightboxFigures(figs);
    expect(positionForFigure(list, 1)).toBe(0);
    expect(positionForFigure(list, 3)).toBe(1);
    expect(positionForFigure(list, 0)).toBe(-1); // figura sem imagem
  });
});
