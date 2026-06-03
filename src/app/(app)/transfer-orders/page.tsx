import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { Plus, ArrowRightLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TransferOrdersPage() {
  const session = await requireSession();
  const transfers = await prisma.transferOrder.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
    include: { fromWarehouse: true, toWarehouse: true, _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Transfer Orders</h1><p className="text-sm text-ink-500">Move stock between warehouses.</p></div>
        <Link href="/transfer-orders/new" className="btn-primary"><Plus className="w-4 h-4" /> New Transfer</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Transfer #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">From → To</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
              <th className="text-right px-4 py-2.5 font-medium">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {transfers.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-500"><ArrowRightLeft className="w-10 h-10 text-ink-300 mx-auto mb-2" /><p>No transfers</p><Link href="/transfer-orders/new" className="text-brand-600 text-sm font-medium">Create one →</Link></td></tr>}
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5"><Link href={`/transfer-orders/${t.id}`} className="text-brand-600 font-medium hover:underline">{t.transferNumber}</Link></td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(t.date)}</td>
                <td className="px-4 py-2.5">{t.fromWarehouse.name} → {t.toWarehouse.name}</td>
                <td className="px-4 py-2.5 text-center"><span className={`badge ${statusColor(t.status)}`}>{titleCase(t.status)}</span></td>
                <td className="px-4 py-2.5 text-right">{formatNumber(t._count.items)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
