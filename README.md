# Khmer SME Stack

An open-source back-office stack for small businesses in Cambodia — starting with a working inventory and order management web app called **Stockly**.

If you run a small shop, a wholesale operation, or a distribution business in Cambodia, this is the kind of software you'll actually use. Built by people who got tired of seeing "$249/mo SaaS" and "free Excel templates" as the only options.

## What you get

A real, working web app you can run on a $5/month VPS or even a Raspberry Pi. Single database file. No vendor lock-in. No phone-home analytics. No per-user fees.

The first piece of the stack is **Stockly**, an inventory and order management app with everything a typical SME needs out of the box:

- Items, categories, barcodes, composite bundles
- Multi-warehouse with per-location stock
- Sales orders → invoices → customer payments
- Purchase orders → vendor bills → vendor payments
- Inter-warehouse stock transfers
- Picklists for warehouse teams
- Inventory adjustments (damages, write-offs, stocktakes)
- Packages and outbound shipments with tracking
- Multi-currency (USD, KHR, EUR, JPY, CNY, INR, and more)
- Tax configuration
- Price lists
- Reports — sales by customer/item, inventory value, low stock, vendor spend, customer aging
- Multi-user with per-organization data isolation
- Mobile-friendly UI

## Quick start

```bash
git clone https://github.com/vengmony/khmer-sme-stack.git
cd khmer-sme-stack
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000 and sign in:

```
Email:    demo@stockly.app
Password: demo1234
```

The seed gives you 3 warehouses, 20 products with stock distributed across them, 5 customers, 3 vendors, a few sales orders, invoices (one already paid), purchase orders, and bills. Enough to click around the entire app without setting up anything.

To start over with a clean database: `npm run db:reset`.

## Why this exists

A lot of Cambodian SMEs still run on paper ledgers and Excel sheets. That's fine until you have more than a few dozen SKUs, two or three staff, and a single mistake means a customer doesn't get what they paid for.

The commercial alternatives are either too expensive, don't speak the local context (no KHR, no Wing/ABA/KHQR), or are foreign SaaS that hold your data hostage behind a monthly fee.

This project's bet: most small businesses don't need every feature a $250/month SaaS offers. They need the parts that actually matter, in their own hands, with a UI that works on a phone, and the freedom to hack on it when something doesn't fit.

It's not finished. It's not polished in every corner. But it's a real foundation you can run a business on today and grow into over time.

## What's planned

The "stack" in Khmer SME Stack means this is meant to grow. Pieces on the roadmap:

- **Khmer (ខ្មែរ) UI translation** — the i18n hooks aren't there yet but are a one-day PR
- **KHQR / ABA Pay / Wing / Pi Pay** payment integration
- **Telegram bot for order alerts** — useful when you're not at your desk
- **ESC/POS thermal printer support** for shop counters
- **Lightweight public storefront** — sell online without paying for Shopify
- **Multi-store** for owners running several branches
- **Offline-first mode** with local sync (the SQLite foundation makes this feasible)

If you build any of these, send a PR.

## Architecture

The whole app is one Next.js project. Server components for the heavy list views, client components for the interactive forms, Prisma on top of SQLite for storage. Authentication is JWT in HTTP-only cookies. Charts come from Recharts. That's it — no Redis, no message queue, no microservices. A single `npm start` runs the whole thing.

```
src/
├── app/
│   ├── (app)/          # Authenticated routes
│   │   ├── dashboard/
│   │   ├── items/      contacts/  sales-orders/  invoices/  payments/
│   │   ├── purchase-orders/  bills/  vendor-payments/
│   │   ├── warehouses/  transfer-orders/  picklists/  inventory-adjustments/
│   │   ├── packages/  shipments/
│   │   ├── reports/  settings/
│   ├── api/            # REST API
│   ├── login/  register/
├── components/         # Reusable UI
├── lib/                # prisma client, auth, utils
prisma/
├── schema.prisma       # 25 models
├── seed.ts             # Demo data
```

The Prisma schema is the canonical source of truth. 25 models covering everything from the most basic item up through composite bundles, packages, shipments, and picklists. Switching from SQLite to PostgreSQL is a one-line config change if you outgrow a single-machine setup.

## When you shouldn't use this

- You need multi-currency accounting with bank reconciliation and audit trails. Use a real accounting system (or build a real accounting module on top of this — the schema is there to extend).
- You need a hosted multi-tenant SaaS. This codebase assumes one organization per deployment. You'd need to add tenant isolation beyond what's there.
- You need real-time carrier rate APIs from FedEx, UPS, DHL. The schema supports tracking numbers; wiring up the rate APIs is a separate project.

## Contributing

PRs welcome. If you're building for a Khmer-speaking audience, the i18n layer is the most valuable thing you could add. If you're integrating with a local payment gateway, even better — the orders and payments schema is already designed for it.

Issues and feature requests: open them on GitHub.

## License

MIT. Fork it, sell services around it, ship it to your clients, just keep the source open.
