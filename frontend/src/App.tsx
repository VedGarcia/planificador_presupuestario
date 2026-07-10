// frontend/src/App.tsx
import React, { useState, useMemo } from 'react';
import { useTransactions } from './hooks/useTransactions';
import type { Transaction } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PlusCircle, Trash2, Wallet, ShieldAlert, Heart, PiggyBank, Calendar, X, RefreshCw, Layers, BookOpen } from 'lucide-react';

type ViewMode = 'planning' | 'actual';

export default function App() {
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions();

  // Controles de Vista
  const [viewMode, setViewMode] = useState<ViewMode>('planning');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    type: 'Needs' as 'Income' | 'Needs' | 'Wants',
    category: '',
    frequency: 'Once' as 'Every Month' | 'Every Week' | 'Once',
    currency: 'USD' as 'USD' | 'LOCAL',
    exchange_rate: 45.5, // Tasa base sugerida del día
    inputAmount: 0,      // Lo que escribe el usuario en la interfaz
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Convertidor de Moneda Dinámico en el Modal
  const conversionCalculated = useMemo(() => {
    const rate = formData.exchange_rate || 1;
    const input = formData.inputAmount || 0;

    if (formData.currency === 'USD') {
      return { stable: input, local: input * rate };
    } else {
      return { stable: input / rate, local: input };
    }
  }, [formData.inputAmount, formData.currency, formData.exchange_rate]);

  // Manejo del Envío del Formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || formData.inputAmount <= 0) return;

    const newTransaction: Transaction = {
      mode: viewMode,
      type: formData.type,
      category: formData.category,
      frequency: viewMode === 'planning' ? formData.frequency : 'Once', // Diario siempre es puntual
      date: formData.date,
      currency: formData.currency,
      exchange_rate: formData.exchange_rate,
      amount_stable: conversionCalculated.stable,
      amount_local: conversionCalculated.local,
      notes: formData.notes
    };

    addTransaction(newTransaction);
    setFormData({ ...formData, category: '', inputAmount: 0, notes: '' });
    setIsModalOpen(false);
  };

  // --- PROCESAMIENTO DE MÉTRICAS COMPARTIDAS (Mesa de Control) ---
  const financialData = useMemo(() => {
    const plan = { income: 0, needs: 0, wants: 0, savings: 0 };
    const real = { income: 0, needs: 0, wants: 0, savings: 0 };

    transactions.forEach(t => {
      // Normalización a proyección mensual estándar
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

  // Selección de datos a mostrar según el Suiche
  const currentSummary = viewMode === 'planning' ? financialData.plan : financialData.real;

  const comparisonChartData = [
    { name: 'Ingresos', Planificado: financialData.plan.income, Real: financialData.real.income },
    { name: 'Needs', Planificado: financialData.plan.needs, Real: financialData.real.needs },
    { name: 'Wants', Planificado: financialData.plan.wants, Real: financialData.real.wants },
    { name: 'Ahorros', Planificado: financialData.plan.savings, Real: financialData.real.savings }
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando base de datos multimoneda...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">

      {/* HEADER & CONTROLES BI-MODALES */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Layers className="text-emerald-400" /> Control Financiero Corporativo/Personal
          </h1>
          <p className="text-slate-400 text-sm mt-1">Estrategia de blindaje inflacionario y conversión multimoneda.</p>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          {/* SUICHE DE VISTA */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
            <button onClick={() => setViewMode('planning')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'planning' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              <Layers size={14} /> Planificación (USD)
            </button>
            <button onClick={() => setViewMode('actual')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'actual' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              <BookOpen size={14} /> Diario Ejecutado
            </button>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="bg-slate-100 hover:bg-white text-slate-900 font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-xs transition-transform active:scale-95">
            <PlusCircle size={16} /> Registrar {viewMode === 'planning' ? 'Meta' : 'Gasto Diario'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">

        {/* INDICADORES FINANCIEROS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Ingresos Totales ({viewMode === 'planning' ? 'Presupuesto' : 'Ejecutado'})</span>
            <p className="text-2xl font-bold text-white">${currentSummary.income.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Needs (Gastos Vitales)</span>
            <p className="text-2xl font-bold text-blue-400">${currentSummary.needs.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Wants (Deseos/Variables)</span>
            <p className="text-2xl font-bold text-pink-400">${currentSummary.wants.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Excedente de Liquidez / Ahorro</span>
            <p className={`text-2xl font-bold ${currentSummary.savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${currentSummary.savings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* GRÁFICOS COMPULSARADOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard de Contraste Presupuestario */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 lg:col-span-2">
            <h3 className="text-base font-bold text-white mb-4">Evaluación de Desviación: Planificado vs. Real Diario</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
                  <Legend />
                  <Bar dataKey="Planificado" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Real" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Estado de Salud de la Ejecución */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Diagnóstico de Liquidez</h3>
              <p className="text-xs text-slate-400">¿Estás ejecutando tus ingresos de manera eficiente antes de la devaluación?</p>
            </div>
            <div className="py-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Ejecución del Ingreso</span><span className="font-semibold">{((financialData.real.income / (financialData.plan.income || 1)) * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${Math.min((financialData.real.income / (financialData.plan.income || 1)) * 100, 100)}%` }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Consumo de Presupuesto Needs</span><span className="font-semibold">{((financialData.real.needs / (financialData.plan.needs || 1)) * 100).toFixed(0)}%</span></div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${Math.min((financialData.real.needs / (financialData.plan.needs || 1)) * 100, 100)}%` }}></div></div>
              </div>
            </div>
            <div className="text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-700 text-slate-400">
              ⚡ **Estrategia:** En vista diaria, los montos en moneda local se convierten instantáneamente a USD indexados usando el histórico registrado para evitar distorsiones inflacionarias.
            </div>
          </div>
        </div>

        {/* TABLA DE AUDITORÍA */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-base font-bold text-white mb-4">Registros en Vista: {viewMode === 'planning' ? 'Matriz de Planificación' : 'Libro de Caja Diario'}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3">Detalle</th>
                  <th className="pb-3">Tipo</th>
                  {viewMode === 'planning' && <th className="pb-3">Frecuencia</th>}
                  <th className="pb-3 text-right">Monto (USD)</th>
                  {viewMode === 'actual' && <th className="pb-3 text-right">Monto Moneda Local</th>}
                  {viewMode === 'actual' && <th className="pb-3 text-right">Tasa Ref.</th>}
                  <th className="pb-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {transactions.filter(t => t.mode === viewMode).map(t => (
                  <tr key={t.id} className="hover:bg-slate-700/10">
                    <td className="py-3">
                      <span className="font-semibold text-white block">{t.category}</span>
                      <span className="text-xs text-slate-500">{t.date} {t.notes ? `• ${t.notes}` : ''}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : t.type === 'Needs' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>{t.type}</span>
                    </td>
                    {viewMode === 'planning' && <td className="py-3 text-slate-400 text-xs">{t.frequency}</td>}
                    <td className="py-3 text-right font-mono font-medium text-white">${t.amount_stable.toFixed(2)}</td>
                    {viewMode === 'actual' && <td className="py-3 text-right font-mono text-slate-400">{t.amount_local ? `${t.amount_local.toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs/Arg` : '-'}</td>}
                    {viewMode === 'actual' && <td className="py-3 text-right font-mono text-slate-500 text-xs">{t.exchange_rate ? `x${t.exchange_rate}` : '-'}</td>}
                    <td className="py-3 text-center">
                      <button onClick={() => t.id && deleteTransaction(t.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL INTELIGENTE MULTIMONEDA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Registrar en {viewMode === 'planning' ? 'Planificación' : 'Libro Diario'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Flujo</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                    <option value="Income">Ingreso (+)</option>
                    <option value="Needs">Needs / Vitales (-)</option>
                    <option value="Wants">Wants / Deseos (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha</label>
                  <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm font-mono" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Concepto / Categoría</label>
                <input type="text" placeholder="Ej: Pago de Proveedor, Supermercado" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
              </div>

              {/* CONTROLES DE MONEDA (Solo visibles en Diario o si se desea calcular) */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Moneda Ejecutada</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-emerald-400" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value as any })}>
                      <option value="USD">USD (Fuerte)</option>
                      <option value="LOCAL">Moneda Local (Frágil)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Tasa de Cambio (Hoy)</label>
                    <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white" value={formData.exchange_rate} onChange={e => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1 })} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Monto Introducido</label>
                  <div className="relative">
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-base font-mono text-white" value={formData.inputAmount || ''} onChange={e => setFormData({ ...formData, inputAmount: parseFloat(e.target.value) || 0 })} required />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">{formData.currency}</span>
                  </div>
                </div>

                {/* VISOR DE CONVERSIÓN EN TIEMPO REAL */}
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Equivalencia USD: <strong className="text-white">${conversionCalculated.stable.toFixed(2)}</strong></span>
                  <span>Equivalencia Local: <strong className="text-white">{conversionCalculated.local.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
                </div>
              </div>

              {viewMode === 'planning' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Frecuencia de Proyección</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}>
                    <option value="Every Month">Mensual</option>
                    <option value="Every Week">Semanal (Multiplica x4)</option>
                    <option value="Once">Puntual</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notas Adicionales</label>
                <input type="text" placeholder="Comentarios..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium p-2.5 rounded-xl text-sm">Cerrar</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium p-2.5 rounded-xl text-sm flex items-center justify-center gap-2">💾 Guardar en SQLite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}