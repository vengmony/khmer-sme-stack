import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VendorPaymentsPage() {
  const session = await requireSession();
  const payments = await prisma.vendorPayment.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { date: 'desc' },
    include: { vendor: true, bill: true },
  });

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Vendor Payments</h1>
        <p className="text-sm text-ink-500">All payments made to vendors.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-ink-500">Total Payments</p><p className="text-2xl font-bold mt-1">{formatNumber(payments.length)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Total Amount</p><p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p></div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Payment #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Vendor</th>
              <th className="text-left px-4 py-2.5 font-medium">Bill</th>
              <th className="text-left px-4 py-2.5 font-medium">Mode</th>
              <th className="text-right px-4 py-2.5 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {payments.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-500"><CreditCard className="w-10 h-10 text-ink-300 mx-auto mb-2" /><p>No payments yet</p></td></tr>}
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5 font-medium">{p.paymentNumber}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(p.date)}</td>
                <td className="px-4 py-2.5"><Link href={`/contacts/${p.vendor.id}`} className="text-brand-600 hover:underline">{p.vendor.companyName || `${p.vendor.firstName} ${p.vendor.lastName}`}</Link></td>
                <td className="px-4 py-2.5 text-ink-600">{p.bill ? <Link href={`/bills/${p.bill.id}`} className="text-brand-600 hover:underline">{p.bill.billNumber}</Link> : '—'}</td>
                <td className="px-4 py-2.5 text-ink-600 capitalize">{p.paymentMode.replace('_', ' ')}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(p.amount, p.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
