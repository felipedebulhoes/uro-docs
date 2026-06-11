import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  surgeryHistory,
  djTimers,
  userFavorites,
  hospitalPresets,
  prescriptionTemplates,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ---------------------------------------------------------------------------
// Cloud sync helpers (UroDocx)
// ---------------------------------------------------------------------------

type SurgeryRow = {
  localId: string;
  procedureId: string;
  procedureName?: string | null;
  patientName?: string | null;
  surgeryDate?: string | null;
  config?: unknown;
};

export async function getSurgeryHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(surgeryHistory).where(eq(surgeryHistory.userId, userId));
}

export async function replaceSurgeryHistory(userId: number, rows: SurgeryRow[]) {
  const db = await getDb();
  if (!db) return;
  await db.delete(surgeryHistory).where(eq(surgeryHistory.userId, userId));
  if (rows.length === 0) return;
  await db.insert(surgeryHistory).values(
    rows.map((r) => ({
      userId,
      localId: r.localId,
      procedureId: r.procedureId,
      procedureName: r.procedureName ?? null,
      patientName: r.patientName ?? null,
      surgeryDate: r.surgeryDate ?? null,
      config: r.config ?? null,
    }))
  );
}

type TimerRow = {
  localId: string;
  patientName?: string | null;
  insertionDate?: string | null;
  removalDate?: string | null;
  lateralidade?: string | null;
  procedureId?: string | null;
  completed?: boolean;
};

export async function getDjTimers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(djTimers).where(eq(djTimers.userId, userId));
}

export async function replaceDjTimers(userId: number, rows: TimerRow[]) {
  const db = await getDb();
  if (!db) return;
  await db.delete(djTimers).where(eq(djTimers.userId, userId));
  if (rows.length === 0) return;
  await db.insert(djTimers).values(
    rows.map((r) => ({
      userId,
      localId: r.localId,
      patientName: r.patientName ?? null,
      insertionDate: r.insertionDate ?? null,
      removalDate: r.removalDate ?? null,
      lateralidade: r.lateralidade ?? null,
      procedureId: r.procedureId ?? null,
      completed: r.completed ?? false,
    }))
  );
}

export async function getFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId));
  return rows.map((r) => r.procedureId);
}

export async function replaceFavorites(userId: number, procedureIds: string[]) {
  const db = await getDb();
  if (!db) return;
  await db.delete(userFavorites).where(eq(userFavorites.userId, userId));
  if (procedureIds.length === 0) return;
  await db.insert(userFavorites).values(
    procedureIds.map((procedureId) => ({ userId, procedureId }))
  );
}

type PresetRow = {
  localId: string;
  name: string;
  defaults?: unknown;
};

export async function getHospitalPresets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(hospitalPresets)
    .where(eq(hospitalPresets.userId, userId));
}

export async function replaceHospitalPresets(userId: number, rows: PresetRow[]) {
  const db = await getDb();
  if (!db) return;
  await db.delete(hospitalPresets).where(eq(hospitalPresets.userId, userId));
  if (rows.length === 0) return;
  await db.insert(hospitalPresets).values(
    rows.map((r) => ({
      userId,
      localId: r.localId,
      name: r.name,
      defaults: r.defaults ?? null,
    }))
  );
}

type PrescriptionTemplateRow = {
  localId: string;
  procedureId: string;
  name: string;
  content: string;
  favorite?: boolean;
};

export async function getPrescriptionTemplates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(prescriptionTemplates)
    .where(eq(prescriptionTemplates.userId, userId));
}

export async function replacePrescriptionTemplates(
  userId: number,
  rows: PrescriptionTemplateRow[]
) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(prescriptionTemplates)
    .where(eq(prescriptionTemplates.userId, userId));
  if (rows.length === 0) return;
  await db.insert(prescriptionTemplates).values(
    rows.map((r) => ({
      userId,
      localId: r.localId,
      procedureId: r.procedureId,
      name: r.name,
      content: r.content,
      favorite: r.favorite ?? false,
    }))
  );
}

// Suppress unused import warning if `and` is not used elsewhere.
void and;
