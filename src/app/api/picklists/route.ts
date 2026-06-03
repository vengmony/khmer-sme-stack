import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.salesOrderId) return NextResponse.json({ error: 'Sales order required' }, { status: 400 });
  const dup = await prisma.picklist.findFirst({ where: { organizationId: orgId, picklistNumber: data.picklistNumber } });
  if (dup) return NextResponse.json({ error: 'Picklist number exists' }, { status: 400 });
  const { items, ...pl } = data;
  const created = await prisma.picklist.create({
    data: { ...pl, organizationId: orgId, items: { create: items || [] } },
  });
  return NextResponse.json(created);
}
