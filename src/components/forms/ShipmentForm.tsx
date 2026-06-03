'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';

export default function ShipmentForm({ mode, packages, nextNumber, initial }: { mode: 'create' | 'edit'; packages: { id: string; packageNumber: string; customer: string }[]; nextNumber: string; initial?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(initial || {
    shipmentNumber: nextNumber,
    date: new Date().toISOString().slice(0, 10),
    packageId: '',
    carrier: 'FedEx',
    trackingNumber: '',
    status: 'pending',
    shippingCharges: 0,
    notes: '',
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.packageId) { setError('Select a package'); return; }
    if (!form.carrier) { setError('Carrier required'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) { const j = await r.json(); setError(j.error || 'Failed'); return; }
      const j = await r.json();
      router.push(`/shipments/${j.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="card p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm">{error}</div>}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Shipment #</label><input value={form.shipmentNumber} onChange={(e) => setForm({ ...form, shipmentNumber: e.target.value })} required className="input" /></div>
          <div><label className="label">Date</label><input type="date" value={typeof form.date === 'string' ? form.date.slice(0, 10) : new Date(form.date).toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
          <div className="md:col-span-2"><label className="label">Package *</label>
            <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })} required className="input">
              <option value="">Select a package…</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.packageNumber} — {p.customer}</option>)}
            </select>
          </div>
          <div><label className="label">Carrier *</label>
            <select value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} required className="input">
              <option>FedEx</option><option>UPS</option><option>USPS</option><option>DHL</option><option>Other</option>
            </select>
          </div>
          <div><label className="label">Tracking #</label><input value={form.trackingNumber || ''} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} className="input" /></div>
          <div><label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div><label className="label">Shipping Charges</label><input type="number" step="0.01" value={form.shippingCharges} onChange={(e) => setForm({ ...form, shippingCharges: parseFloat(e.target.value) || 0 })} className="input" /></div>
          <div className="md:col-span-2"><label className="label">Notes</label><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" /></div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Shipment</button>
      </div>
    </form>
  );
}
