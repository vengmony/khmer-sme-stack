import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.orderNumber || !data.vendorId) return NextResponse.json({ error: 'PO number and vendor required' }, { status: 400 });
  const dup = await prisma.purchaseOrder.findFirst({ where: { organizationId: orgId, orderNumber: data.orderNumber } });
  if (dup) return NextResponse.json({ error: 'PO number exists' }, { status: 400 });
  if (!Array.isArray(data.items) || data.items.length === 0) return NextResponse.json({ error: 'At least one line item required' }, { status: 400 });
  const { items, ...po } = data;
  const created = await prisma.purchaseOrder.create({
    data: { ...po, organizationId: orgId, items: { create: items } },
  });
  return NextResponse.json(created);
}
