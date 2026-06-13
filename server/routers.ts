import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import * as db from "./db";
import { storagePut, storageGetSignedUrl } from "./storage";

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
  sortOrder: z.number().optional(),
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

  // Atlas Cirúrgico: imagens reais (atlas/artigos) protegidas por login
  atlas: router({
    // Lista todas as imagens com URL assinada de curta duração (apenas autenticados).
    images: protectedProcedure.query(async () => {
      const rows = await db.getAllAtlasImages();
      const out = await Promise.all(
        rows.map(async (r) => {
          let signedUrl = r.url;
          try {
            signedUrl = await storageGetSignedUrl(r.storageKey);
          } catch {
            // mantém /manus-storage como fallback
          }
          return {
            atlasId: r.atlasId,
            figureIndex: r.figureIndex,
            url: signedUrl,
            credit: r.credit,
            sourceUrl: r.sourceUrl,
            mimeType: r.mimeType,
          };
        })
      );
      return out;
    }),

    // Upload de imagem (somente admin/dono). Recebe base64 (data URL ou puro).
    uploadImage: adminProcedure
      .input(
        z.object({
          atlasId: z.string().min(1),
          figureIndex: z.number().int().min(0),
          base64: z.string().min(1),
          mimeType: z.string().min(1),
          credit: z.string().min(1),
          sourceUrl: z.string().nullable().optional(),
          ext: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const raw = input.base64.includes(",")
          ? input.base64.slice(input.base64.indexOf(",") + 1)
          : input.base64;
        const buffer = Buffer.from(raw, "base64");
        const ext = (input.ext || input.mimeType.split("/")[1] || "jpg")
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase();
        const relKey = `atlas/${input.atlasId}/fig-${input.figureIndex}.${ext}`;
        const { key, url } = await storagePut(relKey, buffer, input.mimeType);
        await db.upsertAtlasImage({
          atlasId: input.atlasId,
          figureIndex: input.figureIndex,
          storageKey: key,
          url,
          credit: input.credit,
          sourceUrl: input.sourceUrl ?? null,
          mimeType: input.mimeType,
        });
        return { success: true, key } as const;
      }),

    deleteImage: adminProcedure
      .input(z.object({ atlasId: z.string(), figureIndex: z.number().int() }))
      .mutation(async ({ input }) => {
        await db.deleteAtlasImage(input.atlasId, input.figureIndex);
        return { success: true } as const;
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
