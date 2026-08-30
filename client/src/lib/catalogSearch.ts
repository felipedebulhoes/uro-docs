import type { Procedure } from "@/data/procedures";

export type CatalogSearchFilters = {
  query: string;
  category: string | null;
  calculatorsOnly: boolean;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function procedureHasCalculator(procedure: Procedure): boolean {
  return procedure.configFields.some((field) => field.type === "calculated");
}

export function searchCatalog(
  procedures: Procedure[],
  filters: CatalogSearchFilters
): Procedure[] {
  const query = normalize(filters.query);
  const looksForCalculator = /\b(calculadora|calculadoras|calculo|calculos)\b/.test(query);

  return procedures.filter((procedure) => {
    const hasCalculator = procedureHasCalculator(procedure);
    const searchableContent = normalize(
      [
        procedure.name,
        procedure.shortName,
        procedure.category,
        procedure.id.replace(/-/g, " "),
        ...procedure.configFields.flatMap((field) => [
          field.id.replace(/-/g, " "),
          field.label,
          ...(field.options ?? []),
        ]),
      ].join(" ")
    );

    const matchesQuery =
      query === "" ||
      searchableContent.includes(query) ||
      (looksForCalculator && hasCalculator);
    const matchesCategory =
      filters.category === null || procedure.category === filters.category;

    return matchesQuery && matchesCategory && (!filters.calculatorsOnly || hasCalculator);
  });
}
