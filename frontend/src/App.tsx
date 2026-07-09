// frontend/src/App.tsx
import React, { useState, useMemo } from 'react';
import { useTransactions } from './hooks/useTransactions';
import type { Transaction } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PlusCircle, Trash2, Wallet, ShieldAlert, Heart, PiggyBank, Calendar, X } from 'lucide-react';

type PeriodType = 'monthly' | 'quarterly' | 'semiannually' | 'annually';

export default function App() {
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions();

  // Estados de control de la UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('monthly');

  // Estado para el formulario del modal
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    type: 'Needs',
    category: '',
    frequency: 'Every Month',
    amount: 0,
    notes: '',
    term: '2026',
    date: new Date().toISOString().split('T')[0] // Por defecto fecha de hoy YYYY-MM-DD
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || formData.amount <= 0) return;

    addTransaction(formData as Transaction);

    // Resetear formulario y cerrar modal
    setFormData({
      ...formData,
      category: '',
      amount: 0,
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  // --- LÓGICA DE FILTRADO Y PROYECCIÓN TEMPORAL ---
  const { summary, periodLabel, multiplier } = useMemo(() => {
    let mult = 1;
    let label = 'Mensual';

    if (period === 'quarterly') { mult = 3; label = 'Trimestral'; }
    if (period === 'semiannually') { mult = 6; label = 'Semestral'; }
    if (period === 'annually') { mult = 12; label = 'Anual'; }

    let income = 0;
    let needs = 0;
    let wants = 0;

    transactions.forEach(t => {
      let baseMonthlyAmount = t.amount;

      // Normalizar a base mensual primero según la frecuencia
      if (t.frequency === 'Every Week') {
        baseMonthlyAmount = t.amount * 4;
      } else if (t.frequency === 'Once') {
        // Si es un gasto único, asumimos que impacta el mes corriente
        // Para bloques más grandes, simplemente se suma el monto base una vez
        baseMonthlyAmount = t.amount / mult;
      }

      // Proyectar el monto total según el multiplicador del periodo seleccionado
      const projectedAmount = baseMonthlyAmount * mult;

      if (t.type === 'Income') income += projectedAmount;
      if (t.type === 'Needs') needs += projectedAmount;
      if (t.type === 'Wants') wants += projectedAmount;
    });

    const savings = income - (needs + wants);

    return {
      summary: { income, needs, wants, savings },
      periodLabel: label,
      multiplier: mult
    };
  }, [transactions, period]);

  // Data para el gráfico dinámico
  const chartData = [
    { name: `Needs (${periodLabel})`, value: summary.needs, color: '#3B82F6' },
    { name: `Wants (${periodLabel})`, value: summary.wants, color: '#EC4899' },
    { name: `Savings (${periodLabel})`, value: summary.savings > 0 ? summary.savings : 0, color: '#10B981' }
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando aplicación local...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="text-emerald-400" /> Sistema de Control Financiero
          </h1>
          <p className="text-slate-400 text-sm mt-1">Análisis de presupuestos bajo la regla presupuestaria 50/30/20.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-emerald-600/20"
        >
          <PlusCircle size={20} /> Nueva Transacción
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* FILTROS DE VISTA (PANELES SUPERIORES) */}
        <div className="lg:col-span-3 flex bg-slate-800 p-1.5 rounded-xl border border-slate-700/60 max-w-md">
          {(['monthly', 'quarterly', 'semiannually', 'annually'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg capitalize transition-all ${period === p ? 'bg-slate-900 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {p === 'monthly' ? 'Mensual' : p === 'quarterly' ? 'Trimestral' : p === 'semiannually' ? 'Semestral' : 'Anual'}
            </button>
          ))}
        </div>

        {/* TARJETAS DE MÉTRICAS DINÁMICAS */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Ingreso {periodLabel}</span><Wallet size={20} /></div>
            <p className="text-2xl font-bold text-white">${summary.income.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Needs (50% Sugerido)</span><ShieldAlert size={20} className="text-blue-400" /></div>
            <p className="text-2xl font-bold text-blue-400">${summary.needs.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Límite: ${(summary.income * 0.5).toFixed(2)}</span>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Wants (30% Sugerido)</span><Heart size={20} className="text-pink-400" /></div>
            <p className="text-2xl font-bold text-pink-400">${summary.wants.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Límite: ${(summary.income * 0.3).toFixed(2)}</span>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Savings (20% Mínimo)</span><PiggyBank size={20} className="text-emerald-400" /></div>
            <p className="text-2xl font-bold text-emerald-400">${summary.savings.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Meta: ${(summary.income * 0.2).toFixed(2)}</span>
          </div>
        </div>

        {/* GRÁFICO DE DONA */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-white mb-2 self-start">Distribución {periodLabel} Real</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#475569', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HISTORIAL COMPLETO */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Historial General de Registros</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Categoría</th>
                  <th className="pb-3">Frecuencia</th>
                  <th className="pb-3 text-right">Monto Base</th>
                  <th className="pb-3 text-right">Impacto {periodLabel}</th>
                  <th className="pb-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {transactions.map(t => {
                  let baseMonthly = t.frequency === 'Every Week' ? t.amount * 4 : t.amount;
                  if (t.frequency === 'Once') baseMonthly = t.amount / multiplier;
                  const currentImpact = baseMonthly * multiplier;

                  return (
                    <tr key={t.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' :
                          t.type === 'Needs' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'
                          }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-white">
                        {t.category}
                        {t.date && <span className="block text-[11px] text-slate-500 font-normal">{t.date}</span>}
                      </td>
                      <td className="py-3 text-slate-400 text-xs">{t.frequency}</td>
                      <td className="py-3 text-right font-mono text-slate-400">${t.amount.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono text-white font-semibold">${currentImpact.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <button onClick={() => t.id && deleteTransaction(t.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">Ningún registro activo en la base de datos local.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- COMPONENTE MODAL INTERACTIVO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform scale-100 transition-transform">
            <div className="px-6 py-4 bg-slate-750 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar size={20} className="text-emerald-400" /> Registrar Operación
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Registro</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                  <option value="Income">Income (Ingreso)</option>
                  <option value="Needs">Needs (Necesidades Básicas)</option>
                  <option value="Wants">Wants (Deseos/Ocio)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Categoría</label>
                <input type="text" placeholder="Ej: Alquiler, Internet, Compras" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Frecuencia</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}>
                    <option value="Every Month">Mensual</option>
                    <option value="Every Week">Semanal</option>
                    <option value="Once">Una Sola Vez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Monto Imputable ($)</label>
                  <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha de Ejecución</label>
                <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notas Opcionales</label>
                <input type="text" placeholder="Detalles de la transacción..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium p-2.5 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium p-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/10">
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}