import { useState, useEffect, useCallback } from 'react';
import type { Transaction, SavingsGoal, AppSettings } from '../types';

const API_URL = 'http://localhost:3001/api';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [txRes, goalsRes, settingsRes] = await Promise.all([
                fetch(`${API_URL}/transactions`),
                fetch(`${API_URL}/goals`),
                fetch(`${API_URL}/settings`)
            ]);
            setTransactions(await txRes.json());
            setGoals(await goalsRes.json());
            setSettings(await settingsRes.json());
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

    const updateSettings = async (newSettings: AppSettings) => {
        await fetch(`${API_URL}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSettings) });
        fetchData(); // Recargar para aplicar los cambios
    };

    return { transactions, goals, settings, loading, addTransaction, deleteTransaction, addGoal, updateSettings };
};