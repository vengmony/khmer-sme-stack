import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDate, formatNumber, titleCase, cn, statusColor } from '@/lib/utils';
import { ChevronLeft, Edit, Printer, CheckCircle, XCircle, FileText, Boxes, Package } from 'lucide-react';
import SalesOrderActions from '@/components/SalesOrderActions';

export const dynamic = 'force-dynamic';

export default async function SalesOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const so = await prisma.salesOrder.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: {
      customer: true,
      warehouse: true,
      items: true,
      invoices: true,
      packages: true,
    },
  });
  if (!so) nf();

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href="/sales-orders" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Sales Orders
        </Link>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Printer className="w-4 h-4" /> Print</button>
          <Link href={`/sales-orders/${so.id}/edit`} className="btn-secondary text-xs"><Edit className="w-4 h-4" /> Edit</Link>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Sales Order</p>
            <h1 className="text-3xl font-bold mt-1">{so.orderNumber}</h1>
            <p className="text-sm text-ink-500 mt-1">Dated {formatDate(so.date, true)}</p>
            {so.reference && <p className="text-xs text-ink-500 mt-1">Reference: {so.reference}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className={`badge ${statusColor(so.status)}`}>{titleCase(so.status)}</span>
              <span className={`badge ${statusColor(so.paymentStatus)}`}>{titleCase(so.paymentStatus)}</span>
            </div>
            <SalesOrderActions id={so.id} currentStatus={so.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-2">Customer</h2>
          <Link href={`/contacts/${so.customer.id}`} className="text-brand-600 font-medium hover:underline">
            {so.customer.companyName || `${so.customer.firstName} ${so.customer.lastName}`}
          </Link>
          {so.customer.companyName && (
            <p className="text-sm text-ink-600">{so.customer.firstName} {so.customer.lastName}</p>
          )}
          {so.customer.email && <p className="text-sm text-ink-600 mt-1">{so.customer.email}</p>}
          {so.customer.phone && <p className="text-sm text-ink-600">{so.customer.phone}</p>}
          {so.customer.billingAddressLine1 && (
            <div className="text-sm text-ink-600 mt-2">
              <p>{so.customer.billingAddressLine1}</p>
              {so.customer.billingAddressLine2 && <p>{so.customer.billingAddressLine2}</p>}
              <p>{[so.customer.billingCity, so.customer.billingState, so.customer.billingZip].filter(Boolean).join(', ')}</p>
              <p>{so.customer.billingCountry}</p>
            </div>
          )}
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Order Details</h2>
          <Row label="Warehouse" value={so.warehouse?.name || '—'} />
          <Row label="Payment Terms" value={so.paymentTerms || '—'} />
          <Row label="Currency" value={so.currencyCode} />
          <Row label="Expected Shipment" value={so.expectedShipmentDate ? formatDate(so.expectedShipmentDate) : '—'} />
          <Row label="Amount Paid" value={formatCurrency(so.amountPaid || 0, so.currencyCode)} />
          <Row label="Balance" value={formatCurrency((so.total || 0) - (so.amountPaid || 0), so.currencyCode)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 font-semibold flex items-center gap-2">
          <Package className="w-4 h-4" /> Items
        </div>
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
            {so.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2.5">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-ink-500 font-mono">{it.sku}</p>
                </td>
                <td className="px-4 py-2.5 text-right">{formatNumber(it.quantity, 2)}</td>
                <td className="px-4 py-2.5 text-right">{formatCurrency(it.unitPrice, so.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right">{it.taxRate}% · {formatCurrency(it.taxAmount, so.currencyCode)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(it.total, so.currencyCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Notes</h2>
          <p className="text-sm text-ink-600 whitespace-pre-line">{so.notes || 'No notes'}</p>
          <h2 className="font-semibold pt-3">Terms & Conditions</h2>
          <p className="text-sm text-ink-600 whitespace-pre-line">{so.termsConditions || '—'}</p>
        </div>
        <div className="card p-5 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Summary</h2>
          <Row label="Subtotal" value={formatCurrency(so.subtotal, so.currencyCode)} />
          {so.discount > 0 && <Row label="Discount" value={`- ${formatCurrency(so.discount, so.currencyCode)}`} />}
          <Row label="Tax" value={formatCurrency(so.taxAmount, so.currencyCode)} />
          {so.shippingCharges > 0 && <Row label="Shipping" value={formatCurrency(so.shippingCharges, so.currencyCode)} />}
          {so.adjustment !== 0 && <Row label="Adjustment" value={formatCurrency(so.adjustment, so.currencyCode)} />}
          <div className="flex justify-between border-t border-ink-200 pt-2 mt-2">
            <span className="font-semibold text-base">Total</span>
            <span className="text-lg font-bold">{formatCurrency(so.total, so.currencyCode)}</span>
          </div>
        </div>
      </div>

      {(so.invoices.length > 0 || so.packages.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {so.invoices.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Invoices</h2>
              <ul className="space-y-1">
                {so.invoices.map(inv => (
                  <li key={inv.id}>
                    <Link href={`/invoices/${inv.id}`} className="text-brand-600 hover:underline text-sm">
                      {inv.invoiceNumber} — {formatCurrency(inv.total, inv.currencyCode)}
                    </Link>
                    <span className="text-xs text-ink-500 ml-2">· {titleCase(inv.status)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {so.packages.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><Boxes className="w-4 h-4" /> Packages</h2>
              <ul className="space-y-1">
                {so.packages.map(p => (
                  <li key={p.id}>
                    <Link href={`/packages/${p.id}`} className="text-brand-600 hover:underline text-sm">
                      {p.packageNumber}
                    </Link>
                    <span className="text-xs text-ink-500 ml-2">· {titleCase(p.status)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
