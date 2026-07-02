'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface TrackingEvent { status: OrderStatus; label: string; timestamp: string | null; done: boolean; }
interface Order { id: string; status: OrderStatus; total: number; carrier: string; trackingNumber: string; estimatedDelivery: string; events: TrackingEvent[]; }

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order placed', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};
const FLOW: OrderStatus[] = ['pending','confirmed','processing','shipped','out_for_delivery','delivered'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${id}/tracking`).then(r => r.json()).then(d => { if (d.error) setErr(d.error); else setOrder(d.order); });
  }, [id]);

  if (err)   return <div className="p-8 text-red-500">{err}</div>;
  if (!order) return <div className="p-8"><div className="h-8 w-64 bg-gray-100 rounded animate-pulse mb-4" /><div className="h-48 bg-gray-100 rounded-xl animate-pulse" /></div>;

  const currentIdx = FLOW.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-1">Track Order</h1>
      <p className="text-gray-500 text-sm mb-6">#{order.id.slice(-8).toUpperCase()} · {order.carrier} {order.trackingNumber}</p>
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-8">
          {FLOW.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentIdx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i < currentIdx ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 text-center ${i <= currentIdx ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>{STATUS_LABELS[s]}</span>
              {i < FLOW.length - 1 && <div className={`absolute h-0.5 w-full ${i < currentIdx ? 'bg-indigo-600' : 'bg-gray-100'}`} style={{ top: 16, left: '50%' }} />}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">Estimated delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</strong></p>
      </div>
    </div>
  );
}