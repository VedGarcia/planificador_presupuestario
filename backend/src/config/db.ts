// backend/src/config/db.ts
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

  -- NUEVA TABLA: Persistencia de configuraciones (Solo 1 fila)
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    categories TEXT NOT NULL,
    strongCurrency TEXT NOT NULL,
    fragileCurrency TEXT NOT NULL,
    defaultCurrency TEXT NOT NULL,
    defaultExchangeRate REAL NOT NULL
  );

  -- Semilla por defecto si está vacía
  INSERT OR IGNORE INTO settings (id, categories, strongCurrency, fragileCurrency, defaultCurrency, defaultExchangeRate)
  VALUES (1, '["Alquiler", "Supermercado", "Internet", "Salario", "Freelance", "Compra Divisa"]', 'USD', 'VES', 'FRAGILE', 45.50);
`);

export default db;