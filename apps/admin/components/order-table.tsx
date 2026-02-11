interface OrderTableProps {
  orders: any[];
  onStatusUpdate: (orderId: string, status: string) => void;
}

const statusOptions = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export function OrderTable({ orders, onStatusUpdate }: OrderTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-mono">{order.id.slice(0, 8)}</td>
              <td className="px-6 py-4 text-sm">
                {order.user?.firstName} {order.user?.lastName}
              </td>
              <td className="px-6 py-4 text-sm font-semibold">
                ${order.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm">
                <select
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
