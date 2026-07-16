export interface Transaction {
    id?: number;
    mode: 'planning' | 'actual';
    type: 'Income' | 'Needs' | 'Wants' | 'Savings';
    category: string;
    date: string;
    frequency: 'Every Month' | 'Every Week' | 'Once';
    amount_stable: number;
    amount_local?: number;
    currency: 'STRONG' | 'FRAGILE';
    exchange_rate?: number;
    goal_id?: number;
    notes?: string;
}

export interface SavingsGoal {
    id?: number;
    title: string;
    target_amount: number;
    deadline_date: string;
    notes?: string;
}

export interface BudgetSummary {
    income: number;
    needs: number;
    wants: number;
    savings: number;
    active_saved?: number;
    idle_balance?: number;
}

export interface AppSettings {
    categories: string[];
    strongCurrency: string;
    fragileCurrency: string;
    defaultCurrency: 'STRONG' | 'FRAGILE';
    defaultExchangeRate: number;
}