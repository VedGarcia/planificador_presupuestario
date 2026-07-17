import express from 'express';
import cors from 'cors';
import db from './config/db';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- ENDPOINTS TRANSACCIONES ---
app.get('/api/transactions', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all());
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener transacciones' });
    }
});

app.post('/api/transactions', (req, res) => {
    const { mode, type, category, date, frequency, amount_stable, amount_local, currency, exchange_rate, goal_id, notes } = req.body;
    try {
        const insert = db.prepare(`
      INSERT INTO transactions (mode, type, category, date, frequency, amount_stable, amount_local, currency, exchange_rate, goal_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = insert.run(mode, type, category, date, frequency, amount_stable, amount_local || null, currency, exchange_rate || null, goal_id || null, notes || null);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar transacción' });
    }
});

app.delete('/api/transactions/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
        res.json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

// --- ENDPOINTS METAS DE AHORRO (GOALS) ---
app.get('/api/goals', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM savings_goals ORDER BY deadline_date ASC').all());
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener metas' });
    }
});

app.post('/api/goals', (req, res) => {
    const { title, target_amount, deadline_date, notes } = req.body;
    try {
        const insert = db.prepare('INSERT INTO savings_goals (title, target_amount, deadline_date, notes) VALUES (?, ?, ?, ?)');
        const result = insert.run(title, target_amount, deadline_date, notes || null);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear meta' });
    }
});
app.get('/api/settings', (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;
        res.json({
            ...row,
            categories: JSON.parse(row.categories) // Convertimos el string JSON a un Array
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuraciones' });
    }
});

app.put('/api/settings', (req, res) => {
    const { categories, strongCurrency, fragileCurrency, defaultCurrency, defaultExchangeRate } = req.body;
    try {
        const update = db.prepare(`
      UPDATE settings 
      SET categories = ?, strongCurrency = ?, fragileCurrency = ?, defaultCurrency = ?, defaultExchangeRate = ?
      WHERE id = 1
    `);
        update.run(JSON.stringify(categories), strongCurrency, fragileCurrency, defaultCurrency, defaultExchangeRate);
        res.json({ message: 'Configuración actualizada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar configuraciones' });
    }
});
app.listen(PORT, () => console.log(`🚀 Backend en http://localhost:${PORT}`));