import { describe, expect, it, vi } from "vitest";
import { getServerHealth } from "./health";

describe("getServerHealth", () => {
  it("reporta estado saudável quando banco responde", async () => {
    const snapshot = await getServerHealth({
      now: () => 1_700_000_000_000,
      uptimeSeconds: () => 125,
      memoryRssBytes: () => 64 * 1_048_576,
      checkDatabase: async () => undefined,
    });

    expect(snapshot).toMatchObject({
      status: "healthy",
      uptimeSeconds: 125,
      memoryRssBytes: 64 * 1_048_576,
      database: { status: "connected", latencyMs: 0 },
    });
    expect(snapshot.checkedAt).toBe("2023-11-14T22:13:20.000Z");
  });

  it("reporta estado degradado sem expor detalhes internos quando banco falha", async () => {
    const snapshot = await getServerHealth({
      now: () => 1_700_000_000_000,
      checkDatabase: async () => {
        throw new Error("connection refused: sensitive endpoint");
      },
    });

    expect(snapshot.status).toBe("degraded");
    expect(snapshot.database).toEqual({ status: "unavailable", latencyMs: null });
    expect(JSON.stringify(snapshot)).not.toContain("sensitive endpoint");
  });

  it("mantém o retrato degradado quando a checagem do banco não responde", async () => {
    vi.useFakeTimers();
    const pendingCheck = new Promise<void>(() => undefined);
    const snapshotPromise = getServerHealth({
      now: () => 1_700_000_000_000,
      checkDatabase: () => pendingCheck,
    });

    await vi.advanceTimersByTimeAsync(2_500);
    await expect(snapshotPromise).resolves.toMatchObject({
      status: "degraded",
      database: { status: "unavailable", latencyMs: null },
    });
    vi.useRealTimers();
  });
});
