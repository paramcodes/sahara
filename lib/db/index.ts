import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://sahara:sahara_dev_password@localhost:5432/sahara";

// Global pool caching to avoid exhausting connections. Keep the pool cached on
// globalThis in every environment so dev hot reloads and duplicate module loads
// (e.g. bundler splitting) reuse one pool instead of opening a new one per load.
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });

globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
