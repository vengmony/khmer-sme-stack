import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.orderNumber || !data.customerId) {
    return NextResponse.json({ error: 'Order number and customer are required' }, { status: 400 });
  }
  const dup = await prisma.salesOrder.findFirst({ where: { organizationId: orgId, orderNumber: data.orderNumber } });
  if (dup) return NextResponse.json({ error: 'Order number already exists' }, { status: 400 });
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
  }
  const { items, ...so } = data;
  const created = await prisma.salesOrder.create({
    data: { ...so, organizationId: orgId, items: { create: items } },
  });
  return NextResponse.json(created);
}
