import express from "express";
import cors from "cors";
import db from "./config/db";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/transactions', (req, res) => {
    try {
        const statement = db.prepare(
            `SELECT * FROM transactions ORDER BY id DESC`
        );
        const transactions = statement.all();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

app.post('/api/transactions', (req, res) => {
    const { mode, type, category, date, frequency, amount_stable, amount_local, currency, exchange_rate, notes } = req.body;

    if (!mode || !type || !category || !frequency || amount_stable === undefined || !currency) {
        return res.status(400).json({
            error: 'Los campos mode, type, category, frequency, amount_stable y currency son obligatorios.'
        });
    }
    try {
        const insert = db.prepare(`
            INSERT INTO transactions (mode, type, category, date, frequency, amount_stable, amount_local, currency, exchange_rate, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = insert.run(
            mode,
            type,
            category,
            date || new Date().toISOString().split('T')[0],
            frequency,
            amount_stable,
            amount_local !== undefined && amount_local !== null ? amount_local : null,
            currency,
            exchange_rate !== undefined && exchange_rate !== null ? exchange_rate : null,
            notes || null
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            mode,
            type,
            category,
            date: date || new Date().toISOString().split('T')[0],
            frequency,
            amount_stable,
            amount_local: amount_local !== undefined && amount_local !== null ? amount_local : null,
            currency,
            exchange_rate: exchange_rate !== undefined && exchange_rate !== null ? exchange_rate : null,
            notes: notes || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar la transacción.' });
    }
});

// 3. Eliminar una transacción
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;

    try {
        const statement = db.prepare('DELETE FROM transactions WHERE id = ?');
        const result = statement.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Transacción no encontrada.' });
        }

        res.json({ message: 'Transacción eliminada con éxito.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la transacción.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});