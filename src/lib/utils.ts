import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}

export function formatNumber(n: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n || 0);
}

export function formatDate(d: Date | string | null | undefined, withTime = false) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

export function generateNumber(prefix: string, last: number | undefined, pad = 4): string {
  const next = (last || 0) + 1;
  return `${prefix}-${String(next).padStart(pad, '0')}`;
}

export function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (['paid', 'received', 'delivered', 'shipped', 'approved', 'active', 'invoiced'].includes(s))
    return 'bg-emerald-100 text-emerald-700';
  if (['draft', 'pending'].includes(s)) return 'bg-slate-100 text-slate-700';
  if (['open', 'confirmed', 'partially_paid', 'partially_shipped', 'partially_received', 'sent', 'viewed', 'assigned', 'picked', 'packed', 'in_transit'].includes(s))
    return 'bg-blue-100 text-blue-700';
  if (['overdue', 'unpaid', 'low_stock'].includes(s)) return 'bg-amber-100 text-amber-700';
  if (['cancelled', 'void', 'returned'].includes(s)) return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

export function titleCase(s: string): string {
  if (!s) return '';
  return s
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
}

export function round2(n: number) {
  return Math.round((n || 0) * 100) / 100;
}
