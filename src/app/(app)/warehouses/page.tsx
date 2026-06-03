import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatNumber, formatDate, titleCase } from '@/lib/utils';
import { Warehouse as WhIcon, Plus } from 'lucide-react';
import WarehousesClient from '@/components/WarehousesClient';

export const dynamic = 'force-dynamic';

export default async function WarehousesPage() {
  const session = await requireSession();
  const warehouses = await prisma.warehouse.findMany({
    where: { organizationId: session.organizationId },
    include: { stockLevels: { include: { item: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Warehouses</h1><p className="text-sm text-ink-500">Manage your storage locations.</p></div>
      </div>
      <WarehousesClient
        warehouses={warehouses.map((w) => ({
          id: w.id, name: w.name, code: w.code, isDefault: w.isDefault,
          city: w.city, state: w.state, country: w.country,
          itemCount: w.stockLevels.length,
          totalStock: w.stockLevels.reduce((s, sl) => s + sl.quantity, 0),
          totalValue: w.stockLevels.reduce((s, sl) => s + sl.quantity * (sl.item.costPrice || 0), 0),
        }))}
      />
    </div>
  );
}
