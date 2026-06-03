'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Plus, Trash2, Building, Globe, Tag, DollarSign } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'SGD', 'HKD', 'MXN', 'BRL'];
const SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$', HKD: 'HK$', MXN: 'Mex$', BRL: 'R$' };

export default function SettingsClient({ org, taxes, priceLists, warehouses }: {
  org: any;
  taxes: { id: string; name: string; rate: number }[];
  priceLists: { id: string; name: string; currencyCode: string; isDefault: boolean; itemCount: number }[];
  warehouses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'organization' | 'preferences' | 'taxes' | 'pricelists'>('organization');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [orgForm, setOrgForm] = useState(org);
  const [newTax, setNewTax] = useState({ name: '', rate: 0 });
  const [newPriceList, setNewPriceList] = useState({ name: '', currencyCode: 'USD' });

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const r = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm),
      });
      if (!r.ok) { const j = await r.json(); setMsg(j.error || 'Failed'); return; }
      setMsg('Organization saved');
      router.refresh();
    } catch (err: any) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  async function addTax(e: React.FormEvent) {
    e.preventDefault();
    if (!newTax.name) return;
    const r = await fetch('/api/settings/taxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTax),
    });
    if (r.ok) { setNewTax({ name: '', rate: 0 }); router.refresh(); }
  }

  async function deleteTax(id: string) {
    if (!confirm('Delete this tax?')) return;
    await fetch(`/api/settings/taxes/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  async function addPriceList(e: React.FormEvent) {
    e.preventDefault();
    if (!newPriceList.name) return;
    const r = await fetch('/api/settings/price-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPriceList),
    });
    if (r.ok) { setNewPriceList({ name: '', currencyCode: 'USD' }); router.refresh(); }
  }

  async function deletePriceList(id: string) {
    if (!confirm('Delete this price list?')) return;
    await fetch(`/api/settings/price-lists/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <>
      <div className="card p-1 inline-flex flex-wrap gap-1">
        {[
          { v: 'organization', l: 'Organization', icon: Building },
          { v: 'preferences', l: 'Preferences', icon: Globe },
          { v: 'taxes', l: 'Taxes', icon: Tag },
          { v: 'pricelists', l: 'Price Lists', icon: DollarSign },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.v}
              onClick={() => setTab(t.v as any)}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${tab === t.v ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-ink-100'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.l}
            </button>
          );
        })}
      </div>

      {msg && <div className="card p-3 bg-emerald-50 border-emerald-200 text-emerald-700 text-sm">{msg}</div>}

      {tab === 'organization' && (
        <form onSubmit={saveOrg} className="card p-5 space-y-4">
          <h2 className="font-semibold">Organization Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Organization Name</label><input value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} required className="input" /></div>
            <div><label className="label">Email</label><input type="email" value={orgForm.email || ''} onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })} className="input" /></div>
            <div><label className="label">Phone</label><input value={orgForm.phone || ''} onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })} className="input" /></div>
            <div><label className="label">Website</label><input value={orgForm.website || ''} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} className="input" /></div>
            <div><label className="label">Currency Code</label>
              <select value={orgForm.currencyCode} onChange={(e) => setOrgForm({ ...orgForm, currencyCode: e.target.value, currencySymbol: SYMBOLS[e.target.value] || '$' })} className="input">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Currency Symbol</label><input value={orgForm.currencySymbol} onChange={(e) => setOrgForm({ ...orgForm, currencySymbol: e.target.value })} className="input" /></div>
            <div><label className="label">Fiscal Year Start</label>
              <select value={orgForm.fiscalYearStart} onChange={(e) => setOrgForm({ ...orgForm, fiscalYearStart: e.target.value })} className="input">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <h3 className="font-medium pt-2">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Address Line 1</label><input value={orgForm.addressLine1 || ''} onChange={(e) => setOrgForm({ ...orgForm, addressLine1: e.target.value })} className="input" /></div>
            <div><label className="label">Address Line 2</label><input value={orgForm.addressLine2 || ''} onChange={(e) => setOrgForm({ ...orgForm, addressLine2: e.target.value })} className="input" /></div>
            <div><label className="label">City</label><input value={orgForm.city || ''} onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })} className="input" /></div>
            <div><label className="label">State / Province</label><input value={orgForm.state || ''} onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })} className="input" /></div>
            <div><label className="label">ZIP / Postal Code</label><input value={orgForm.zip || ''} onChange={(e) => setOrgForm({ ...orgForm, zip: e.target.value })} className="input" /></div>
            <div><label className="label">Country</label><input value={orgForm.country || ''} onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })} className="input" /></div>
          </div>
          <div className="flex justify-end"><button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button></div>
        </form>
      )}

      {tab === 'preferences' && (
        <form onSubmit={saveOrg} className="card p-5 space-y-4">
          <h2 className="font-semibold">Inventory Preferences</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={orgForm.enableSerialTracking} onChange={(e) => setOrgForm({ ...orgForm, enableSerialTracking: e.target.checked })} />
              Track items by serial number
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={orgForm.enableBatchTracking} onChange={(e) => setOrgForm({ ...orgForm, enableBatchTracking: e.target.checked })} />
              Track items by batch / lot
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={orgForm.enableBarcode} onChange={(e) => setOrgForm({ ...orgForm, enableBarcode: e.target.checked })} />
              Enable barcode generation & scanning
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={orgForm.enableMultiCurrency} onChange={(e) => setOrgForm({ ...orgForm, enableMultiCurrency: e.target.checked })} />
              Enable multi-currency transactions
            </label>
          </div>
          <div className="flex justify-end pt-2"><button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button></div>
        </form>
      )}

      {tab === 'taxes' && (
        <div className="space-y-4">
          <form onSubmit={addTax} className="card p-5">
            <h2 className="font-semibold mb-3">Add New Tax</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={newTax.name} onChange={(e) => setNewTax({ ...newTax, name: e.target.value })} placeholder="Tax name (e.g. Sales Tax 8.5%)" required className="input md:col-span-2" />
              <input type="number" min="0" step="0.01" value={newTax.rate} onChange={(e) => setNewTax({ ...newTax, rate: parseFloat(e.target.value) || 0 })} placeholder="Rate %" required className="input" />
            </div>
            <div className="flex justify-end mt-3"><button type="submit" className="btn-primary"><Plus className="w-4 h-4" /> Add Tax</button></div>
          </form>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                <tr><th className="text-left px-4 py-2.5 font-medium">Name</th><th className="text-right px-4 py-2.5 font-medium">Rate</th><th className="w-12"></th></tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {taxes.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-ink-500 text-sm">No taxes configured</td></tr>}
                {taxes.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-2.5 font-medium">{t.name}</td>
                    <td className="px-4 py-2.5 text-right">{t.rate}%</td>
                    <td className="px-4 py-2.5 text-center"><button onClick={() => deleteTax(t.id)} className="text-rose-600 hover:bg-rose-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pricelists' && (
        <div className="space-y-4">
          <form onSubmit={addPriceList} className="card p-5">
            <h2 className="font-semibold mb-3">Add New Price List</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={newPriceList.name} onChange={(e) => setNewPriceList({ ...newPriceList, name: e.target.value })} placeholder="Name (e.g. Wholesale)" required className="input md:col-span-2" />
              <select value={newPriceList.currencyCode} onChange={(e) => setNewPriceList({ ...newPriceList, currencyCode: e.target.value })} className="input">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex justify-end mt-3"><button type="submit" className="btn-primary"><Plus className="w-4 h-4" /> Add Price List</button></div>
          </form>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                <tr><th className="text-left px-4 py-2.5 font-medium">Name</th><th className="text-left px-4 py-2.5 font-medium">Currency</th><th className="text-right px-4 py-2.5 font-medium">Items</th><th className="w-12"></th></tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {priceLists.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-500 text-sm">No price lists</td></tr>}
                {priceLists.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-medium">{p.name} {p.isDefault && <span className="badge bg-emerald-100 text-emerald-700 ml-1">Default</span>}</td>
                    <td className="px-4 py-2.5">{p.currencyCode}</td>
                    <td className="px-4 py-2.5 text-right">{p.itemCount}</td>
                    <td className="px-4 py-2.5 text-center"><button onClick={() => deletePriceList(p.id)} className="text-rose-600 hover:bg-rose-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
