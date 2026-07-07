import React, { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PlusCircle, Trash2, Wallet, ShieldAlert, Heart, PiggyBank } from 'lucide-react';
import type { Transaction } from './types';

export default function App() {
  const { transactions, loading, addTransaction, deleteTransaction, summary } = useTransactions();

  // Estado para el formulario rápido
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    type: 'Needs',
    category: '',
    frequency: 'Every Month',
    amount: 0,
    notes: '',
    term: '2026'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || formData.amount <= 0) return;
    addTransaction(formData as Transaction);
    setFormData({ ...formData, category: '', amount: 0, notes: '' });
  };

  // Configuración del gráfico de Recharts
  const chartData = [
    { name: 'Needs (Necesidades)', value: summary.needs, color: '#3B82F6' }, // Azul
    { name: 'Wants (Deseos)', value: summary.wants, color: '#EC4899' },    // Rosado
    { name: 'Savings (Ahorro)', value: summary.savings > 0 ? summary.savings : 0, color: '#10B981' } // Verde
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando aplicación local...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Wallet className="text-emerald-400" /> Control de Finanzas Personales <span className="text-sm bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">Regla 50/30/20</span>
        </h1>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* SECCIÓN 1: KPIS Y RESUMEN FINANCIERO */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Ingreso Mensual</span><Wallet size={20} className="text-slate-400" /></div>
            <p className="text-2xl font-bold text-white">${summary.income.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Needs (50% objetivo)</span><ShieldAlert size={20} className="text-blue-400" /></div>
            <p className="text-2xl font-bold text-blue-400">${summary.needs.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Max sugerido: ${(summary.income * 0.5).toFixed(2)}</span>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Wants (30% objetivo)</span><Heart size={20} className="text-pink-400" /></div>
            <p className="text-2xl font-bold text-pink-400">${summary.wants.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Max sugerido: ${(summary.income * 0.3).toFixed(2)}</span>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-slate-400 mb-2"><span>Savings (20% objetivo)</span><PiggyBank size={20} className="text-emerald-400" /></div>
            <p className="text-2xl font-bold text-emerald-400">${summary.savings.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Min sugerido: ${(summary.income * 0.2).toFixed(2)}</span>
          </div>
        </div>

        {/* SECCIÓN 2: GRÁFICO DISTRIBUTION */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-white mb-4 self-start">Distribución Real Mensual</h2>
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

        {/* SECCIÓN 3: FORMULARIO DE REGISTRO */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Agregar Transacción</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Registro</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                <option value="Income">Income (Ingreso)</option>
                <option value="Needs">Needs (Necesidades Básicas)</option>
                <option value="Wants">Wants (Deseos/Ocio)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
              <input type="text" placeholder="Ej: Rent, Business, Dining out" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Frecuencia</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}>
                <option value="Every Month">Mensual (Every Month)</option>
                <option value="Every Week">Semanal (Every Week)</option>
                <option value="Once">Una sola vez (Once)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Monto ($)</label>
              <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Notas / Detalles</label>
              <input type="text" placeholder="Detalles adicionales..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <button type="submit" className="sm:col-span-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium p-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2">
              <PlusCircle size={20} /> Registrar Transacción
            </button>
          </form>
        </div>

        {/* SECCIÓN 4: TABLA DE HISTORIAL */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 lg:col-span-3">
          <h2 className="text-lg font-semibold text-white mb-4">Historial de Registros</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Categoría</th>
                  <th className="pb-3">Frecuencia</th>
                  <th className="pb-3 text-right">Monto base</th>
                  <th className="pb-3 text-right">Impacto Mensual</th>
                  <th className="pb-3">Notas</th>
                  <th className="pb-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {transactions.map(t => {
                  const monthlyImpact = t.frequency === 'Every Week' ? t.amount * 4 : t.amount;
                  return (
                    <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' :
                          t.type === 'Needs' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'
                          }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-white">{t.category}</td>
                      <td className="py-3.5 text-slate-400">{t.frequency}</td>
                      <td className="py-3.5 text-right font-mono text-slate-300">${t.amount.toFixed(2)}</td>
                      <td className="py-3.5 text-right font-mono text-white font-semibold">${monthlyImpact.toFixed(2)}</td>
                      <td className="py-3.5 text-slate-400 max-w-xs truncate">{t.notes || '-'}</td>
                      <td className="py-3.5 text-center">
                        <button onClick={() => t.id && deleteTransaction(t.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">No hay transacciones registradas todavía. ¡Agrega la primera arriba!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}