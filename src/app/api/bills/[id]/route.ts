import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const data = await req.json();
  const existing = await prisma.bill.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { items, ...bill } = data;
  await prisma.billItem.deleteMany({ where: { billId: params.id } });
  const updated = await prisma.bill.update({
    where: { id: params.id },
    data: { ...bill, items: { create: items || [] } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const existing = await prisma.bill.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.bill.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
