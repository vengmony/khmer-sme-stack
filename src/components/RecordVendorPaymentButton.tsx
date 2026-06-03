'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, X, Loader2 } from 'lucide-react';
import { formatCurrency, round2 } from '@/lib/utils';

export default function RecordVendorPaymentButton({ billId, vendorId, balance, currencyCode }: { billId: string; vendorId: string; balance: number; currencyCode: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    amount: balance,
    paymentMode: 'bank_transfer',
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: '',
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const r = await fetch('/api/vendor-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: round2(form.amount), vendorId, billId, currencyCode }),
      });
      if (!r.ok) {
        const j = await r.json();
        setError(j.error || 'Failed');
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-xs">
        <CreditCard className="w-3 h-3" /> Pay Bill
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-ink-200">
              <h2 className="font-semibold">Pay Bill</h2>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submit} className="p-4 space-y-3">
              {error && <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
              <div>
                <label className="label">Amount ({currencyCode})</label>
                <input type="number" min="0.01" step="0.01" max={balance} required value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="input" />
                <p className="text-xs text-ink-500 mt-1">Balance: {formatCurrency(balance, currencyCode)}</p>
              </div>
              <div>
                <label className="label">Payment Mode</label>
                <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="input">
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Credit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Reference</label>
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="input" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
