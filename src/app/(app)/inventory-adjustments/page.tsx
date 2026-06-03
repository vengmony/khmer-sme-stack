import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { Plus, Sliders } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InventoryAdjustmentsPage() {
  const session = await requireSession();
  const adjustments = await prisma.inventoryAdjustment.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
    include: { warehouse: true, _count: { select: { items: true } } },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Inventory Adjustments</h1><p className="text-sm text-ink-500">Adjust stock levels for discrepancies, damage, or write-offs.</p></div>
        <Link href="/inventory-adjustments/new" className="btn-primary"><Plus className="w-4 h-4" /> New Adjustment</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Adjustment #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Warehouse</th>
              <th className="text-left px-4 py-2.5 font-medium">Reason</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
              <th className="text-right px-4 py-2.5 font-medium">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {adjustments.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-500"><Sliders className="w-10 h-10 text-ink-300 mx-auto mb-2" /><p>No adjustments</p><Link href="/inventory-adjustments/new" className="text-brand-600 text-sm font-medium">Create one →</Link></td></tr>}
            {adjustments.map((a) => (
              <tr key={a.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5"><Link href={`/inventory-adjustments/${a.id}`} className="text-brand-600 font-medium hover:underline">{a.adjustmentNumber}</Link></td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(a.date)}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{a.warehouse?.name || '—'}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{a.reason || '—'}</td>
                <td className="px-4 py-2.5 text-center"><span className={`badge ${statusColor(a.status)}`}>{titleCase(a.status)}</span></td>
                <td className="px-4 py-2.5 text-right">{formatNumber(a._count.items)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
