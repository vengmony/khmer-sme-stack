'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Receipt } from 'lucide-react';
import { formatCurrency, formatDate, titleCase, cn } from '@/lib/utils';

interface Invoice {
  id: string; invoiceNumber: string; date: string; dueDate: string | null;
  customer: string; status: string; paymentStatus: string;
  total: number; amountPaid: number; balance: number; currencyCode: string;
}

export default function InvoicesListClient({ invoices }: { invoices: Invoice[] }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'overdue' | 'paid'>('all');

  const filtered = invoices.filter(i => {
    if (q && !`${i.invoiceNumber} ${i.customer}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'unpaid' && i.paymentStatus === 'paid') return false;
    if (filter === 'overdue' && i.status !== 'overdue') return false;
    if (filter === 'paid' && i.paymentStatus !== 'paid') return false;
    return true;
  });

  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-ink-200 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices..." className="input pl-9" />
        </div>
        <div className="flex gap-1">
          {(['all', 'unpaid', 'overdue', 'paid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 text-xs rounded-md font-medium capitalize', filter === f ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}>{f}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Invoice #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Due Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Customer</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
              <th className="text-right px-4 py-2.5 font-medium">Total</th>
              <th className="text-right px-4 py-2.5 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                <Receipt className="w-10 h-10 text-ink-300 mx-auto mb-2" />
                <p>No invoices found</p>
                <Link href="/invoices/new" className="text-brand-600 text-sm font-medium">Create your first invoice →</Link>
              </td></tr>
            )}
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5"><Link href={`/invoices/${i.id}`} className="text-brand-600 font-medium hover:underline">{i.invoiceNumber}</Link></td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(i.date)}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(i.dueDate) || '—'}</td>
                <td className="px-4 py-2.5">{i.customer}</td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={cn('badge', i.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700')}>{titleCase(i.status)}</span>
                    <span className={cn('badge text-[10px]', i.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : i.paymentStatus === 'unpaid' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>{titleCase(i.paymentStatus)}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(i.total, i.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(i.balance, i.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-ink-200 text-xs text-ink-500">
        Showing {filtered.length} of {invoices.length} invoices
      </div>
    </div>
  );
}
