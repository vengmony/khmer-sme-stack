import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber, titleCase, cn, statusColor } from '@/lib/utils';
import { Plus, Receipt } from 'lucide-react';
import InvoicesListClient from '@/components/lists/InvoicesListClient';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const session = await requireSession();
  const orgId = session.organizationId;

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    include: { customer: true, _count: { select: { items: true, payments: true } } },
  });

  const total = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const paid = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const outstanding = total - paid;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-ink-500">Bill customers and track payments.</p>
        </div>
        <Link href="/invoices/new" className="btn-primary"><Plus className="w-4 h-4" /> New Invoice</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-ink-500">Total Invoices</p><p className="text-2xl font-bold mt-1">{formatNumber(invoices.length)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Total Invoiced</p><p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Total Paid</p><p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(paid)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Outstanding</p><p className="text-2xl font-bold mt-1 text-amber-600">{formatCurrency(outstanding)}</p>{overdueCount > 0 && <p className="text-xs text-rose-600 mt-1">{overdueCount} overdue</p>}</div>
      </div>

      <InvoicesListClient
        invoices={invoices.map((i) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          date: i.date.toISOString(),
          dueDate: i.dueDate?.toISOString() || null,
          customer: i.customer.companyName || `${i.customer.firstName} ${i.customer.lastName}`,
          status: i.status,
          paymentStatus: i.paymentStatus,
          total: i.total,
          amountPaid: i.amountPaid,
          balance: i.balance,
          currencyCode: i.currencyCode,
        }))}
      />
    </div>
  );
}
