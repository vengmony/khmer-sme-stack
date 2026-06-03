import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TransactionForm from '@/components/forms/TransactionForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewBillPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const [vendors, items, org] = await Promise.all([
    prisma.contact.findMany({ where: { organizationId: orgId, type: { in: ['vendor', 'both'] } } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true } }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);

  const last = await prisma.bill.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.billNumber.replace(/\D/g, '')) : 5000;

  return (
    <div className="space-y-4">
      <Link href="/bills" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to Bills
      </Link>
      <h1 className="text-2xl font-bold">New Bill</h1>
      <TransactionForm
        mode="create"
        type="bill"
        apiPath="/api/bills"
        numberField="billNumber"
        nextNumber={`BILL-${String(lastNum + 1).padStart(4, '0')}`}
        contacts={vendors.map((c) => ({ id: c.id, name: c.companyName || `${c.firstName} ${c.lastName}`, currencyCode: c.currencyCode || 'USD' }))}
        contactLabel="Vendor"
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unitPrice: i.unitPrice, unit: i.unit, costPrice: i.costPrice }))}
        defaultCurrency={org?.currencyCode || 'USD'}
        priceField="costPrice"
      />
    </div>
  );
}
