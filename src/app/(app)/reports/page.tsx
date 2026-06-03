import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatNumber, formatDate, titleCase, statusColor } from '@/lib/utils';
import { BarChart3, Package, ShoppingCart, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import ReportsCharts from '@/components/charts/ReportsCharts';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({ searchParams }: { searchParams: { report?: string } }) {
  const session = await requireSession();
  const orgId = session.organizationId;
  const report = searchParams.report || 'sales';

  // Common data
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [salesOrders, invoices, items, lowStock] = await Promise.all([
    prisma.salesOrder.findMany({ where: { organizationId: orgId, date: { gte: since } }, include: { customer: true, items: { include: { item: true } } } }),
    prisma.invoice.findMany({ where: { organizationId: orgId, date: { gte: since } }, include: { customer: true } }),
    prisma.item.findMany({ where: { organizationId: orgId, isActive: true }, include: { stockLevels: true } }),
    prisma.stockLevel.findMany({ where: { item: { organizationId: orgId, trackInventory: true, isActive: true } }, include: { item: true, warehouse: true } }),
  ]);

  // Sales by customer
  const salesByCustomer = new Map<string, { name: string; total: number; count: number }>();
  for (const so of salesOrders) {
    const key = so.customer.companyName || `${so.customer.firstName} ${so.customer.lastName}`;
    const existing = salesByCustomer.get(key) || { name: key, total: 0, count: 0 };
    existing.total += so.total || 0;
    existing.count += 1;
    salesByCustomer.set(key, existing);
  }
  const topCustomers = Array.from(salesByCustomer.values()).sort((a, b) => b.total - a.total).slice(0, 10);

  // Sales by item
  const salesByItem = new Map<string, { name: string; sku: string; qty: number; revenue: number }>();
  for (const so of salesOrders) {
    for (const line of so.items) {
      const key = line.itemId;
      const existing = salesByItem.get(key) || { name: line.name, sku: line.sku || '', qty: 0, revenue: 0 };
      existing.qty += line.quantity;
      existing.revenue += line.total;
      salesByItem.set(key, existing);
    }
  }
  const topItems = Array.from(salesByItem.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Sales by status
  const salesByStatus = new Map<string, number>();
  for (const so of salesOrders) {
    salesByStatus.set(so.status, (salesByStatus.get(so.status) || 0) + 1);
  }

  // Low stock items
  const lowStockItems = lowStock
    .filter(s => s.item.reorderPoint > 0 && s.available <= s.item.reorderPoint)
    .sort((a, b) => a.available - b.available);

  // Daily sales trend
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }
  const salesSeries = days.map(d => ({
    date: d,
    sales: salesOrders.filter(s => s.date.toISOString().slice(0, 10) === d).reduce((sum, s) => sum + (s.total || 0), 0),
  }));

  // Inventory valuation
  const inventoryValue = items.reduce((s, i) => {
    const totalStock = i.stockLevels.reduce((ss, sl) => ss + sl.quantity, 0);
    return s + totalStock * (i.costPrice || 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-ink-500">Insights into your business performance.</p>
      </div>

      {/* Report type tabs */}
      <div className="card p-1 inline-flex flex-wrap gap-1">
        {[
          { v: 'sales', l: 'Sales', icon: TrendingUp },
          { v: 'inventory', l: 'Inventory', icon: Package },
          { v: 'purchases', l: 'Purchases', icon: ShoppingCart },
          { v: 'customers', l: 'Customers', icon: Receipt },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <a
              key={t.v}
              href={`/reports?report=${t.v}`}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${report === t.v ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-ink-100'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.l}
            </a>
          );
        })}
      </div>

      {report === 'sales' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Sales Orders" value={formatNumber(salesOrders.length)} icon={ShoppingCart} />
            <Kpi label="Total Revenue" value={formatCurrency(salesOrders.reduce((s, o) => s + o.total, 0))} icon={TrendingUp} accent="text-emerald-600" />
            <Kpi label="Avg Order Value" value={formatCurrency(salesOrders.length ? salesOrders.reduce((s, o) => s + o.total, 0) / salesOrders.length : 0)} icon={BarChart3} />
            <Kpi label="Unique Customers" value={formatNumber(new Set(salesOrders.map(s => s.customerId)).size)} icon={Receipt} />
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Daily Sales (Last 30 days)</h2>
            <ReportsCharts salesSeries={salesSeries} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="font-semibold mb-3">Top Customers by Revenue</h2>
              <table className="w-full text-sm">
                <thead className="text-xs text-ink-500 border-b border-ink-200">
                  <tr><th className="text-left py-2">Customer</th><th className="text-right py-2">Orders</th><th className="text-right py-2">Revenue</th></tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {topCustomers.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-ink-500">No data</td></tr>}
                  {topCustomers.map((c, i) => (
                    <tr key={i}><td className="py-2">{c.name}</td><td className="text-right py-2">{c.count}</td><td className="text-right py-2 font-medium">{formatCurrency(c.total)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold mb-3">Top Selling Items</h2>
              <table className="w-full text-sm">
                <thead className="text-xs text-ink-500 border-b border-ink-200">
                  <tr><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Revenue</th></tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {topItems.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-ink-500">No data</td></tr>}
                  {topItems.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2"><p className="font-medium">{it.name}</p><p className="text-xs text-ink-500 font-mono">{it.sku}</p></td>
                      <td className="text-right py-2">{formatNumber(it.qty, 0)}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(it.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {report === 'inventory' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Active Items" value={formatNumber(items.length)} icon={Package} />
            <Kpi label="Inventory Value" value={formatCurrency(inventoryValue)} icon={TrendingUp} accent="text-emerald-600" />
            <Kpi label="Low Stock" value={formatNumber(lowStockItems.length)} icon={AlertTriangle} accent="text-amber-600" />
            <Kpi label="Total Units" value={formatNumber(items.reduce((s, i) => s + i.stockLevels.reduce((ss, sl) => ss + sl.quantity, 0), 0), 0)} icon={BarChart3} />
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Items</h2>
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-500 border-b border-ink-200">
                <tr><th className="text-left py-2">Item</th><th className="text-left py-2">Warehouse</th><th className="text-right py-2">On Hand</th><th className="text-right py-2">Reorder</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {lowStockItems.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-ink-500">All items are well-stocked</td></tr>}
                {lowStockItems.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2"><p className="font-medium">{s.item.name}</p><p className="text-xs text-ink-500 font-mono">{s.item.sku}</p></td>
                    <td className="py-2 text-ink-600">{s.warehouse.name}</td>
                    <td className="text-right py-2 font-medium text-amber-600">{formatNumber(s.available, 0)}</td>
                    <td className="text-right py-2 text-ink-500">{formatNumber(s.item.reorderPoint, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Top Inventory Value Items</h2>
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-500 border-b border-ink-200">
                <tr><th className="text-left py-2">Item</th><th className="text-right py-2">Stock</th><th className="text-right py-2">Cost</th><th className="text-right py-2">Value</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items
                  .map(i => ({ ...i, totalStock: i.stockLevels.reduce((s, sl) => s + sl.quantity, 0) }))
                  .filter(i => i.totalStock > 0)
                  .sort((a, b) => (b.totalStock * b.costPrice) - (a.totalStock * a.costPrice))
                  .slice(0, 10)
                  .map(i => (
                    <tr key={i.id}>
                      <td className="py-2"><p className="font-medium">{i.name}</p><p className="text-xs text-ink-500 font-mono">{i.sku}</p></td>
                      <td className="text-right py-2">{formatNumber(i.totalStock, 0)} {i.unit}</td>
                      <td className="text-right py-2">{formatCurrency(i.costPrice || 0)}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(i.totalStock * (i.costPrice || 0))}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {report === 'purchases' && (
        <PurchaseReports orgId={orgId} />
      )}

      {report === 'customers' && (
        <CustomerReports orgId={orgId} />
      )}
    </div>
  );
}

async function PurchaseReports({ orgId }: { orgId: string }) {
  const pos = await prisma.purchaseOrder.findMany({ where: { organizationId: orgId }, include: { vendor: true, items: true } });
  const total = pos.reduce((s, p) => s + p.total, 0);
  const byVendor = new Map<string, { name: string; total: number; count: number }>();
  for (const p of pos) {
    const key = p.vendor.companyName || `${p.vendor.firstName} ${p.vendor.lastName}`;
    const ex = byVendor.get(key) || { name: key, total: 0, count: 0 };
    ex.total += p.total;
    ex.count += 1;
    byVendor.set(key, ex);
  }
  const topVendors = Array.from(byVendor.values()).sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Purchase Orders" value={formatNumber(pos.length)} icon={ShoppingCart} />
        <Kpi label="Total Spend" value={formatCurrency(total)} icon={TrendingUp} />
        <Kpi label="Avg PO Value" value={formatCurrency(pos.length ? total / pos.length : 0)} icon={BarChart3} />
        <Kpi label="Unique Vendors" value={formatNumber(new Set(pos.map(p => p.vendorId)).size)} icon={Receipt} />
      </div>
      <div className="card p-5">
        <h2 className="font-semibold mb-3">Top Vendors by Spend</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-ink-500 border-b border-ink-200">
            <tr><th className="text-left py-2">Vendor</th><th className="text-right py-2">POs</th><th className="text-right py-2">Spend</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {topVendors.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-ink-500">No data</td></tr>}
            {topVendors.map((v, i) => (
              <tr key={i}><td className="py-2">{v.name}</td><td className="text-right py-2">{v.count}</td><td className="text-right py-2 font-medium">{formatCurrency(v.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function CustomerReports({ orgId }: { orgId: string }) {
  const customers = await prisma.contact.findMany({
    where: { organizationId: orgId, type: { in: ['customer', 'both'] } },
    include: { salesOrders: true, invoices: true },
  });

  return (
    <>
      <div className="card p-5">
        <h2 className="font-semibold mb-3">Customer Aging (by Outstanding Receivable)</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-ink-500 border-b border-ink-200">
            <tr>
              <th className="text-left py-2">Customer</th>
              <th className="text-right py-2">Sales Orders</th>
              <th className="text-right py-2">Invoiced</th>
              <th className="text-right py-2">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {customers.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-ink-500">No customers</td></tr>}
            {customers
              .sort((a, b) => b.outstandingReceivable - a.outstandingReceivable)
              .slice(0, 20)
              .map(c => {
                const invoiced = c.invoices.reduce((s, i) => s + i.total, 0);
                return (
                  <tr key={c.id}>
                    <td className="py-2"><p className="font-medium">{c.companyName || `${c.firstName} ${c.lastName}`}</p></td>
                    <td className="text-right py-2">{formatNumber(c.salesOrders.length)}</td>
                    <td className="text-right py-2">{formatCurrency(invoiced, c.currencyCode || 'USD')}</td>
                    <td className="text-right py-2 font-medium text-amber-600">{formatCurrency(c.outstandingReceivable, c.currencyCode || 'USD')}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Kpi({ label, value, icon: Icon, accent }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-ink-400" />
        <p className="text-xs text-ink-500 font-medium">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${accent || ''}`}>{value}</p>
    </div>
  );
}
