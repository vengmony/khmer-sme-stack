# Project Analysis: Khmer SME Stack (Stockly)

## Overview
Khmer SME Stack is an open-source back-office solution tailored for small and medium businesses in Cambodia. Its primary module, **Stockly**, focuses on inventory and order management.

## Tech Stack
- **Framework:** Next.js 14 (using App Router)
- **Database:** SQLite (managed via Prisma ORM)
- **Styling:** Tailwind CSS
- **Authentication:** JWT stored in HTTP-only cookies
- **Icons:** Lucide React
- **Charts:** Recharts
- **Validation:** Zod

## Project Structure
- `src/app/`: Contains the application routes.
  - `(app)/`: Authenticated routes for dashboard, items, contacts, orders, etc.
  - `api/`: REST API endpoints for various resources.
  - `login/` & `register/`: Authentication pages.
- `src/components/`: Reusable React components.
  - `forms/`: Interactive forms for creating/editing records.
  - `lists/`: Client-side list views with filtering and sorting.
  - `charts/`: Dashboard visualization components.
- `src/lib/`: Core utilities, Prisma client, and authentication logic.
- `prisma/`: Database schema and seed data.

## Core Modules
1. **Inventory Management:** Items, categories, barcodes, and multi-warehouse support.
2. **Sales & Purchasing:** Sales orders, purchase orders, invoices, and bills.
3. **Logistics:** Transfers, picklists, packages, and shipments.
4. **Finance:** Customer and vendor payments, multi-currency support (USD/KHR), and tax configuration.
5. **Reporting:** Sales, inventory valuation, and low stock reports.

## Key Observations
- The application uses a single-organization model per deployment.
- It leverages Next.js Server Components for data fetching and Client Components for interactivity.
- Multi-currency support is a first-class citizen, particularly focusing on the Cambodian context (USD and KHR).
- The system is designed to be lightweight and deployable on low-cost hardware.
