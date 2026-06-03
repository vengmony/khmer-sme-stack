import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatNumber, formatDate, titleCase, cn } from '@/lib/utils';
import { ChevronLeft, Edit, Archive, Package, Boxes, BarChart3, Activity } from 'lucide-react';
import { notFound as nf } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const item = await prisma.item.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: {
      stockLevels: { include: { warehouse: true } },
      compositeItems: { include: { child: true } },
    },
  });
  if (!item) nf();

  const totalStock = item.stockLevels.reduce((s, sl) => s + sl.available, 0);
  const totalCommitted = item.stockLevels.reduce((s, sl) => s + sl.committed, 0);
  const totalValue = totalStock * (item.costPrice || 0);

  return (
    <div className="space-y-4 max-w-6xl">
      <div>
        <Link href="/items" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Items
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-ink-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-ink-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{item.name}</h1>
                {item.isComposite && <span className="badge bg-violet-100 text-violet-700">Bundle</span>}
                <span className={cn('badge', item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-ink-500 font-mono">SKU: {item.sku}</p>
              {item.description && <p className="text-sm text-ink-600 mt-2 max-w-2xl">{item.description}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-ink-500">
                {item.category && <span>Category: <span className="text-ink-700 font-medium">{item.category}</span></span>}
                {item.brand && <span>Brand: <span className="text-ink-700 font-medium">{item.brand}</span></span>}
                <span>Created: {formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/items/${item.id}/edit`} className="btn-secondary"><Edit className="w-4 h-4" /> Edit</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Selling Price" value={formatCurrency(item.unitPrice)} />
        <Kpi label="Cost Price" value={formatCurrency(item.costPrice || 0)} />
        <Kpi label="Stock on Hand" value={`${formatNumber(totalStock, 0)} ${item.unit}`} accent={totalStock <= item.reorderPoint && item.reorderPoint > 0 ? 'text-amber-600' : ''} />
        <Kpi label="Inventory Value" value={formatCurrency(totalValue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Boxes className="w-4 h-4" /> Stock by Warehouse</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 border-b border-ink-200">
              <tr>
                <th className="text-left py-2">Warehouse</th>
                <th className="text-right py-2">On Hand</th>
                <th className="text-right py-2">Committed</th>
                <th className="text-right py-2">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {item.stockLevels.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-ink-500">No stock records</td></tr>}
              {item.stockLevels.map((sl) => (
                <tr key={sl.id}>
                  <td className="py-2">{sl.warehouse.name}</td>
                  <td className="text-right py-2">{formatNumber(sl.quantity, 0)}</td>
                  <td className="text-right py-2 text-amber-600">{formatNumber(sl.committed, 0)}</td>
                  <td className="text-right py-2 font-medium">{formatNumber(sl.available, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Stock Information</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Reorder Point" value={`${formatNumber(item.reorderPoint, 0)} ${item.unit}`} />
            <Row label="Committed" value={`${formatNumber(totalCommitted, 0)} ${item.unit}`} />
            <Row label="Track Inventory" value={item.trackInventory ? 'Yes' : 'No'} />
            <Row label="Track Serial" value={item.trackSerial ? 'Yes' : 'No'} />
            <Row label="Track Batch" value={item.trackBatch ? 'Yes' : 'No'} />
            <Row label="Weight" value={item.weight ? `${item.weight} kg` : '—'} />
            <Row label="Dimensions" value={item.dimensionL && item.dimensionW && item.dimensionH ? `${item.dimensionL}×${item.dimensionW}×${item.dimensionH} cm` : '—'} />
          </dl>
        </div>
      </div>

      {item.isComposite && item.compositeItems.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Composite Components</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 border-b border-ink-200">
              <tr>
                <th className="text-left py-2">Component</th>
                <th className="text-left py-2">SKU</th>
                <th className="text-right py-2">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {item.compositeItems.map((c) => (
                <tr key={c.id}>
                  <td className="py-2"><Link href={`/items/${c.childId}`} className="text-brand-600 hover:underline">{c.child.name}</Link></td>
                  <td className="py-2 font-mono text-xs">{c.child.sku}</td>
                  <td className="text-right py-2">{formatNumber(c.quantity, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-ink-500">{label}</p>
      <p className={cn('text-xl font-bold mt-1', accent)}>{value}</p>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
