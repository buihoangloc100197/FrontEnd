import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const sqlitePath = path.join(root, 'data', 'app.db');
const envFile = path.join(root, '.env.local');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(envFile);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!fs.existsSync(sqlitePath)) {
  console.error('SQLite database not found at:', sqlitePath);
  process.exit(1);
}

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase env is missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

let sqlite3;
try {
  sqlite3 = await import('sqlite3');
} catch (error) {
  console.error('Missing sqlite3 package. Run: npm install sqlite3 --save-dev');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const db = new sqlite3.default.Database(sqlitePath, sqlite3.default.OPEN_READONLY);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrateTable({ table, selectSql, transform, upsertKey }) {
  const rows = await run(selectSql);
  if (!rows.length) {
    console.log(`[${table}] no rows found`);
    return;
  }

  for (const row of rows) {
    const payload = transform(row);
    const { error } = await supabase.from(table).upsert(payload, { onConflict: upsertKey });
    if (error) {
      console.error(`[${table}] insert failed`, error.message, payload);
    } else {
      console.log(`[${table}] migrated row:`, payload[upsertKey] ?? payload.id ?? 'n/a');
    }
  }
}

try {
  await migrateTable({
    table: 'users',
    selectSql: `SELECT id, username, password_hash, full_name, mssv, class_name, gender, phone, email, avatar_url, role, profile_complete, created_at, updated_at FROM users ORDER BY id`,
    transform: (row) => ({
      id: Number(row.id),
      username: row.username,
      password_hash: row.password_hash,
      full_name: row.full_name,
      mssv: row.mssv,
      class_name: row.class_name,
      gender: row.gender,
      phone: row.phone,
      email: row.email,
      avatar_url: row.avatar_url,
      role: row.role ?? 'user',
      profile_complete: Number(row.profile_complete ?? 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
    upsertKey: 'id',
  });

  await migrateTable({
    table: 'computers',
    selectSql: `SELECT id, name, room, specs, status, created_at FROM computers ORDER BY id`,
    transform: (row) => ({
      id: Number(row.id),
      name: row.name,
      room: row.room,
      specs: row.specs,
      status: row.status ?? 'available',
      created_at: row.created_at,
    }),
    upsertKey: 'id',
  });

  await migrateTable({
    table: 'borrow_requests',
    selectSql: `SELECT id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at FROM borrow_requests ORDER BY id`,
    transform: (row) => ({
      id: Number(row.id),
      computer_id: Number(row.computer_id),
      borrower_id: Number(row.borrower_id),
      reason: row.reason,
      status: row.status ?? 'pending',
      requested_at: row.requested_at,
      approved_by: row.approved_by ? Number(row.approved_by) : null,
      approved_at: row.approved_at,
      returned_at: row.returned_at,
    }),
    upsertKey: 'id',
  });

  console.log('SQLite -> Supabase migration finished.');
} catch (error) {
  console.error('Migration failed:', error);
  process.exitCode = 1;
} finally {
  db.close();
}
