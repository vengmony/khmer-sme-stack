import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { Plus, ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PicklistsPage() {
  const session = await requireSession();
  const picklists = await prisma.picklist.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
    include: { salesOrder: { include: { customer: true } }, warehouse: true, _count: { select: { items: true } } },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Picklists</h1><p className="text-sm text-ink-500">Pick items for order fulfillment.</p></div>
        <Link href="/picklists/new" className="btn-primary"><Plus className="w-4 h-4" /> New Picklist</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Picklist #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Sales Order</th>
              <th className="text-left px-4 py-2.5 font-medium">Warehouse</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
              <th className="text-right px-4 py-2.5 font-medium">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {picklists.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-500"><ClipboardList className="w-10 h-10 text-ink-300 mx-auto mb-2" /><p>No picklists</p><Link href="/picklists/new" className="text-brand-600 text-sm font-medium">Create one →</Link></td></tr>}
            {picklists.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5"><Link href={`/picklists/${p.id}`} className="text-brand-600 font-medium hover:underline">{p.picklistNumber}</Link></td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(p.date)}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{p.salesOrder?.orderNumber || '—'}</td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{p.warehouse?.name || '—'}</td>
                <td className="px-4 py-2.5 text-center"><span className={`badge ${statusColor(p.status)}`}>{titleCase(p.status)}</span></td>
                <td className="px-4 py-2.5 text-right">{formatNumber(p._count.items)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
