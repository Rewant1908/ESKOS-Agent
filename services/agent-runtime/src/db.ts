import { Pool } from "pg";

if (!process.env.POSTGRES_HOST || !process.env.POSTGRES_PASSWORD) {
  console.warn(
    "[agent-runtime] POSTGRES_HOST or POSTGRES_PASSWORD not set — agent run logging will fail. " +
    "Set these environment variables to enable persistence."
  );
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER || "eskos",
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || "eskos_knowledge",
});

export default pool;
