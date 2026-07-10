import { useState, useMemo, useEffect } from 'react';
import type { Transaction, AppSettings } from '../types';
import { X, Calendar, Settings as SettingsIcon } from 'lucide-react';

// --- MODAL DE TRANSACCIONES ---
interface TxModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'planning' | 'actual';
    settings: AppSettings;
    onSave: (tx: Transaction) => void;
}

export function TransactionModal({ isOpen, onClose, mode, settings, onSave }: TxModalProps) {
    const [formData, setFormData] = useState({
        type: 'Needs' as 'Income' | 'Needs' | 'Wants',
        category: settings.categories[0] || '',
        frequency: 'Once' as 'Every Month' | 'Every Week' | 'Once',
        currency: 'USD' as 'USD' | 'LOCAL',
        exchange_rate: settings.defaultExchangeRate,
        inputAmount: 0,
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Re-ajustar reglas dependiendo de si planificas (USD estricto) o registras diario
    useEffect(() => {
        if (mode === 'planning') {
            setFormData(f => ({ ...f, currency: 'USD', frequency: 'Every Month', category: settings.categories[0] || '' }));
        } else {
            setFormData(f => ({ ...f, currency: settings.defaultCurrency, frequency: 'Once', category: settings.categories[0] || '' }));
        }
    }, [mode, settings, isOpen]);

    const conversion = useMemo(() => {
        const rate = formData.exchange_rate || 1;
        const input = formData.inputAmount || 0;
        return formData.currency === 'USD'
            ? { stable: input, local: input * rate }
            : { stable: input / rate, local: input };
    }, [formData.inputAmount, formData.currency, formData.exchange_rate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-850">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-400" />
                        {mode === 'planning' ? 'Planificar Meta Mensual' : 'Registrar Gasto del Día'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSave({
                        mode,
                        type: formData.type,
                        category: formData.category,
                        frequency: mode === 'planning' ? formData.frequency : 'Once',
                        date: formData.date,
                        currency: formData.currency,
                        exchange_rate: mode === 'planning' ? undefined : formData.exchange_rate,
                        amount_stable: conversion.stable,
                        amount_local: mode === 'planning' ? undefined : conversion.local,
                        notes: formData.notes
                    });
                }} className="p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-slate-200" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                <option value="Income">Ingreso (+)</option>
                                <option value="Needs">Needs / Vital (-)</option>
                                <option value="Wants">Wants / Ocio (-)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha</label>
                            <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-slate-200" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Concepto Seleccionado</label>
                        <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {mode === 'actual' ? (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Moneda de Pago</label>
                                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-emerald-400" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value as any })}>
                                        <option value="USD">USD ($)</option>
                                        <option value="LOCAL">Moneda Local</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Tasa del Día</label>
                                    <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white" value={formData.exchange_rate} onChange={e => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1 })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Monto Ejecutado</label>
                                <div className="relative">
                                    <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white" value={formData.inputAmount || ''} onChange={e => setFormData({ ...formData, inputAmount: parseFloat(e.target.value) || 0 })} required />
                                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">{formData.currency}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                                <span>Equivalente USD: <strong>${conversion.stable.toFixed(2)}</strong></span>
                                <span>Monto Local: <strong>{conversion.local.toFixed(2)}</strong></span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Monto Planificado (USD)</label>
                            <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white" value={formData.inputAmount || ''} onChange={e => setFormData({ ...formData, inputAmount: parseFloat(e.target.value) || 0 })} required />
                            <div className="mt-3">
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Frecuencia</label>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-slate-200" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}>
                                    <option value="Every Month">Mensual</option>
                                    <option value="Every Week">Semanal (Multiplica x4)</option>
                                    <option value="Once">Gasto Único del Mes</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Notas</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-white" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="w-1/3 bg-slate-700 text-slate-200 p-2.5 rounded-xl text-sm">Cerrar</button>
                        <button type="submit" className="flex-1 bg-emerald-600 text-white p-2.5 rounded-xl text-sm font-semibold">Guardar</button>
                    </div>
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
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><SettingsIcon size={18} /> Panel de Configuración</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Monedas y Valores</h3>
                        <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Divisa Diario Defecto</label>
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs" value={localSettings.defaultCurrency} onChange={e => setLocalSettings({ ...localSettings, defaultCurrency: e.target.value as any })}>
                                    <option value="USD">USD ($)</option>
                                    <option value="LOCAL">Moneda Local</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Tasa Base de Cambio</label>
                                <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs font-mono text-white" value={localSettings.defaultExchangeRate} onChange={e => setLocalSettings({ ...localSettings, defaultExchangeRate: parseFloat(e.target.value) || 1 })} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Conceptos Dinámicos</h3>
                        <div className="flex gap-2 mb-3">
                            <input type="text" placeholder="Nueva categoría..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                            <button onClick={addCategory} className="bg-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold">Añadir</button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 bg-slate-900/40 p-2 rounded-xl border border-slate-700-600">
                            {localSettings.categories.map(cat => (
                                <div key={cat} className="flex justify-between items-center bg-slate-800 px-3 py-1.5 rounded-lg text-xs">
                                    <span className="text-slate-200 font-medium">{cat}</span>
                                    <button type="button" onClick={() => removeCategory(cat)} className="text-red-400 hover:text-red-300">Eliminar</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="w-1/3 bg-slate-700 text-slate-200 p-2 rounded-xl text-xs">Cancelar</button>
                        <button type="button" onClick={() => { onSaveSettings(localSettings); onClose(); }} className="flex-1 bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold">Aplicar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    );
}