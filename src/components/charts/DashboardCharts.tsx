'use client';

import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3563ff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3563ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickFormatter={(d) => d.slice(5)}
            interval={4}
          />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} width={50} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            labelFormatter={(d: any) => new Date(d).toLocaleDateString()}
            formatter={(v: any) => [`$${v.toFixed(2)}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#3563ff" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data }: { data: { date: string; sales: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} interval={4} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} width={30} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            labelFormatter={(d: any) => new Date(d).toLocaleDateString()}
            formatter={(v: any) => [v, 'Orders']}
          />
          <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
