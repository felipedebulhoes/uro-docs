import { atlasEntries } from "../client/src/data/atlasData";

const hasImage = (imageUrl?: string) => Boolean(imageUrl?.trim());
const reportRows = atlasEntries.map((entry) => {
  const illustrated = entry.figures.filter((figure) => hasImage(figure.imageUrl));
  const pending = entry.figures.filter((figure) => !hasImage(figure.imageUrl));
  const traceabilityIssues = illustrated.filter(
    (figure) => !figure.credit?.trim() || !/^https?:\/\//.test(figure.sourceUrl ?? "")
  );

  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    totalFigures: entry.figures.length,
    illustrated: illustrated.length,
    pending: pending.length,
    traceabilityIssues: traceabilityIssues.length,
    status:
      entry.figures.length === 0
        ? "sem figuras"
        : illustrated.length === 0
          ? "sem imagem"
          : pending.length > 0
            ? "cobertura parcial"
            : "coberto",
  };
});

const byStatus = reportRows.reduce<Record<string, number>>((totals, row) => {
  totals[row.status] = (totals[row.status] ?? 0) + 1;
  return totals;
}, {});

const totalFigures = reportRows.reduce((sum, row) => sum + row.totalFigures, 0);
const totalIllustrated = reportRows.reduce((sum, row) => sum + row.illustrated, 0);
const totalPending = reportRows.reduce((sum, row) => sum + row.pending, 0);

console.log("# Auditoria de Figuras do Atlas\n");
console.log(`- Entradas auditadas: ${atlasEntries.length}`);
console.log(`- Figuras cadastradas: ${totalFigures}`);
console.log(`- Figuras com imagem: ${totalIllustrated}`);
console.log(`- Figuras pendentes de imagem: ${totalPending}`);
console.log(`- Entradas por situação: ${Object.entries(byStatus).map(([status, count]) => `${status} (${count})`).join(", ")}\n`);

console.log("## Entradas prioritárias\n");
console.log("| ID | Entrada | Categoria | Figuras com imagem | Pendentes | Situação |");
console.log("|---|---|---:|---:|---:|---|");
for (const row of reportRows
  .filter((row) => row.status !== "coberto")
  .sort((a, b) => b.pending - a.pending || a.name.localeCompare(b.name, "pt-BR"))) {
  console.log(`| ${row.id} | ${row.name} | ${row.category} | ${row.illustrated}/${row.totalFigures} | ${row.pending} | ${row.status} |`);
}

console.log("\n## Rastreabilidade\n");
const withIssues = reportRows.filter((row) => row.traceabilityIssues > 0);
if (withIssues.length === 0) {
  console.log("Todas as figuras com imagem possuem crédito e URL de fonte.");
} else {
  for (const row of withIssues) {
    console.log(`- ${row.name}: ${row.traceabilityIssues} figura(s) com rastreabilidade incompleta.`);
  }
}
