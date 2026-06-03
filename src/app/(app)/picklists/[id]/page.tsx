import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PicklistDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const p = await prisma.picklist.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { salesOrder: { include: { customer: true } }, warehouse: true, items: { include: { item: true } } },
  });
  if (!p) nf();
  return (
    <div className="space-y-4 max-w-4xl">
      <Link href="/picklists" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</Link>
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Picklist</p>
            <h1 className="text-3xl font-bold mt-1">{p.picklistNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">{formatDate(p.date, true)}</p>
            {p.salesOrder && <p className="text-xs text-ink-500 mt-1">For <Link href={`/sales-orders/${p.salesOrder.id}`} className="text-brand-600 hover:underline">{p.salesOrder.orderNumber}</Link> · {p.salesOrder.customer.companyName || `${p.salesOrder.customer.firstName} ${p.salesOrder.customer.lastName}`}</p>}
          </div>
          <span className={`badge ${statusColor(p.status)}`}>{titleCase(p.status)}</span>
        </div>
      </div>
      <div className="card p-5 space-y-2 text-sm">
        <h2 className="font-semibold mb-2">Details</h2>
        <div className="flex justify-between"><dt className="text-ink-500">Warehouse</dt><dd className="font-medium">{p.warehouse?.name || '—'}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-500">Assignee</dt><dd className="font-medium">{p.assigneeName || '—'}</dd></div>
      </div>
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 font-semibold">Items</div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-2.5">Status</th><th className="text-left px-4 py-2.5">Item</th><th className="text-right px-4 py-2.5">To Pick</th><th className="text-right px-4 py-2.5">Picked</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {p.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5">{it.picked ? <span className="badge bg-emerald-100 text-emerald-700">✓ Picked</span> : <span className="badge bg-slate-100 text-slate-700">Pending</span>}</td>
                <td className="px-4 py-2.5"><p className="font-medium">{it.item.name}</p><p className="text-xs text-ink-500 font-mono">{it.item.sku}</p></td>
                <td className="px-4 py-2.5 text-right">{formatNumber(it.quantity, 0)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatNumber(it.pickedQty, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
