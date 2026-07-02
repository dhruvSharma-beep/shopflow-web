'use client';
import { useEffect, useState } from 'react';

interface Stats { revenue: number; orders: number; customers: number; avgOrder: number; }
interface RecentOrder { id: string; customer: string; total: number; status: string; createdAt: string; }

export default function AdminDashboard() {
  const [stats,  setStats]  = useState<Stats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d.stats); setOrders(d.recentOrders); });
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const statusColor = (s: string) => ({ fulfilled: 'text-green-600', pending: 'text-yellow-600', cancelled: 'text-red-600' }[s] ?? 'text-gray-600');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenue',     value: stats ? fmt(stats.revenue)   : '—' },
          { label: 'Orders',      value: stats?.orders?.toLocaleString() ?? '—' },
          { label: 'Customers',   value: stats?.customers?.toLocaleString() ?? '—' },
          { label: 'Avg Order',   value: stats ? fmt(stats.avgOrder)  : '—' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b"><h2 className="font-semibold text-sm">Recent Orders</h2></div>
        <table className="w-full text-sm"><thead className="bg-gray-50">
          <tr>{['Order','Customer','Total','Status','Date'].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>)}</tr>
        </thead><tbody className="divide-y">
          {orders.map(o => (
            <tr key={o.id} className="hover:bg-gray-50">
              <td className="px-5 py-3 font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</td>
              <td className="px-5 py-3">{o.customer}</td>
              <td className="px-5 py-3">{fmt(o.total)}</td>
              <td className={`px-5 py-3 font-medium ${statusColor(o.status)}`}>{o.status}</td>
              <td className="px-5 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}