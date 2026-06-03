'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Package, Users, FileText, ShoppingCart, Receipt, CreditCard,
  Truck, Warehouse, ClipboardList, Sliders, BarChart3, Settings, Boxes, LogOut,
  Menu, X, Search, Plus, ChevronDown, ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string; icon: React.ElementType; section?: string };

const NAV: NavItem[] = [
  { href: '/dashboard',          label: 'Dashboard',          icon: LayoutDashboard, section: 'Overview' },
  { href: '/items',              label: 'Items',              icon: Package,         section: 'Inventory' },
  { href: '/inventory-adjustments', label: 'Inventory Adjustments', icon: Sliders,   section: 'Inventory' },
  { href: '/warehouses',         label: 'Warehouses',         icon: Warehouse,       section: 'Inventory' },
  { href: '/transfer-orders',    label: 'Transfer Orders',    icon: ArrowRightLeft,  section: 'Inventory' },
  { href: '/picklists',          label: 'Picklists',          icon: ClipboardList,   section: 'Inventory' },

  { href: '/contacts',           label: 'Contacts',           icon: Users,           section: 'Sales' },
  { href: '/sales-orders',       label: 'Sales Orders',       icon: FileText,        section: 'Sales' },
  { href: '/packages',           label: 'Packages',           icon: Boxes,           section: 'Sales' },
  { href: '/shipments',          label: 'Shipments',          icon: Truck,           section: 'Sales' },
  { href: '/invoices',           label: 'Invoices',           icon: Receipt,         section: 'Sales' },
  { href: '/payments',           label: 'Customer Payments',  icon: CreditCard,      section: 'Sales' },

  { href: '/purchase-orders',    label: 'Purchase Orders',    icon: ShoppingCart,    section: 'Purchases' },
  { href: '/bills',              label: 'Bills',              icon: Receipt,         section: 'Purchases' },
  { href: '/vendor-payments',    label: 'Vendor Payments',    icon: CreditCard,      section: 'Purchases' },

  { href: '/reports',            label: 'Reports',            icon: BarChart3,       section: 'Insights' },
  { href: '/settings',           label: 'Settings',           icon: Settings,        section: 'Insights' },
];

interface User { name: string; email: string; role: string; orgName: string; }

export default function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const sections = useMemo(() => {
    const m = new Map<string, NavItem[]>();
    NAV.forEach((n) => {
      const s = n.section || 'Other';
      if (!m.has(s)) m.set(s, []);
      m.get(s)!.push(n);
    });
    return Array.from(m.entries());
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-ink-50">
      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static z-40 w-64 h-screen bg-white border-r border-ink-200 flex flex-col transition-transform',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-ink-200">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-brand-600">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white">S</div>
            <span>Stockly</span>
          </Link>
          <button className="lg:hidden p-1" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map(([section, items]) => (
            <div key={section}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{section}</p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn('nav-link', active ? 'nav-link-active' : 'nav-link-inactive')}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-200">
          <div className="relative">
            <button
              onClick={() => setUserMenu((v) => !v)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-ink-100"
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-ink-500 truncate">{user.orgName}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-ink-400" />
            </button>
            {userMenu && (
              <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-ink-200 rounded-md shadow-lg py-1">
                <div className="px-3 py-2 border-b border-ink-100">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-ink-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-ink-200 flex items-center justify-between px-4 lg:px-6 gap-4">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                placeholder="Search items, orders, contacts..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-ink-50 border border-transparent rounded-md focus:bg-white focus:border-ink-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sales-orders/new" className="btn-primary text-xs">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Sales Order</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
