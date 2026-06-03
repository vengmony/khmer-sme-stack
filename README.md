# Stockly — Zoho Inventory Clone

A complete, full-stack inventory management web application inspired by Zoho Inventory. Built with **Next.js 14**, **TypeScript**, **Prisma**, **SQLite**, and **Tailwind CSS**.

This isn't a toy — it's a working business application. Every major module from Zoho Inventory has been reimplemented: items, multi-warehouse stock, sales orders, invoices, payments, purchase orders, bills, vendor payments, packages, shipments, picklists, transfer orders, inventory adjustments, reports, and full settings.

## Demo Account

```
Email:    demo@stockly.app
Password: demo1234
```

The seed data populates **3 warehouses**, **20 items** with stock distributed across them, **5 customers**, **3 vendors**, **5 sales orders**, **4 invoices** (one already paid), **3 purchase orders**, and **2 bills** — enough data to click around the entire system immediately.

## Feature Coverage vs. Zoho Inventory

| Zoho Inventory Module | Status | Notes |
|---|---|---|
| Dashboard with KPIs & charts | ✅ | Revenue & sales charts, low-stock alerts, recent activity |
| Items (CRUD, SKU, image, barcode fields) | ✅ | Composite items, variants-ready schema, multi-barcode (UPC/EAN/ISBN) |
| Item groups / Composite items | ✅ | Bundle components |
| Multi-warehouse with stock levels | ✅ | Per-item, per-warehouse quantities with committed/available |
| Transfer orders | ✅ | Atomic stock decrement/increment across warehouses |
| Picklists | ✅ | Pick-status tracking per line |
| Inventory adjustments | ✅ | Positive/negative adjustments per warehouse |
| Contacts (Customers + Vendors) | ✅ | Separate and combined, billing/shipping addresses, payment terms |
| Sales orders | ✅ | Full lifecycle, status workflow, line items, discounts, tax |
| Invoices | ✅ | Convertible from sales orders, balance tracking |
| Customer payments | ✅ | Partial/full, multiple modes, auto-update invoice & receivable |
| Purchase orders | ✅ | Status workflow, line items |
| Bills | ✅ | Vendor payables tracking |
| Vendor payments | ✅ | Auto-update bill & payable |
| Packages | ✅ | From sales order, dimensions & weight, tracking number |
| Shipments | ✅ | Carrier, tracking, status flow |
| Multi-currency transactions | ✅ | 12 currencies pre-configured |
| Taxes | ✅ | Per-rate tax configuration, applied on lines |
| Price lists | ✅ | Wholesale etc., with line-level overrides |
| Reports | ✅ | Sales, Inventory, Purchases, Customers with drill-downs |
| Settings (org, currency, preferences) | ✅ | Multi-warehouse tax/price list management |
| Email notifications | ⏳ Schema-ready | Hooks in place; SMTP not configured |
| Multi-channel (Shopify/Amazon) | ❌ | Not in scope; API-ready architecture though |
| Shipping carrier API integration | ❌ | Manual rate entry; ready for carrier adapter |
| Custom modules | ❌ | Not in scope |

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, Server Actions)
- **Language:** TypeScript (strict)
- **Database:** SQLite via Prisma ORM
- **Auth:** JWT (jose) in HTTP-only cookies
- **UI:** React 18 + Tailwind CSS + Lucide icons + Recharts
- **Validation:** Zod-ready (currently form-level)

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated route group
│   │   ├── dashboard/      # Overview with KPIs
│   │   ├── items/          # Items CRUD + detail
│   │   ├── contacts/       # Customers + Vendors
│   │   ├── sales-orders/   # Sales pipeline
│   │   ├── invoices/       # Billing
│   │   ├── payments/       # Customer payments
│   │   ├── purchase-orders/# Procurement
│   │   ├── bills/          # Vendor bills
│   │   ├── vendor-payments/# Outflows
│   │   ├── warehouses/     # Multi-location
│   │   ├── transfer-orders/# Inter-warehouse stock moves
│   │   ├── packages/       # Packing slips
│   │   ├── shipments/      # Outbound logistics
│   │   ├── picklists/      # Picking workflow
│   │   ├── inventory-adjustments/
│   │   ├── reports/        # Analytics
│   │   └── settings/       # Org & preferences
│   ├── api/                # REST API routes
│   │   ├── auth/           # Login/Register/Logout
│   │   ├── items/          # Items CRUD
│   │   ├── contacts/       # Contacts CRUD
│   │   ├── sales-orders/   # Sales
│   │   ├── invoices/       # Invoices
│   │   ├── customer-payments/
│   │   ├── purchase-orders/
│   │   ├── bills/
│   │   ├── vendor-payments/
│   │   ├── packages/
│   │   ├── shipments/
│   │   ├── picklists/
│   │   ├── inventory-adjustments/
│   │   ├── transfer-orders/
│   │   ├── warehouses/
│   │   └── settings/       # Org, taxes, price lists
│   ├── login/              # Public login
│   └── register/           # Public register
├── components/             # Reusable UI
│   ├── AppShell.tsx        # Sidebar + header
│   ├── SalesOrderActions.tsx
│   ├── RecordPaymentButton.tsx
│   ├── RecordVendorPaymentButton.tsx
│   ├── SettingsClient.tsx
│   ├── WarehousesClient.tsx
│   ├── forms/              # Form components
│   └── lists/              # List view components
└── lib/                    # Shared utilities
    ├── prisma.ts           # Prisma client singleton
    ├── auth.ts             # JWT + session helpers
    └── utils.ts            # Currency, date, format helpers

prisma/
├── schema.prisma           # Database schema (25+ models)
└── seed.ts                 # Sample data
```

## Database Schema (high-level)

25+ Prisma models including:

- **Organization** — Tenant root
- **User** — Auth, with org membership
- **Warehouse** — Storage location
- **Item** + **StockLevel** — Products with per-warehouse stock
- **CompositeItem** — Bundle relationships
- **Contact** — Customers/vendors (with addresses, terms, balances)
- **SalesOrder** + **SalesOrderItem** — Order with line items
- **Invoice** + **InvoiceItem** + **CustomerPayment**
- **PurchaseOrder** + **PurchaseOrderItem** + **PurchaseReceive**
- **Bill** + **BillItem** + **VendorPayment**
- **Package** + **PackageItem** + **Shipment**
- **Picklist** + **PicklistItem**
- **InventoryAdjustment** + **InventoryAdjustmentItem**
- **TransferOrder** + **TransferOrderItem**
- **Tax**, **PriceList** + **PriceListItem**

All transactions are atomic where needed (e.g., recording a payment updates invoice balance + contact receivable in a single transaction).

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Initialize the database
npm run db:push

# 3. Seed with sample data
npm run db:seed

# 4. Run dev server
npm run dev
# OR build and run
npm run build && npm start
```

Open http://localhost:3000 and sign in with `demo@stockly.app` / `demo1234`.

### Other scripts

```bash
npm run db:reset    # Wipe and re-seed the database
npm run db:push     # Sync schema to database
```

## How the System Works End-to-End

1. **Sign in** with the demo account (or create your own)
2. **Dashboard** — see revenue charts, KPIs, low stock alerts, and recent activity
3. **Items** — view 20 seeded products, drill into one to see stock per warehouse
4. **Create a Sales Order** — pick a customer, search/add items, set quantities & prices
5. **Convert SO to Invoice** — invoice auto-fills from the SO
6. **Record a Payment** — invoice balance & customer receivable update automatically
7. **Check Reports** — sales by customer, by item, low stock, etc.
8. **Set Up Multi-Warehouse** — transfer stock from SF → NY, watch stock levels move
9. **Adjust Inventory** — record damages/losses with positive/negative adjustments
10. **Create a Package** from a sales order, then create a Shipment for the package

## What's NOT Included (Deliberately)

To stay focused on the core inventory experience, the following are **not** built but are designed to be straightforward extensions:

- **Shipping carrier APIs** (FedEx, UPS, etc.) — Schema supports tracking, just needs API adapter
- **Marketplace integrations** (Shopify, Amazon) — Architecture supports webhook ingestion
- **Email/SMS notifications** — Hooks are in place (status changes can trigger emails)
- **Mobile apps** — This is a responsive web app; the iOS/Android apps would be separate
- **Public customer/vendor portals** — Login-only system; portals would be a separate app
- **Custom modules** — Fixed schema covers all standard Zoho Inventory entities
- **PDF generation** — Print buttons are wired; PDF export needs a renderer
- **Multi-user collaboration features** (audit trails, comments) — Single-tenant per org

## Production Checklist

Before deploying this to real business use, you would need to:

- [ ] Replace SQLite with PostgreSQL (Prisma already supports it; just change provider)
- [ ] Move JWT secret to a secure store (Vault, AWS SSM, etc.)
- [ ] Configure proper session expiry & refresh tokens
- [ ] Add rate limiting (e.g., via middleware)
- [ ] Set up HTTPS-only cookies in production
- [ ] Add CSRF protection for non-GET requests
- [ ] Implement backup strategy for the database
- [ ] Add an audit log for all mutations
- [ ] Set up monitoring (Sentry, DataDog, etc.)
- [ ] Configure email service for transactional notifications
- [ ] Add 2FA for users
- [ ] Add role-based access control (admin/user permissions)

## License

MIT — Feel free to fork, learn from, or extend.
