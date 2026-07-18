const { Pool } = require("pg");
const crypto = require("crypto");

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER || "eskos",
  password: process.env.POSTGRES_PASSWORD || "eskosdbpass123",
  database: process.env.POSTGRES_DB || "eskos_knowledge",
});

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const SEED_USERS = [
  { username: "Navin", password: "password123", role: "reviewer", tenant: "goel-scientific" },
  { username: "KP", password: "password123", role: "reviewer", tenant: "borosil-scientific" },
  { username: "Purnima", password: "password123", role: "admin", tenant: "shared" },
  { username: "Rewant", password: "password123", role: "admin", tenant: "goel-scientific" },
  { username: "Supervisor Console", password: "password123", role: "admin", tenant: "goel-scientific" }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Creating users table if it does not exist...");
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

    console.log("Seeding user records...");
    for (const u of SEED_USERS) {
      const hash = hashPassword(u.password);
      await client.query(`
        INSERT INTO users (username, password_hash, role, tenant)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            tenant = EXCLUDED.tenant;
      `, [u.username, hash, u.role, u.tenant]);
      console.log(`Seeded user: ${u.username}`);
    }

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Database seed error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
