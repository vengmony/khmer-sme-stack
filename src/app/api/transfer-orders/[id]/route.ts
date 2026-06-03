import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const t = await prisma.transferOrder.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: { fromWarehouse: true, toWarehouse: true, items: { include: { item: true } } },
  });
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(t);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const existing = await prisma.transferOrder.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.transferOrder.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
