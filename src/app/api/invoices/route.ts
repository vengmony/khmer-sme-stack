import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.invoiceNumber || !data.customerId) {
    return NextResponse.json({ error: 'Invoice number and customer required' }, { status: 400 });
  }
  const dup = await prisma.invoice.findFirst({ where: { organizationId: orgId, invoiceNumber: data.invoiceNumber } });
  if (dup) return NextResponse.json({ error: 'Invoice number exists' }, { status: 400 });
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return NextResponse.json({ error: 'At least one line item required' }, { status: 400 });
  }
  const { items, ...inv } = data;
  const created = await prisma.invoice.create({
    data: { ...inv, organizationId: orgId, items: { create: items } },
  });
  return NextResponse.json(created);
}
