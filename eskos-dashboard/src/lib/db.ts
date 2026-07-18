import { Pool } from "pg";

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "eskos",
    password: process.env.POSTGRES_PASSWORD || "eskosdbpass123",
    database: process.env.POSTGRES_DB || "eskos_knowledge",
  });
} else {
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool({
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
      user: process.env.POSTGRES_USER || "eskos",
      password: process.env.POSTGRES_PASSWORD || "eskosdbpass123",
      database: process.env.POSTGRES_DB || "eskos_knowledge",
    });
  }
  pool = (global as any).pgPool;
}

export default pool;
