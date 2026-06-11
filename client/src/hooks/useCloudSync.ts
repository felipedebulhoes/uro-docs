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

const HISTORY_KEY = "urodocx_history";
const TIMERS_KEY = "urodocx_dj_timers";
const FAVORITES_KEY = "urodocx_favorites";
const PRESETS_KEY = "uro-docs-hospital-presets";
const SYNCED_FLAG = "urodocx_cloud_pulled";

/**
 * Cloud sync layer for UroDocx.
 *
 * Strategy: localStorage is the working source of truth (works fully offline).
 * When the user is authenticated:
 *  - On first load, pull cloud data and merge into localStorage (union by id).
 *  - Expose push helpers that mirror the full local dataset to the cloud.
 *
 * This keeps every existing localStorage-based feature working unchanged while
 * giving the doctor a durable, cross-device backup.
 */
export function useCloudSync() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [synced, setSynced] = useState(false);
  const pulledRef = useRef(false);

  const pushSurgeries = trpc.sync.pushSurgeries.useMutation();
  const pushTimers = trpc.sync.pushTimers.useMutation();
  const pushFavorites = trpc.sync.pushFavorites.useMutation();
  const pushPresets = trpc.sync.pushPresets.useMutation();

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

  // ---- Initial pull + merge ----------------------------------------------
  useEffect(() => {
    if (loading || !isAuthenticated || pulledRef.current) return;
    pulledRef.current = true;

    (async () => {
      try {
        const cloud = await utils.sync.pull.fetch();

        // Merge surgeries (union by localId)
        const localHistory = getHistory();
        const localHistoryIds = new Set(localHistory.map((r) => r.id));
        const cloudHistory: SurgeryRecord[] = (cloud.surgeries || [])
          .filter((c: any) => !localHistoryIds.has(c.localId))
          .map((c: any) => ({
            id: c.localId,
            procedureId: c.procedureId,
            procedureName: c.procedureName ?? "",
            patientName: c.patientName ?? "",
            date: c.surgeryDate ?? "",
            config: (c.config as Record<string, string>) ?? {},
            createdAt: c.createdAt
              ? new Date(c.createdAt).toISOString()
              : new Date().toISOString(),
          }));
        const mergedHistory = [...localHistory, ...cloudHistory]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 200);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(mergedHistory));

        // Merge timers (union by localId)
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
        const mergedTimers = [...localTimers, ...cloudTimers];
        localStorage.setItem(TIMERS_KEY, JSON.stringify(mergedTimers));

        // Merge favorites (union)
        const mergedFavorites = Array.from(
          new Set([...getFavorites(), ...((cloud.favorites as string[]) || [])])
        );
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(mergedFavorites));

        // Merge presets (union by localId)
        const localPresets = getPresets();
        const localPresetIds = new Set(localPresets.map((p) => p.id));
        const cloudPresets: HospitalPreset[] = (cloud.presets || [])
          .filter((c: any) => !localPresetIds.has(c.localId))
          .map((c: any) => ({
            id: c.localId,
            name: c.name,
            defaults: (c.defaults as Record<string, string>) ?? {},
            createdAt: c.createdAt
              ? new Date(c.createdAt).toISOString()
              : new Date().toISOString(),
          }));
        const mergedPresets = [...localPresets, ...cloudPresets];
        localStorage.setItem(PRESETS_KEY, JSON.stringify(mergedPresets));

        localStorage.setItem(SYNCED_FLAG, new Date().toISOString());
        setSynced(true);

        // Push the merged result back so the cloud is the union too.
        syncSurgeries();
        syncTimers();
        syncFavorites();
        syncPresets();
      } catch (err) {
        // Offline or backend error — keep using localStorage silently.
        console.warn("[CloudSync] pull failed, using local data", err);
      }
    })();
  }, [
    loading,
    isAuthenticated,
    utils,
    syncSurgeries,
    syncTimers,
    syncFavorites,
    syncPresets,
  ]);

  return {
    isAuthenticated,
    synced,
    syncSurgeries,
    syncTimers,
    syncFavorites,
    syncPresets,
  };
}
