import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.salesOrderId) return NextResponse.json({ error: 'Sales order required' }, { status: 400 });
  const dup = await prisma.package.findFirst({ where: { organizationId: orgId, packageNumber: data.packageNumber } });
  if (dup) return NextResponse.json({ error: 'Package number exists' }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const { items, ...pkg } = data;
    const created = await tx.package.create({
      data: { ...pkg, organizationId: orgId, items: { create: items || [] } },
    });
    // Update sales order status
    if (pkg.status === 'shipped' || pkg.status === 'delivered') {
      await tx.salesOrder.update({
        where: { id: pkg.salesOrderId },
        data: { status: pkg.status === 'delivered' ? 'shipped' : 'partially_shipped' },
      });
    }
    return created;
  });
  return NextResponse.json(result);
}

export async function GET() {
  const orgId = await getOrgId();
  const packages = await prisma.package.findMany({
    where: { organizationId: orgId },
    include: { salesOrder: { include: { customer: true } }, items: true, shipment: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(packages);
}
