/**
 * Pure, framework-free helpers for the cloud sync layer.
 *
 * These functions contain the business logic for merging local and cloud
 * datasets and detecting conflicts. They are intentionally free of React,
 * localStorage and tRPC so they can be unit-tested in isolation and reused
 * by `useCloudSync`.
 */

export interface SurgeryLike {
  id: string;
  procedureId: string;
  procedureName: string;
  patientName: string;
  date: string;
  config: Record<string, string>;
  createdAt: string;
}

export interface PresetLike {
  id: string;
  name: string;
  defaults: Record<string, string>;
  createdAt: string;
}

export type SyncConflictKind = "surgery" | "preset";

export interface SyncConflict {
  kind: SyncConflictKind;
  localId: string;
  title: string;
  localSummary: string;
  cloudSummary: string;
  local: SurgeryLike | PresetLike;
  cloud: SurgeryLike | PresetLike;
}

/** Shallow, order-independent equality for a flat string→string config map. */
export function sameConfig(
  a: Record<string, string>,
  b: Record<string, string>
): boolean {
  const ak = Object.keys(a || {}).sort();
  const bk = Object.keys(b || {}).sort();
  if (ak.length !== bk.length) return false;
  return ak.every((k, i) => k === bk[i] && a[k] === b[k]);
}

export function surgerySummary(r: SurgeryLike): string {
  const fields = Object.entries(r.config || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  return `${r.patientName || "—"} | ${r.date || "—"}${fields ? " | " + fields : ""}`;
}

export function presetSummary(p: PresetLike): string {
  return (
    Object.entries(p.defaults || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ") || "(sem campos)"
  );
}

/** True when two surgery records sharing an id have divergent content. */
export function surgeryDiverges(local: SurgeryLike, cloud: SurgeryLike): boolean {
  return (
    local.patientName !== cloud.patientName ||
    local.date !== cloud.date ||
    local.procedureId !== cloud.procedureId ||
    !sameConfig(local.config, cloud.config)
  );
}

/** True when two presets sharing an id have divergent content. */
export function presetDiverges(local: PresetLike, cloud: PresetLike): boolean {
  return local.name !== cloud.name || !sameConfig(local.defaults, cloud.defaults);
}

/**
 * Merge cloud surgeries into the local list.
 * - Records present only in the cloud are appended (`newRecords`).
 * - Records present on both sides with divergent content are reported as
 *   conflicts (never silently overwritten).
 */
export function detectSurgeryConflicts(
  local: SurgeryLike[],
  cloud: SurgeryLike[]
): { newRecords: SurgeryLike[]; conflicts: SyncConflict[] } {
  const localById = new Map(local.map((r) => [r.id, r]));
  const newRecords: SurgeryLike[] = [];
  const conflicts: SyncConflict[] = [];

  for (const c of cloud) {
    const match = localById.get(c.id);
    if (!match) {
      newRecords.push(c);
      continue;
    }
    if (surgeryDiverges(match, c)) {
      conflicts.push({
        kind: "surgery",
        localId: c.id,
        title: `${match.procedureName || c.procedureName} — ${
          match.patientName || "paciente"
        }`,
        localSummary: surgerySummary(match),
        cloudSummary: surgerySummary(c),
        local: match,
        cloud: c,
      });
    }
  }

  return { newRecords, conflicts };
}

/** Same as `detectSurgeryConflicts` but for hospital presets. */
export function detectPresetConflicts(
  local: PresetLike[],
  cloud: PresetLike[]
): { newRecords: PresetLike[]; conflicts: SyncConflict[] } {
  const localById = new Map(local.map((p) => [p.id, p]));
  const newRecords: PresetLike[] = [];
  const conflicts: SyncConflict[] = [];

  for (const c of cloud) {
    const match = localById.get(c.id);
    if (!match) {
      newRecords.push(c);
      continue;
    }
    if (presetDiverges(match, c)) {
      conflicts.push({
        kind: "preset",
        localId: c.id,
        title: `Preset: ${match.name || c.name}`,
        localSummary: presetSummary(match),
        cloudSummary: presetSummary(c),
        local: match,
        cloud: c,
      });
    }
  }

  return { newRecords, conflicts };
}

/** Union merge of two string lists, preserving first-seen order. */
export function mergeFavorites(local: string[], cloud: string[]): string[] {
  return Array.from(new Set([...(local || []), ...(cloud || [])]));
}
