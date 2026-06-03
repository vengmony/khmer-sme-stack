import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TransferOrderForm from '@/components/forms/TransferOrderForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewTransferOrderPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const [warehouses, items] = await Promise.all([
    prisma.warehouse.findMany({ where: { organizationId: orgId } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true }, orderBy: { name: 'asc' } }),
  ]);
  const last = await prisma.transferOrder.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.transferNumber.replace(/\D/g, '')) : 7000;

  return (
    <div className="space-y-4">
      <Link href="/transfer-orders" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold">New Transfer Order</h1>
      <TransferOrderForm
        mode="create"
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name }))}
        nextNumber={`TR-${String(lastNum + 1).padStart(4, '0')}`}
      />
    </div>
  );
}
