'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  dailyPrice: number;
  depositPrice: number;
  images: Array<{ url: string; alt: string }>;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function StorefrontHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?page=1&limit=12'),
          api.get('/products/categories'),
        ]);

        setProducts(productsRes.data.items);
        setCategories(categoriesRes.data.items || []);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-milin-500 via-rose-400 to-milin-600 text-white py-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-5xl md:text-6xl font-display font-bold">Milin Shop</h1>
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-xl md:text-2xl mb-4 font-light">
            Luxury Women\'s Fashion Rental
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            Rent premium designer pieces for every occasion. From elegant evening gowns to chic blazers, 
            access the luxury wardrobe of your dreams.
          </p>
          <button className="bg-white text-milin-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
            Shop Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-pink-50 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-milin-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-milin-900 mb-2">Curated Collection</h3>
              <p className="text-gray-600">Handpicked luxury designer pieces for every occasion</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-milin-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-milin-900 mb-2">Easy Rental</h3>
              <p className="text-gray-600">Simple process from browsing to checkout</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-milin-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-milin-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">All pieces thoroughly cleaned and maintained</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-milin-900 mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-milin-500 text-white'
                      : 'bg-pink-100 text-milin-900 hover:bg-milin-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 px-8 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-milin-900 mb-8">
            {selectedCategory ? 'Filtered Products' : 'Featured Collections'}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <div className="relative h-96 bg-gray-200 overflow-hidden">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      {product.stock > 0 && (
                        <div className="absolute top-4 right-4 bg-milin-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Available
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-milin-900 mb-2 group-hover:text-milin-600">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-milin-600 font-bold text-lg">
                            ฿{product.dailyPrice.toLocaleString()}/day
                          </p>
                          <p className="text-gray-500 text-xs">
                            Deposit: ฿{product.depositPrice.toLocaleString()}
                          </p>
                        </div>
                        <button className="bg-milin-500 text-white p-2 rounded-lg hover:bg-milin-600 transition-colors">
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-milin-800 to-rose-800 text-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to Rent?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of women who love dressing up without the commitment.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-milin-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </main>
  );
}
