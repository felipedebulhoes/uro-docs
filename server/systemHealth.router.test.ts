import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { healthMock } = vi.hoisted(() => ({ healthMock: vi.fn() }));

vi.mock("./health", () => ({
  getServerHealth: healthMock,
}));

import { appRouter } from "./routers";

type Role = "admin" | "user" | null;

function createContext(role: Role): TrpcContext {
  return {
    user:
      role === null
        ? null
        : {
            id: 1,
            openId: "health-test-user",
            name: "Health Test",
            email: "health@example.com",
            loginMethod: "manus",
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("system.adminHealth", () => {
  beforeEach(() => {
    healthMock.mockReset();
    healthMock.mockResolvedValue({
      status: "healthy",
      checkedAt: "2026-09-10T12:00:00.000Z",
      uptimeSeconds: 300,
      memoryRssBytes: 32 * 1_048_576,
      database: { status: "connected", latencyMs: 4 },
    });
  });

  it("permite consulta para administrador", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.system.adminHealth()).resolves.toMatchObject({
      status: "healthy",
      database: { status: "connected" },
    });
    expect(healthMock).toHaveBeenCalledTimes(1);
  });

  it("bloqueia usuário comum e usuário não autenticado", async () => {
    await expect(
      appRouter.createCaller(createContext("user")).system.adminHealth()
    ).rejects.toThrow();
    await expect(
      appRouter.createCaller(createContext(null)).system.adminHealth()
    ).rejects.toThrow();
    expect(healthMock).not.toHaveBeenCalled();
  });
});
