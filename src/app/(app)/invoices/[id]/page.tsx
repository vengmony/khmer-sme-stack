import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft, Edit, Printer, Mail, CreditCard } from 'lucide-react';
import RecordPaymentButton from '@/components/RecordPaymentButton';

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const inv = await prisma.invoice.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { date: 'desc' } },
      salesOrder: true,
    },
  });
  if (!inv) nf();

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href="/invoices" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Mail className="w-4 h-4" /> Email</button>
          <button className="btn-secondary text-xs"><Printer className="w-4 h-4" /> Print</button>
          <Link href={`/invoices/${inv.id}/edit`} className="btn-secondary text-xs"><Edit className="w-4 h-4" /> Edit</Link>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Invoice</p>
            <h1 className="text-3xl font-bold mt-1">{inv.invoiceNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">Dated {formatDate(inv.date, true)} · Due {formatDate(inv.dueDate) || '—'}</p>
            {inv.reference && <p className="text-xs text-ink-500 mt-1">Reference: {inv.reference}</p>}
            {inv.salesOrder && (
              <p className="text-xs text-ink-500 mt-1">From <Link href={`/sales-orders/${inv.salesOrder.id}`} className="text-brand-600 hover:underline">Sales Order {inv.salesOrder.orderNumber}</Link></p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className={`badge ${statusColor(inv.status)}`}>{titleCase(inv.status)}</span>
              <span className={`badge ${statusColor(inv.paymentStatus)}`}>{titleCase(inv.paymentStatus)}</span>
            </div>
            {inv.balance > 0 && (
              <RecordPaymentButton
                invoiceId={inv.id}
                customerId={inv.customerId}
                balance={inv.balance}
                currencyCode={inv.currencyCode}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-2">Bill To</h2>
          <Link href={`/contacts/${inv.customer.id}`} className="text-brand-600 font-medium hover:underline">
            {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
          </Link>
          {inv.customer.companyName && <p className="text-sm text-ink-600">{inv.customer.firstName} {inv.customer.lastName}</p>}
          {inv.customer.email && <p className="text-sm text-ink-600 mt-1">{inv.customer.email}</p>}
          {inv.customer.billingAddressLine1 && (
            <div className="text-sm text-ink-600 mt-2">
              <p>{inv.customer.billingAddressLine1}</p>
              {inv.customer.billingAddressLine2 && <p>{inv.customer.billingAddressLine2}</p>}
              <p>{[inv.customer.billingCity, inv.customer.billingState, inv.customer.billingZip].filter(Boolean).join(', ')}</p>
              <p>{inv.customer.billingCountry}</p>
            </div>
          )}
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Invoice Details</h2>
          <Row label="Payment Terms" value={inv.paymentTerms || '—'} />
          <Row label="Currency" value={inv.currencyCode} />
          <Row label="Amount Paid" value={formatCurrency(inv.amountPaid, inv.currencyCode)} />
          <Row label="Balance" value={formatCurrency(inv.balance, inv.currencyCode)} className={inv.balance > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 font-semibold">Items</div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5">Item</th>
              <th className="text-right px-4 py-2.5">Qty</th>
              <th className="text-right px-4 py-2.5">Price</th>
              <th className="text-right px-4 py-2.5">Tax</th>
              <th className="text-right px-4 py-2.5">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {inv.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5"><p className="font-medium">{it.name}</p><p className="text-xs text-ink-500 font-mono">{it.sku}</p></td>
                <td className="px-4 py-2.5 text-right">{formatNumber(it.quantity, 2)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(it.unitPrice, inv.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right">{it.taxRate}% · {formatCurrency(it.taxAmount, inv.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(it.total, inv.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Notes</h2>
          <p className="text-sm text-ink-600 whitespace-pre-line">{inv.notes || 'No notes'}</p>
          <h2 className="font-semibold pt-3">Terms & Conditions</h2>
          <p className="text-sm text-ink-600 whitespace-pre-line">{inv.termsConditions || '—'}</p>
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Summary</h2>
          <Row label="Subtotal" value={formatCurrency(inv.subtotal, inv.currencyCode)} />
          {inv.discount > 0 && <Row label="Discount" value={`- ${formatCurrency(inv.discount, inv.currencyCode)}`} />}
          <Row label="Tax" value={formatCurrency(inv.taxAmount, inv.currencyCode)} />
          {inv.shippingCharges > 0 && <Row label="Shipping" value={formatCurrency(inv.shippingCharges, inv.currencyCode)} />}
          {inv.adjustment !== 0 && <Row label="Adjustment" value={formatCurrency(inv.adjustment, inv.currencyCode)} />}
          <div className="flex justify-between border-t border-ink-200 pt-2 mt-2"><span className="font-semibold text-base">Total</span><span className="text-lg font-bold">{formatCurrency(inv.total, inv.currencyCode)}</span></div>
          <div className="flex justify-between"><span className="text-emerald-600">Amount Paid</span><span className="font-medium text-emerald-600">-{formatCurrency(inv.amountPaid, inv.currencyCode)}</span></div>
          <div className="flex justify-between border-t border-ink-200 pt-2"><span className="font-semibold text-base">Balance Due</span><span className="text-lg font-bold">{formatCurrency(inv.balance, inv.currencyCode)}</span></div>
        </div>
      </div>

      {inv.payments.length > 0 && (
        <div className="card">
          <div className="px-5 py-3 border-b border-ink-200 font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payments Received</div>
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2">Payment #</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Mode</th>
                <th className="text-right px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {inv.payments.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-medium">{p.paymentNumber}</td>
                  <td className="px-4 py-2 text-ink-600">{formatDate(p.date)}</td>
                  <td className="px-4 py-2 text-ink-600 capitalize">{p.paymentMode.replace('_', ' ')}</td>
                  <td className="px-4 py-2 text-right font-medium text-emerald-600">{formatCurrency(p.amount, p.currencyCode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className={`font-medium ${className || ''}`}>{value}</dd></div>;
}
