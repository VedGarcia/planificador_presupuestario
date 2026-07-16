import { useState, useMemo } from 'react';
import { useTransactions } from './hooks/useTransactions';
import type { AppSettings, SavingsGoal, Transaction } from './types';
import { TransactionModal, SettingsModal, GoalModal } from './components/Modals';
import { DashboardPanels } from './components/Dashboard';
import { TransactionTable } from './components/TransactionTable';
import { Layers, BookOpen, Settings as SettingsIcon, PlusCircle, Target, Download } from 'lucide-react';

type PeriodFilter = 'M' | 'Q' | 'S' | 'A';

export default function App() {
  const { transactions, goals, loading, addTransaction, deleteTransaction, addGoal } = useTransactions();

  const [viewMode, setViewMode] = useState<'planning' | 'actual'>('planning');
  const [timeFilter, setTimeFilter] = useState<PeriodFilter>('M');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [settings, setSettings] = useState<AppSettings>({
    categories: ['Alquiler', 'Supermercado', 'Internet', 'Salario', 'Freelance', 'Compra Divisa'],
    strongCurrency: 'USD',
    fragileCurrency: 'VES',
    defaultCurrency: 'FRAGILE',
    defaultExchangeRate: 45.50
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = ['Modo', 'Tipo', 'Fecha', 'Categoria', `Monto (${settings.strongCurrency})`, `Monto (${settings.fragileCurrency})`, 'Notas'];
    const rows = filteredData.map(t => [
      t.mode, t.type, t.date, t.category, t.amount_stable.toFixed(2),
      t.amount_local ? t.amount_local.toFixed(2) : '0.00', t.notes || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Financiero_${timeFilter}_${viewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 1. Filtrado y Proyección Temporal
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(t => {
      if (t.mode === 'planning') return true; // Planificación es atemporal, se filtra por multiplicador luego

      const txDate = new Date(t.date);
      if (timeFilter === 'M') return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      if (timeFilter === 'Q') return txDate >= new Date(currentYear, currentMonth - 3, 1);
      if (timeFilter === 'S') return txDate >= new Date(currentYear, currentMonth - 6, 1);
      if (timeFilter === 'A') return txDate.getFullYear() === currentYear;
      return true;
    });
  }, [transactions, timeFilter]);

  // 2. Procesamiento de Metas (Cuotas y Progreso)
  const goalsProgress = useMemo(() => {
    return goals.map(g => {
      // Dinero real asignado a esta meta (en compras diarias de tipo Savings)
      const saved = transactions.filter(t => t.goal_id === g.id && t.mode === 'actual').reduce((acc, t) => acc + t.amount_stable, 0);

      // Cálculo de meses restantes
      const deadline = new Date(g.deadline_date);
      const today = new Date();
      const monthsLeft = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth()) || 1;

      const remaining = g.target_amount - saved;
      const requiredMonthlyQuota = remaining > 0 ? remaining / Math.max(monthsLeft, 1) : 0;

      return { ...g, saved, requiredMonthlyQuota, progress: Math.min((saved / g.target_amount) * 100, 100) };
    });
  }, [goals, transactions]);

  // 3. Mesa de Control (Matemáticas Finales)
  const financialData = useMemo(() => {
    const plan = { income: 0, needs: 0, wants: 0, savings: 0 };
    const real = { income: 0, needs: 0, wants: 0, savings: 0, active_saved: 0, idle_balance: 0 };

    // Multiplicador para la vista teórica (Planificación)
    const multiplier = timeFilter === 'M' ? 1 : timeFilter === 'Q' ? 3 : timeFilter === 'S' ? 6 : 12;

    // Inyectar la cuota mensual de los proyectos en la planificación
    const totalMonthlyQuotas = goalsProgress.reduce((acc, g) => acc + g.requiredMonthlyQuota, 0);
    plan.savings += (totalMonthlyQuotas * multiplier);

    filteredData.forEach(t => {
      let baseStable = t.amount_stable;

      if (t.mode === 'planning') {
        if (t.frequency === 'Every Week') baseStable *= 4;
        if (t.frequency === 'Once') baseStable /= multiplier; // Diluir evento único en el bloque de tiempo

        const projected = baseStable * multiplier;
        if (t.type === 'Income') plan.income += projected;
        if (t.type === 'Needs') plan.needs += projected;
        if (t.type === 'Wants') plan.wants += projected;
        if (t.type === 'Savings') plan.savings += projected; // Ahorro extra planificado manual
      } else {
        // En vista real (Diario), lo filtrado es exactamente lo que es
        if (t.type === 'Income') real.income += baseStable;
        if (t.type === 'Needs') real.needs += baseStable;
        if (t.type === 'Wants') real.wants += baseStable;
        if (t.type === 'Savings') real.active_saved += baseStable; // Compra blindada real
      }
    });

    plan.savings += plan.income - (plan.needs + plan.wants + plan.savings); // Resto del dinero planificado va a ahorro
    real.idle_balance = real.income - (real.needs + real.wants + real.active_saved); // ¡SALDO OCIOSO EN PELIGRO!
    real.savings = real.active_saved; // Para los gráficos, el ahorro real es solo la divisa comprada

    return { plan, real };
  }, [filteredData, goalsProgress, timeFilter]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando módulos...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans space-y-6">

      {/* HEADER Y CONTROLES */}
      <header className="max-w-7xl mx-auto border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">🛡️ Control Multimoneda & Metas</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          {/* Suiche Plan / Diario */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
            <button onClick={() => setViewMode('planning')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'planning' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}><Layers size={13} /> Plan</button>
            <button onClick={() => setViewMode('actual')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'actual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><BookOpen size={13} /> Diario</button>
          </div>

          {/* Filtro de Tiempo */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
            {(['M', 'Q', 'S', 'A'] as PeriodFilter[]).map(p => (
              <button key={p} onClick={() => setTimeFilter(p)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === p ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                {p}
              </button>
            ))}
          </div>

          <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors"><SettingsIcon size={16} /></button>
          <button onClick={handleExportCSV} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 rounded-xl transition-colors" title="Exportar Reporte CSV"><Download size={16} /></button>
          <button onClick={() => setIsGoalModalOpen(true)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition-transform active:scale-95 flex items-center gap-1.5"><Target size={15} /> Nueva Meta</button>
          <button onClick={() => setIsTxModalOpen(true)} className="bg-slate-100 hover:bg-white text-slate-900 font-bold px-3 py-2 rounded-xl text-xs transition-transform active:scale-95 flex items-center gap-1.5"><PlusCircle size={15} /> Registro</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <DashboardPanels
          viewMode={viewMode}
          summary={viewMode === 'planning' ? financialData.plan : financialData.real}
          planData={financialData.plan}
          realData={financialData.real}
          goals={goalsProgress}
          settings={settings}
        />

        <TransactionTable
          viewMode={viewMode}
          transactions={filteredData}
          settings={settings}
          onDelete={deleteTransaction}
        />
      </main>

      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} mode={viewMode} settings={settings} goals={goals} onSave={(tx) => { addTransaction(tx); setIsTxModalOpen(false); }} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSaveSettings={setSettings} />
      <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} settings={settings} onSave={(g) => { addGoal(g); setIsGoalModalOpen(false); }} />
    </div>
  );
}