import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const so = await prisma.salesOrder.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: { customer: true, items: true, warehouse: true },
  });
  if (!so) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(so);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const data = await req.json();
  const existing = await prisma.salesOrder.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { items, ...so } = data;
  await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: params.id } });
  const updated = await prisma.salesOrder.update({
    where: { id: params.id },
    data: { ...so, items: { create: items || [] } },
  });
  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const data = await req.json();
  const existing = await prisma.salesOrder.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.salesOrder.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const existing = await prisma.salesOrder.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.salesOrder.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
