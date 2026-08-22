import type { AtlasGlobalResult } from "./atlasGlobalSearch";

export const ATLAS_RECENT_SEARCHES_KEY = "urodocs.atlas.recent-searches";
export const ATLAS_FAVORITE_RESULTS_KEY = "urodocs.atlas.favorite-results";
export const MAX_RECENT_SEARCHES = 6;
export const MAX_FAVORITE_RESULTS = 12;

function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseStoredSearches(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return uniqueBy(
      parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()),
      (item) => item.toLocaleLowerCase("pt-BR")
    ).slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function appendRecentSearch(searches: string[], query: string): string[] {
  const normalized = query.trim();
  if (normalized.length < 2) return searches;
  return uniqueBy([normalized, ...searches], (item) => item.toLocaleLowerCase("pt-BR")).slice(0, MAX_RECENT_SEARCHES);
}

function isAtlasGlobalResult(value: unknown): value is AtlasGlobalResult {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AtlasGlobalResult>;
  return (
    typeof item.key === "string" &&
    typeof item.entryId === "string" &&
    typeof item.entryName === "string" &&
    typeof item.category === "string" &&
    typeof item.kind === "string" &&
    (typeof item.sectionIndex === "number" || item.sectionIndex === null) &&
    (typeof item.sectionTitle === "string" || item.sectionTitle === null) &&
    typeof item.summary === "string" &&
    typeof item.score === "number"
  );
}

export function parseStoredFavorites(value: string | null): AtlasGlobalResult[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return uniqueBy(parsed.filter(isAtlasGlobalResult), (item) => item.key).slice(0, MAX_FAVORITE_RESULTS);
  } catch {
    return [];
  }
}

export function toggleFavoriteResult(favorites: AtlasGlobalResult[], result: AtlasGlobalResult): AtlasGlobalResult[] {
  const isSaved = favorites.some((item) => item.key === result.key);
  if (isSaved) return favorites.filter((item) => item.key !== result.key);
  return [result, ...favorites].slice(0, MAX_FAVORITE_RESULTS);
}
