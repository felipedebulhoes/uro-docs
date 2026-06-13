import { drizzle } from "drizzle-orm/mysql2";
import { atlasFigureImages } from "./drizzle/schema";
import { atlasEntries } from "./client/src/data/atlasData";
import fs from "node:fs";

const db = drizzle(process.env.DATABASE_URL!);

const rows = await db
  .select({ atlasId: atlasFigureImages.atlasId, figureIndex: atlasFigureImages.figureIndex })
  .from(atlasFigureImages);

const have = new Set(rows.map((r) => `${r.atlasId}::${r.figureIndex}`));

type Missing = {
  atlasId: string;
  name: string;
  category: string;
  figureIndex: number;
  figureNumber: number;
  caption: string;
  searchTerms: string;
  isKey: boolean;
};

const missing: Missing[] = [];
for (const e of atlasEntries) {
  e.figures.forEach((f, i) => {
    if (!have.has(`${e.id}::${i}`)) {
      missing.push({
        atlasId: e.id,
        name: e.name,
        category: e.category,
        figureIndex: i,
        figureNumber: i + 1,
        caption: f.caption,
        searchTerms: f.searchTerms,
        isKey: i === 0,
      });
    }
  });
}

const missingKey = missing.filter((m) => m.isKey);
console.log(`Imagens no banco: ${rows.length}`);
console.log(`Total de figuras sem imagem: ${missing.length}`);
console.log(`  - figuras-chave (1ª) faltantes: ${missingKey.length}`);
console.log(`  - figuras 2-4 faltantes: ${missing.length - missingKey.length}`);

fs.writeFileSync("/home/ubuntu/atlas_missing_figures.json", JSON.stringify(missing, null, 2));
console.log("Salvo em /home/ubuntu/atlas_missing_figures.json");
process.exit(0);
