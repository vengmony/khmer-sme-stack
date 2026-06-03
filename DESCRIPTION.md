# About Khmer SME Stack

A free, open-source back-office stack for small and medium businesses in Cambodia. The first piece is **Stockly**, a working inventory and order management web app — the kind most small shops, wholesalers, and distributors actually need day-to-day.

The codebase is a Next.js 14 + Prisma + SQLite app. The Prisma schema covers the full set of operations a real SME runs: items, warehouses, sales orders, invoices, payments, purchase orders, vendor bills, transfers, picklists, packages, shipments, and reports. Multi-currency is built in (USD, KHR, and 10 others). Auth is JWT. The UI works on phones.

The point isn't to ship the most polished SaaS in the world. The point is to give Cambodian developers and small business owners a real starting point they own, instead of paying $29–$249/month for a foreign product that doesn't speak the local context.

## Why this exists

Most Cambodian SMEs run on paper, WhatsApp, and Excel. That works until it doesn't — usually around the time you have more than a couple dozen SKUs, more than one person touching the data, or a customer asking why their order is late.

The commercial options aren't great. Foreign SaaS is priced in USD with no local payment support, holds your data on someone else's servers, and charges per user. Local off-the-shelf software tends to be expensive desktop apps from the early 2000s.

This is a third path: an MIT-licensed codebase you can run on a $5 VPS, modify freely, and grow into the specific business you have.

## What's in the first release (Stockly)

- Items, categories, barcodes (UPC/EAN/ISBN), composite bundles, reorder points
- Multi-warehouse stock with per-location quantities
- Sales orders → invoices → customer payments (atomic balance updates)
- Purchase orders → vendor bills → vendor payments
- Inter-warehouse transfer orders (atomic stock moves)
- Inventory adjustments (positive/negative per warehouse)
- Picklists with per-line picked status
- Packages and outbound shipments with carrier + tracking
- Multi-currency transactions
- Tax configuration
- Price lists
- Reports: sales by customer/item, inventory valuation, low stock, vendor spend, customer aging
- Multi-user, multi-organization data isolation

## Built for the local context

- **USD by default**, KHR (and any other currency) one switch away in Settings
- **Single SQLite file** — back it up with a cron job and an S3 sync, or just copy it to a flash drive
- **Mobile-friendly** because the shop owner is usually the one using it from their phone
- **Designed to extend** with KHQR / ABA Pay / Wing / Pi Pay, Khmer translations, Telegram alerts, and ESC/POS thermal printer support

## Getting started

```bash
git clone https://github.com/vengmony/khmer-sme-stack.git
cd khmer-sme-stack
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Sign in at `http://localhost:3000` with `demo@stockly.app` / `demo1234`.

## Roadmap

- [ ] Khmer (ខ្មែរ) UI translation
- [ ] KHQR / ABA Pay / Wing / Pi Pay integration
- [ ] Telegram bot for order alerts
- [ ] ESC/POS thermal printer support
- [ ] Public storefront (lightweight e-commerce)
- [ ] Multi-store (one owner, many branches)
- [ ] Offline-first sync mode

## License

MIT — fork it, run it, sell services around it, just keep the source open.
