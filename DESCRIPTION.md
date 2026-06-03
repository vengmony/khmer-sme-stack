## About this project

**khmer-sme-stack** is a free, open-source starter for building POS, inventory, and e-commerce back-office systems tailored to the realities of running a small business in Cambodia.

It's a working, end-to-end inventory management web app — modeled after Zoho Inventory — that small shop owners, wholesalers, and distributors can actually use today, and that developers can fork and adapt to local needs.

### Why this exists

Cambodian SMEs still run their businesses on:
- paper ledgers and Excel sheets that break as soon as there are more than 50 SKUs
- expensive foreign SaaS priced in USD with no local payment support
- WhatsApp groups and "do you have stock?" phone calls

This project gives you a foundation to fix that. It's not a finished product — it's a working **starting point** you can fork, translate, and extend.

### What's included (out of the box)

- Multi-warehouse stock tracking
- Sales orders, invoices, and customer payments
- Purchase orders, bills, and vendor payments
- Packages and shipments
- Picklists and inventory adjustments
- Inter-warehouse transfer orders
- Composite items (kits/bundles)
- Multi-currency support (USD, KHR, EUR, JPY, and 8 more)
- Tax configuration
- Price lists
- Reports (sales by customer/item, inventory valuation, low stock, vendor spend, customer aging)
- JWT auth, role-based organization model
- Clean, modern, mobile-friendly UI

### Designed for Cambodia

- **Default currency is USD**, with KHR (and others) one switch away in Settings
- **Offline-tolerant** by design (single SQLite file — drop it on a flash drive, sync later)
- **Mobile-friendly UI** because the owner is often the one using it from a phone
- **Ready to extend** with local payment gateways (Wing, ABA Pay, Pi Pay, KHQR), Khmer language translations, and Telegram-bot notifications

### Tech stack

Next.js 14 (App Router) · TypeScript · Prisma · SQLite · Tailwind CSS · Recharts · JWT auth
No vendor lock-in. No telemetry. Runs on a $5/month VPS.

### Quick start

```bash
git clone https://github.com/vengmony/khmer-sme-stack.git
cd khmer-sme-stack
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Then sign in at `http://localhost:3000` with `demo@stockly.app` / `demo1234`.

### Roadmap (contributions welcome)

- [ ] Khmer (ខ្មែរ) UI translation
- [ ] KHQR / ABA Pay / Wing payment integration
- [ ] Telegram bot for order alerts
- [ ] Receipt printer support (ESC/POS thermal printers)
- [ ] Mobile-first POS mode for shop counters
- [ ] Public storefront (lightweight e-commerce)
- [ ] Multi-store (one owner, many branches)
- [ ] Lite mode for very low-bandwidth areas

### License

MIT — fork it, sell it, ship it, just keep it open.
