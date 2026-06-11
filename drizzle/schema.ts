import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Surgery history records synced to the cloud. */
export const surgeryHistory = mysqlTable("surgery_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  localId: varchar("localId", { length: 64 }).notNull(),
  procedureId: varchar("procedureId", { length: 128 }).notNull(),
  procedureName: text("procedureName"),
  patientName: text("patientName"),
  surgeryDate: varchar("surgeryDate", { length: 32 }),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SurgeryHistory = typeof surgeryHistory.$inferSelect;
export type InsertSurgeryHistory = typeof surgeryHistory.$inferInsert;

/** Double-J stent timers synced to the cloud. */
export const djTimers = mysqlTable("dj_timers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  localId: varchar("localId", { length: 64 }).notNull(),
  patientName: text("patientName"),
  insertionDate: varchar("insertionDate", { length: 32 }),
  removalDate: varchar("removalDate", { length: 32 }),
  lateralidade: varchar("lateralidade", { length: 32 }),
  procedureId: varchar("procedureId", { length: 128 }),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DjTimer = typeof djTimers.$inferSelect;
export type InsertDjTimer = typeof djTimers.$inferInsert;

/** Favorite procedures synced to the cloud. */
export const userFavorites = mysqlTable("user_favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  procedureId: varchar("procedureId", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

/** Hospital presets synced to the cloud. */
export const hospitalPresets = mysqlTable("hospital_presets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  localId: varchar("localId", { length: 64 }).notNull(),
  name: text("name").notNull(),
  defaults: json("defaults"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HospitalPreset = typeof hospitalPresets.$inferSelect;
export type InsertHospitalPreset = typeof hospitalPresets.$inferInsert;


/** Custom prescription templates synced to the cloud. */
export const prescriptionTemplates = mysqlTable("prescription_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  localId: varchar("localId", { length: 64 }).notNull(),
  procedureId: varchar("procedureId", { length: 128 }).notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  favorite: boolean("favorite").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrescriptionTemplate = typeof prescriptionTemplates.$inferSelect;
export type InsertPrescriptionTemplate = typeof prescriptionTemplates.$inferInsert;
