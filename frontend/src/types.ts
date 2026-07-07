export interface Transaction {
    id?: number;
    type: 'Income' | 'Needs' | 'Wants';
    category: string;
    date?: string;
    frequency: 'Every Month' | 'Every Week' | 'Once';
    term?: string;
    amount: number;
    notes?: string;

}

export interface BudgetSummary {
    income: number;
    needs: number;
    wants: number;
    savings: number;
}