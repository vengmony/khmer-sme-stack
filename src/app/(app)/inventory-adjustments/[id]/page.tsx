import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdjustmentDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const adj = await prisma.inventoryAdjustment.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { warehouse: true, items: { include: { item: true } } },
  });
  if (!adj) nf();
  return (
    <div className="space-y-4 max-w-4xl">
      <Link href="/inventory-adjustments" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</Link>
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Inventory Adjustment</p>
            <h1 className="text-3xl font-bold mt-1">{adj.adjustmentNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">{formatDate(adj.date, true)}</p>
            {adj.reason && <p className="text-xs text-ink-500 mt-1">Reason: {adj.reason}</p>}
          </div>
          <span className={`badge ${statusColor(adj.status)}`}>{titleCase(adj.status)}</span>
        </div>
      </div>
      <div className="card p-5 space-y-2 text-sm">
        <h2 className="font-semibold mb-2">Details</h2>
        <div className="flex justify-between"><dt className="text-ink-500">Warehouse</dt><dd className="font-medium">{adj.warehouse?.name || '—'}</dd></div>
      </div>
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 font-semibold">Items Adjusted</div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-2.5">Item</th><th className="text-right px-4 py-2.5">Quantity</th><th className="text-left px-4 py-2.5">Reason</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {adj.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5"><p className="font-medium">{it.item.name}</p><p className="text-xs text-ink-500 font-mono">{it.item.sku}</p></td>
                <td className={`px-4 py-2.5 text-right font-medium ${it.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{it.quantity > 0 ? '+' : ''}{formatNumber(it.quantity, 0)}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{it.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
