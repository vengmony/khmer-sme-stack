import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import SettingsClient from '@/components/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await requireSession();
  const orgId = session.organizationId;
  const [org, taxes, priceLists, warehouses] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.tax.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } }),
    prisma.priceList.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.warehouse.findMany({ where: { organizationId: orgId } }),
  ]);
  if (!org) return null;

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-ink-500">Organization, preferences, and configurations.</p>
      </div>
      <SettingsClient
        org={{
          id: org.id, name: org.name, email: org.email, phone: org.phone, website: org.website,
          currencyCode: org.currencyCode, currencySymbol: org.currencySymbol,
          fiscalYearStart: org.fiscalYearStart,
          addressLine1: org.addressLine1, addressLine2: org.addressLine2,
          city: org.city, state: org.state, zip: org.zip, country: org.country,
          enableSerialTracking: org.enableSerialTracking,
          enableBatchTracking: org.enableBatchTracking,
          enableMultiCurrency: org.enableMultiCurrency,
          enableBarcode: org.enableBarcode,
        }}
        taxes={taxes.map(t => ({ id: t.id, name: t.name, rate: t.rate }))}
        priceLists={priceLists.map(p => ({ id: p.id, name: p.name, currencyCode: p.currencyCode, isDefault: p.isDefault, itemCount: p._count.items }))}
        warehouses={warehouses.map(w => ({ id: w.id, name: w.name }))}
      />
    </div>
  );
}
