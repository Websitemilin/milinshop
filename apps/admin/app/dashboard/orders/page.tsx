'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { OrderTable } from '@/components/order-table';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders', {
          params: { page, pageSize: 20 },
        });
        setOrders(res.data.items);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      setOrders(updated);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <OrderTable orders={orders} onStatusUpdate={handleStatusUpdate} />
      )}
    </div>
  );
}
