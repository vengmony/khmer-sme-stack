import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdjustmentForm from '@/components/forms/AdjustmentForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewAdjustmentPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const [warehouses, items] = await Promise.all([
    prisma.warehouse.findMany({ where: { organizationId: orgId } }),
    prisma.item.findMany({ where: { organizationId: orgId, trackInventory: true }, orderBy: { name: 'asc' } }),
  ]);
  const last = await prisma.inventoryAdjustment.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.adjustmentNumber.replace(/\D/g, '')) : 8000;

  return (
    <div className="space-y-4">
      <Link href="/inventory-adjustments" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold">New Inventory Adjustment</h1>
      <AdjustmentForm
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unit: i.unit }))}
        nextNumber={`ADJ-${String(lastNum + 1).padStart(4, '0')}`}
      />
    </div>
  );
}
