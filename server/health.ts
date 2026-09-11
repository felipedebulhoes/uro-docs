import { sql } from "drizzle-orm";
import * as database from "./db";

export type ServerHealthSnapshot = {
  status: "healthy" | "degraded";
  checkedAt: string;
  uptimeSeconds: number;
  memoryRssBytes: number;
  database: {
    status: "connected" | "unavailable";
    latencyMs: number | null;
  };
};

const DATABASE_HEALTH_TIMEOUT_MS = 2_500;

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Database health check timed out")), timeoutMs);
    }),
  ]);
}

type HealthDependencies = {
  now?: () => number;
  uptimeSeconds?: () => number;
  memoryRssBytes?: () => number;
  checkDatabase?: () => Promise<void>;
};

export async function checkDatabaseConnection(): Promise<void> {
  const connection = await database.getDb();
  if (!connection) {
    throw new Error("Database connection is unavailable");
  }
  await connection.execute(sql`SELECT 1`);
}

/**
 * Produz um retrato de saúde sob demanda. Não mantém conexões persistentes
 * nem agenda verificações em segundo plano: o painel consulta apenas enquanto
 * está aberto.
 */
export async function getServerHealth(
  dependencies: HealthDependencies = {}
): Promise<ServerHealthSnapshot> {
  const now = dependencies.now ?? Date.now;
  const databaseCheck = dependencies.checkDatabase ?? checkDatabaseConnection;
  const startedAt = now();

  let databaseStatus: ServerHealthSnapshot["database"]["status"] = "connected";
  let latencyMs: number | null = null;

  try {
    await withTimeout(databaseCheck(), DATABASE_HEALTH_TIMEOUT_MS);
    latencyMs = Math.max(0, Math.round(now() - startedAt));
  } catch {
    databaseStatus = "unavailable";
  }

  return {
    status: databaseStatus === "connected" ? "healthy" : "degraded",
    checkedAt: new Date(now()).toISOString(),
    uptimeSeconds: Math.max(0, Math.floor((dependencies.uptimeSeconds ?? process.uptime)())),
    memoryRssBytes: Math.max(0, (dependencies.memoryRssBytes ?? (() => process.memoryUsage().rss))()),
    database: {
      status: databaseStatus,
      latencyMs,
    },
  };
}
