import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
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
    role TEXT NOT NULL DEFAULT 'user',
    profile_complete INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS computers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    room TEXT NOT NULL,
    specs TEXT,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS borrow_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    computer_id INTEGER NOT NULL,
    borrower_id INTEGER NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER,
    approved_at TEXT,
    returned_at TEXT,
    FOREIGN KEY (computer_id) REFERENCES computers(id),
    FOREIGN KEY (borrower_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  );
`);

const userColumns = db
  .prepare("PRAGMA table_info(users)")
  .all() as Array<{ name: string }>;

const hasAvatarColumn = userColumns.some((column) => column.name === "avatar_url");
const hasRoleColumn = userColumns.some((column) => column.name === "role");

if (!hasAvatarColumn) {
  db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
}

if (!hasRoleColumn) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';");
}

db.prepare("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''").run();

const deduplicateComputers = () => {
  const duplicateGroups = db
    .prepare(
      "SELECT name, room, MIN(id) AS keep_id FROM computers GROUP BY name, room HAVING COUNT(*) > 1",
    )
    .all() as Array<{ name: string; room: string; keep_id: number }>;

  for (const duplicate of duplicateGroups) {
    db.prepare(
      "UPDATE borrow_requests SET computer_id = ? WHERE computer_id IN (SELECT id FROM computers WHERE name = ? AND room = ? AND id != ?)",
    ).run(duplicate.keep_id, duplicate.name, duplicate.room, duplicate.keep_id);

    db.prepare(
      "DELETE FROM computers WHERE name = ? AND room = ? AND id != ?",
    ).run(duplicate.name, duplicate.room, duplicate.keep_id);
  }

  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_computers_name_room ON computers (name, room)",
  );
};

const seedSettings = db.prepare(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
);

seedSettings.run("app_name", appConfig.appName);
seedSettings.run("api_base_url", appConfig.apiBaseUrl);
seedSettings.run("app_domain", appConfig.appDomain);

deduplicateComputers();

const seedComputers = db.prepare(
  "INSERT OR IGNORE INTO computers (name, room, specs, status, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
);

seedComputers.run("M01", "C201", "Intel i5, 16GB RAM, SSD 512GB", "available");
seedComputers.run("M02", "C201", "Intel i7, 16GB RAM, SSD 512GB", "available");
seedComputers.run("M03", "C201", "Intel i5, 8GB RAM, SSD 256GB", "available");
seedComputers.run("M04", "C201", "Intel i7, 32GB RAM, SSD 1TB", "available");

const seedDefaultUser = db.prepare(
  "INSERT OR IGNORE INTO users (username, password_hash, full_name, email, role, profile_complete, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
);

seedDefaultUser.run(
  "admin",
  bcrypt.hashSync("123", 10),
  "System Admin",
  "admin@example.com",
  "admin",
  1,
);

db.prepare("UPDATE users SET role = 'admin' WHERE username = 'admin' AND role != 'admin'").run();

const hasBorrowRequestSeed = db
  .prepare("SELECT EXISTS(SELECT 1 FROM users WHERE id = 1) AS has_user")
  .get() as { has_user: number };

if (Number(hasBorrowRequestSeed.has_user) === 1) {
  const seedBorrowRequests = db.prepare(
    "INSERT OR IGNORE INTO borrow_requests (computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)",
  );

  seedBorrowRequests.run(1, 1, "Cần làm bài tập nhóm", "pending", null, null, null);
}

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
