import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ItemForm from '@/components/forms/ItemForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewItemPage() {
  const session = await requireSession();
  const [warehouses, vendors, taxes] = await Promise.all([
    prisma.warehouse.findMany({ where: { organizationId: session.organizationId } }),
    prisma.contact.findMany({ where: { organizationId: session.organizationId, type: { in: ['vendor', 'both'] } } }),
    prisma.tax.findMany({ where: { organizationId: session.organizationId } }),
  ]);

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <Link href="/items" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Items
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Item</h1>
      </div>
      <ItemForm
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name, isDefault: w.isDefault }))}
        vendors={vendors.map((v) => ({ id: v.id, name: v.companyName || `${v.firstName} ${v.lastName}` }))}
        taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: t.rate }))}
      />
    </div>
  );
}
