import type { AtlasEntry } from "@/data/atlasData";

export type AtlasGlobalResultKind = "procedure" | "complication" | "section" | "reference";
export type AtlasGlobalResultFilter = "all" | AtlasGlobalResultKind;

export type AtlasGlobalResult = {
  key: string;
  entryId: string;
  entryName: string;
  category: string;
  kind: AtlasGlobalResultKind;
  sectionIndex: number | null;
  sectionTitle: string | null;
  summary: string;
  score: number;
};

export function filterAtlasGlobalResults(
  results: AtlasGlobalResult[],
  filter: AtlasGlobalResultFilter
): AtlasGlobalResult[] {
  return filter === "all" ? results : results.filter((result) => result.kind === filter);
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[*_`#>[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(value: string, limit = 164): string {
  const text = value
    .replace(/[*_`#]/g, "")
    .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}

function sectionKind(title: string): AtlasGlobalResultKind {
  const normalizedTitle = normalize(title);
  if (normalizedTitle.includes("complica") || normalizedTitle.includes("manejo")) return "complication";
  if (normalizedTitle.includes("refer")) return "reference";
  return "section";
}

function matchesAllTerms(content: string, terms: string[]): boolean {
  return terms.every((term) => content.includes(term));
}

export function searchAtlasGlobally(
  entries: AtlasEntry[],
  rawQuery: string,
  limit = 18
): AtlasGlobalResult[] {
  const query = normalize(rawQuery);
  const terms = query.split(" ").filter(Boolean);

  if (terms.length === 0) {
    return entries.slice(0, limit).map((entry, index) => ({
      key: `${entry.id}-procedure`,
      entryId: entry.id,
      entryName: entry.name,
      category: entry.category,
      kind: "procedure",
      sectionIndex: null,
      sectionTitle: null,
      summary: entry.evidence,
      score: limit - index,
    }));
  }

  const results: AtlasGlobalResult[] = [];

  for (const entry of entries) {
    const entryContent = normalize([entry.name, entry.category, entry.evidence, entry.id.replace(/-/g, " ")].join(" "));
    if (matchesAllTerms(entryContent, terms)) {
      results.push({
        key: `${entry.id}-procedure`,
        entryId: entry.id,
        entryName: entry.name,
        category: entry.category,
        kind: "procedure",
        sectionIndex: null,
        sectionTitle: null,
        summary: entry.evidence,
        score: entryContent.includes(query) ? 120 : 100,
      });
    }

    entry.sections.forEach((section, sectionIndex) => {
      const title = normalize(section.title);
      const body = normalize(section.body);
      const content = `${title} ${body}`;
      if (!matchesAllTerms(content, terms)) return;

      const kind = sectionKind(section.title);
      const titleBonus = title.includes(query) ? 56 : 0;
      const kindBonus = kind === "complication" ? 26 : kind === "reference" ? 10 : 0;
      results.push({
        key: `${entry.id}-section-${sectionIndex}`,
        entryId: entry.id,
        entryName: entry.name,
        category: entry.category,
        kind,
        sectionIndex,
        sectionTitle: section.title,
        summary: shortText(section.body),
        score: 70 + titleBonus + kindBonus,
      });
    });
  }

  return results
    .sort((a, b) => b.score - a.score || a.entryName.localeCompare(b.entryName, "pt-BR"))
    .slice(0, limit);
}
