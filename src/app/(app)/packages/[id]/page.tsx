import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const pkg = await prisma.package.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { salesOrder: { include: { customer: true } }, items: { include: { item: true } }, shipment: true },
  });
  if (!pkg) nf();
  return (
    <div className="space-y-4 max-w-4xl">
      <Link href="/packages" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</Link>
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Package</p>
            <h1 className="text-3xl font-bold mt-1">{pkg.packageNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">{formatDate(pkg.date, true)}</p>
            {pkg.salesOrder && <p className="text-xs text-ink-500 mt-1">For <Link href={`/sales-orders/${pkg.salesOrder.id}`} className="text-brand-600 hover:underline">{pkg.salesOrder.orderNumber}</Link></p>}
          </div>
          <span className={`badge ${statusColor(pkg.status)}`}>{titleCase(pkg.status)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Shipment</h2>
          <Row label="Carrier" value={pkg.carrier || '—'} />
          <Row label="Tracking #" value={pkg.trackingNumber || '—'} />
          <Row label="Weight" value={pkg.weight ? `${pkg.weight} kg` : '—'} />
          <Row label="Dimensions" value={pkg.dimensionL && pkg.dimensionW && pkg.dimensionH ? `${pkg.dimensionL}×${pkg.dimensionW}×${pkg.dimensionH} cm` : '—'} />
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Customer</h2>
          {pkg.salesOrder?.customer && (
            <>
              <p className="font-medium">{pkg.salesOrder.customer.companyName || `${pkg.salesOrder.customer.firstName} ${pkg.salesOrder.customer.lastName}`}</p>
              <p className="text-ink-600 text-xs">{pkg.salesOrder.customer.email}</p>
            </>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 font-semibold">Items</div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr><th className="text-left px-4 py-2.5">Item</th><th className="text-right px-4 py-2.5">Quantity</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {pkg.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5"><p className="font-medium">{it.item.name}</p><p className="text-xs text-ink-500 font-mono">{it.item.sku}</p></td>
                <td className="px-4 py-2.5 text-right font-medium">{formatNumber(it.quantity, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
