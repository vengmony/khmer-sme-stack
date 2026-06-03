'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'SGD', 'HKD'];
const TERMS = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60'];

export default function ContactForm({ initial, mode = 'create' }: { initial?: any; mode?: 'create' | 'edit' }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(initial || {
    type: 'customer',
    salutation: '',
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    taxId: '',
    currencyCode: 'USD',
    paymentTerms: 'Net 30',
    notes: '',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
    shippingAddressLine1: '',
    shippingAddressLine2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: '',
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);

  function set<K extends string>(k: K, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const url = mode === 'create' ? '/api/contacts' : `/api/contacts/${initial.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const payload = sameAsBilling
        ? { ...form, shippingAddressLine1: form.billingAddressLine1, shippingAddressLine2: form.billingAddressLine2, shippingCity: form.billingCity, shippingState: form.billingState, shippingZip: form.billingZip, shippingCountry: form.billingCountry }
        : form;
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const j = await r.json();
        setError(j.error || 'Failed to save');
        return;
      }
      const j = await r.json();
      router.push(`/contacts/${j.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="card p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm">{error}</div>}

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Contact Type</h2>
        <div className="grid grid-cols-3 gap-2">
          {['customer', 'vendor', 'both'].map(t => (
            <label key={t} className={`card p-3 cursor-pointer flex items-center gap-2 ${form.type === t ? 'border-brand-500 bg-brand-50' : ''}`}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set('type', t)} />
              <span className="text-sm capitalize font-medium">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Salutation</label>
            <select value={form.salutation || ''} onChange={(e) => set('salutation', e.target.value)} className="input">
              <option value="">—</option>
              <option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option>
            </select>
          </div>
          <div>
            <label className="label">First Name *</label>
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required className="input" />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required className="input" />
          </div>
          <div className="md:col-span-3">
            <label className="label">Company Name</label>
            <input value={form.companyName || ''} onChange={(e) => set('companyName', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Mobile</label>
            <input value={form.mobile || ''} onChange={(e) => set('mobile', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Website</label>
            <input value={form.website || ''} onChange={(e) => set('website', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Tax ID</label>
            <input value={form.taxId || ''} onChange={(e) => set('taxId', e.target.value)} className="input" />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Billing & Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Currency</label>
            <select value={form.currencyCode || 'USD'} onChange={(e) => set('currencyCode', e.target.value)} className="input">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Payment Terms</label>
            <select value={form.paymentTerms || 'Net 30'} onChange={(e) => set('paymentTerms', e.target.value)} className="input">
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Address Line 1</label>
            <input value={form.billingAddressLine1 || ''} onChange={(e) => set('billingAddressLine1', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Address Line 2</label>
            <input value={form.billingAddressLine2 || ''} onChange={(e) => set('billingAddressLine2', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">City</label>
            <input value={form.billingCity || ''} onChange={(e) => set('billingCity', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">State / Province</label>
            <input value={form.billingState || ''} onChange={(e) => set('billingState', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">ZIP / Postal Code</label>
            <input value={form.billingZip || ''} onChange={(e) => set('billingZip', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Country</label>
            <input value={form.billingCountry || ''} onChange={(e) => set('billingCountry', e.target.value)} className="input" />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Shipping Address</h2>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)} />
            Same as billing
          </label>
        </div>
        {!sameAsBilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Address Line 1</label>
              <input value={form.shippingAddressLine1 || ''} onChange={(e) => set('shippingAddressLine1', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Address Line 2</label>
              <input value={form.shippingAddressLine2 || ''} onChange={(e) => set('shippingAddressLine2', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">City</label>
              <input value={form.shippingCity || ''} onChange={(e) => set('shippingCity', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">State / Province</label>
              <input value={form.shippingState || ''} onChange={(e) => set('shippingState', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">ZIP / Postal Code</label>
              <input value={form.shippingZip || ''} onChange={(e) => set('shippingZip', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Country</label>
              <input value={form.shippingCountry || ''} onChange={(e) => set('shippingCountry', e.target.value)} className="input" />
            </div>
          </div>
        )}
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Notes</h2>
        <textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3} className="input" />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {mode === 'create' ? 'Create Contact' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
