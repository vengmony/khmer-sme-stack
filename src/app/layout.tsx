import './globals.css';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Stockly — Inventory Management',
  description: 'A complete inventory management system with multi-warehouse, multi-channel sales, purchasing, and shipping.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Allow public pages (login, register) by rendering them outside the shell.
  // We do not redirect here; the public layout routes handle their own layout.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
