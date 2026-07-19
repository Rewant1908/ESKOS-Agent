import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER || "eskos",
  password: process.env.POSTGRES_PASSWORD || "eskosdbpass123",
  database: process.env.POSTGRES_DB || "eskos_knowledge",
});

const USERS = [
  { username: "navin", role: "reviewer", tenant: "goel-scientific" },
  { username: "kp", role: "reviewer", tenant: "borosil-scientific" },
  { username: "purnima", role: "admin", tenant: "shared" },
  { username: "admin", role: "admin", tenant: "shared" }
];

async function main() {
  const client = await pool.connect();
  try {
    // Check if table users exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        tenant VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const u of USERS) {
      const plaintext = crypto.randomBytes(8).toString("hex"); // 16 characters hex
      const hash = await bcrypt.hash(plaintext, 12);
      await client.query(`
        INSERT INTO users (username, password_hash, role, tenant)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            tenant = EXCLUDED.tenant;
      `, [u.username, hash, u.role, u.tenant]);
      console.log(`SEED USER CREATED: username=${u.username} password=${plaintext} — SAVE THIS, IT WILL NOT BE SHOWN AGAIN`);
    }
  } catch (err) {
    console.error("Error seeding users:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
