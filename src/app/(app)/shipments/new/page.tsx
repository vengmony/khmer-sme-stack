import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ShipmentForm from '@/components/forms/ShipmentForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewShipmentPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const packages = await prisma.package.findMany({
    where: { organizationId: orgId, status: { in: ['packed', 'shipped'] } },
    include: { salesOrder: { include: { customer: true } } },
  });
  const last = await prisma.shipment.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.shipmentNumber.replace(/\D/g, '')) : 10000;

  return (
    <div className="space-y-4">
      <Link href="/shipments" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold">New Shipment</h1>
      <ShipmentForm
        mode="create"
        packages={packages.map((p) => ({
          id: p.id, packageNumber: p.packageNumber,
          customer: p.salesOrder?.customer.companyName || `${p.salesOrder?.customer.firstName} ${p.salesOrder?.customer.lastName}` || '—',
        }))}
        nextNumber={`SHP-${String(lastNum + 1).padStart(4, '0')}`}
      />
    </div>
  );
}
