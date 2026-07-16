import { useState, useEffect, useCallback } from 'react';
import type { Transaction, SavingsGoal } from '../types';

const API_URL = 'http://localhost:3001/api';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [txRes, goalsRes] = await Promise.all([
                fetch(`${API_URL}/transactions`),
                fetch(`${API_URL}/goals`)
            ]);
            setTransactions(await txRes.json());
            setGoals(await goalsRes.json());
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const addTransaction = async (tx: Transaction) => {
        await fetch(`${API_URL}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx) });
        fetchData();
    };

    const deleteTransaction = async (id: number) => {
        await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const addGoal = async (goal: SavingsGoal) => {
        await fetch(`${API_URL}/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(goal) });
        fetchData();
    };

    return { transactions, goals, loading, addTransaction, deleteTransaction, addGoal };
};