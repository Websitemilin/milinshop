'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DashboardCard } from '@/components/dashboard-card';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/revenue?days=30'),
        ]);
        setStats(statsRes.data);
        setRevenueData(revenueRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+12.5%"
        />
        <DashboardCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend="+8.2%"
        />
        <DashboardCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          trend="+5.1%"
        />
        <DashboardCard
          title="New Users"
          value={stats?.newUsers || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="+3.2%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8b6f47"
                fill="#c4a878"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {stats?.recentOrders?.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b"
              >
                <div>
                  <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                  <p className="text-sm text-gray-500">{order.id}</p>
                </div>
                <span className="text-lg font-semibold">${order.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
