import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const migrationPath = fileURLToPath(new URL("./migrations/001_initial.sql", import.meta.url));

try {
  await pool.query(await readFile(migrationPath, "utf8"));
  console.log("Database migration applied");
} finally {
  await pool.end();
}
