import { useState, useEffect } from 'react';
import type { Transaction, BudgetSummary } from '../types';

const API_URL = 'http://localhost:3001/api/transactions';

export const useTransactions = () => {
    const Skinner: Transaction[] = [];
    const [transactions, setTransactions] = useState<Transaction[]>(Skinner);
    const [loading, setLoading] = useState(true);

    // Cargar transacciones al iniciar
    const fetchTransactions = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Agregar transacción
    const addTransaction = async (transaction: Transaction) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction),
            });
            if (response.ok) {
                fetchTransactions();
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    // Eliminar transacción
    const deleteTransaction = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setTransactions(transactions.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    // Calcular totales mensuales (Replicando la lógica de tu Excel Calc)
    const calculateSummary = (): BudgetSummary => {
        let income = 0;
        let needs = 0;
        let wants = 0;

        transactions.forEach(t => {
            const monthlyAmount = t.frequency === 'Every Week' ? t.amount * 4 : t.amount;

            if (t.type === 'Income') income += monthlyAmount;
            if (t.type === 'Needs') needs += monthlyAmount;
            if (t.type === 'Wants') wants += monthlyAmount;
        });

        const savings = income - (needs + wants);

        return { income, needs, wants, savings };
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return {
        transactions,
        loading,
        addTransaction,
        deleteTransaction,
        summary: calculateSummary(),
    };
};