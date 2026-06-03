import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  // Clean
  await prisma.priceListItem.deleteMany();
  await prisma.priceList.deleteMany();
  await prisma.tax.deleteMany();
  await prisma.transferOrderItem.deleteMany();
  await prisma.transferOrder.deleteMany();
  await prisma.inventoryAdjustmentItem.deleteMany();
  await prisma.inventoryAdjustment.deleteMany();
  await prisma.picklistItem.deleteMany();
  await prisma.picklist.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.packageItem.deleteMany();
  await prisma.package.deleteMany();
  await prisma.vendorPayment.deleteMany();
  await prisma.customerPayment.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseReceiveItem.deleteMany();
  await prisma.purchaseReceive.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.compositeItem.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.item.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Org
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Trading Co.',
      email: 'hello@acmetrading.com',
      phone: '+1-555-0100',
      website: 'https://acmetrading.com',
      currencyCode: 'USD',
      currencySymbol: '$',
      addressLine1: '500 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
      enableSerialTracking: true,
      enableBatchTracking: true,
      enableMultiCurrency: true,
      enableBarcode: true,
    },
  });

  // User
  const passwordHash = await bcrypt.hash('demo1234', 10);
  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'demo@stockly.app',
      passwordHash,
      name: 'Demo Admin',
      role: 'admin',
    },
  });

  // Warehouses
  const mainWh = await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      name: 'San Francisco HQ',
      code: 'SF-01',
      addressLine1: '500 Market Street',
      city: 'San Francisco', state: 'CA', zip: '94105', country: 'USA',
      isDefault: true,
    },
  });
  const wh2 = await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      name: 'New York Distribution',
      code: 'NY-01',
      addressLine1: '350 5th Avenue',
      city: 'New York', state: 'NY', zip: '10118', country: 'USA',
    },
  });
  const wh3 = await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      name: 'Austin Fulfillment',
      code: 'AUS-01',
      addressLine1: '300 W 2nd Street',
      city: 'Austin', state: 'TX', zip: '78701', country: 'USA',
    },
  });

  // Taxes
  await prisma.tax.createMany({
    data: [
      { organizationId: org.id, name: 'Sales Tax (8.5%)', rate: 8.5 },
      { organizationId: org.id, name: 'VAT (20%)', rate: 20 },
      { organizationId: org.id, name: 'GST (10%)', rate: 10 },
    ],
  });

  // Contacts
  const customers = await Promise.all([
    prisma.contact.create({ data: { organizationId: org.id, type: 'customer', firstName: 'Sarah', lastName: 'Johnson', companyName: 'Lakeside Boutique', email: 'sarah@lakesideboutique.com', phone: '+1-555-0210', paymentTerms: 'Net 30', currencyCode: 'USD' } }),
    prisma.contact.create({ data: { organizationId: org.id, type: 'customer', firstName: 'David', lastName: 'Chen', companyName: 'Northwind Trading', email: 'd.chen@northwind.com', phone: '+1-555-0211', paymentTerms: 'Net 15', currencyCode: 'USD' } }),
    prisma.contact.create({ data: { organizationId: org.id, type: 'customer', firstName: 'Emily', lastName: 'Rodriguez', companyName: 'Emerald Apothecary', email: 'emily@emeraldap.com', phone: '+1-555-0212', paymentTerms: 'Net 30', currencyCode: 'USD' } }),
    prisma.contact.create({ data: { organizationId: org.id, type: 'customer', firstName: 'Marcus', lastName: 'Williams', companyName: 'Brooklyn Hardware', email: 'marcus@brooklynhw.com', phone: '+1-555-0213', paymentTerms: 'Due on Receipt', currencyCode: 'USD' } }),
    prisma.contact.create({ data: { organizationId: org.id, type: 'customer', firstName: 'Priya', lastName: 'Patel', companyName: 'Spice Route Imports', email: 'priya@spiceroute.com', phone: '+1-555-0214', paymentTerms: 'Net 45', currencyCode: 'EUR' } }),
  ]);

  const vendors = await Promise.all([
    prisma.contact.create({ data: { organizationId: org.id, type: 'vendor', firstName: 'James', lastName: 'Murphy', companyName: 'Pacific Wholesale Supply', email: 'james@pacificws.com', phone: '+1-555-0300', paymentTerms: 'Net 30', currencyCode: 'USD' } }),
    prisma.contact.create({ data: { organizationId: org.id, type: 'vendor', firstName: 'Aiko', lastName: 'Tanaka', companyName: 'Kyoto Crafts Co.', email: 'aiko@kyotocrafts.jp', phone: '+81-555-0400', paymentTerms: 'Net 60', currencyCode: 'JPY' } }),
    prisma.contact.create({ data: { organizationId: org.id, type: 'vendor', firstName: 'Lars', lastName: 'Eriksson', companyName: 'Nordic Materials AB', email: 'lars@nordic-mat.se', phone: '+46-555-0500', paymentTerms: 'Net 30', currencyCode: 'EUR' } }),
  ]);

  // Items
  const itemsData = [
    { sku: 'TSHIRT-BLK-M', name: 'Classic Cotton T-Shirt — Black (M)', unitPrice: 19.99, costPrice: 7.50, reorderPoint: 25, category: 'Apparel' },
    { sku: 'TSHIRT-WHT-M', name: 'Classic Cotton T-Shirt — White (M)', unitPrice: 19.99, costPrice: 7.50, reorderPoint: 25, category: 'Apparel' },
    { sku: 'MUG-CER-12',   name: 'Ceramic Coffee Mug 12oz',           unitPrice: 12.50, costPrice: 4.00, reorderPoint: 40, category: 'Drinkware' },
    { sku: 'NOTE-A5-HD',  name: 'Hardcover Notebook A5',             unitPrice: 15.00, costPrice: 5.50, reorderPoint: 30, category: 'Stationery' },
    { sku: 'PEN-BLUE-50', name: 'Ballpoint Pen — Blue (Box of 50)',  unitPrice: 24.00, costPrice: 9.00, reorderPoint: 15, category: 'Stationery' },
    { sku: 'BAG-CNV-LG',  name: 'Canvas Tote Bag — Large',           unitPrice: 18.00, costPrice: 6.50, reorderPoint: 30, category: 'Bags' },
    { sku: 'BTL-WAT-750', name: 'Stainless Water Bottle 750ml',       unitPrice: 29.99, costPrice: 11.00, reorderPoint: 20, category: 'Drinkware' },
    { sku: 'USBC-C-2M',   name: 'USB-C Charging Cable 2m',            unitPrice: 14.99, costPrice: 3.50, reorderPoint: 50, category: 'Electronics' },
    { sku: 'SPCKR-BT',    name: 'Bluetooth Speaker Mini',            unitPrice: 49.99, costPrice: 22.00, reorderPoint: 12, category: 'Electronics' },
    { sku: 'LMP-LED-SM',  name: 'LED Desk Lamp (Small)',              unitPrice: 39.99, costPrice: 16.00, reorderPoint: 10, category: 'Home' },
    { sku: 'PLNT-POT-S',  name: 'Ceramic Planter Pot — Small',        unitPrice: 16.50, costPrice: 6.00, reorderPoint: 18, category: 'Home' },
    { sku: 'TEA-EAR-30',  name: 'Earl Grey Tea Bags (Box of 30)',     unitPrice:  8.99, costPrice: 2.80, reorderPoint: 25, category: 'Grocery' },
    { sku: 'CHOC-DARK-12',name: 'Dark Chocolate Bar 70% (12-pack)',   unitPrice: 22.00, costPrice: 8.00, reorderPoint: 20, category: 'Grocery' },
    { sku: 'COF-BN-1KG',  name: 'Single-Origin Coffee Beans 1kg',     unitPrice: 32.00, costPrice: 13.50,reorderPoint: 14, category: 'Grocery' },
    { sku: 'SOAP-HND-3',  name: 'Handmade Bar Soap (3-pack)',         unitPrice: 11.50, costPrice: 3.20, reorderPoint: 22, category: 'Personal Care' },
    { sku: 'CDN-VAN-8',   name: 'Vanilla Scented Candle 8oz',         unitPrice: 19.50, costPrice: 6.80, reorderPoint: 16, category: 'Home' },
    { sku: 'BOOK-NOTE-1', name: 'Moleskine-style Notebook',           unitPrice: 21.00, costPrice: 7.50, reorderPoint: 30, category: 'Stationery' },
    { sku: 'STK-NT-100',  name: 'Sticky Notes 3x3" (Pack of 100)',    unitPrice:  6.99, costPrice: 1.80, reorderPoint: 50, category: 'Stationery' },
    { sku: 'SD-CARD-128', name: 'SD Memory Card 128GB',              unitPrice: 24.99, costPrice: 10.00,reorderPoint: 20, category: 'Electronics' },
    { sku: 'HEADPH-W',    name: 'Wireless Headphones',               unitPrice: 79.00, costPrice: 32.00,reorderPoint:  8, category: 'Electronics' },
  ];

  const items: any[] = [];
  for (const i of itemsData) {
    const created = await prisma.item.create({
      data: { organizationId: org.id, ...i, unit: 'pcs' },
    });
    items.push(created);
  }

  // Stock levels
  const warehouses = [mainWh, wh2, wh3];
  for (const item of items) {
    for (const wh of warehouses) {
      const isDefault = wh.id === mainWh.id;
      const qty = isDefault ? 50 + Math.floor(Math.random() * 200) : Math.floor(Math.random() * 80);
      await prisma.stockLevel.create({
        data: {
          itemId: item.id, warehouseId: wh.id, quantity: qty, available: qty, committed: 0,
        },
      });
    }
  }

  // Price list
  const pl = await prisma.priceList.create({
    data: { organizationId: org.id, name: 'Wholesale', currencyCode: 'USD' },
  });
  for (const item of items) {
    await prisma.priceListItem.create({
      data: { priceListId: pl.id, itemId: item.id, unitPrice: Math.round(item.unitPrice * 0.7 * 100) / 100 },
    });
  }

  // Helper to create a sales order
  async function makeSalesOrder(idx: number, customerId: string, status: string, paymentStatus: string) {
    const num = `SO-${String(1000 + idx).padStart(4, '0')}`;
    const lineItems = items
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3))
      .map((it) => {
        const qty = 1 + Math.floor(Math.random() * 5);
        const lineTotal = qty * it.unitPrice;
        return {
          itemId: it.id,
          name: it.name,
          sku: it.sku,
          quantity: qty,
          unitPrice: it.unitPrice,
          discount: 0,
          taxRate: 8.5,
          taxAmount: Math.round(lineTotal * 0.085 * 100) / 100,
          total: lineTotal,
        };
      });
    const subtotal = lineItems.reduce((s, l) => s + l.total, 0);
    const tax = lineItems.reduce((s, l) => s + l.taxAmount, 0);
    const total = subtotal + tax;

    const so = await prisma.salesOrder.create({
      data: {
        organizationId: org.id,
        orderNumber: num,
        customerId,
        warehouseId: mainWh.id,
        status,
        paymentStatus,
        currencyCode: 'USD',
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        amountPaid: paymentStatus === 'paid' ? total : paymentStatus === 'partially_paid' ? total * 0.5 : 0,
        items: { create: lineItems },
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      },
    });
    return so;
  }

  // Create a few sales orders
  await makeSalesOrder(1, customers[0].id, 'invoiced', 'unpaid');
  await makeSalesOrder(2, customers[1].id, 'shipped', 'paid');
  await makeSalesOrder(3, customers[2].id, 'confirmed', 'unpaid');
  await makeSalesOrder(4, customers[3].id, 'shipped', 'partially_paid');
  await makeSalesOrder(5, customers[0].id, 'draft', 'unpaid');

  // Invoices
  for (let i = 0; i < 4; i++) {
    const customer = customers[i];
    const num = `INV-${String(2000 + i).padStart(4, '0')}`;
    const lineItems = items.slice(i * 2, i * 2 + 3).map((it) => {
      const qty = 2 + Math.floor(Math.random() * 4);
      const lineTotal = qty * it.unitPrice;
      return {
        itemId: it.id, name: it.name, sku: it.sku,
        quantity: qty, unitPrice: it.unitPrice, discount: 0, taxRate: 8.5,
        taxAmount: Math.round(lineTotal * 0.085 * 100) / 100, total: lineTotal,
      };
    });
    const subtotal = lineItems.reduce((s, l) => s + l.total, 0);
    const tax = lineItems.reduce((s, l) => s + l.taxAmount, 0);
    const total = subtotal + tax;
    const status = i === 0 ? 'paid' : i === 1 ? 'sent' : i === 2 ? 'overdue' : 'sent';
    const paymentStatus = status === 'paid' ? 'paid' : status === 'overdue' ? 'overdue' : 'unpaid';
    const inv = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        invoiceNumber: num,
        customerId: customer.id,
        status, paymentStatus,
        currencyCode: 'USD',
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        amountPaid: paymentStatus === 'paid' ? total : 0,
        balance: paymentStatus === 'paid' ? 0 : total,
        dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
        items: { create: lineItems },
        date: new Date(Date.now() - (i + 1) * 5 * 24 * 60 * 60 * 1000),
      },
    });
    if (status === 'paid') {
      await prisma.customerPayment.create({
        data: {
          organizationId: org.id,
          paymentNumber: `PMT-${String(3000 + i).padStart(4, '0')}`,
          customerId: customer.id,
          invoiceId: inv.id,
          amount: total,
          currencyCode: 'USD',
          paymentMode: 'bank_transfer',
          date: new Date(),
        },
      });
    }
  }

  // Purchase orders
  for (let i = 0; i < 3; i++) {
    const vendor = vendors[i];
    const num = `PO-${String(4000 + i).padStart(4, '0')}`;
    const lineItems = items.slice(i * 3, i * 3 + 4).map((it) => {
      const qty = 10 + Math.floor(Math.random() * 30);
      const lineTotal = qty * (it.costPrice || 0);
      return {
        itemId: it.id, name: it.name, sku: it.sku,
        quantity: qty, unitPrice: it.costPrice || 0, discount: 0, taxRate: 0,
        taxAmount: 0, total: lineTotal,
      };
    });
    const total = lineItems.reduce((s, l) => s + l.total, 0);
    await prisma.purchaseOrder.create({
      data: {
        organizationId: org.id,
        orderNumber: num,
        vendorId: vendor.id,
        warehouseId: mainWh.id,
        status: i === 0 ? 'received' : i === 1 ? 'open' : 'draft',
        paymentStatus: 'unpaid',
        currencyCode: 'USD',
        subtotal: total, taxAmount: 0, total,
        items: { create: lineItems },
        date: new Date(Date.now() - i * 4 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Bills
  for (let i = 0; i < 2; i++) {
    const vendor = vendors[i];
    const num = `BILL-${String(5000 + i).padStart(4, '0')}`;
    const lineItems = items.slice(i * 2, i * 2 + 3).map((it) => {
      const qty = 5 + Math.floor(Math.random() * 10);
      const lineTotal = qty * (it.costPrice || 0);
      return {
        itemId: it.id, name: it.name, sku: it.sku,
        quantity: qty, unitPrice: it.costPrice || 0, discount: 0, taxRate: 0,
        taxAmount: 0, total: lineTotal,
      };
    });
    const total = lineItems.reduce((s, l) => s + l.total, 0);
    await prisma.bill.create({
      data: {
        organizationId: org.id,
        billNumber: num,
        vendorId: vendor.id,
        status: i === 0 ? 'open' : 'paid',
        paymentStatus: i === 0 ? 'unpaid' : 'paid',
        currencyCode: 'USD',
        subtotal: total, taxAmount: 0, total,
        amountPaid: i === 0 ? 0 : total,
        balance: i === 0 ? total : 0,
        dueDate: new Date(Date.now() + (i + 1) * 14 * 24 * 60 * 60 * 1000),
        items: { create: lineItems },
        date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Seeded successfully!');
  console.log('   Login: demo@stockly.app / demo1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
