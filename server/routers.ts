import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const surgerySchema = z.object({
  localId: z.string(),
  procedureId: z.string(),
  procedureName: z.string().nullable().optional(),
  patientName: z.string().nullable().optional(),
  surgeryDate: z.string().nullable().optional(),
  config: z.any().optional(),
});

const timerSchema = z.object({
  localId: z.string(),
  patientName: z.string().nullable().optional(),
  insertionDate: z.string().nullable().optional(),
  removalDate: z.string().nullable().optional(),
  lateralidade: z.string().nullable().optional(),
  procedureId: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

const presetSchema = z.object({
  localId: z.string(),
  name: z.string(),
  defaults: z.any().optional(),
});

const prescriptionTemplateSchema = z.object({
  localId: z.string(),
  procedureId: z.string(),
  name: z.string(),
  content: z.string(),
  favorite: z.boolean().optional(),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Cloud sync for UroDocx personal data
  sync: router({
    pull: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const [surgeries, timers, favorites, presets, prescriptionTemplates] =
        await Promise.all([
          db.getSurgeryHistory(userId),
          db.getDjTimers(userId),
          db.getFavorites(userId),
          db.getHospitalPresets(userId),
          db.getPrescriptionTemplates(userId),
        ]);
      return { surgeries, timers, favorites, presets, prescriptionTemplates };
    }),

    pushSurgeries: protectedProcedure
      .input(z.object({ rows: z.array(surgerySchema) }))
      .mutation(async ({ ctx, input }) => {
        await db.replaceSurgeryHistory(ctx.user.id, input.rows);
        return { success: true } as const;
      }),

    pushTimers: protectedProcedure
      .input(z.object({ rows: z.array(timerSchema) }))
      .mutation(async ({ ctx, input }) => {
        await db.replaceDjTimers(ctx.user.id, input.rows);
        return { success: true } as const;
      }),

    pushFavorites: protectedProcedure
      .input(z.object({ procedureIds: z.array(z.string()) }))
      .mutation(async ({ ctx, input }) => {
        await db.replaceFavorites(ctx.user.id, input.procedureIds);
        return { success: true } as const;
      }),

    pushPresets: protectedProcedure
      .input(z.object({ rows: z.array(presetSchema) }))
      .mutation(async ({ ctx, input }) => {
        await db.replaceHospitalPresets(ctx.user.id, input.rows);
        return { success: true } as const;
      }),

    pushPrescriptionTemplates: protectedProcedure
      .input(z.object({ rows: z.array(prescriptionTemplateSchema) }))
      .mutation(async ({ ctx, input }) => {
        await db.replacePrescriptionTemplates(ctx.user.id, input.rows);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
