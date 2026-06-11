import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

// Mock the db module so tests run without a real database connection.
vi.mock("./db", () => {
  return {
    getSurgeryHistory: vi.fn(async () => [
      {
        id: 10,
        userId: 1,
        localId: "s-1",
        procedureId: "rtu-p",
        procedureName: "RTU-P",
        patientName: "Paciente A",
        surgeryDate: "2026-06-01",
        config: { lateralidade: "Direito" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
    getDjTimers: vi.fn(async () => []),
    getFavorites: vi.fn(async () => ["rtu-p"]),
    getHospitalPresets: vi.fn(async () => []),
    replaceSurgeryHistory: vi.fn(async () => undefined),
    replaceDjTimers: vi.fn(async () => undefined),
    replaceFavorites: vi.fn(async () => undefined),
    replaceHospitalPresets: vi.fn(async () => undefined),
  };
});

import { appRouter } from "./routers";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(authed = true): TrpcContext {
  const user: AuthenticatedUser | null = authed
    ? {
        id: 1,
        openId: "sample-user",
        email: "sample@example.com",
        name: "Dr. Felipe",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("sync.pull", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates all user data for an authenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(true));
    const result = await caller.sync.pull();

    expect(result.surgeries).toHaveLength(1);
    expect(result.surgeries[0]?.procedureId).toBe("rtu-p");
    expect(result.favorites).toEqual(["rtu-p"]);
    expect(result.timers).toEqual([]);
    expect(result.presets).toEqual([]);
    expect(db.getSurgeryHistory).toHaveBeenCalledWith(1);
  });

  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createCtx(false));
    await expect(caller.sync.pull()).rejects.toThrow();
  });
});

describe("sync push mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pushes surgeries and reports success", async () => {
    const caller = appRouter.createCaller(createCtx(true));
    const rows = [
      {
        localId: "s-2",
        procedureId: "nlp",
        procedureName: "NLP",
        patientName: "Paciente B",
        surgeryDate: "2026-06-10",
        config: { lado: "Esquerdo" },
      },
    ];
    const result = await caller.sync.pushSurgeries({ rows });
    expect(result).toEqual({ success: true });
    expect(db.replaceSurgeryHistory).toHaveBeenCalledWith(1, rows);
  });

  it("pushes favorites and reports success", async () => {
    const caller = appRouter.createCaller(createCtx(true));
    const result = await caller.sync.pushFavorites({
      procedureIds: ["rtu-p", "nlp"],
    });
    expect(result).toEqual({ success: true });
    expect(db.replaceFavorites).toHaveBeenCalledWith(1, ["rtu-p", "nlp"]);
  });

  it("pushes timers and reports success", async () => {
    const caller = appRouter.createCaller(createCtx(true));
    const rows = [
      {
        localId: "t-1",
        patientName: "Paciente C",
        insertionDate: "2026-06-01",
        removalDate: "2026-06-22",
        lateralidade: "Direito",
        procedureId: "rtu-p",
        completed: false,
      },
    ];
    const result = await caller.sync.pushTimers({ rows });
    expect(result).toEqual({ success: true });
    expect(db.replaceDjTimers).toHaveBeenCalledWith(1, rows);
  });

  it("pushes hospital presets and reports success", async () => {
    const caller = appRouter.createCaller(createCtx(true));
    const rows = [
      { localId: "p-1", name: "Hospital São Luiz", defaults: { hospital: "São Luiz" } },
    ];
    const result = await caller.sync.pushPresets({ rows });
    expect(result).toEqual({ success: true });
    expect(db.replaceHospitalPresets).toHaveBeenCalledWith(1, rows);
  });

  it("rejects push from unauthenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(false));
    await expect(
      caller.sync.pushFavorites({ procedureIds: ["rtu-p"] })
    ).rejects.toThrow();
  });
});
