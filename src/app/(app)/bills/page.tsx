import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { Plus, Receipt } from 'lucide-react';
import BillsListClient from '@/components/lists/BillsListClient';

export const dynamic = 'force-dynamic';

export default async function BillsPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const bills = await prisma.bill.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    include: { vendor: true, _count: { select: { items: true, payments: true } } },
  });

  const total = bills.reduce((s, b) => s + (b.total || 0), 0);
  const paid = bills.reduce((s, b) => s + (b.amountPaid || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Bills</h1><p className="text-sm text-ink-500">Vendor bills and payables.</p></div>
        <Link href="/bills/new" className="btn-primary"><Plus className="w-4 h-4" /> New Bill</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-ink-500">Total Bills</p><p className="text-2xl font-bold mt-1">{formatNumber(bills.length)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Total Amount</p><p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Total Paid</p><p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(paid)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Outstanding</p><p className="text-2xl font-bold mt-1 text-rose-600">{formatCurrency(total - paid)}</p></div>
      </div>
      <BillsListClient
        bills={bills.map((b) => ({
          id: b.id,
          billNumber: b.billNumber,
          date: b.date.toISOString(),
          dueDate: b.dueDate?.toISOString() || null,
          vendor: b.vendor.companyName || `${b.vendor.firstName} ${b.vendor.lastName}`,
          status: b.status,
          paymentStatus: b.paymentStatus,
          total: b.total,
          amountPaid: b.amountPaid,
          balance: b.balance,
          currencyCode: b.currencyCode,
        }))}
      />
    </div>
  );
}
