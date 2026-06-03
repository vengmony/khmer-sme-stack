import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.fromWarehouseId || !data.toWarehouseId) return NextResponse.json({ error: 'Warehouses required' }, { status: 400 });
  if (data.fromWarehouseId === data.toWarehouseId) return NextResponse.json({ error: 'From and To must differ' }, { status: 400 });
  if (!Array.isArray(data.items) || data.items.length === 0) return NextResponse.json({ error: 'Items required' }, { status: 400 });

  const dup = await prisma.transferOrder.findFirst({ where: { organizationId: orgId, transferNumber: data.transferNumber } });
  if (dup) return NextResponse.json({ error: 'Transfer number exists' }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const { items, ...to } = data;
    const transfer = await tx.transferOrder.create({
      data: { ...to, organizationId: orgId, items: { create: items } },
    });
    // Adjust stock: decrement from, increment to
    for (const it of items) {
      if (!it.itemId || !it.quantity) continue;
      const from = await tx.stockLevel.findUnique({ where: { itemId_warehouseId: { itemId: it.itemId, warehouseId: data.fromWarehouseId } } });
      if (from) {
        await tx.stockLevel.update({
          where: { id: from.id },
          data: { quantity: { decrement: it.quantity }, available: { decrement: it.quantity } },
        });
      }
      await tx.stockLevel.upsert({
        where: { itemId_warehouseId: { itemId: it.itemId, warehouseId: data.toWarehouseId } },
        update: { quantity: { increment: it.quantity }, available: { increment: it.quantity } },
        create: { itemId: it.itemId, warehouseId: data.toWarehouseId, quantity: it.quantity, available: it.quantity },
      });
    }
    return transfer;
  });
  return NextResponse.json(result);
}
