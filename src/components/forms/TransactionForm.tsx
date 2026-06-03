'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, Search } from 'lucide-react';
import { formatCurrency, round2 } from '@/lib/utils';

interface LineItem { itemId: string; name: string; sku: string; quantity: number; unitPrice: number; taxRate: number; }

interface TransactionFormProps {
  mode: 'create' | 'edit';
  type: 'purchase-order' | 'bill';
  apiPath: string;
  numberField: string; // 'orderNumber' | 'billNumber'
  nextNumber: string;
  contacts: { id: string; name: string; currencyCode: string }[];
  contactLabel: string;
  items: { id: string; sku: string; name: string; unitPrice: number; unit: string; costPrice: number }[];
  warehouses?: { id: string; name: string }[];
  defaultCurrency: string;
  initial?: any;
  priceField?: 'unitPrice' | 'costPrice';
}

export default function TransactionForm({
  mode, type, apiPath, numberField, nextNumber,
  contacts, contactLabel, items, warehouses, defaultCurrency, initial, priceField = 'unitPrice',
}: TransactionFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<any>(initial || {
    [numberField]: nextNumber,
    reference: '',
    date: new Date().toISOString().slice(0, 10),
    dueDate: '',
    contactId: '',
    warehouseId: warehouses?.[0]?.id || '',
    status: 'draft',
    paymentTerms: 'Net 30',
    currencyCode: defaultCurrency,
    exchangeRate: 1,
    notes: '',
    termsConditions: '',
    shippingCharges: 0,
    adjustment: 0,
    discount: 0,
    discountType: 'amount',
  });

  const [lines, setLines] = useState<LineItem[]>(initial?.items?.map((i: any) => ({
    itemId: i.itemId, name: i.name, sku: i.sku, quantity: i.quantity,
    unitPrice: i.unitPrice, taxRate: i.taxRate || 0,
  })) || []);

  // Rename contactId to vendorId or customerId on submit
  const contactField = type === 'purchase-order' ? 'vendorId' : 'vendorId';

  useEffect(() => {
    if (!form.contactId) return;
    const c = contacts.find(c => c.id === form.contactId);
    if (c?.currencyCode) setForm((f: any) => ({ ...f, currencyCode: c.currencyCode }));
  }, [form.contactId]);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items.slice(0, 8);
    return items.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)).slice(0, 8);
  }, [items, search]);

  function addItem(item: any) {
    if (lines.find(l => l.itemId === item.id)) {
      setLines(lines.map(l => l.itemId === item.id ? { ...l, quantity: l.quantity + 1 } : l));
    } else {
      setLines([...lines, { itemId: item.id, name: item.name, sku: item.sku, quantity: 1, unitPrice: item[priceField] || item.unitPrice, taxRate: 0 }]);
    }
    setSearch('');
  }
  function updateLine(idx: number, patch: Partial<LineItem>) {
    setLines(lines.map((l, i) => i === idx ? { ...l, ...patch } : l));
  }
  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const taxTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.taxRate || 0) / 100, 0);
  const discount = form.discountType === 'percent' ? subtotal * (form.discount / 100) : (form.discount || 0);
  const total = subtotal + taxTotal - discount + (form.shippingCharges || 0) + (form.adjustment || 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.contactId) { setError(`${contactLabel} is required`); return; }
    if (lines.length === 0) { setError('Add at least one line item'); return; }
    setSaving(true);
    try {
      const body: any = {
        ...form,
        [contactField]: form.contactId,
        subtotal: round2(subtotal),
        taxAmount: round2(taxTotal),
        total: round2(total),
        balance: round2(total - (initial?.amountPaid || 0)),
        amountPaid: initial?.amountPaid || 0,
        items: lines.map(l => ({
          itemId: l.itemId, name: l.name, sku: l.sku,
          quantity: l.quantity, unitPrice: l.unitPrice, discount: 0, taxRate: l.taxRate,
          taxAmount: round2(l.quantity * l.unitPrice * l.taxRate / 100),
          total: round2(l.quantity * l.unitPrice * (1 + l.taxRate / 100)),
        })),
      };
      delete body.contactId;

      const url = mode === 'create' ? apiPath : `${apiPath}/${initial.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const j = await r.json();
        setError(j.error || 'Failed to save');
        return;
      }
      const j = await r.json();
      const detailPath = type === 'purchase-order' ? 'purchase-orders' : 'bills';
      router.push(`/${detailPath}/${j.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const statusOptions = type === 'purchase-order'
    ? [{ v: 'draft', l: 'Draft' }, { v: 'open', l: 'Open' }, { v: 'partially_received', l: 'Partially Received' }, { v: 'received', l: 'Received' }, { v: 'billed', l: 'Billed' }, { v: 'cancelled', l: 'Cancelled' }]
    : [{ v: 'draft', l: 'Draft' }, { v: 'open', l: 'Open' }, { v: 'partially_paid', l: 'Partially Paid' }, { v: 'paid', l: 'Paid' }, { v: 'overdue', l: 'Overdue' }, { v: 'void', l: 'Void' }];

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="card p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm">{error}</div>}

      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">{contactLabel} *</label>
            <select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} required className="input">
              <option value="">Select {contactLabel.toLowerCase()}…</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Number</label>
            <input value={form[numberField]} onChange={(e) => setForm({ ...form, [numberField]: e.target.value })} required className="input" />
          </div>
          <div>
            <label className="label">Reference</label>
            <input value={form.reference || ''} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={typeof form.date === 'string' ? form.date.slice(0, 10) : new Date(form.date).toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
          </div>
          {type === 'bill' && (
            <div>
              <label className="label">Due Date</label>
              <input type="date" value={typeof form.dueDate === 'string' ? form.dueDate.slice(0, 10) : form.dueDate ? new Date(form.dueDate).toISOString().slice(0, 10) : ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input" />
            </div>
          )}
          {warehouses && (
            <div>
              <label className="label">Warehouse</label>
              <select value={form.warehouseId || ''} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} className="input">
                <option value="">— None —</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              {statusOptions.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Payment Terms</label>
            <input value={form.paymentTerms || ''} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Currency</label>
            <select value={form.currencyCode} onChange={(e) => setForm({ ...form, currencyCode: e.target.value })} className="input">
              {['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold">Line Items</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="input pl-9" />
          {search && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-ink-200 rounded-md shadow-lg max-h-72 overflow-y-auto">
              {filteredItems.length === 0 ? <div className="p-3 text-sm text-ink-500">No items found</div> : filteredItems.map(i => (
                <button key={i.id} type="button" onClick={() => addItem(i)} className="w-full px-3 py-2 text-left hover:bg-ink-50 flex items-center justify-between text-sm border-b border-ink-100 last:border-0">
                  <div><p className="font-medium">{i.name}</p><p className="text-xs text-ink-500 font-mono">{i.sku}</p></div>
                  <p className="text-sm font-medium">{formatCurrency(i[priceField] || i.unitPrice)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {lines.length === 0 ? (
          <div className="text-center py-8 text-sm text-ink-500 border border-dashed border-ink-200 rounded-md">Search and click items to add.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 border-b border-ink-200">
              <tr>
                <th className="text-left py-2 font-medium">Item</th>
                <th className="text-right py-2 font-medium w-24">Qty</th>
                <th className="text-right py-2 font-medium w-32">Price</th>
                <th className="text-right py-2 font-medium w-24">Tax %</th>
                <th className="text-right py-2 font-medium w-32">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {lines.map((l, idx) => {
                const lt = l.quantity * l.unitPrice * (1 + (l.taxRate || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-2"><p className="font-medium text-sm">{l.name}</p><p className="text-xs text-ink-500 font-mono">{l.sku}</p></td>
                    <td className="py-1.5"><input type="number" min="0" step="0.01" value={l.quantity} onChange={(e) => updateLine(idx, { quantity: parseFloat(e.target.value) || 0 })} className="input text-right" /></td>
                    <td className="py-1.5"><input type="number" min="0" step="0.01" value={l.unitPrice} onChange={(e) => updateLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })} className="input text-right" /></td>
                    <td className="py-1.5"><input type="number" min="0" step="0.01" value={l.taxRate} onChange={(e) => updateLine(idx, { taxRate: parseFloat(e.target.value) || 0 })} className="input text-right" /></td>
                    <td className="py-2 text-right font-medium">{formatCurrency(lt, form.currencyCode)}</td>
                    <td className="py-2 text-center"><button type="button" onClick={() => removeLine(idx)} className="text-rose-600 hover:bg-rose-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Notes</h2>
          <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="input" />
          <h2 className="font-semibold pt-3">Terms & Conditions</h2>
          <textarea value={form.termsConditions || ''} onChange={(e) => setForm({ ...form, termsConditions: e.target.value })} rows={3} className="input" />
        </div>
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Summary</h2>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatCurrency(subtotal, form.currencyCode)} />
            <div className="flex items-center gap-2">
              <span className="text-ink-500 w-24">Discount</span>
              <input type="number" min="0" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} className="input flex-1 text-right" />
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input w-20">
                <option value="amount">{form.currencyCode}</option>
                <option value="percent">%</option>
              </select>
            </div>
            <Row label="Tax" value={formatCurrency(taxTotal, form.currencyCode)} />
            <div className="flex items-center gap-2">
              <span className="text-ink-500 w-24">Shipping</span>
              <input type="number" min="0" step="0.01" value={form.shippingCharges} onChange={(e) => setForm({ ...form, shippingCharges: parseFloat(e.target.value) || 0 })} className="input flex-1 text-right" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ink-500 w-24">Adjustment</span>
              <input type="number" step="0.01" value={form.adjustment} onChange={(e) => setForm({ ...form, adjustment: parseFloat(e.target.value) || 0 })} className="input flex-1 text-right" />
            </div>
            <div className="flex items-center justify-between border-t border-ink-200 pt-2">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{formatCurrency(total, form.currencyCode)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-ink-50 py-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {mode === 'create' ? 'Create' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-ink-500">{label}</span><span className="font-medium">{value}</span></div>;
}
