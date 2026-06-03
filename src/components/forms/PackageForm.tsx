'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, Plus } from 'lucide-react';

export default function PackageForm({ mode, salesOrders, nextNumber, initial }: { mode: 'create' | 'edit'; salesOrders: { id: string; orderNumber: string; customer: string; items: { id: string; name: string; sku: string; quantity: number }[] }[]; nextNumber: string; initial?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(initial || {
    packageNumber: nextNumber,
    date: new Date().toISOString().slice(0, 10),
    salesOrderId: '',
    status: 'draft',
    trackingNumber: '',
    carrier: '',
    weight: 0,
    dimensionL: 0,
    dimensionW: 0,
    dimensionH: 0,
    notes: '',
  });
  const [lines, setLines] = useState<{ itemId: string; name: string; sku: string; quantity: number }[]>(initial?.items || []);

  useEffect(() => {
    if (!form.salesOrderId) { setLines([]); return; }
    const so = salesOrders.find(s => s.id === form.salesOrderId);
    if (so) setLines(so.items.map(i => ({ itemId: i.id, name: i.name, sku: i.sku, quantity: i.quantity })));
  }, [form.salesOrderId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.salesOrderId) { setError('Select a sales order'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: lines }),
      });
      if (!r.ok) { const j = await r.json(); setError(j.error || 'Failed'); return; }
      const j = await r.json();
      router.push(`/packages/${j.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="card p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm">{error}</div>}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="label">Package #</label><input value={form.packageNumber} onChange={(e) => setForm({ ...form, packageNumber: e.target.value })} required className="input" /></div>
          <div><label className="label">Date</label><input type="date" value={typeof form.date === 'string' ? form.date.slice(0, 10) : new Date(form.date).toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
          <div><label className="label">Sales Order *</label>
            <select value={form.salesOrderId} onChange={(e) => setForm({ ...form, salesOrderId: e.target.value })} required className="input">
              <option value="">Select…</option>
              {salesOrders.map(so => <option key={so.id} value={so.id}>{so.orderNumber} — {so.customer}</option>)}
            </select>
          </div>
          <div><label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              <option value="draft">Draft</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div><label className="label">Carrier</label><input value={form.carrier || ''} onChange={(e) => setForm({ ...form, carrier: e.target.value })} className="input" placeholder="FedEx, UPS, DHL..." /></div>
          <div><label className="label">Tracking #</label><input value={form.trackingNumber || ''} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} className="input" /></div>
          <div><label className="label">Weight (kg)</label><input type="number" step="0.01" value={form.weight || 0} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} className="input" /></div>
          <div className="md:col-span-1"></div>
          <div><label className="label">L (cm)</label><input type="number" step="0.1" value={form.dimensionL || 0} onChange={(e) => setForm({ ...form, dimensionL: parseFloat(e.target.value) || 0 })} className="input" /></div>
          <div><label className="label">W (cm)</label><input type="number" step="0.1" value={form.dimensionW || 0} onChange={(e) => setForm({ ...form, dimensionW: parseFloat(e.target.value) || 0 })} className="input" /></div>
          <div><label className="label">H (cm)</label><input type="number" step="0.1" value={form.dimensionH || 0} onChange={(e) => setForm({ ...form, dimensionH: parseFloat(e.target.value) || 0 })} className="input" /></div>
          <div className="md:col-span-1"></div>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Items (from Sales Order)</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 border-b border-ink-200">
              <tr><th className="text-left py-2 font-medium">Item</th><th className="text-right py-2 font-medium">Quantity</th></tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-2"><p className="font-medium">{l.name}</p><p className="text-xs text-ink-500 font-mono">{l.sku}</p></td>
                  <td className="py-2 text-right">{l.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Package</button>
      </div>
    </form>
  );
}
