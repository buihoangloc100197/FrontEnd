import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { appConfig } from "@/lib/env";

const dbRelativePath = "data/app.db";
const dbDirectory = path.dirname(path.join(process.cwd(), dbRelativePath));
const dbPath = path.join(process.cwd(), dbRelativePath);

fs.mkdirSync(dbDirectory, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    mssv TEXT,
    class_name TEXT,
    gender TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    profile_complete INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const userColumns = db
  .prepare("PRAGMA table_info(users)")
  .all() as Array<{ name: string }>;

const hasAvatarColumn = userColumns.some((column) => column.name === "avatar_url");

if (!hasAvatarColumn) {
  db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
}

const seedSettings = db.prepare(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
);

seedSettings.run("app_name", appConfig.appName);
seedSettings.run("api_base_url", appConfig.apiBaseUrl);
seedSettings.run("app_domain", appConfig.appDomain);

export function getDatabaseStatus() {
  const result = db
    .prepare("SELECT COUNT(*) AS total FROM settings")
    .get() as { total: number };

  return {
    path: dbPath,
    total: result.total,
  };
}

export function insertLog(message: string) {
  db.prepare("INSERT INTO logs (message) VALUES (?)").run(message);
}

export default db;
