import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatDate, formatCurrency, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft, Truck, Package as PkgIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const s = await prisma.shipment.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { package: { include: { salesOrder: { include: { customer: true } } } } },
  });
  if (!s) nf();
  return (
    <div className="space-y-4 max-w-4xl">
      <Link href="/shipments" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</Link>
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Shipment</p>
            <h1 className="text-3xl font-bold mt-1">{s.shipmentNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">{formatDate(s.date, true)}</p>
          </div>
          <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-ink-400" /><span className={`badge ${statusColor(s.status)}`}>{titleCase(s.status)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Carrier Info</h2>
          <Row label="Carrier" value={s.carrier} />
          <Row label="Tracking #" value={s.trackingNumber || '—'} />
          <Row label="Shipping Charges" value={s.shippingCharges ? formatCurrency(s.shippingCharges) : '—'} />
          <Row label="Shipped Date" value={formatDate(s.shippedDate) || '—'} />
          <Row label="Delivered Date" value={formatDate(s.deliveryDate) || '—'} />
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><PkgIcon className="w-4 h-4" /> Package</h2>
          {s.package ? (
            <>
              <Link href={`/packages/${s.package.id}`} className="text-brand-600 font-medium hover:underline">{s.package.packageNumber}</Link>
              {s.package.salesOrder?.customer && (
                <p className="text-ink-600 text-xs mt-1">To: {s.package.salesOrder.customer.companyName || `${s.package.salesOrder.customer.firstName} ${s.package.salesOrder.customer.lastName}`}</p>
              )}
            </>
          ) : <p>—</p>}
        </div>
      </div>
      {s.notes && <div className="card p-5"><h2 className="font-semibold mb-2">Notes</h2><p className="text-sm text-ink-600 whitespace-pre-line">{s.notes}</p></div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
