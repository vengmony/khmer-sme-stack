import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewInvoicePage({ searchParams }: { searchParams: { customerId?: string; salesOrderId?: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const [customers, items, org] = await Promise.all([
    prisma.contact.findMany({ where: { organizationId: orgId, type: { in: ['customer', 'both'] } } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true } }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);

  const last = await prisma.invoice.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.invoiceNumber.replace(/\D/g, '')) : 2000;

  let prefill: any = undefined;
  if (searchParams.salesOrderId) {
    const so = await prisma.salesOrder.findFirst({ where: { id: searchParams.salesOrderId, organizationId: orgId }, include: { items: true } });
    if (so) {
      prefill = {
        customerId: so.customerId,
        currencyCode: so.currencyCode,
        paymentTerms: so.paymentTerms,
        notes: so.notes,
        termsConditions: so.termsConditions,
        items: so.items.map((it) => ({
          itemId: it.itemId, name: it.name, sku: it.sku, quantity: it.quantity, unitPrice: it.unitPrice, taxRate: it.taxRate,
        })),
      };
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/invoices" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to Invoices
      </Link>
      <h1 className="text-2xl font-bold">New Invoice</h1>
      <InvoiceForm
        mode="create"
        customers={customers.map((c) => ({ id: c.id, name: c.companyName || `${c.firstName} ${c.lastName}`, currencyCode: c.currencyCode || 'USD' }))}
        items={items.map((i) => ({ id: i.id, sku: i.sku, name: i.name, unitPrice: i.unitPrice, unit: i.unit }))}
        defaultCurrency={org?.currencyCode || 'USD'}
        nextNumber={`INV-${String(lastNum + 1).padStart(4, '0')}`}
        initial={prefill}
        initialCustomerId={searchParams.customerId}
      />
    </div>
  );
}
