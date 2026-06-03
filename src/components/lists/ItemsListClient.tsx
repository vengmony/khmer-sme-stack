'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber, titleCase, cn } from '@/lib/utils';

interface Item {
  id: string; sku: string; name: string; category: string | null;
  unitPrice: number; costPrice: number; reorderPoint: number;
  isActive: boolean; isComposite: boolean;
  totalStock: number;
  stockByWarehouse: { name: string; qty: number }[];
}

export default function ItemsListClient({ items, q }: { items: Item[]; q: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(q);
  const [filter, setFilter] = useState<'all' | 'low' | 'active' | 'inactive'>('all');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[], [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter === 'low' && (i.totalStock > i.reorderPoint || i.reorderPoint === 0)) return false;
      if (filter === 'active' && !i.isActive) return false;
      if (filter === 'inactive' && i.isActive) return false;
      if (category !== 'all' && i.category !== category) return false;
      return true;
    });
  }, [items, filter, category]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params.toString());
    if (query) p.set('q', query); else p.delete('q');
    router.push(`/items?${p.toString()}`);
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-ink-200 flex flex-wrap items-center gap-2">
        <form onSubmit={onSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="input pl-9"
          />
        </form>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="input w-auto">
          <option value="all">All items</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
          <option value="low">Low stock</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-auto">
          <option value="all">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Item</th>
              <th className="text-left px-4 py-2.5 font-medium">SKU</th>
              <th className="text-left px-4 py-2.5 font-medium">Category</th>
              <th className="text-right px-4 py-2.5 font-medium">Price</th>
              <th className="text-right px-4 py-2.5 font-medium">Cost</th>
              <th className="text-right px-4 py-2.5 font-medium">Stock</th>
              <th className="text-right px-4 py-2.5 font-medium">Value</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-ink-500">
                <Package className="w-10 h-10 text-ink-300 mx-auto mb-2" />
                <p>No items found</p>
                <Link href="/items/new" className="text-brand-600 text-sm font-medium">Create your first item →</Link>
              </td></tr>
            )}
            {filtered.map((i) => {
              const low = i.reorderPoint > 0 && i.totalStock <= i.reorderPoint;
              return (
                <tr key={i.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/items/${i.id}`} className="block">
                      <p className="font-medium flex items-center gap-1.5">
                        {i.isComposite && <span className="badge bg-violet-100 text-violet-700">Bundle</span>}
                        {i.name}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-600">{i.sku}</td>
                  <td className="px-4 py-2.5 text-ink-600">{i.category || '—'}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(i.unitPrice)}</td>
                  <td className="px-4 py-2.5 text-right text-ink-600">{formatCurrency(i.costPrice)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={cn('font-medium', low && 'text-amber-600 flex items-center justify-end gap-1')}>
                      {low && <AlertTriangle className="w-3 h-3" />}
                      {formatNumber(i.totalStock, 0)}
                    </span>
                    {i.reorderPoint > 0 && <p className="text-[10px] text-ink-500">ROP: {formatNumber(i.reorderPoint, 0)}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(i.totalStock * (i.costPrice || 0))}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={cn('badge', i.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                      {i.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-ink-200 text-xs text-ink-500">
        Showing {filtered.length} of {items.length} items
      </div>
    </div>
  );
}
