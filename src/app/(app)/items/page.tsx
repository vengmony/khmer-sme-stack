import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatNumber, titleCase } from '@/lib/utils';
import { Plus, Package, Search } from 'lucide-react';
import ItemsListClient from '@/components/lists/ItemsListClient';

export const dynamic = 'force-dynamic';

export default async function ItemsPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const q = (searchParams.q || '').toLowerCase().trim();

  const items = await prisma.item.findMany({
    where: {
      organizationId: orgId,
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { category: { contains: q } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      stockLevels: { include: { warehouse: true } },
    },
  });

  const totalStock = items.reduce((s, i) => s + i.stockLevels.reduce((ss, sl) => ss + sl.available, 0), 0);
  const totalValue = items.reduce((s, i) => {
    const stock = i.stockLevels.reduce((ss, sl) => ss + sl.available, 0);
    return s + stock * (i.costPrice || 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Items</h1>
          <p className="text-sm text-ink-500">Manage your product catalog and inventory.</p>
        </div>
        <Link href="/items/new" className="btn-primary"><Plus className="w-4 h-4" /> New Item</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-ink-500">Total Items</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(items.length)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Total Stock</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(totalStock, 0)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Inventory Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Categories</p>
          <p className="text-2xl font-bold mt-1">{new Set(items.map(i => i.category).filter(Boolean)).size}</p>
        </div>
      </div>

      <ItemsListClient items={items.map((i) => ({
        id: i.id,
        sku: i.sku,
        name: i.name,
        category: i.category,
        unitPrice: i.unitPrice,
        costPrice: i.costPrice,
        reorderPoint: i.reorderPoint,
        isActive: i.isActive,
        isComposite: i.isComposite,
        stockByWarehouse: i.stockLevels.map((sl) => ({ name: sl.warehouse.name, qty: sl.available })),
        totalStock: i.stockLevels.reduce((s, sl) => s + sl.available, 0),
      }))} q={q} />
    </div>
  );
}
