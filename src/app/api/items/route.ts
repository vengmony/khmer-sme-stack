import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function GET() {
  const orgId = await getOrgId();
  const items = await prisma.item.findMany({
    where: { organizationId: orgId },
    include: { stockLevels: true, preferredVendor: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  const { initialStock, compositeItems, ...item } = data;

  if (!item.sku || !item.name) {
    return NextResponse.json({ error: 'SKU and name are required' }, { status: 400 });
  }
  const dup = await prisma.item.findFirst({ where: { organizationId: orgId, sku: item.sku } });
  if (dup) return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });

  const created = await prisma.item.create({
    data: { ...item, organizationId: orgId },
  });

  // Initial stock
  if (initialStock && typeof initialStock === 'object') {
    for (const [warehouseId, qty] of Object.entries(initialStock)) {
      const q = Number(qty);
      if (q > 0) {
        await prisma.stockLevel.upsert({
          where: { itemId_warehouseId: { itemId: created.id, warehouseId } },
          update: { quantity: { increment: q }, available: { increment: q } },
          create: { itemId: created.id, warehouseId, quantity: q, available: q },
        });
      }
    }
  }

  // Composite items
  if (item.isComposite && Array.isArray(compositeItems)) {
    for (const c of compositeItems) {
      if (c.childItemId) {
        await prisma.compositeItem.create({
          data: { parentId: created.id, childId: c.childItemId, quantity: c.quantity || 1 },
        });
      }
    }
  }

  return NextResponse.json(created);
}
