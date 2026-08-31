// Store para histórico de cirurgias e timers de DJ (localStorage)
import type { DocumentSnapshot } from "@/lib/documentSnapshot";

export interface SurgeryRecord {
  id: string;
  procedureId: string;
  procedureName: string;
  patientName: string;
  date: string;
  config: Record<string, string>;
  templateVersion?: string;
  documentSnapshot?: DocumentSnapshot;
  createdAt: string;
}

export interface DJTimer {
  id: string;
  patientName: string;
  insertionDate: string;
  removalDate: string;
  lateralidade: string;
  procedureId: string;
  completed: boolean;
  followUpStatus: "pending" | "contacted" | "removed";
  contactedAt?: string;
  removalConfirmedAt?: string;
}

export interface DocumentUsage {
  key: string;
  procedureId: string;
  documentId: string;
  documentLabel: string;
  count: number;
  lastUsedAt: string;
}

const HISTORY_KEY = "urodocx_history";
const TIMERS_KEY = "urodocx_dj_timers";
const FAVORITES_KEY = "urodocx_favorites";
const RECENTS_KEY = "urodocx_recents";
const DOCUMENT_USAGE_KEY = "urodocx_document_usage";
const CLOUD_RESTORE_PAUSED_KEY = "urodocx_cloud_restore_paused";

// History
export function getHistory(): SurgeryRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToHistory(record: Omit<SurgeryRecord, "id" | "createdAt">): SurgeryRecord {
  const history = getHistory();
  const newRecord: SurgeryRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  history.unshift(newRecord);
  // Keep last 200 records
  const trimmed = history.slice(0, 200);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  return newRecord;
}

// Returns the most recent saved record for a given procedure, or null.
export function getLastRecordForProcedure(procedureId: string): SurgeryRecord | null {
  const history = getHistory();
  // History is stored newest-first (unshift), so the first match is the latest.
  return history.find((r) => r.procedureId === procedureId) ?? null;
}

export function removeFromHistory(id: string): void {
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
}

// DJ Timers
export function getDJTimers(): DJTimer[] {
  try {
    const data = localStorage.getItem(TIMERS_KEY);
    const timers = data ? JSON.parse(data) : [];
    if (!Array.isArray(timers)) return [];
    return timers.map((timer) => ({
      ...timer,
      followUpStatus: timer.completed
        ? "removed"
        : timer.followUpStatus === "contacted"
          ? "contacted"
          : "pending",
    }));
  } catch {
    return [];
  }
}

export function addDJTimer(
  timer: Omit<DJTimer, "id" | "completed" | "followUpStatus" | "contactedAt" | "removalConfirmedAt">
): DJTimer {
  const timers = getDJTimers();
  const newTimer: DJTimer = {
    ...timer,
    id: crypto.randomUUID(),
    completed: false,
    followUpStatus: "pending",
  };
  timers.unshift(newTimer);
  localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
  return newTimer;
}

export function completeDJTimer(id: string): void {
  const timers = getDJTimers().map((t) =>
    t.id === id
      ? {
          ...t,
          completed: true,
          followUpStatus: "removed" as const,
          removalConfirmedAt: t.removalConfirmedAt ?? new Date().toISOString(),
        }
      : t
  );
  localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
}

export function markDJTimerContacted(id: string): void {
  const timers = getDJTimers().map((t) =>
    t.id === id && !t.completed
      ? {
          ...t,
          followUpStatus: "contacted" as const,
          contactedAt: t.contactedAt ?? new Date().toISOString(),
        }
      : t
  );
  localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
}

export function removeDJTimer(id: string): void {
  const timers = getDJTimers().filter((t) => t.id !== id);
  localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
}

// Favorites
export function getFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(procedureId: string): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(procedureId);
  if (index >= 0) {
    favorites.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return false;
  } else {
    favorites.push(procedureId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  }
}

// Recents
export function getRecents(): string[] {
  try {
    const data = localStorage.getItem(RECENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToRecents(procedureId: string): void {
  let recents = getRecents().filter((id) => id !== procedureId);
  recents.unshift(procedureId);
  recents = recents.slice(0, 10);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
}

function sortDocumentUsage(a: DocumentUsage, b: DocumentUsage): number {
  if (b.count !== a.count) return b.count - a.count;
  return b.lastUsedAt.localeCompare(a.lastUsedAt);
}

export function getDocumentUsage(): DocumentUsage[] {
  try {
    const data = localStorage.getItem(DOCUMENT_USAGE_KEY);
    const usage = data ? JSON.parse(data) : [];
    if (!Array.isArray(usage)) return [];
    return usage
      .filter(
        (item): item is DocumentUsage =>
          typeof item?.key === "string" &&
          typeof item?.procedureId === "string" &&
          typeof item?.documentId === "string" &&
          typeof item?.documentLabel === "string" &&
          typeof item?.count === "number" &&
          typeof item?.lastUsedAt === "string"
      )
      .sort(sortDocumentUsage);
  } catch {
    return [];
  }
}

export function recordDocumentUse(input: Omit<DocumentUsage, "key" | "count" | "lastUsedAt">): void {
  const usage = getDocumentUsage();
  const key = `${input.procedureId}:${input.documentId}`;
  const existing = usage.find((item) => item.key === key);
  const now = new Date().toISOString();
  const next = existing
    ? usage.map((item) =>
        item.key === key
          ? { ...item, documentLabel: input.documentLabel, count: item.count + 1, lastUsedAt: now }
          : item
      )
    : [...usage, { ...input, key, count: 1, lastUsedAt: now }];

  localStorage.setItem(
    DOCUMENT_USAGE_KEY,
    JSON.stringify(next.sort(sortDocumentUsage).slice(0, 40))
  );
}

export function getMostUsedDocuments(limit = 6): DocumentUsage[] {
  return getDocumentUsage().slice(0, Math.max(0, limit));
}

/**
 * Remove deste navegador os dados que podem identificar pacientes. O histórico,
 * os timers e o uso de documentos são apagados; preferências de navegação e
 * presets não clínicos permanecem disponíveis.
 */
export function clearLocalClinicalData(): void {
  [HISTORY_KEY, TIMERS_KEY, DOCUMENT_USAGE_KEY].forEach((key) =>
    localStorage.removeItem(key)
  );
  localStorage.setItem(CLOUD_RESTORE_PAUSED_KEY, "true");
}

export function isCloudRestorePaused(): boolean {
  try {
    return localStorage.getItem(CLOUD_RESTORE_PAUSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function resumeCloudRestore(): void {
  localStorage.removeItem(CLOUD_RESTORE_PAUSED_KEY);
}
