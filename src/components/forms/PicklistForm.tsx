'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PicklistForm({ mode, salesOrders, warehouses, nextNumber, initial }: { mode: 'create' | 'edit'; salesOrders: { id: string; orderNumber: string; customer: string; items: { id: string; name: string; sku: string; quantity: number }[] }[]; warehouses: { id: string; name: string }[]; nextNumber: string; initial?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(initial || {
    picklistNumber: nextNumber,
    date: new Date().toISOString().slice(0, 10),
    salesOrderId: '',
    warehouseId: warehouses[0]?.id || '',
    status: 'draft',
    assigneeName: '',
    notes: '',
  });
  const [lines, setLines] = useState<{ itemId: string; name: string; sku: string; quantity: number; picked: boolean; pickedQty: number }[]>([]);

  useEffect(() => {
    if (!form.salesOrderId) { setLines([]); return; }
    const so = salesOrders.find(s => s.id === form.salesOrderId);
    if (so) setLines(so.items.map(i => ({ itemId: i.id, name: i.name, sku: i.sku, quantity: i.quantity, picked: false, pickedQty: 0 })));
  }, [form.salesOrderId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.salesOrderId) { setError('Select a sales order'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/picklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: lines }),
      });
      if (!r.ok) { const j = await r.json(); setError(j.error || 'Failed'); return; }
      const j = await r.json();
      router.push(`/picklists/${j.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="card p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm">{error}</div>}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="label">Picklist #</label><input value={form.picklistNumber} onChange={(e) => setForm({ ...form, picklistNumber: e.target.value })} required className="input" /></div>
          <div><label className="label">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
          <div><label className="label">Sales Order *</label>
            <select value={form.salesOrderId} onChange={(e) => setForm({ ...form, salesOrderId: e.target.value })} required className="input">
              <option value="">Select…</option>
              {salesOrders.map(so => <option key={so.id} value={so.id}>{so.orderNumber} — {so.customer}</option>)}
            </select>
          </div>
          <div><label className="label">Warehouse</label>
            <select value={form.warehouseId || ''} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} className="input">
              <option value="">— None —</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              <option value="draft">Draft</option>
              <option value="assigned">Assigned</option>
              <option value="picked">Picked</option>
              <option value="packed">Packed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div><label className="label">Assignee</label><input value={form.assigneeName || ''} onChange={(e) => setForm({ ...form, assigneeName: e.target.value })} className="input" /></div>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Items to Pick</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 border-b border-ink-200">
              <tr>
                <th className="text-left py-2 font-medium">Picked</th>
                <th className="text-left py-2 font-medium">Item</th>
                <th className="text-right py-2 font-medium w-24">Qty</th>
                <th className="text-right py-2 font-medium w-24">Picked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {lines.map((l, i) => (
                <tr key={i} className={cn(l.picked ? 'bg-emerald-50/50' : '')}>
                  <td className="py-2"><input type="checkbox" checked={l.picked} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, picked: e.target.checked, pickedQty: e.target.checked ? x.quantity : 0 } : x))} /></td>
                  <td className="py-2"><p className="font-medium">{l.name}</p><p className="text-xs text-ink-500 font-mono">{l.sku}</p></td>
                  <td className="py-2 text-right">{l.quantity}</td>
                  <td className="py-1.5"><input type="number" min="0" max={l.quantity} value={l.pickedQty} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, pickedQty: parseFloat(e.target.value) || 0, picked: parseFloat(e.target.value) > 0 } : x))} className="input text-right" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Picklist</button>
      </div>
    </form>
  );
}
