'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SalesOrderActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function changeStatus(status: string) {
    setBusy(true);
    try {
      const r = await fetch(`/api/sales-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (currentStatus === 'cancelled' || currentStatus === 'invoiced') return null;

  return (
    <div className="flex gap-1.5">
      {currentStatus === 'draft' && (
        <button onClick={() => changeStatus('confirmed')} disabled={busy} className="btn-secondary text-xs">
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Confirm
        </button>
      )}
      {currentStatus === 'confirmed' && (
        <button onClick={() => changeStatus('shipped')} disabled={busy} className="btn-secondary text-xs">
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Mark Shipped
        </button>
      )}
      <button onClick={() => changeStatus('cancelled')} disabled={busy} className="btn-ghost text-xs text-rose-600">
        <XCircle className="w-3 h-3" /> Cancel
      </button>
    </div>
  );
}
