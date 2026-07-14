import type { BudgetSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PanelProps {
    viewMode: 'planning' | 'actual';
    summary: BudgetSummary;
    planData: BudgetSummary;
    realData: BudgetSummary;
}

export function DashboardPanels({ viewMode, summary, planData, realData }: PanelProps) {

    // Estructura de datos para el gráfico comparativo de barras
    const barChartData = [
        { name: 'Ingresos', Planificado: planData.income, Real: realData.income },
        { name: 'Necesidades', Planificado: planData.needs, Real: realData.needs },
        { name: 'Gustos', Planificado: planData.wants, Real: realData.wants },
        { name: 'Ahorros', Planificado: planData.savings, Real: realData.savings }
    ];

    return (
        <>
            {/* TARJETAS DE MÉTRICAS PRINCIPALES */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
                    <span className="text-xs text-slate-400 block mb-1">Ingresos ({viewMode === 'planning' ? 'Meta' : 'Real'})</span>
                    <p className="text-2xl font-bold text-white">${summary.income.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
                    <span className="text-xs text-slate-400 block mb-1">Necesidades (Gastos Vitales)</span>
                    <p className="text-2xl font-bold text-blue-400">${summary.needs.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
                    <span className="text-xs text-slate-400 block mb-1">Gustos (Deseos / Ocio)</span>
                    <p className="text-2xl font-bold text-pink-400">${summary.wants.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
                    <span className="text-xs text-slate-400 block mb-1">Excedente / Ahorros</span>
                    <p className={`text-2xl font-bold ${summary.savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${summary.savings.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* CONTENDEDOR DEL GRÁFICO Y ALERTAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 lg:col-span-2">
                    <h3 className="text-base font-bold text-white mb-4">Mesa de Control: Planificado vs Ejecución Real</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} />
                                <Legend />
                                <Bar dataKey="Planificado" fill="#475569" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Real" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TARJETA DE SALUD FINANCIERA (BARRAS DE PROGRESO) */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Alerta Contra Inflación</h3>
                        <p className="text-xs text-slate-400">Eficiencia de quema de liquidez frente a tu presupuesto base.</p>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1"><span>Ejecución Ingreso</span><span className="font-mono font-bold">{((realData.income / (planData.income || 1)) * 100).toFixed(0)}%</span></div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${Math.min((realData.income / (planData.income || 1)) * 100, 100)}%` }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1"><span>Consumo de Necesidades</span><span className="font-mono font-bold">{((realData.needs / (planData.needs || 1)) * 100).toFixed(0)}%</span></div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${Math.min((realData.needs / (planData.needs || 1)) * 100, 100)}%` }}></div></div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Los datos mostrados corresponden a la unificación de tasas históricas.</p>
                </div>
            </div>
        </>
    );
}