import express from "express";
import { Client } from "pg";

const app = express();
const db = new Client({ connectionString: process.env.DATABASE_URL });

app.get("/health", async (_req, res) => {
  await db.query("select 1");
  res.json({ ok: true });
});
