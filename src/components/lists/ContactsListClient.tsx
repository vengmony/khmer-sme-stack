'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Users, Building, Mail, Phone } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface Contact {
  id: string; type: string;
  name: string; firstName: string; lastName: string;
  companyName: string | null;
  email: string | null; phone: string | null;
  paymentTerms: string | null; currencyCode: string | null;
  outstandingReceivable: number; outstandingPayable: number;
  orderCount: number; invoiceCount: number;
}

export default function ContactsListClient({ contacts, typeFilter, q }: { contacts: Contact[]; typeFilter: string; q: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(q);
  const [type, setType] = useState(typeFilter);

  function navigate(newQ: string, newType: string) {
    const p = new URLSearchParams(params.toString());
    if (newQ) p.set('q', newQ); else p.delete('q');
    if (newType !== 'all') p.set('type', newType); else p.delete('type');
    router.push(`/contacts?${p.toString()}`);
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-ink-200 flex flex-wrap items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); navigate(query, type); }} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
            className="input pl-9"
          />
        </form>
        <select value={type} onChange={(e) => { setType(e.target.value); navigate(query, e.target.value); }} className="input w-auto">
          <option value="all">All</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Name</th>
              <th className="text-left px-4 py-2.5 font-medium">Type</th>
              <th className="text-left px-4 py-2.5 font-medium">Email</th>
              <th className="text-left px-4 py-2.5 font-medium">Phone</th>
              <th className="text-left px-4 py-2.5 font-medium">Payment Terms</th>
              <th className="text-right px-4 py-2.5 font-medium">Receivable</th>
              <th className="text-right px-4 py-2.5 font-medium">Payable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {contacts.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                <Users className="w-10 h-10 text-ink-300 mx-auto mb-2" />
                <p>No contacts yet</p>
                <Link href="/contacts/new" className="text-brand-600 text-sm font-medium">Create your first contact →</Link>
              </td></tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5">
                  <Link href={`/contacts/${c.id}`} className="block">
                    <p className="font-medium">{c.name}</p>
                    {c.companyName && c.firstName && (
                      <p className="text-xs text-ink-500">{c.firstName} {c.lastName}</p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <span className={cn('badge', c.type === 'customer' ? 'bg-blue-100 text-blue-700' : c.type === 'vendor' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700')}>
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{c.email || '—'}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{c.phone || '—'}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{c.paymentTerms || '—'}</td>
                <td className="px-4 py-2.5 text-right text-emerald-600">{c.outstandingReceivable > 0 ? formatCurrency(c.outstandingReceivable, c.currencyCode || 'USD') : '—'}</td>
                <td className="px-4 py-2.5 text-right text-rose-600">{c.outstandingPayable > 0 ? formatCurrency(c.outstandingPayable, c.currencyCode || 'USD') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-ink-200 text-xs text-ink-500">
        Showing {contacts.length} contact{contacts.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}
