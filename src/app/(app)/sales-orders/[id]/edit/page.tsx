import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import SalesOrderForm from '@/components/forms/SalesOrderForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditSalesOrderPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const so = await prisma.salesOrder.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: { items: true },
  });
  if (!so) nf();

  const [customers, items, warehouses, org] = await Promise.all([
    prisma.contact.findMany({ where: { organizationId: orgId, type: { in: ['customer', 'both'] } } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true } }),
    prisma.warehouse.findMany({ where: { organizationId: orgId } }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);

  return (
    <div className="space-y-4">
      <Link href={`/sales-orders/${so.id}`} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to Sales Order
      </Link>
      <h1 className="text-2xl font-bold">Edit Sales Order {so.orderNumber}</h1>
      <SalesOrderForm
        mode="edit"
        customers={customers.map((c) => ({ id: c.id, name: c.companyName || `${c.firstName} ${c.lastName}`, currencyCode: c.currencyCode || 'USD' }))}
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unitPrice: i.unitPrice, unit: i.unit }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        defaultCurrency={org?.currencyCode || 'USD'}
        nextNumber={so.orderNumber}
        initial={{
          ...so,
          date: so.date.toISOString().slice(0, 10),
          expectedShipmentDate: so.expectedShipmentDate?.toISOString().slice(0, 10) || '',
        }}
      />
    </div>
  );
}
