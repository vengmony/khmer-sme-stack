'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Boxes, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@stockly.app');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const j = await r.json();
        setError(j.error || 'Login failed');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold">Stockly</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-sm text-ink-500 mb-6">Welcome back. Sign in to manage your inventory.</p>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="input pl-9" placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="input pl-9" placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-600 text-center">
            New here? <Link href="/register" className="text-brand-600 font-medium hover:underline">Create an account</Link>
          </p>

          <div className="mt-6 p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <p className="font-medium mb-1">Demo Account</p>
            <p>Email: <code className="font-mono">demo@stockly.app</code></p>
            <p>Password: <code className="font-mono">demo1234</code></p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 to-brand-800 items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <Boxes className="w-12 h-12 mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-3">Run your entire inventory from one place</h2>
          <p className="text-brand-100 leading-relaxed">
            Manage items, warehouses, sales orders, invoices, shipments, and reports — all in a single, modern application.
            Track stock in real time across every channel.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-brand-50">
            <li>✓ Multi-warehouse with bin-level tracking</li>
            <li>✓ Sales & purchase orders, invoicing, bills</li>
            <li>✓ Packages, shipments, picklists</li>
            <li>✓ Multi-currency, taxes, price lists</li>
            <li>✓ Real-time reports and dashboards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
