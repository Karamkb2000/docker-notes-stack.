const express = require("express");
const { Pool } = require("pg");
const { createClient } = require("redis");

const pool = new Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || "app",
  password: process.env.PGPASSWORD || "app",
  database: process.env.PGDATABASE || "notes"
});

const redis = createClient({ url: process.env.REDIS_URL || "redis://cache:6379" });
redis.on("error", (err) => console.error("redis error:", err.message));

async function ensureSchema() {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, text TEXT NOT NULL)"
  );
}

async function start() {
  await redis.connect();
  await ensureSchema();

  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/notes", async (req, res) => {
    const { rows } = await pool.query("SELECT id, text FROM notes ORDER BY id");
    res.json(rows);
  });

  app.post("/api/notes", async (req, res) => {
    const text = ((req.body && req.body.text) || "").trim();
    if (!text) return res.status(400).json({ error: "text is required" });
    const { rows } = await pool.query(
      "INSERT INTO notes (text) VALUES ($1) RETURNING id, text",
      [text]
    );
    await redis.incr("notes_created");
    res.status(201).json(rows[0]);
  });

  app.get("/api/stats", async (req, res) => {
    const created = await redis.get("notes_created");
    const ticks = await redis.get("worker_ticks");
    res.json({ notesCreated: Number(created || 0), workerTicks: Number(ticks || 0) });
  });

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`api listening on ${port}`));
}

start().catch((err) => {
  console.error("failed to start api:", err);
  process.exit(1);
});
