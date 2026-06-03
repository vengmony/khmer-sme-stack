import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import ItemForm from '@/components/forms/ItemForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const item = await prisma.item.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { compositeItems: true, stockLevels: true },
  });
  if (!item) nf();

  const [warehouses, vendors, taxes, items] = await Promise.all([
    prisma.warehouse.findMany({ where: { organizationId: session.organizationId } }),
    prisma.contact.findMany({ where: { organizationId: session.organizationId, type: { in: ['vendor', 'both'] } } }),
    prisma.tax.findMany({ where: { organizationId: session.organizationId } }),
    prisma.item.findMany({ where: { organizationId: session.organizationId }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <Link href={`/items/${item.id}`} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Item
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Item</h1>
      </div>
      <ItemForm
        mode="edit"
        initial={{
          ...item,
          compositeItems: item.compositeItems,
        }}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name, isDefault: w.isDefault }))}
        vendors={vendors.map((v) => ({ id: v.id, name: v.companyName || `${v.firstName} ${v.lastName}` }))}
        taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: t.rate }))}
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unitPrice: i.unitPrice }))}
      />
    </div>
  );
}
