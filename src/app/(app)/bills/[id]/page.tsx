import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft, Edit, Printer, CreditCard } from 'lucide-react';
import RecordVendorPaymentButton from '@/components/RecordVendorPaymentButton';

export const dynamic = 'force-dynamic';

export default async function BillDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const bill = await prisma.bill.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { vendor: true, items: true, purchaseOrder: true, payments: { orderBy: { date: 'desc' } } },
  });
  if (!bill) nf();

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href="/bills" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</Link>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Printer className="w-4 h-4" /> Print</button>
          <Link href={`/bills/${bill.id}/edit`} className="btn-secondary text-xs"><Edit className="w-4 h-4" /> Edit</Link>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Bill</p>
            <h1 className="text-3xl font-bold mt-1">{bill.billNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">Dated {formatDate(bill.date)} · Due {formatDate(bill.dueDate) || '—'}</p>
            {bill.purchaseOrder && <p className="text-xs text-ink-500 mt-1">From <Link href={`/purchase-orders/${bill.purchaseOrder.id}`} className="text-brand-600 hover:underline">PO {bill.purchaseOrder.orderNumber}</Link></p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className={`badge ${statusColor(bill.status)}`}>{titleCase(bill.status)}</span>
              <span className={`badge ${statusColor(bill.paymentStatus)}`}>{titleCase(bill.paymentStatus)}</span>
            </div>
            {bill.balance > 0 && (
              <RecordVendorPaymentButton
                billId={bill.id}
                vendorId={bill.vendorId}
                balance={bill.balance}
                currencyCode={bill.currencyCode}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-2">Vendor</h2>
          <Link href={`/contacts/${bill.vendor.id}`} className="text-brand-600 font-medium hover:underline">{bill.vendor.companyName || `${bill.vendor.firstName} ${bill.vendor.lastName}`}</Link>
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Bill Details</h2>
          <Row label="Payment Terms" value={bill.paymentTerms || '—'} />
          <Row label="Currency" value={bill.currencyCode} />
          <Row label="Amount Paid" value={formatCurrency(bill.amountPaid, bill.currencyCode)} />
          <Row label="Balance" value={formatCurrency(bill.balance, bill.currencyCode)} />
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
              <th className="text-right px-4 py-2.5">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {bill.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5"><p className="font-medium">{it.name}</p><p className="text-xs text-ink-500 font-mono">{it.sku}</p></td>
                <td className="px-4 py-2.5 text-right">{formatNumber(it.quantity, 2)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(it.unitPrice, bill.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(it.total, bill.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5 space-y-2 text-sm">
        <h2 className="font-semibold mb-2">Summary</h2>
        <Row label="Subtotal" value={formatCurrency(bill.subtotal, bill.currencyCode)} />
        {bill.discount > 0 && <Row label="Discount" value={`- ${formatCurrency(bill.discount, bill.currencyCode)}`} />}
        {bill.taxAmount > 0 && <Row label="Tax" value={formatCurrency(bill.taxAmount, bill.currencyCode)} />}
        <div className="flex justify-between border-t border-ink-200 pt-2 mt-2"><span className="font-semibold">Total</span><span className="text-lg font-bold">{formatCurrency(bill.total, bill.currencyCode)}</span></div>
        <div className="flex justify-between"><span className="text-emerald-600">Paid</span><span className="font-medium text-emerald-600">-{formatCurrency(bill.amountPaid, bill.currencyCode)}</span></div>
        <div className="flex justify-between border-t border-ink-200 pt-2"><span className="font-semibold">Balance</span><span className="text-lg font-bold">{formatCurrency(bill.balance, bill.currencyCode)}</span></div>
      </div>

      {bill.payments.length > 0 && (
        <div className="card">
          <div className="px-5 py-3 border-b border-ink-200 font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payments Made</div>
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
              <tr><th className="text-left px-4 py-2">Payment #</th><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Mode</th><th className="text-right px-4 py-2">Amount</th></tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {bill.payments.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-medium">{p.paymentNumber}</td>
                  <td className="px-4 py-2 text-ink-600">{formatDate(p.date)}</td>
                  <td className="px-4 py-2 text-ink-600 capitalize">{p.paymentMode.replace('_', ' ')}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(p.amount, p.currencyCode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
