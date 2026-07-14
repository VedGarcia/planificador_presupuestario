import type { Transaction, AppSettings } from '../types';
import { Trash2 } from 'lucide-react';

interface TableProps {
    viewMode: 'planning' | 'actual';
    transactions: Transaction[];
    settings: AppSettings; // Agregado para inyección dinámica de nombres
    onDelete: (id: number) => void;
}

export function TransactionTable({ viewMode, transactions, settings, onDelete }: TableProps) {
    const filtered = transactions.filter(t => t.mode === viewMode);

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-base font-bold text-white mb-4">
                {viewMode === 'planning' ? 'Matriz de Planificación Estructural' : 'Libro Diario Multimoneda'}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="pb-3">Concepto</th>
                            <th className="pb-3">Tipo</th>
                            {viewMode === 'planning' && <th className="pb-3">Periodicidad</th>}
                            <th className="pb-3 text-right">Valor ({settings.strongCurrency})</th>
                            {viewMode === 'actual' && <th className="pb-3 text-right">Monto ({settings.fragileCurrency})</th>}
                            {viewMode === 'actual' && <th className="pb-3 text-right">Tasa Ref.</th>}
                            <th className="pb-3 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {filtered.map(t => (
                            <tr key={t.id} className="hover:bg-slate-700/10 transition-colors">
                                <td className="py-3">
                                    <span className="font-semibold text-white block">{t.category}</span>
                                    <span className="text-[11px] text-slate-500">{t.date} {t.notes ? `• ${t.notes}` : ''}</span>
                                </td>
                                <td className="py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : t.type === 'Needs' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>{t.type}</span>
                                </td>
                                {viewMode === 'planning' && <td className="py-3 text-slate-400 text-xs">{t.frequency}</td>}
                                <td className="py-3 text-right font-mono font-medium text-white">{t.amount_stable.toFixed(2)} {settings.strongCurrency}</td>
                                {viewMode === 'actual' && <td className="py-3 text-right font-mono text-slate-400">{t.amount_local ? `${t.amount_local.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${settings.fragileCurrency}` : '-'}</td>}
                                {viewMode === 'actual' && <td className="py-3 text-right font-mono text-slate-500 text-xs">{t.exchange_rate ? `x${t.exchange_rate}` : '-'}</td>}
                                <td className="py-3 text-center">
                                    <button onClick={() => t.id && onDelete(t.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500">Ningún registro cargado en esta sección.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}