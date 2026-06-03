'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

interface Warehouse { id: string; name: string; isDefault: boolean; }
interface Vendor { id: string; name: string; }
interface Tax { id: string; name: string; rate: number; }

interface CompositeLine { childItemId: string; quantity: number; }

interface ItemFormProps {
  initial?: any;
  warehouses: Warehouse[];
  vendors: Vendor[];
  taxes: Tax[];
  items?: { id: string; sku: string; name: string; unitPrice: number; }[];
  mode?: 'create' | 'edit';
}

export default function ItemForm({ initial, warehouses, vendors, taxes, items = [], mode = 'create' }: ItemFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<any>(initial || {
    sku: '',
    name: '',
    description: '',
    unit: 'pcs',
    unitPrice: 0,
    costPrice: 0,
    trackInventory: true,
    trackSerial: false,
    trackBatch: false,
    reorderPoint: 0,
    preferredVendorId: '',
    category: '',
    brand: '',
    upc: '',
    ean: '',
    isbn: '',
    imageUrl: '',
    isActive: true,
    isComposite: false,
    weight: 0,
    dimensionL: 0,
    dimensionW: 0,
    dimensionH: 0,
    initialStock: {} as Record<string, number>,
  });

  const [composite, setComposite] = useState<CompositeLine[]>(initial?.compositeItems?.map((c: any) => ({ childItemId: c.childId, quantity: c.quantity })) || []);

  function set<K extends string>(k: K, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const url = mode === 'create' ? '/api/items' : `/api/items/${initial.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, compositeItems: composite }),
      });
      if (!r.ok) {
        const j = await r.json();
        setError(j.error || 'Failed to save item');
        return;
      }
      const j = await r.json();
      router.push(`/items/${j.id}`);
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
        <h2 className="font-semibold">Item Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required className="input" />
          </div>
          <div>
            <label className="label">SKU *</label>
            <input value={form.sku} onChange={(e) => set('sku', e.target.value)} required className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className="input" />
          </div>
          <div>
            <label className="label">Category</label>
            <input value={form.category || ''} onChange={(e) => set('category', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Brand</label>
            <input value={form.brand || ''} onChange={(e) => set('brand', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Unit</label>
            <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className="input">
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="ml">ml</option>
              <option value="m">m</option>
              <option value="box">box</option>
              <option value="pack">pack</option>
            </select>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input value={form.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} className="input" placeholder="https://…" />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Pricing & Cost</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Sales Price *</label>
            <input type="number" step="0.01" min="0" value={form.unitPrice} onChange={(e) => set('unitPrice', parseFloat(e.target.value) || 0)} required className="input" />
          </div>
          <div>
            <label className="label">Cost Price</label>
            <input type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => set('costPrice', parseFloat(e.target.value) || 0)} className="input" />
          </div>
          <div>
            <label className="label">Reorder Point</label>
            <input type="number" min="0" value={form.reorderPoint} onChange={(e) => set('reorderPoint', parseFloat(e.target.value) || 0)} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Preferred Vendor</label>
          <select value={form.preferredVendorId || ''} onChange={(e) => set('preferredVendorId', e.target.value)} className="input">
            <option value="">— None —</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Inventory Tracking</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.trackInventory} onChange={(e) => set('trackInventory', e.target.checked)} />
            Track inventory for this item
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.trackSerial} onChange={(e) => set('trackSerial', e.target.checked)} />
            Track by serial number
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.trackBatch} onChange={(e) => set('trackBatch', e.target.checked)} />
            Track by batch / lot
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isComposite} onChange={(e) => set('isComposite', e.target.checked)} />
            This is a composite item (bundle / kit)
          </label>
        </div>

        {form.trackInventory && mode === 'create' && (
          <div>
            <h3 className="text-sm font-medium mb-2">Initial Stock by Warehouse</h3>
            <div className="space-y-2">
              {warehouses.map(w => (
                <div key={w.id} className="flex items-center gap-3">
                  <span className="text-sm flex-1">{w.name} {w.isDefault && <span className="text-xs text-ink-500">(default)</span>}</span>
                  <input
                    type="number" min="0" placeholder="0"
                    className="input w-32"
                    onChange={(e) => setForm((f: any) => ({ ...f, initialStock: { ...f.initialStock, [w.id]: parseFloat(e.target.value) || 0 } }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {form.isComposite && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Composite Components</h2>
            <button type="button" className="btn-secondary text-xs" onClick={() => setComposite([...composite, { childItemId: '', quantity: 1 }])}>
              <Plus className="w-3 h-3" /> Add Component
            </button>
          </div>
          {composite.length === 0 && <p className="text-sm text-ink-500">No components added yet.</p>}
          {composite.map((c, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select value={c.childItemId} onChange={(e) => setComposite(composite.map((cc, i) => i === idx ? { ...cc, childItemId: e.target.value } : cc))} className="input flex-1">
                <option value="">Select item…</option>
                {items.filter(i => i.id !== initial?.id).map(i => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
              </select>
              <input type="number" min="1" value={c.quantity} onChange={(e) => setComposite(composite.map((cc, i) => i === idx ? { ...cc, quantity: parseFloat(e.target.value) || 1 } : cc))} className="input w-24" />
              <button type="button" onClick={() => setComposite(composite.filter((_, i) => i !== idx))} className="btn-ghost text-rose-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Physical Properties</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Weight (kg)</label>
            <input type="number" step="0.01" min="0" value={form.weight || 0} onChange={(e) => set('weight', parseFloat(e.target.value) || 0)} className="input" />
          </div>
          <div>
            <label className="label">Length (cm)</label>
            <input type="number" step="0.1" min="0" value={form.dimensionL || 0} onChange={(e) => set('dimensionL', parseFloat(e.target.value) || 0)} className="input" />
          </div>
          <div>
            <label className="label">Width (cm)</label>
            <input type="number" step="0.1" min="0" value={form.dimensionW || 0} onChange={(e) => set('dimensionW', parseFloat(e.target.value) || 0)} className="input" />
          </div>
          <div>
            <label className="label">Height (cm)</label>
            <input type="number" step="0.1" min="0" value={form.dimensionH || 0} onChange={(e) => set('dimensionH', parseFloat(e.target.value) || 0)} className="input" />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Barcodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">UPC</label>
            <input value={form.upc || ''} onChange={(e) => set('upc', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">EAN</label>
            <input value={form.ean || ''} onChange={(e) => set('ean', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">ISBN</label>
            <input value={form.isbn || ''} onChange={(e) => set('isbn', e.target.value)} className="input" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-ink-50 py-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {mode === 'create' ? 'Create Item' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
