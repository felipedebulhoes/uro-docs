import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getHistory,
  getDJTimers,
  getFavorites,
  type SurgeryRecord,
  type DJTimer,
} from "@/data/surgeryStore";
import { getPresets, type HospitalPreset } from "@/data/hospitalPresets";
import {
  getAllTemplates,
  type PrescriptionTemplate,
} from "@/data/prescriptionTemplates";
import {
  detectSurgeryConflicts,
  detectPresetConflicts,
  mergeFavorites,
  type SyncConflict as PureSyncConflict,
} from "@/lib/syncLogic";

const HISTORY_KEY = "urodocx_history";
const TIMERS_KEY = "urodocx_dj_timers";
const FAVORITES_KEY = "urodocx_favorites";
const PRESETS_KEY = "uro-docs-hospital-presets";
const TEMPLATES_KEY = "urodocx_prescription_templates";
const SYNCED_FLAG = "urodocx_cloud_pulled";

/**
 * A conflict happens when the same record (matched by its stable localId)
 * exists both locally and in the cloud, but the meaningful content differs.
 * The UI lets the doctor decide which version to keep.
 */
export type SyncConflict = PureSyncConflict;

export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

/**
 * Cloud sync layer for UroDocx.
 *
 * Strategy: localStorage is the working source of truth (works fully offline).
 * When the user is authenticated:
 *  - On first load, pull cloud data and merge into localStorage (union by id).
 *  - Detect conflicts (same localId, divergent content) and surface them.
 *  - Expose push helpers + a manual `syncNow()` that mirrors the full local
 *    dataset to the cloud and re-pulls.
 */
export function useCloudSync() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [synced, setSynced] = useState(false);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SYNCED_FLAG);
    } catch {
      return null;
    }
  });
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const pulledRef = useRef(false);

  const pushSurgeries = trpc.sync.pushSurgeries.useMutation();
  const pushTimers = trpc.sync.pushTimers.useMutation();
  const pushFavorites = trpc.sync.pushFavorites.useMutation();
  const pushPresets = trpc.sync.pushPresets.useMutation();
  const pushTemplates = trpc.sync.pushPrescriptionTemplates.useMutation();

  // ---- Push helpers (mirror full local dataset to the cloud) -------------
  const syncSurgeries = useCallback(() => {
    if (!isAuthenticated) return;
    const rows = getHistory().map((r) => ({
      localId: r.id,
      procedureId: r.procedureId,
      procedureName: r.procedureName,
      patientName: r.patientName,
      surgeryDate: r.date,
      config: r.config,
    }));
    pushSurgeries.mutate({ rows });
  }, [isAuthenticated, pushSurgeries]);

  const syncTimers = useCallback(() => {
    if (!isAuthenticated) return;
    const rows = getDJTimers().map((t) => ({
      localId: t.id,
      patientName: t.patientName,
      insertionDate: t.insertionDate,
      removalDate: t.removalDate,
      lateralidade: t.lateralidade,
      procedureId: t.procedureId,
      completed: t.completed,
    }));
    pushTimers.mutate({ rows });
  }, [isAuthenticated, pushTimers]);

  const syncFavorites = useCallback(() => {
    if (!isAuthenticated) return;
    pushFavorites.mutate({ procedureIds: getFavorites() });
  }, [isAuthenticated, pushFavorites]);

  const syncPresets = useCallback(() => {
    if (!isAuthenticated) return;
    const rows = getPresets().map((p) => ({
      localId: p.id,
      name: p.name,
      defaults: p.defaults,
    }));
    pushPresets.mutate({ rows });
  }, [isAuthenticated, pushPresets]);

  const syncTemplates = useCallback(() => {
    if (!isAuthenticated) return;
    const rows = getAllTemplates().map((t) => ({
      localId: t.id,
      procedureId: t.procedureId,
      name: t.name,
      content: t.content,
      favorite: t.favorite,
      sortOrder: t.sortOrder,
    }));
    pushTemplates.mutate({ rows });
  }, [isAuthenticated, pushTemplates]);

  /**
   * Core merge routine. Pulls cloud data, merges non-conflicting records by
   * union of localId, collects conflicts for divergent records, and (when
   * requested) pushes the merged local dataset back to the cloud.
   * Returns the list of detected conflicts.
   */
  const mergeFromCloud = useCallback(
    async (pushBack: boolean): Promise<SyncConflict[]> => {
      const cloud = await utils.sync.pull.fetch();
      const detected: SyncConflict[] = [];

      // ---- Surgeries -----------------------------------------------------
      const localHistory = getHistory();
      const cloudSurgeries: SurgeryRecord[] = ((cloud.surgeries || []) as any[]).map(
        (c) => ({
          id: c.localId,
          procedureId: c.procedureId,
          procedureName: c.procedureName ?? "",
          patientName: c.patientName ?? "",
          date: c.surgeryDate ?? "",
          config: (c.config as Record<string, string>) ?? {},
          createdAt: c.createdAt
            ? new Date(c.createdAt).toISOString()
            : new Date().toISOString(),
        })
      );
      const surgeryMerge = detectSurgeryConflicts(
        localHistory as any,
        cloudSurgeries as any
      );
      detected.push(...surgeryMerge.conflicts);
      const newSurgeries = surgeryMerge.newRecords as unknown as SurgeryRecord[];
      const mergedHistory = [...localHistory, ...newSurgeries]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 200);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(mergedHistory));

      // ---- Timers (union by localId, last-write wins, no conflict UI) -----
      const localTimers = getDJTimers();
      const localTimerIds = new Set(localTimers.map((t) => t.id));
      const cloudTimers: DJTimer[] = (cloud.timers || [])
        .filter((c: any) => !localTimerIds.has(c.localId))
        .map((c: any) => ({
          id: c.localId,
          patientName: c.patientName ?? "",
          insertionDate: c.insertionDate ?? "",
          removalDate: c.removalDate ?? "",
          lateralidade: c.lateralidade ?? "",
          procedureId: c.procedureId ?? "",
          completed: Boolean(c.completed),
        }));
      localStorage.setItem(
        TIMERS_KEY,
        JSON.stringify([...localTimers, ...cloudTimers])
      );

      // ---- Favorites (union) ---------------------------------------------
      const mergedFavorites = mergeFavorites(
        getFavorites(),
        (cloud.favorites as string[]) || []
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(mergedFavorites));

      // ---- Presets -------------------------------------------------------
      const localPresets = getPresets();
      const cloudPresets: HospitalPreset[] = ((cloud.presets || []) as any[]).map(
        (c) => ({
          id: c.localId,
          name: c.name,
          defaults: (c.defaults as Record<string, string>) ?? {},
          createdAt: c.createdAt
            ? new Date(c.createdAt).toISOString()
            : new Date().toISOString(),
        })
      );
      const presetMerge = detectPresetConflicts(
        localPresets as any,
        cloudPresets as any
      );
      detected.push(...presetMerge.conflicts);
      const newPresets = presetMerge.newRecords as unknown as HospitalPreset[];
      localStorage.setItem(
        PRESETS_KEY,
        JSON.stringify([...localPresets, ...newPresets])
      );

      // ---- Prescription templates (union by localId, no conflict UI) -----
      const localTemplates = getAllTemplates();
      const localTemplateIds = new Set(localTemplates.map((t) => t.id));
      const cloudTemplates: PrescriptionTemplate[] = (
        cloud.prescriptionTemplates || []
      )
        .filter((c: any) => !localTemplateIds.has(c.localId))
        .map((c: any, i: number) => ({
          id: c.localId,
          procedureId: c.procedureId,
          name: c.name,
          content: c.content,
          favorite: Boolean(c.favorite),
          sortOrder: typeof c.sortOrder === "number" ? c.sortOrder : i,
          createdAt: c.createdAt
            ? new Date(c.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: c.updatedAt
            ? new Date(c.updatedAt).toISOString()
            : new Date().toISOString(),
        }));
      localStorage.setItem(
        TEMPLATES_KEY,
        JSON.stringify([...localTemplates, ...cloudTemplates])
      );

      const ts = new Date().toISOString();
      localStorage.setItem(SYNCED_FLAG, ts);
      setLastSyncedAt(ts);
      setSynced(true);

      if (pushBack) {
        syncSurgeries();
        syncTimers();
        syncFavorites();
        syncPresets();
        syncTemplates();
      }

      return detected;
    },
    [utils, syncSurgeries, syncTimers, syncFavorites, syncPresets, syncTemplates]
  );

  /**
   * Resolve a single conflict by choosing which version wins. Applies to the
   * matching record in localStorage and pushes the result back to the cloud.
   */
  const resolveConflict = useCallback(
    (localId: string, choice: "local" | "cloud") => {
      const conflict = conflicts.find((c) => c.localId === localId);
      if (!conflict) return;

      if (conflict.kind === "surgery") {
        const chosen = (
          choice === "local" ? conflict.local : conflict.cloud
        ) as SurgeryRecord;
        const history = getHistory().map((r) =>
          r.id === localId ? { ...r, ...chosen, id: localId } : r
        );
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        syncSurgeries();
      } else {
        const chosen = (
          choice === "local" ? conflict.local : conflict.cloud
        ) as HospitalPreset;
        const presets = getPresets().map((p) =>
          p.id === localId ? { ...p, ...chosen, id: localId } : p
        );
        localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
        syncPresets();
      }

      setConflicts((prev) => prev.filter((c) => c.localId !== localId));
    },
    [conflicts, syncSurgeries, syncPresets]
  );

  const resolveAll = useCallback(
    (choice: "local" | "cloud") => {
      const ids = conflicts.map((c) => c.localId);
      ids.forEach((id) => resolveConflict(id, choice));
    },
    [conflicts, resolveConflict]
  );

  /** Manual "Sync now": pull + merge + detect conflicts + push back. */
  const syncNow = useCallback(async (): Promise<{
    ok: boolean;
    conflicts: number;
  }> => {
    if (!isAuthenticated) return { ok: false, conflicts: 0 };
    setStatus("syncing");
    try {
      const detected = await mergeFromCloud(true);
      setConflicts(detected);
      setStatus("synced");
      return { ok: true, conflicts: detected.length };
    } catch (err) {
      console.warn("[CloudSync] manual sync failed", err);
      setStatus("offline");
      return { ok: false, conflicts: 0 };
    }
  }, [isAuthenticated, mergeFromCloud]);

  // ---- Initial pull + merge (runs once per session) ----------------------
  useEffect(() => {
    if (loading || !isAuthenticated || pulledRef.current) return;
    pulledRef.current = true;
    setStatus("syncing");
    (async () => {
      try {
        const detected = await mergeFromCloud(true);
        setConflicts(detected);
        setStatus("synced");
      } catch (err) {
        console.warn("[CloudSync] pull failed, using local data", err);
        setStatus("offline");
      }
    })();
  }, [loading, isAuthenticated, mergeFromCloud]);

  return {
    isAuthenticated,
    synced,
    status,
    lastSyncedAt,
    conflicts,
    syncNow,
    resolveConflict,
    resolveAll,
    syncSurgeries,
    syncTimers,
    syncFavorites,
    syncPresets,
    syncTemplates,
  };
}
