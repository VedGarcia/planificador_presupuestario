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
    const { type, category, date, frequency, term, amount, notes, mode, amount_stable, amount_local, currency, exchange_rate } = req.body;

    if (!type || !category || !frequency || amount === undefined) {
        return res.status(400).json({
            error: 'Los campos type, category, frequency y amount son obligatorios.'
        });
    }
    try {
        const insert = db.prepare(`
            INSERT INTO transactions (type, category, date, frequency, term, amount, notes, mode, amount_stable, amount_local, currency, exchange_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = insert.run(
            type,
            category,
            date || null,
            frequency,
            term || null,
            mode,
            amount_stable,
            amount_local,
            currency,
            exchange_rate,
            notes || null
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            type,
            category,
            date,
            frequency,
            term,
            mode,
            amount_stable,
            amount_local,
            currency,
            exchange_rate,
            notes
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