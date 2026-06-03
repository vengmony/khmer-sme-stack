import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import TransactionForm from '@/components/forms/TransactionForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditPurchaseOrderPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: { items: true },
  });
  if (!po) nf();
  const [vendors, items, warehouses, org] = await Promise.all([
    prisma.contact.findMany({ where: { organizationId: orgId, type: { in: ['vendor', 'both'] } } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true } }),
    prisma.warehouse.findMany({ where: { organizationId: orgId } }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);
  return (
    <div className="space-y-4">
      <Link href={`/purchase-orders/${po.id}`} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold">Edit Purchase Order {po.orderNumber}</h1>
      <TransactionForm
        mode="edit"
        type="purchase-order"
        apiPath="/api/purchase-orders"
        numberField="orderNumber"
        nextNumber={po.orderNumber}
        contacts={vendors.map((c) => ({ id: c.id, name: c.companyName || `${c.firstName} ${c.lastName}`, currencyCode: c.currencyCode || 'USD' }))}
        contactLabel="Vendor"
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unitPrice: i.unitPrice, unit: i.unit, costPrice: i.costPrice }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        defaultCurrency={org?.currencyCode || 'USD'}
        priceField="costPrice"
        initial={{
          ...po,
          contactId: po.vendorId,
          date: po.date.toISOString().slice(0, 10),
          expectedDelivery: po.expectedDelivery?.toISOString().slice(0, 10) || '',
        }}
      />
    </div>
  );
}
