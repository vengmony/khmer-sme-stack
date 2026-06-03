import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const inv = await prisma.invoice.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: { items: true },
  });
  if (!inv) nf();
  const [customers, items, org] = await Promise.all([
    prisma.contact.findMany({ where: { organizationId: orgId, type: { in: ['customer', 'both'] } } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true } }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);
  return (
    <div className="space-y-4">
      <Link href={`/invoices/${inv.id}`} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to Invoice
      </Link>
      <h1 className="text-2xl font-bold">Edit Invoice {inv.invoiceNumber}</h1>
      <InvoiceForm
        mode="edit"
        customers={customers.map((c) => ({ id: c.id, name: c.companyName || `${c.firstName} ${c.lastName}`, currencyCode: c.currencyCode || 'USD' }))}
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unitPrice: i.unitPrice, unit: i.unit }))}
        defaultCurrency={org?.currencyCode || 'USD'}
        nextNumber={inv.invoiceNumber}
        initial={{
          ...inv,
          date: inv.date.toISOString().slice(0, 10),
          dueDate: inv.dueDate?.toISOString().slice(0, 10) || '',
          items: inv.items,
        }}
      />
    </div>
  );
}
