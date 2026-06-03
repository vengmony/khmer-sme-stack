'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Warehouse as WhIcon, Plus, X, Loader2, Check } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface Warehouse { id: string; name: string; code: string | null; isDefault: boolean; city: string | null; state: string | null; country: string | null; itemCount: number; totalStock: number; totalValue: number; }

export default function WarehousesClient({ warehouses }: { warehouses: Warehouse[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', city: '', state: '', country: 'USA' });
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const r = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const j = await r.json();
        setError(j.error || 'Failed to create');
        return;
      }
      setOpen(false);
      setForm({ name: '', code: '', city: '', state: '', country: 'USA' });
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button onClick={() => setOpen(true)} className="card border-2 border-dashed border-ink-300 flex flex-col items-center justify-center p-6 hover:border-brand-500 hover:bg-brand-50/30 transition min-h-[180px]">
          <Plus className="w-8 h-8 text-ink-400 mb-2" />
          <p className="font-medium">Add Warehouse</p>
          <p className="text-xs text-ink-500 mt-1">Create a new storage location</p>
        </button>
        {warehouses.map((w) => (
          <div key={w.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center"><WhIcon className="w-5 h-5" /></div>
              {w.isDefault && <span className="badge bg-emerald-100 text-emerald-700">Default</span>}
            </div>
            <h3 className="font-semibold">{w.name}</h3>
            {w.code && <p className="text-xs text-ink-500 font-mono">{w.code}</p>}
            {(w.city || w.state || w.country) && <p className="text-sm text-ink-600 mt-1">{[w.city, w.state, w.country].filter(Boolean).join(', ')}</p>}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-ink-200 text-sm">
              <div><p className="text-xs text-ink-500">SKUs</p><p className="font-semibold">{formatNumber(w.itemCount)}</p></div>
              <div><p className="text-xs text-ink-500">Units</p><p className="font-semibold">{formatNumber(w.totalStock, 0)}</p></div>
              <div><p className="text-xs text-ink-500">Value</p><p className="font-semibold">{formatCurrency(w.totalValue)}</p></div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-ink-200">
              <h2 className="font-semibold">New Warehouse</h2>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submit} className="p-4 space-y-3">
              {error && <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
              <div><label className="label">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" /></div>
              <div><label className="label">Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input" placeholder="e.g. SF-01" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">City</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></div>
                <div><label className="label">State</label><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" /></div>
              </div>
              <div><label className="label">Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
