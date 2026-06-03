'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, Plus, ArrowRight } from 'lucide-react';

export default function TransferOrderForm({ mode, warehouses, items, nextNumber, initial }: { mode: 'create' | 'edit'; warehouses: { id: string; name: string }[]; items: { id: string; sku: string; name: string }[]; nextNumber: string; initial?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(initial || {
    transferNumber: nextNumber,
    date: new Date().toISOString().slice(0, 10),
    fromWarehouseId: warehouses[0]?.id || '',
    toWarehouseId: warehouses[1]?.id || warehouses[0]?.id || '',
    status: 'draft',
    notes: '',
  });
  const [lines, setLines] = useState<{ itemId: string; name: string; sku: string; quantity: number }[]>(initial?.items || []);

  function addItem() {
    setLines([...lines, { itemId: '', name: '', sku: '', quantity: 1 }]);
  }
  function updateLine(idx: number, patch: any) {
    setLines(lines.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, ...patch };
      if (patch.itemId) {
        const it = items.find(i => i.id === patch.itemId);
        if (it) { updated.name = it.name; updated.sku = it.sku; }
      }
      return updated;
    }));
  }
  function removeLine(idx: number) { setLines(lines.filter((_, i) => i !== idx)); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.fromWarehouseId === form.toWarehouseId) { setError('From and To warehouses must be different'); return; }
    if (lines.length === 0 || !lines[0].itemId) { setError('Add at least one item'); return; }
    setSaving(true);
    try {
      const body = { ...form, items: lines };
      const url = mode === 'create' ? '/api/transfer-orders' : `/api/transfer-orders/${initial.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) { const j = await r.json(); setError(j.error || 'Failed'); return; }
      const j = await r.json();
      router.push(`/transfer-orders/${j.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="card p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm">{error}</div>}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="label">Transfer #</label><input value={form.transferNumber} onChange={(e) => setForm({ ...form, transferNumber: e.target.value })} required className="input" /></div>
          <div><label className="label">Date</label><input type="date" value={typeof form.date === 'string' ? form.date.slice(0, 10) : new Date(form.date).toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
          <div><label className="label">From Warehouse *</label>
            <select value={form.fromWarehouseId} onChange={(e) => setForm({ ...form, fromWarehouseId: e.target.value })} required className="input">
              <option value="">Select…</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="label">To Warehouse *</label>
            <select value={form.toWarehouseId} onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })} required className="input">
              <option value="">Select…</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-4"><label className="label">Notes</label><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" /></div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Items to Transfer</h2>
          <button type="button" onClick={addItem} className="btn-secondary text-xs"><Plus className="w-3 h-3" /> Add Item</button>
        </div>
        {lines.length === 0 ? (
          <div className="text-center py-8 text-sm text-ink-500 border border-dashed border-ink-200 rounded-md">Click "Add Item" to begin.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 border-b border-ink-200">
              <tr><th className="text-left py-2 font-medium">Item</th><th className="text-right py-2 font-medium w-24">Qty</th><th className="w-10"></th></tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {lines.map((l, idx) => (
                <tr key={idx}>
                  <td className="py-1.5">
                    <select value={l.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value })} className="input">
                      <option value="">Select item…</option>
                      {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5"><input type="number" min="1" step="1" value={l.quantity} onChange={(e) => updateLine(idx, { quantity: parseFloat(e.target.value) || 1 })} className="input text-right" /></td>
                  <td className="py-1.5 text-center"><button type="button" onClick={() => removeLine(idx)} className="text-rose-600 hover:bg-rose-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {mode === 'create' ? 'Create Transfer' : 'Save'}</button>
      </div>
    </form>
  );
}
