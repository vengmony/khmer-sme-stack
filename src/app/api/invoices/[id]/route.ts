import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const data = await req.json();
  const existing = await prisma.invoice.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { items, ...inv } = data;
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } });
  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: { ...inv, items: { create: items || [] } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const existing = await prisma.invoice.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
