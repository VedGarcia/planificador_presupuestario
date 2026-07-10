export interface Transaction {
    id?: number;
    mode: 'planning' | 'actual';
    type: 'Income' | 'Needs' | 'Wants';
    category: string;
    date: string;
    frequency: 'Every Month' | 'Every Week' | 'Once';
    amount_stable: number; // Moneda de referencia estándar (USD)
    amount_local?: number;  // Moneda inflacionaria
    currency: 'USD' | 'LOCAL';
    exchange_rate?: number; // Tasa del día
    notes?: string;
}

export interface BudgetSummary {
    income: number;
    needs: number;
    wants: number;
    savings: number;
}