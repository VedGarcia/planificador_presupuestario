import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../finanzas.db');
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL,          -- 'planning' (Presupuesto) o 'actual' (Libro diario real)
    type TEXT NOT NULL,          -- 'Income', 'Needs', 'Wants'
    category TEXT NOT NULL,      -- Ej: Alquiler, Salario, Delivery
    date TEXT NOT NULL,          -- YYYY-MM-DD
    frequency TEXT NOT NULL,     -- 'Every Month', 'Every Week', 'Once'
    amount_stable REAL NOT NULL, -- Monto en Moneda Fuerte (USD) -> Base de la app
    amount_local REAL,           -- Monto en Moneda Frágil (Moneda Local)
    currency TEXT NOT NULL,      -- Moneda seleccionada en el registro: 'USD' o 'LOCAL'
    exchange_rate REAL,          -- Tasa de cambio del día de la operación
    notes TEXT
  )
`);

export default db;