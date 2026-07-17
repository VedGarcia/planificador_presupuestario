import type { BudgetSummary, AppSettings } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface PanelProps {
    viewMode: 'planning' | 'actual';
    summary: BudgetSummary;
    planData: BudgetSummary;
    realData: BudgetSummary;
    goals: any[];
    settings: AppSettings;
}

export function DashboardPanels({ viewMode, summary, planData, realData, goals, settings }: PanelProps) {

    const barChartData = [
        { name: 'Ingresos', Planificado: planData.income, Real: realData.income },
        { name: 'Needs', Planificado: planData.needs, Real: realData.needs },
        { name: 'Wants', Planificado: planData.wants, Real: realData.wants },
        { name: 'Ahorro/Cobertura', Planificado: planData.savings, Real: realData.active_saved }
    ];

    // Cálculos de porcentajes seguros (evitar dividir por cero)
    const safeIncome = summary.income > 0 ? summary.income : 1;
    const needsPct = ((summary.needs / safeIncome) * 100).toFixed(1);
    const wantsPct = ((summary.wants / safeIncome) * 100).toFixed(1);
    const savingsPct = viewMode === 'planning'
        ? ((summary.savings / safeIncome) * 100).toFixed(1)
        : (((summary.active_saved || 0) / safeIncome) * 100).toFixed(1);

    return (
        <>
            {/* TARJETAS KPI: Grid dinámico (4 en plan, 5 en diario) */}
            <div className={`grid grid-cols-2 gap-4 ${viewMode === 'planning' ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
                    <span className="text-xs text-slate-400 block mb-1">Ingresos</span>
                    <p className="text-xl sm:text-2xl font-bold text-white">${summary.income.toFixed(2)}</p>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                    <div>
                        <span className="text-xs text-slate-400 block mb-1">Needs</span>
                        <p className="text-xl sm:text-2xl font-bold text-blue-400">${summary.needs.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">
                        <strong className={Number(needsPct) > 50 ? 'text-red-400' : 'text-slate-400'}>{needsPct}%</strong> / 50% (Max: ${(summary.income * 0.5).toFixed(0)})
                    </span>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                    <div>
                        <span className="text-xs text-slate-400 block mb-1">Wants</span>
                        <p className="text-xl sm:text-2xl font-bold text-pink-400">${summary.wants.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">
                        <strong className={Number(wantsPct) > 30 ? 'text-red-400' : 'text-slate-400'}>{wantsPct}%</strong> / 30% (Max: ${(summary.income * 0.3).toFixed(0)})
                    </span>
                </div>

                {/* Tarjeta de Ahorro / Blindaje */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                    <div>
                        <span className="text-xs text-slate-400 block mb-1">{viewMode === 'planning' ? 'Ahorro / Metas' : 'Ahorro Blindado'}</span>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                            ${viewMode === 'planning' ? summary.savings.toFixed(2) : (summary.active_saved || 0).toFixed(2)}
                        </p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">
                        <strong className={Number(savingsPct) < 20 ? 'text-yellow-400' : 'text-emerald-400'}>{savingsPct}%</strong> / 20% (Meta: ${(summary.income * 0.2).toFixed(0)})
                    </span>
                </div>

                {/* Tarjeta 5: Saldo Ocioso (Solo visible en modo Diario) */}
                {viewMode === 'actual' && (
                    <div className={`p-5 rounded-xl border flex flex-col justify-center ${(summary.idle_balance || 0) > 0 ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-slate-800 border-slate-700/50'}`}>
                        <span className="text-xs text-slate-400 block mb-1">Saldo Ocioso (Riesgo)</span>
                        <p className={`text-xl sm:text-2xl font-bold ${(summary.idle_balance || 0) > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                            ${(summary.idle_balance || 0).toFixed(2)}
                        </p>
                        {(summary.idle_balance || 0) > 0 && <span className="flex items-center gap-1 text-[10px] text-yellow-500 mt-1"><AlertTriangle size={10} /> ¡Se está devaluando!</span>}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 lg:col-span-2">
                    <h3 className="text-sm font-bold text-white mb-4">Contraste de Ejecución ({settings.strongCurrency})</h3>
                    {/* ... (Gráfico igual) ... */}
                    <div className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px', color: '#fff' }} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Bar dataKey="Planificado" fill="#475569" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Real" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 overflow-y-auto max-h-72">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400" /> Proyectos & Compras</h3>
                    <div className="space-y-4">
                        {goals.map(g => (
                            <div key={g.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-bold text-slate-200">{g.title}</span>
                                    <span className="text-emerald-400 font-mono">${g.saved.toFixed(0)} / ${g.target_amount}</span>
                                </div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1">
                                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${g.progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>Vence: {g.deadline_date}</span>
                                    <span>Cuota Fija: ${g.requiredMonthlyQuota.toFixed(2)}/mes</span>
                                </div>
                            </div>
                        ))}
                        {goals.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No hay metas activas.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}