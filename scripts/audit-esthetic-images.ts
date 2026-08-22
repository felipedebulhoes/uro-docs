import { writeFileSync } from "node:fs";
import { atlasEntries } from "../client/src/data/atlasData";

const entries = atlasEntries.filter((entry) => entry.category === "Estética Genital");
const lines = [
  "# Auditoria visual — Estética Genital",
  "",
  `Entradas revisadas: ${entries.length}`,
  "",
];

for (const entry of entries) {
  lines.push(`## ${entry.name}`, "", `- ID: \`${entry.id}\``, `- Figuras: ${entry.figures.length}`, "");
  entry.figures.forEach((figure, index) => {
    lines.push(
      `### Figura ${index + 1} — ${figure.caption}`,
      `- Imagem: ${figure.imageUrl ? "sim" : "não"}`,
      `- URL: ${figure.imageUrl ?? "—"}`,
      `- Crédito: ${figure.credit ?? "—"}`,
      `- Fonte: ${figure.sourceUrl ?? "—"}`,
      `- Descrição: ${figure.description ?? "—"}`,
      "",
    );
  });
}

writeFileSync("audit/esthetic-images-audit.md", `${lines.join("\n")}\n`);
console.log(`Auditadas ${entries.length} entradas de estética genital.`);
