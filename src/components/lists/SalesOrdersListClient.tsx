'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Search, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate, titleCase, cn } from '@/lib/utils';

interface SO {
  id: string; orderNumber: string; date: string; customer: string;
  status: string; paymentStatus: string; total: number; currencyCode: string;
  itemCount: number; amountPaid: number; balance: number;
}

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'partially_shipped', label: 'Partially Shipped' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-blue-100 text-blue-700',
  partially_shipped: 'bg-amber-100 text-amber-700',
  shipped: 'bg-emerald-100 text-emerald-700',
  invoiced: 'bg-violet-100 text-violet-700',
  cancelled: 'bg-rose-100 text-rose-700',
};
const PAYMENT_COLORS: Record<string, string> = {
  unpaid: 'bg-rose-100 text-rose-700',
  partially_paid: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

export default function SalesOrdersListClient({ orders, status }: { orders: SO[]; status: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [s, setS] = useState(status);
  const [q, setQ] = useState('');

  const filtered = orders.filter(o => {
    if (s !== 'all' && o.status !== s) return false;
    if (q && !`${o.orderNumber} ${o.customer}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  function changeStatus(newStatus: string) {
    setS(newStatus);
    const p = new URLSearchParams(params.toString());
    if (newStatus !== 'all') p.set('status', newStatus); else p.delete('status');
    router.push(`/sales-orders?${p.toString()}`);
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-ink-200 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order # or customer..."
            className="input pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(st => (
            <button
              key={st.value}
              onClick={() => changeStatus(st.value)}
              className={cn('px-3 py-1.5 text-xs rounded-md font-medium',
                s === st.value ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}
            >{st.label}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Order #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Customer</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
              <th className="text-center px-4 py-2.5 font-medium">Payment</th>
              <th className="text-right px-4 py-2.5 font-medium">Total</th>
              <th className="text-right px-4 py-2.5 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                <FileText className="w-10 h-10 text-ink-300 mx-auto mb-2" />
                <p>No sales orders found</p>
                <Link href="/sales-orders/new" className="text-brand-600 text-sm font-medium">Create one →</Link>
              </td></tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5">
                  <Link href={`/sales-orders/${o.id}`} className="text-brand-600 font-medium hover:underline">{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(o.date)}</td>
                <td className="px-4 py-2.5">{o.customer}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={cn('badge', STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-700')}>
                    {titleCase(o.status)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={cn('badge', PAYMENT_COLORS[o.paymentStatus] || 'bg-slate-100 text-slate-700')}>
                    {titleCase(o.paymentStatus)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(o.total, o.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(o.balance, o.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-ink-200 text-xs text-ink-500">
        Showing {filtered.length} of {orders.length} orders
      </div>
    </div>
  );
}
