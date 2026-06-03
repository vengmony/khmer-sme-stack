import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatNumber, titleCase } from '@/lib/utils';
import Link from 'next/link';
import {
  TrendingUp, ShoppingCart, Package, Receipt, Users, AlertTriangle,
  DollarSign, ArrowUpRight, Plus, FileText, Boxes
} from 'lucide-react';
import { RevenueChart, OrdersChart } from '@/components/charts/DashboardCharts';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await requireSession();
  const orgId = session.organizationId;

  const [
    itemCount, contactCount, salesOrderCount, invoiceCount,
    openInvoices, openBills, lowStock,
    recentSalesOrders, recentInvoices,
  ] = await Promise.all([
    prisma.item.count({ where: { organizationId: orgId } }),
    prisma.contact.count({ where: { organizationId: orgId } }),
    prisma.salesOrder.count({ where: { organizationId: orgId } }),
    prisma.invoice.count({ where: { organizationId: orgId } }),
    prisma.invoice.aggregate({
      where: { organizationId: orgId, paymentStatus: { in: ['unpaid', 'partially_paid', 'overdue'] } },
      _sum: { balance: true }, _count: true,
    }),
    prisma.bill.aggregate({
      where: { organizationId: orgId, paymentStatus: { in: ['unpaid', 'partially_paid', 'overdue'] } },
      _sum: { balance: true }, _count: true,
    }),
    prisma.stockLevel.findMany({
      where: { item: { organizationId: orgId, trackInventory: true } },
      include: { item: true, warehouse: true },
    }),
    prisma.salesOrder.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: true },
    }),
    prisma.invoice.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: true },
    }),
  ]);

  // Last 30 days sales revenue grouped by day
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentInvoicesForChart = await prisma.invoice.findMany({
    where: { organizationId: orgId, date: { gte: since } },
    select: { date: true, total: true, status: true },
  });
  const recentSalesForChart = await prisma.salesOrder.findMany({
    where: { organizationId: orgId, date: { gte: since } },
    select: { date: true, total: true, status: true },
  });

  // Build daily series
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }
  const revenueSeries = days.map((d) => ({
    date: d,
    revenue: recentInvoicesForChart
      .filter((i) => i.date.toISOString().slice(0, 10) === d)
      .reduce((s, i) => s + (i.total || 0), 0),
  }));
  const orderSeries = days.map((d) => ({
    date: d,
    sales: recentSalesForChart.filter((s) => s.date.toISOString().slice(0, 10) === d).length,
  }));

  const lowStockItems = lowStock
    .filter((s) => s.item.reorderPoint > 0 && s.available <= s.item.reorderPoint)
    .slice(0, 5);

  const totalReceivable = openInvoices._sum.balance || 0;
  const totalPayable = openBills._sum.balance || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-ink-500 mt-0.5">Here's what's happening in your business today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/sales-orders/new" className="btn-primary"><Plus className="w-4 h-4" /> Sales Order</Link>
          <Link href="/purchase-orders/new" className="btn-secondary"><Plus className="w-4 h-4" /> Purchase Order</Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Package}   label="Total Items"      value={formatNumber(itemCount)}                  accent="bg-blue-100 text-blue-700" />
        <Kpi icon={Users}     label="Contacts"         value={formatNumber(contactCount)}                accent="bg-violet-100 text-violet-700" />
        <Kpi icon={ShoppingCart} label="Sales Orders"  value={formatNumber(salesOrderCount)}             accent="bg-emerald-100 text-emerald-700" />
        <Kpi icon={Receipt}   label="Invoices"         value={formatNumber(invoiceCount)}                accent="bg-amber-100 text-amber-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-600">Outstanding Receivables</p>
            <DollarSign className="w-4 h-4 text-ink-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalReceivable)}</p>
          <p className="text-xs text-ink-500 mt-1">{openInvoices._count} unpaid invoice{openInvoices._count === 1 ? '' : 's'}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-600">Outstanding Payables</p>
            <DollarSign className="w-4 h-4 text-ink-400" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalPayable)}</p>
          <p className="text-xs text-ink-500 mt-1">{openBills._count} unpaid bill{openBills._count === 1 ? '' : 's'}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-600">Low Stock Items</p>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
          <p className="text-xs text-ink-500 mt-1">Items at or below reorder point</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Revenue (last 30 days)</h2>
              <p className="text-xs text-ink-500">Invoiced amounts by day</p>
            </div>
            <Link href="/reports" className="text-xs text-brand-600 font-medium flex items-center gap-1">
              View reports <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <RevenueChart data={revenueSeries} />
        </div>
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="font-semibold">Sales Orders</h2>
            <p className="text-xs text-ink-500">Last 30 days</p>
          </div>
          <OrdersChart data={orderSeries} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-ink-200">
            <h2 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Recent Sales Orders</h2>
            <Link href="/sales-orders" className="text-xs text-brand-600 font-medium">View all</Link>
          </div>
          {recentSalesOrders.length === 0 ? (
            <EmptyState cta="/sales-orders/new" label="Create your first sales order" />
          ) : (
            <ul className="divide-y divide-ink-200">
              {recentSalesOrders.map((so) => (
                <li key={so.id}>
                  <Link href={`/sales-orders/${so.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-ink-50">
                    <div>
                      <p className="text-sm font-medium">{so.orderNumber}</p>
                      <p className="text-xs text-ink-500">{so.customer.firstName} {so.customer.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(so.total, so.currencyCode)}</p>
                      <span className={`badge mt-0.5 ${titleCase(so.status) ? '' : ''}`}>{titleCase(so.status)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-ink-200">
            <h2 className="font-semibold flex items-center gap-2"><Receipt className="w-4 h-4" /> Recent Invoices</h2>
            <Link href="/invoices" className="text-xs text-brand-600 font-medium">View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <EmptyState cta="/invoices/new" label="Create your first invoice" />
          ) : (
            <ul className="divide-y divide-ink-200">
              {recentInvoices.map((inv) => (
                <li key={inv.id}>
                  <Link href={`/invoices/${inv.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-ink-50">
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-ink-500">{inv.customer.firstName} {inv.customer.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(inv.total, inv.currencyCode)}</p>
                      <span className="badge">{titleCase(inv.status)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Low stock */}
      {lowStockItems.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-ink-200">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
            </h2>
            <Link href="/inventory-adjustments" className="text-xs text-brand-600 font-medium">Adjust stock</Link>
          </div>
          <ul className="divide-y divide-ink-200">
            {lowStockItems.map((s) => (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Boxes className="w-5 h-5 text-ink-400" />
                  <div>
                    <p className="text-sm font-medium">{s.item.name}</p>
                    <p className="text-xs text-ink-500">SKU: {s.item.sku} · {s.warehouse.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">{formatNumber(s.available, 0)} {s.item.unit}</p>
                  <p className="text-xs text-ink-500">Reorder at {formatNumber(s.item.reorderPoint, 0)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-xs text-ink-500 font-medium">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function EmptyState({ cta, label }: { cta: string; label: string }) {
  return (
    <div className="p-8 text-center">
      <TrendingUp className="w-8 h-8 text-ink-300 mx-auto mb-2" />
      <p className="text-sm text-ink-500 mb-3">No data yet</p>
      <Link href={cta} className="btn-primary"><Plus className="w-4 h-4" /> {label}</Link>
    </div>
  );
}
