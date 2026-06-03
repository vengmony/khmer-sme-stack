import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TransferOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const t = await prisma.transferOrder.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { fromWarehouse: true, toWarehouse: true, items: { include: { item: true } } },
  });
  if (!t) nf();
  return (
    <div className="space-y-4 max-w-4xl">
      <Link href="/transfer-orders" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</Link>
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Transfer Order</p>
            <h1 className="text-3xl font-bold mt-1">{t.transferNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">{formatDate(t.date, true)}</p>
          </div>
          <span className={`badge ${statusColor(t.status)}`}>{titleCase(t.status)}</span>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm">
          <div className="card p-3 flex-1 text-center"><p className="text-xs text-ink-500">From</p><p className="font-semibold mt-0.5">{t.fromWarehouse.name}</p></div>
          <ArrowRight className="w-5 h-5 text-ink-400" />
          <div className="card p-3 flex-1 text-center"><p className="text-xs text-ink-500">To</p><p className="font-semibold mt-0.5">{t.toWarehouse.name}</p></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 font-semibold">Items</div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-2.5">Item</th><th className="text-right px-4 py-2.5">Quantity</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {t.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5"><p className="font-medium">{it.item.name}</p><p className="text-xs text-ink-500 font-mono">{it.item.sku}</p></td>
                <td className="px-4 py-2.5 text-right font-medium">{formatNumber(it.quantity, 0)} {it.item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {t.notes && <div className="card p-5"><h2 className="font-semibold mb-2">Notes</h2><p className="text-sm text-ink-600 whitespace-pre-line">{t.notes}</p></div>}
    </div>
  );
}
