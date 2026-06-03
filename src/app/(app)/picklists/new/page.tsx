import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import PicklistForm from '@/components/forms/PicklistForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewPicklistPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const [salesOrders, warehouses] = await Promise.all([
    prisma.salesOrder.findMany({
      where: { organizationId: orgId, status: { in: ['confirmed', 'partially_shipped'] } },
      include: { customer: true, items: true },
    }),
    prisma.warehouse.findMany({ where: { organizationId: orgId } }),
  ]);
  const last = await prisma.picklist.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.picklistNumber.replace(/\D/g, '')) : 11000;

  return (
    <div className="space-y-4">
      <Link href="/picklists" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold">New Picklist</h1>
      <PicklistForm
        mode="create"
        salesOrders={salesOrders.map((so) => ({
          id: so.id, orderNumber: so.orderNumber, customer: so.customer.companyName || `${so.customer.firstName} ${so.customer.lastName}`,
          items: so.items.map(i => ({ id: i.itemId, name: i.name, sku: i.sku || '', quantity: i.quantity })),
        }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        nextNumber={`PL-${String(lastNum + 1).padStart(4, '0')}`}
      />
    </div>
  );
}
