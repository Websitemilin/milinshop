import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ProductFormProps {
  editingId?: string | null;
  onSuccess?: () => void;
}

export function ProductForm({ editingId, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    dailyPrice: 0,
    depositPrice: 0,
    stock: 0,
    colors: [],
    sizes: [],
    material: '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/admin/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Daily Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.dailyPrice}
            onChange={(e) =>
              setFormData({ ...formData, dailyPrice: parseFloat(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Deposit Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.depositPrice}
            onChange={(e) =>
              setFormData({ ...formData, depositPrice: parseFloat(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-luxury-600 hover:bg-luxury-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
}
