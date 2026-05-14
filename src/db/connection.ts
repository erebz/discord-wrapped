import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import * as schema from "./schema";

// Strip the "file:" prefix that Drizzle config uses
const dbPath = env.DATABASE_URL.replace(/^file:/, "");

// Ensure the data directory exists before opening the file
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);

// WAL mode gives better concurrent read performance
sqlite.pragma("journal_mode = WAL");

export let db = drizzle(sqlite, { schema });

/**
 * For testing purposes only — allows injecting a mock or in-memory DB.
 */
export function setTestDb(testDb: any) {
  db = testDb;
}

/**
 * Run pending migrations from the ./drizzle folder.
 * Called once at application startup.
 */
export function runMigrations() {
  logger.info("Running database migrations");
  migrate(db, { migrationsFolder: "./drizzle" });
  logger.info("Migrations complete");
}
