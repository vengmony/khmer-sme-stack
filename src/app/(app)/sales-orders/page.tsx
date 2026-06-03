import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatNumber, formatDate, titleCase } from '@/lib/utils';
import { Plus, FileText } from 'lucide-react';
import SalesOrdersListClient from '@/components/lists/SalesOrdersListClient';

export const dynamic = 'force-dynamic';

export default async function SalesOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const status = searchParams.status;

  const orders = await prisma.salesOrder.findMany({
    where: {
      organizationId: orgId,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { customer: true, _count: { select: { items: true } } },
  });

  const totalValue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const openCount = orders.filter(o => ['draft', 'confirmed', 'partially_shipped'].includes(o.status)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Sales Orders</h1>
          <p className="text-sm text-ink-500">Manage customer orders and fulfillment.</p>
        </div>
        <Link href="/sales-orders/new" className="btn-primary"><Plus className="w-4 h-4" /> New Sales Order</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-ink-500">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(orders.length)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Open Orders</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{formatNumber(openCount)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Total Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Avg. Order Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(orders.length ? totalValue / orders.length : 0)}</p>
        </div>
      </div>

      <SalesOrdersListClient
        orders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          date: o.date.toISOString(),
          customer: o.customer.companyName || `${o.customer.firstName} ${o.customer.lastName}`,
          status: o.status,
          paymentStatus: o.paymentStatus,
          total: o.total,
          currencyCode: o.currencyCode,
          itemCount: o._count.items,
          amountPaid: o.amountPaid,
          balance: o.total - o.amountPaid,
        }))}
        status={status || 'all'}
      />
    </div>
  );
}
