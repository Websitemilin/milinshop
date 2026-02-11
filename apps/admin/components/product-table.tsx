import { Trash2, Edit2 } from 'lucide-react';

interface ProductTableProps {
  products: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Title
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Category
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Daily Price
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {product.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {product.category?.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                ${product.dailyPrice.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product.id)}
                    className="p-2 hover:bg-blue-50 rounded text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 hover:bg-red-50 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
