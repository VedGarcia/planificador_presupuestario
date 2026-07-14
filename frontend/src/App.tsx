import { useState, useMemo } from 'react';
import { useTransactions } from './hooks/useTransactions';
import type { AppSettings } from './types';
import { TransactionModal, SettingsModal } from './components/Modals';
import { DashboardPanels } from './components/Dashboard';
import { TransactionTable } from './components/TransactionTable';
import { Layers, BookOpen, Settings as SettingsIcon, PlusCircle } from 'lucide-react';

export default function App() {
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions();

  // Estados Globales de Vista e Interfaces Modulares
  const [viewMode, setViewMode] = useState<'planning' | 'actual'>('planning');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Estado de la Configuración Interna
  const [settings, setSettings] = useState<AppSettings>({
    categories: ['Alquiler', 'Supermercado', 'Internet', 'Salario', 'Freelance', 'Delivery', 'Inversión'],
    strongCurrency: 'USD',         // Valor por defecto inicial, editable en la UI
    fragileCurrency: 'VES',        // Valor por defecto inicial, editable en la UI
    defaultCurrency: 'FRAGILE',    // Inicia apuntando a la Moneda Local en el diario
    defaultExchangeRate: 45.50
  });

  // Cálculo e indexación de bloques financieros estructurales
  const financialData = useMemo(() => {
    const plan = { income: 0, needs: 0, wants: 0, savings: 0 };
    const real = { income: 0, needs: 0, wants: 0, savings: 0 };

    transactions.forEach(t => {
      let monthlyStable = t.amount_stable;
      if (t.frequency === 'Every Week') monthlyStable = t.amount_stable * 4;

      if (t.mode === 'planning') {
        if (t.type === 'Income') plan.income += monthlyStable;
        if (t.type === 'Needs') plan.needs += monthlyStable;
        if (t.type === 'Wants') plan.wants += monthlyStable;
      } else {
        if (t.type === 'Income') real.income += monthlyStable;
        if (t.type === 'Needs') real.needs += monthlyStable;
        if (t.type === 'Wants') real.wants += monthlyStable;
      }
    });

    plan.savings = plan.income - (plan.needs + plan.wants);
    real.savings = real.income - (real.needs + real.wants);

    return { plan, real };
  }, [transactions]);

  const currentSummary = viewMode === 'planning' ? financialData.plan : financialData.real;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando módulos...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans space-y-8">

      {/* HEADER COMPACTO */}
      <header className="max-w-7xl mx-auto border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">🛡️ Control Multimoneda</h1>
          <p className="text-slate-400 text-xs">Entorno modular optimizado contra devaluación.</p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* CONTROL SWITCH */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
            <button onClick={() => setViewMode('planning')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'planning' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
              <Layers size={13} /> Planificación (USD)
            </button>
            <button onClick={() => setViewMode('actual')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'actual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
              <BookOpen size={13} /> Diario (Ejecutado)
            </button>
          </div>

          {/* BOTÓN CONFIGURACIÓN */}
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors">
            <SettingsIcon size={16} />
          </button>

          {/* BOTÓN REGISTRO */}
          <button onClick={() => setIsTxModalOpen(true)} className="bg-slate-100 hover:bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-xs transition-transform active:scale-95 flex items-center gap-1.5">
            <PlusCircle size={15} /> Nuevo Registro
          </button>
        </div>
      </header>

      {/* DASHBOARD PRINCIPAL */}
      <main className="max-w-7xl mx-auto space-y-8">
        <DashboardPanels
          viewMode={viewMode}
          summary={currentSummary}
          planData={financialData.plan}
          realData={financialData.real}
        />

        <TransactionTable
          viewMode={viewMode}
          transactions={transactions}
          settings={settings}
          onDelete={deleteTransaction}
        />
      </main>

      {/* COMPONENTES DE DIÁLOGO MODULARES */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        mode={viewMode}
        settings={settings}
        onSave={(tx) => { addTransaction(tx); setIsTxModalOpen(false); }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
      />

    </div>
  );
}