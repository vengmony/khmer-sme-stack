import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber, titleCase, statusColor } from '@/lib/utils';
import { ChevronLeft, Edit, Printer } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: { vendor: true, warehouse: true, items: true, bills: true },
  });
  if (!po) nf();
  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href="/purchase-orders" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</Link>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Printer className="w-4 h-4" /> Print</button>
          <Link href={`/purchase-orders/${po.id}/edit`} className="btn-secondary text-xs"><Edit className="w-4 h-4" /> Edit</Link>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Purchase Order</p>
            <h1 className="text-3xl font-bold mt-1">{po.orderNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">Dated {formatDate(po.date, true)} · Expected: {formatDate(po.expectedDelivery) || '—'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className={`badge ${statusColor(po.status)}`}>{titleCase(po.status)}</span>
              <span className={`badge ${statusColor(po.paymentStatus)}`}>{titleCase(po.paymentStatus)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-2">Vendor</h2>
          <Link href={`/contacts/${po.vendor.id}`} className="text-brand-600 font-medium hover:underline">{po.vendor.companyName || `${po.vendor.firstName} ${po.vendor.lastName}`}</Link>
          {po.vendor.email && <p className="text-sm text-ink-600 mt-1">{po.vendor.email}</p>}
          {po.vendor.phone && <p className="text-sm text-ink-600">{po.vendor.phone}</p>}
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Details</h2>
          <Row label="Warehouse" value={po.warehouse?.name || '—'} />
          <Row label="Payment Terms" value={po.paymentTerms || '—'} />
          <Row label="Currency" value={po.currencyCode} />
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
            {po.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5"><p className="font-medium">{it.name}</p><p className="text-xs text-ink-500 font-mono">{it.sku}</p></td>
                <td className="px-4 py-2.5 text-right">{formatNumber(it.quantity, 2)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(it.unitPrice, po.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(it.total, po.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Notes</h2>
          <p className="text-sm text-ink-600 whitespace-pre-line">{po.notes || 'No notes'}</p>
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Summary</h2>
          <Row label="Subtotal" value={formatCurrency(po.subtotal, po.currencyCode)} />
          {po.discount > 0 && <Row label="Discount" value={`- ${formatCurrency(po.discount, po.currencyCode)}`} />}
          {po.taxAmount > 0 && <Row label="Tax" value={formatCurrency(po.taxAmount, po.currencyCode)} />}
          {po.shippingCharges > 0 && <Row label="Shipping" value={formatCurrency(po.shippingCharges, po.currencyCode)} />}
          <div className="flex justify-between border-t border-ink-200 pt-2 mt-2"><span className="font-semibold text-base">Total</span><span className="text-lg font-bold">{formatCurrency(po.total, po.currencyCode)}</span></div>
        </div>
      </div>

      {po.bills.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Bills</h2>
          <ul className="space-y-1">
            {po.bills.map(b => (
              <li key={b.id}><Link href={`/bills/${b.id}`} className="text-brand-600 hover:underline text-sm">{b.billNumber} — {formatCurrency(b.total, b.currencyCode)}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
