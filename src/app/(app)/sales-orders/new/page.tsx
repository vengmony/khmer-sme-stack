import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SalesOrderForm from '@/components/forms/SalesOrderForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewSalesOrderPage({ searchParams }: { searchParams: { customerId?: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const [customers, items, warehouses, org] = await Promise.all([
    prisma.contact.findMany({ where: { organizationId: orgId, type: { in: ['customer', 'both'] } }, orderBy: { firstName: 'asc' } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true }, orderBy: { name: 'asc' } }),
    prisma.warehouse.findMany({ where: { organizationId: orgId } }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);

  const last = await prisma.salesOrder.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.orderNumber.replace(/\D/g, '')) : 1000;

  return (
    <div className="space-y-4">
      <Link href="/sales-orders" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to Sales Orders
      </Link>
      <h1 className="text-2xl font-bold">New Sales Order</h1>
      <SalesOrderForm
        mode="create"
        customers={customers.map((c) => ({ id: c.id, name: c.companyName || `${c.firstName} ${c.lastName}`, currencyCode: c.currencyCode || 'USD' }))}
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unitPrice: i.unitPrice, unit: i.unit }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        defaultCurrency={org?.currencyCode || 'USD'}
        nextNumber={`SO-${String(lastNum + 1).padStart(4, '0')}`}
        initialCustomerId={searchParams.customerId}
      />
    </div>
  );
}
