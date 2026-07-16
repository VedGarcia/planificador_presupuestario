import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../finanzas.db');
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    target_amount REAL NOT NULL,
    deadline_date TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    frequency TEXT NOT NULL,
    amount_stable REAL NOT NULL,
    amount_local REAL,
    currency TEXT NOT NULL,
    exchange_rate REAL,
    goal_id INTEGER,
    notes TEXT,
    FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE SET NULL
  );
`);

export default db;