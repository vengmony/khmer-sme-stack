'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatDate, titleCase, cn, statusColor } from '@/lib/utils';

interface PO { id: string; orderNumber: string; date: string; vendor: string; status: string; paymentStatus: string; total: number; currencyCode: string; itemCount: number; amountPaid: number; balance: number; }

export default function PurchaseOrdersListClient({ orders }: { orders: PO[] }) {
  const [q, setQ] = useState('');
  const filtered = orders.filter(o => !q || `${o.orderNumber} ${o.vendor}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-ink-200 flex items-center gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search POs..." className="input pl-9" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">PO #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Vendor</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
              <th className="text-center px-4 py-2.5 font-medium">Payment</th>
              <th className="text-right px-4 py-2.5 font-medium">Total</th>
              <th className="text-right px-4 py-2.5 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-500"><ShoppingCart className="w-10 h-10 text-ink-300 mx-auto mb-2" /><p>No purchase orders</p><Link href="/purchase-orders/new" className="text-brand-600 text-sm font-medium">Create one →</Link></td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5"><Link href={`/purchase-orders/${o.id}`} className="text-brand-600 font-medium hover:underline">{o.orderNumber}</Link></td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(o.date)}</td>
                <td className="px-4 py-2.5">{o.vendor}</td>
                <td className="px-4 py-2.5 text-center"><span className={`badge ${statusColor(o.status)}`}>{titleCase(o.status)}</span></td>
                <td className="px-4 py-2.5 text-center"><span className={`badge ${statusColor(o.paymentStatus)}`}>{titleCase(o.paymentStatus)}</span></td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(o.total, o.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(o.balance, o.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
