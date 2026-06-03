import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.packageId || !data.carrier) return NextResponse.json({ error: 'Package and carrier required' }, { status: 400 });
  const dup = await prisma.shipment.findFirst({ where: { organizationId: orgId, shipmentNumber: data.shipmentNumber } });
  if (dup) return NextResponse.json({ error: 'Shipment number exists' }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.create({ data: { ...data, organizationId: orgId } });
    if (data.status === 'in_transit' || data.status === 'delivered') {
      await tx.package.update({ where: { id: data.packageId }, data: { status: 'shipped' } });
    }
    return shipment;
  });
  return NextResponse.json(result);
}
