'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ReportsCharts({ salesSeries }: { salesSeries: { date: string; sales: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesSeries}>
          <defs>
            <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3563ff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3563ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} interval={4} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} width={50} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            labelFormatter={(d: any) => new Date(d).toLocaleDateString()}
            formatter={(v: any) => [`$${v.toFixed(2)}`, 'Sales']}
          />
          <Area type="monotone" dataKey="sales" stroke="#3563ff" strokeWidth={2} fill="url(#r1)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
