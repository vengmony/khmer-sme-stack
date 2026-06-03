import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatNumber, titleCase } from '@/lib/utils';
import { Plus, Users } from 'lucide-react';
import ContactsListClient from '@/components/lists/ContactsListClient';

export const dynamic = 'force-dynamic';

export default async function ContactsPage({ searchParams }: { searchParams: { q?: string; type?: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const q = (searchParams.q || '').toLowerCase().trim();
  const typeFilter = searchParams.type || 'all';

  const where: any = { organizationId: orgId };
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { companyName: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (typeFilter !== 'all') where.type = typeFilter;

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { salesOrders: true, purchaseOrders: true, invoices: true, bills: true } },
    },
  });

  const customerCount = contacts.filter(c => c.type === 'customer' || c.type === 'both').length;
  const vendorCount = contacts.filter(c => c.type === 'vendor' || c.type === 'both').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-ink-500">Customers, vendors, and both.</p>
        </div>
        <Link href="/contacts/new" className="btn-primary"><Plus className="w-4 h-4" /> New Contact</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-ink-500">Total Contacts</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(contacts.length)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Customers</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(customerCount)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Vendors</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(vendorCount)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">Total Receivable</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(contacts.reduce((s, c) => s + (c.outstandingReceivable || 0), 0))}</p>
        </div>
      </div>

      <ContactsListClient
        contacts={contacts.map((c) => ({
          id: c.id,
          type: c.type,
          name: c.companyName || `${c.firstName} ${c.lastName}`,
          firstName: c.firstName,
          lastName: c.lastName,
          companyName: c.companyName,
          email: c.email,
          phone: c.phone,
          paymentTerms: c.paymentTerms,
          currencyCode: c.currencyCode,
          outstandingReceivable: c.outstandingReceivable,
          outstandingPayable: c.outstandingPayable,
          orderCount: (c._count.salesOrders || 0) + (c._count.purchaseOrders || 0),
          invoiceCount: c._count.invoices + c._count.bills,
        }))}
        typeFilter={typeFilter}
        q={q}
      />
    </div>
  );
}
