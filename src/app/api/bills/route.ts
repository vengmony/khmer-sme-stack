import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.billNumber || !data.vendorId) return NextResponse.json({ error: 'Bill number and vendor required' }, { status: 400 });
  const dup = await prisma.bill.findFirst({ where: { organizationId: orgId, billNumber: data.billNumber } });
  if (dup) return NextResponse.json({ error: 'Bill number exists' }, { status: 400 });
  if (!Array.isArray(data.items) || data.items.length === 0) return NextResponse.json({ error: 'At least one line item required' }, { status: 400 });
  const { items, ...bill } = data;
  const created = await prisma.bill.create({
    data: { ...bill, organizationId: orgId, items: { create: items } },
  });
  return NextResponse.json(created);
}
