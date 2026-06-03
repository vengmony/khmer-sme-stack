import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { Plus, ShoppingCart } from 'lucide-react';
import PurchaseOrdersListClient from '@/components/lists/PurchaseOrdersListClient';

export const dynamic = 'force-dynamic';

export default async function PurchaseOrdersPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const orders = await prisma.purchaseOrder.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    include: { vendor: true, _count: { select: { items: true } } },
  });

  const total = orders.reduce((s, o) => s + (o.total || 0), 0);
  const openCount = orders.filter(o => ['draft', 'open', 'partially_received'].includes(o.status)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Purchase Orders</h1><p className="text-sm text-ink-500">Order stock from vendors.</p></div>
        <Link href="/purchase-orders/new" className="btn-primary"><Plus className="w-4 h-4" /> New Purchase Order</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-ink-500">Total POs</p><p className="text-2xl font-bold mt-1">{formatNumber(orders.length)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Open POs</p><p className="text-2xl font-bold mt-1 text-blue-600">{formatNumber(openCount)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Total Value</p><p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Avg. PO Value</p><p className="text-2xl font-bold mt-1">{formatCurrency(orders.length ? total / orders.length : 0)}</p></div>
      </div>

      <PurchaseOrdersListClient
        orders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          date: o.date.toISOString(),
          vendor: o.vendor.companyName || `${o.vendor.firstName} ${o.vendor.lastName}`,
          status: o.status,
          paymentStatus: o.paymentStatus,
          total: o.total,
          currencyCode: o.currencyCode,
          itemCount: o._count.items,
          amountPaid: o.amountPaid,
          balance: o.total - o.amountPaid,
        }))}
      />
    </div>
  );
}
