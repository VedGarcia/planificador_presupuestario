import { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Settings as SettingsIcon } from 'lucide-react';
import type { Transaction, AppSettings, SavingsGoal } from '../types';

const getLocalYYYYMMDD = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- MODAL DE TRANSACCIONES ---
interface TxModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'planning' | 'actual';
    settings: AppSettings;
    goals: SavingsGoal[];
    onSave: (tx: Transaction) => void;
}

export function TransactionModal({ isOpen, onClose, mode, settings, goals, onSave }: TxModalProps) {
    const [formData, setFormData] = useState({
        type: 'Needs' as 'Income' | 'Needs' | 'Wants' | 'Savings',
        category: settings.categories[0] || '',
        frequency: 'Once' as 'Every Month' | 'Every Week' | 'Once',
        currency: 'STRONG' as 'STRONG' | 'FRAGILE',
        exchange_rate: settings.defaultExchangeRate,
        inputAmount: 0,
        goal_id: 0,
        notes: '',
        date: getLocalYYYYMMDD()
    });

    // Resetear el formulario cada vez que se abre el modal
    useEffect(() => {
        if (isOpen) {
            setFormData({
                type: 'Needs',
                category: settings.categories[0] || '',
                frequency: mode === 'planning' ? 'Every Month' : 'Once',
                currency: mode === 'planning' ? 'STRONG' : settings.defaultCurrency,
                exchange_rate: settings.defaultExchangeRate,
                inputAmount: 0,
                goal_id: 0,
                notes: '',
                date: getLocalYYYYMMDD()
            });
        }
    }, [mode, settings, isOpen]);

    const conversion = useMemo(() => {
        const rate = formData.exchange_rate || 1;
        const input = formData.inputAmount || 0;
        return formData.currency === 'STRONG' ? { stable: input, local: input * rate } : { stable: input / rate, local: input };
    }, [formData.inputAmount, formData.currency, formData.exchange_rate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-850">
                    <h2 className="text-sm font-bold text-white">Registro Financiero</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={16} /></button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSave({
                        mode, type: formData.type, category: formData.category,
                        frequency: mode === 'planning' ? formData.frequency : 'Once', date: formData.date,
                        currency: formData.currency, exchange_rate: mode === 'planning' ? undefined : formData.exchange_rate,
                        amount_stable: conversion.stable, amount_local: mode === 'planning' ? undefined : conversion.local,
                        goal_id: formData.goal_id === 0 ? undefined : formData.goal_id, notes: formData.notes
                    });
                }} className="p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Flujo</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-slate-200" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                <option value="Income">Ingreso (+)</option>
                                <option value="Needs">Vitales (-)</option>
                                <option value="Wants">Deseos (-)</option>
                                <option value="Savings">Compra Divisa / Meta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha</label>
                            <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-slate-200" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Concepto</label>
                        <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {mode === 'actual' ? (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-emerald-400" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value as any })}>
                                        <option value="STRONG">{settings.strongCurrency} (Fuerte)</option>
                                        <option value="FRAGILE">{settings.fragileCurrency} (Local)</option>
                                    </select>
                                </div>
                                <div><input type="number" step="0.0001" placeholder="Tasa..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono" value={formData.exchange_rate} onChange={e => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1 })} /></div>
                            </div>
                            <input type="number" step="0.01" placeholder="Monto Introducido..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white text-sm" value={formData.inputAmount || ''} onChange={e => setFormData({ ...formData, inputAmount: parseFloat(e.target.value) || 0 })} required />
                        </div>
                    ) : (
                        <input type="number" step="0.01" placeholder={`Monto Planificado en ${settings.strongCurrency}...`} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white text-sm" value={formData.inputAmount || ''} onChange={e => setFormData({ ...formData, inputAmount: parseFloat(e.target.value) || 0 })} required />
                    )}

                    {formData.type === 'Savings' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Destinar a Proyecto (Opcional)</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200" value={formData.goal_id} onChange={e => setFormData({ ...formData, goal_id: parseInt(e.target.value) })}>
                                <option value={0}>-- Ahorro General Libre --</option>
                                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="w-full bg-emerald-600 text-white p-2.5 rounded-xl text-sm font-semibold">Guardar Registro</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- NUEVO COMPONENTE: MODAL DE CREACIÓN DE METAS ---
interface GoalModalProps { isOpen: boolean; onClose: () => void; settings: AppSettings; onSave: (g: SavingsGoal) => void; }

export function GoalModal({ isOpen, onClose, settings, onSave }: GoalModalProps) {
    const [data, setData] = useState({ title: '', target_amount: 0, deadline_date: getLocalYYYYMMDD() });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white">Nueva Meta / Compra</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={16} /></button>
                </div>
                <form onSubmit={e => { e.preventDefault(); onSave(data); }} className="p-5 space-y-4">
                    <input type="text" placeholder="Ej: Laptop de Trabajo" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} required />
                    <input type="number" placeholder={`Costo Total (${settings.strongCurrency})`} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono" value={data.target_amount || ''} onChange={e => setData({ ...data, target_amount: parseFloat(e.target.value) || 0 })} required />
                    <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Fecha Límite</label>
                        <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200" value={data.deadline_date} onChange={e => setData({ ...data, deadline_date: e.target.value })} required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2.5 rounded-xl text-sm font-semibold">Iniciar Meta</button>
                </form>
            </div>
        </div>
    );
}

// --- MODAL DE CONFIGURACIÓN ---
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSaveSettings: (newSettings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
    const [newCategory, setNewCategory] = useState('');
    const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });

    if (!isOpen) return null;

    const addCategory = () => {
        if (!newCategory.trim() || localSettings.categories.includes(newCategory.trim())) return;
        setLocalSettings({ ...localSettings, categories: [...localSettings.categories, newCategory.trim()] });
        setNewCategory('');
    };

    const removeCategory = (cat: string) => {
        setLocalSettings({ ...localSettings, categories: localSettings.categories.filter(c => c !== cat) });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-850">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><SettingsIcon size={18} /> Parametrización General</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Estructura Monetaria Manual</h3>
                        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Moneda Fuerte (Ancla)</label>
                                    <input type="text" placeholder="Ej: USD, USDT" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white uppercase" value={localSettings.strongCurrency} onChange={e => setLocalSettings({ ...localSettings, strongCurrency: e.target.value.toUpperCase() })} />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Moneda Frágil (Local)</label>
                                    <input type="text" placeholder="Ej: VES, ARS" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white uppercase" value={localSettings.fragileCurrency} onChange={e => setLocalSettings({ ...localSettings, fragileCurrency: e.target.value.toUpperCase() })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Diario por Defecto</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200" value={localSettings.defaultCurrency} onChange={e => setLocalSettings({ ...localSettings, defaultCurrency: e.target.value as any })}>
                                        <option value="STRONG">{localSettings.strongCurrency || 'Fuerte'}</option>
                                        <option value="FRAGILE">{localSettings.fragileCurrency || 'Frágil'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Tasa Base Corriente</label>
                                    <input type="number" step="0.0001" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs font-mono text-white" value={localSettings.defaultExchangeRate} onChange={e => setLocalSettings({ ...localSettings, defaultExchangeRate: parseFloat(e.target.value) || 1 })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Desplegables de Conceptos</h3>
                        <div className="flex gap-2 mb-3">
                            <input type="text" placeholder="Añadir concepto al menú..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                            <button type="button" onClick={addCategory} className="bg-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold text-white">Añadir</button>
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-900/40 p-2 rounded-xl border border-slate-700">
                            {localSettings.categories.map(cat => (
                                <div key={cat} className="flex justify-between items-center bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
                                    <span className="text-slate-200 font-medium">{cat}</span>
                                    <button type="button" onClick={() => removeCategory(cat)} className="text-red-400 hover:text-red-300 text-[11px]">Eliminar</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="w-1/3 bg-slate-700 text-slate-200 p-2 rounded-xl text-xs">Cancelar</button>
                        <button type="button" onClick={() => { onSaveSettings(localSettings); onClose(); }} className="flex-1 bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold">Aplicar Configuración</button>
                    </div>
                </div>
            </div>
        </div>
    );
}