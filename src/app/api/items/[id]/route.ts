import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const item = await prisma.item.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: { stockLevels: { include: { warehouse: true } }, compositeItems: { include: { child: true } } },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const data = await req.json();
  const { compositeItems, initialStock, ...item } = data;

  const existing = await prisma.item.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.item.update({ where: { id: params.id }, data: item });

  if (item.isComposite && Array.isArray(compositeItems)) {
    await prisma.compositeItem.deleteMany({ where: { parentId: params.id } });
    for (const c of compositeItems) {
      if (c.childItemId) {
        await prisma.compositeItem.create({
          data: { parentId: params.id, childId: c.childItemId, quantity: c.quantity || 1 },
        });
      }
    }
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const orgId = await getOrgId();
  const existing = await prisma.item.findFirst({ where: { id: params.id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.item.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
