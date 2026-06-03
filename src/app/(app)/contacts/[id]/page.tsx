import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, titleCase, cn } from '@/lib/utils';
import { ChevronLeft, Edit, Mail, Phone, Building, FileText, ShoppingCart, Receipt, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const contact = await prisma.contact.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: {
      salesOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
      purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
      invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      bills: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!contact) nf();

  const fullName = contact.companyName || `${contact.firstName} ${contact.lastName}`;

  return (
    <div className="space-y-4 max-w-6xl">
      <Link href="/contacts" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to Contacts
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xl font-bold">
              {fullName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <span className={cn('badge', contact.type === 'customer' ? 'bg-blue-100 text-blue-700' : contact.type === 'vendor' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700')}>
                  {contact.type}
                </span>
              </div>
              {contact.companyName && (
                <p className="text-sm text-ink-600">{contact.salutation} {contact.firstName} {contact.lastName}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-ink-600">
                {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>}
                {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>}
              </div>
            </div>
          </div>
          <Link href={`/contacts/${contact.id}/edit`} className="btn-secondary"><Edit className="w-4 h-4" /> Edit</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Billing Address</h2>
          {contact.billingAddressLine1 ? (
            <div className="text-sm text-ink-700 space-y-0.5">
              <p>{contact.billingAddressLine1}</p>
              {contact.billingAddressLine2 && <p>{contact.billingAddressLine2}</p>}
              <p>{[contact.billingCity, contact.billingState, contact.billingZip].filter(Boolean).join(', ')}</p>
              <p>{contact.billingCountry}</p>
            </div>
          ) : <p className="text-sm text-ink-500">No billing address</p>}
          <div className="mt-4 pt-4 border-t border-ink-200 space-y-2 text-sm">
            <Row label="Currency" value={contact.currencyCode || '—'} />
            <Row label="Payment Terms" value={contact.paymentTerms || '—'} />
            <Row label="Tax ID" value={contact.taxId || '—'} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-3">Financial Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-md bg-emerald-50 border border-emerald-200">
              <div>
                <p className="text-xs text-emerald-700">Outstanding Receivable</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(contact.outstandingReceivable, contact.currencyCode || 'USD')}</p>
              </div>
              <Receipt className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-rose-50 border border-rose-200">
              <div>
                <p className="text-xs text-rose-700">Outstanding Payable</p>
                <p className="text-xl font-bold text-rose-700">{formatCurrency(contact.outstandingPayable, contact.currencyCode || 'USD')}</p>
              </div>
              <CreditCard className="w-8 h-8 text-rose-300" />
            </div>
          </div>
        </div>
      </div>

      {(contact.type === 'customer' || contact.type === 'both') && (
        <div className="card">
          <div className="px-5 py-3 border-b border-ink-200 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Sales Orders</h2>
            <Link href={`/sales-orders/new?customerId=${contact.id}`} className="text-xs text-brand-600 font-medium">+ New</Link>
          </div>
          {contact.salesOrders.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500 text-center">No sales orders yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Order #</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-right px-4 py-2">Total</th>
                  <th className="text-center px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {contact.salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-ink-50">
                    <td className="px-4 py-2"><Link href={`/sales-orders/${so.id}`} className="text-brand-600 hover:underline">{so.orderNumber}</Link></td>
                    <td className="px-4 py-2 text-ink-600">{formatDate(so.date)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(so.total, so.currencyCode)}</td>
                    <td className="px-4 py-2 text-center"><span className="badge">{titleCase(so.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {(contact.type === 'vendor' || contact.type === 'both') && (
        <div className="card">
          <div className="px-5 py-3 border-b border-ink-200 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Purchase Orders</h2>
            <Link href={`/purchase-orders/new?vendorId=${contact.id}`} className="text-xs text-brand-600 font-medium">+ New</Link>
          </div>
          {contact.purchaseOrders.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-500 text-center">No purchase orders yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">PO #</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-right px-4 py-2">Total</th>
                  <th className="text-center px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {contact.purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-ink-50">
                    <td className="px-4 py-2"><Link href={`/purchase-orders/${po.id}`} className="text-brand-600 hover:underline">{po.orderNumber}</Link></td>
                    <td className="px-4 py-2 text-ink-600">{formatDate(po.date)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(po.total, po.currencyCode)}</td>
                    <td className="px-4 py-2 text-center"><span className="badge">{titleCase(po.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
