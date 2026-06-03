import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, titleCase, statusColor } from '@/lib/utils';
import { Plus, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ShipmentsPage() {
  const session = await requireSession();
  const shipments = await prisma.shipment.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
    include: { package: true },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Shipments</h1><p className="text-sm text-ink-500">Track outbound shipments.</p></div>
        <Link href="/shipments/new" className="btn-primary"><Plus className="w-4 h-4" /> New Shipment</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Shipment #</th>
              <th className="text-left px-4 py-2.5 font-medium">Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Carrier</th>
              <th className="text-left px-4 py-2.5 font-medium">Tracking #</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {shipments.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-500"><Truck className="w-10 h-10 text-ink-300 mx-auto mb-2" /><p>No shipments</p><Link href="/shipments/new" className="text-brand-600 text-sm font-medium">Create one →</Link></td></tr>}
            {shipments.map((s) => (
              <tr key={s.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5"><Link href={`/shipments/${s.id}`} className="text-brand-600 font-medium hover:underline">{s.shipmentNumber}</Link></td>
                <td className="px-4 py-2.5 text-ink-600 text-xs">{formatDate(s.date)}</td>
                <td className="px-4 py-2.5 text-ink-600">{s.carrier}</td>
                <td className="px-4 py-2.5 text-ink-600 font-mono text-xs">{s.trackingNumber || '—'}</td>
                <td className="px-4 py-2.5 text-center"><span className={`badge ${statusColor(s.status)}`}>{titleCase(s.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
