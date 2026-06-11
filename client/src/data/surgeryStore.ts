// Store para histórico de cirurgias e timers de DJ (localStorage)

export interface SurgeryRecord {
  id: string;
  procedureId: string;
  procedureName: string;
  patientName: string;
  date: string;
  config: Record<string, string>;
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
}

const HISTORY_KEY = "urodocx_history";
const TIMERS_KEY = "urodocx_dj_timers";
const FAVORITES_KEY = "urodocx_favorites";
const RECENTS_KEY = "urodocx_recents";

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
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addDJTimer(timer: Omit<DJTimer, "id" | "completed">): DJTimer {
  const timers = getDJTimers();
  const newTimer: DJTimer = {
    ...timer,
    id: crypto.randomUUID(),
    completed: false,
  };
  timers.unshift(newTimer);
  localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
  return newTimer;
}

export function completeDJTimer(id: string): void {
  const timers = getDJTimers().map((t) =>
    t.id === id ? { ...t, completed: true } : t
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
