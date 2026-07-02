import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../finanzas.db');
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,       -- 'Income', 'Needs', 'Wants'
    category TEXT NOT NULL,   -- 'Business', 'Rent', 'Dining out', etc.
    date TEXT,                -- Formato YYYY-MM-DD (para gastos puntuales)
    frequency TEXT NOT NULL,  -- 'Every Month', 'Every Week', 'Once'
    term TEXT,                -- '2024', '2026', etc. (Año de vigencia)
    amount REAL NOT NULL,     -- Monto de la transacción
    notes TEXT                -- Comentarios o detalles adicionales
  )
`);

export default db;