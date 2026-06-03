import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.warehouseId || !Array.isArray(data.items) || data.items.length === 0) {
    return NextResponse.json({ error: 'Warehouse and items required' }, { status: 400 });
  }
  const dup = await prisma.inventoryAdjustment.findFirst({ where: { organizationId: orgId, adjustmentNumber: data.adjustmentNumber } });
  if (dup) return NextResponse.json({ error: 'Adjustment number exists' }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const { items, ...adj } = data;
    const created = await tx.inventoryAdjustment.create({
      data: { ...adj, organizationId: orgId, items: { create: items } },
    });
    for (const it of items) {
      if (!it.itemId || !it.quantity) continue;
      await tx.stockLevel.upsert({
        where: { itemId_warehouseId: { itemId: it.itemId, warehouseId: data.warehouseId } },
        update: { quantity: { increment: it.quantity }, available: { increment: it.quantity } },
        create: { itemId: it.itemId, warehouseId: data.warehouseId, quantity: it.quantity, available: it.quantity },
      });
    }
    return created;
  });
  return NextResponse.json(result);
}
