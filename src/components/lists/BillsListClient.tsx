'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Receipt } from 'lucide-react';
import { formatCurrency, formatDate, titleCase, statusColor } from '@/lib/utils';

interface Bill { id: string; billNumber: string; date: string; dueDate: string | null; vendor: string; status: string; paymentStatus: string; total: number; amountPaid: number; balance: number; currencyCode: string; }

export default function BillsListClient({ bills }: { bills: Bill[] }) {
  const [q, setQ] = useState('');
  const filtered = bills.filter(b => !q || `${b.billNumber} ${b.vendor}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-ink-200 flex items-center gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bills..." className="input pl-9" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Bill #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Due</th>
              <th className="text-left px-4 py-2.5 font-medium">Vendor</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
              <th className="text-right px-4 py-2.5 font-medium">Total</th>
              <th className="text-right px-4 py-2.5 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-500"><Receipt className="w-10 h-10 text-ink-300 mx-auto mb-2" /><p>No bills</p><Link href="/bills/new" className="text-brand-600 text-sm font-medium">Create one →</Link></td></tr>}
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5"><Link href={`/bills/${b.id}`} className="text-brand-600 font-medium hover:underline">{b.billNumber}</Link></td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(b.date)}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(b.dueDate) || '—'}</td>
                <td className="px-4 py-2.5">{b.vendor}</td>
                <td className="px-4 py-2.5 text-center"><div className="flex flex-col items-center gap-0.5"><span className={`badge ${statusColor(b.status)}`}>{titleCase(b.status)}</span><span className={`badge text-[10px] ${statusColor(b.paymentStatus)}`}>{titleCase(b.paymentStatus)}</span></div></td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(b.total, b.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(b.balance, b.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
