'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, Plus } from 'lucide-react';

export default function AdjustmentForm({ warehouses, items, nextNumber }: { warehouses: { id: string; name: string }[]; items: { id: string; sku: string; name: string; unit: string }[]; nextNumber: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    adjustmentNumber: nextNumber,
    date: new Date().toISOString().slice(0, 10),
    reason: '',
    warehouseId: warehouses[0]?.id || '',
    status: 'draft',
    notes: '',
  });
  const [lines, setLines] = useState<{ itemId: string; name: string; sku: string; quantity: number; reason: string }[]>([]);

  function addLine() { setLines([...lines, { itemId: '', name: '', sku: '', quantity: 0, reason: '' }]); }
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
    if (lines.length === 0 || !lines[0].itemId) { setError('Add at least one item'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/inventory-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: lines }),
      });
      if (!r.ok) { const j = await r.json(); setError(j.error || 'Failed'); return; }
      const j = await r.json();
      router.push(`/inventory-adjustments/${j.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="card p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm">{error}</div>}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="label">Adjustment #</label><input value={form.adjustmentNumber} onChange={(e) => setForm({ ...form, adjustmentNumber: e.target.value })} required className="input" /></div>
          <div><label className="label">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
          <div><label className="label">Warehouse *</label>
            <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} required className="input">
              <option value="">Select…</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="label">Reason</label>
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input">
              <option value="">Select…</option>
              <option>Damaged</option><option>Lost</option><option>Found</option><option>Stocktake</option><option>Write-off</option><option>Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Items to Adjust</h2>
          <button type="button" onClick={addLine} className="btn-secondary text-xs"><Plus className="w-3 h-3" /> Add Item</button>
        </div>
        {lines.length === 0 ? (
          <div className="text-center py-8 text-sm text-ink-500 border border-dashed border-ink-200 rounded-md">Click "Add Item" to begin.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 border-b border-ink-200">
              <tr><th className="text-left py-2 font-medium">Item</th><th className="text-right py-2 font-medium w-24">Quantity (negative to reduce)</th><th className="text-left py-2 font-medium w-40">Reason</th><th className="w-10"></th></tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {lines.map((l, idx) => (
                <tr key={idx}>
                  <td className="py-1.5">
                    <select value={l.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value })} className="input">
                      <option value="">Select…</option>
                      {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5"><input type="number" step="1" value={l.quantity} onChange={(e) => updateLine(idx, { quantity: parseFloat(e.target.value) || 0 })} className="input text-right" /></td>
                  <td className="py-1.5"><input value={l.reason} onChange={(e) => updateLine(idx, { reason: e.target.value })} className="input" /></td>
                  <td className="py-1.5 text-center"><button type="button" onClick={() => removeLine(idx)} className="text-rose-600 hover:bg-rose-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-xs text-ink-500">Use positive numbers to add stock, negative to reduce.</p>
      </div>

      <div className="card p-5">
        <label className="label">Notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Adjustment</button>
      </div>
    </form>
  );
}
