'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Heart, ShoppingBag, Sparkles, Star } from 'lucide-react';

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
        const categoryParam = selectedCategory ? `&categoryId=${selectedCategory}` : '';
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/products?page=1&pageSize=12${categoryParam}`),
          api.get('/categories').catch(() => ({ data: [] })),
        ]);

        setProducts(productsRes.data.items || []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data.items || []));
      } catch (error) {
        console.error('Failed to fetch:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-mirin-500 via-rose-400 to-mirin-600 text-white py-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-5xl md:text-6xl font-display font-bold">Mirin Shop</h1>
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-xl md:text-2xl mb-4 font-light">
            เช่าแฟชั่นหรูสำหรับผู้หญิง
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            เช่าเสื้อผ้าดีไซเนอร์สำหรับทุกโอกาส ตั้งแต่ชุดราตรีหรูไปจนถึงเสื้อสูทสวยงาม
            เข้าถึงตู้เสื้อผ้าระดับลักชัวรี่ในฝันของคุณ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-mirin-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
            >
              เลือกซื้อเลย
            </button>
            <Link
              href="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              สมัครสมาชิกฟรี
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-pink-50 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-mirin-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-mirin-900 mb-2">คัดสรรมาอย่างดี</h3>
              <p className="text-gray-600">เสื้อผ้าดีไซเนอร์หรูสำหรับทุกโอกาส</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-mirin-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-mirin-900 mb-2">เช่าง่าย สะดวก</h3>
              <p className="text-gray-600">กระบวนการง่ายดาย ตั้งแต่เลือกจนถึงชำระเงิน</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-mirin-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-mirin-900 mb-2">คุณภาพระดับพรีเมียม</h3>
              <p className="text-gray-600">ทุกชิ้นผ่านการทำความสะอาดและดูแลอย่างดี</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-mirin-900 mb-8">เลือกตามหมวดหมู่</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm ${
                  selectedCategory === null
                    ? 'bg-mirin-500 text-white shadow-md'
                    : 'bg-pink-100 text-mirin-900 hover:bg-mirin-200'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm ${
                    selectedCategory === cat.id
                      ? 'bg-mirin-500 text-white shadow-md'
                      : 'bg-pink-100 text-mirin-900 hover:bg-mirin-200'
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
      <section id="products-section" className="py-12 px-8 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-mirin-900 mb-8">
            {selectedCategory ? 'สินค้าในหมวดหมู่นี้' : 'คอลเลกชันแนะนำ'}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-mirin-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">กำลังโหลดสินค้า...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">ไม่พบสินค้า</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-72 bg-gradient-to-br from-pink-100 to-pink-200 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-pink-300" />
                        </div>
                      )}
                      {product.stock > 0 ? (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                          มีสินค้า
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-gray-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                          หมด
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-mirin-900 mb-1 group-hover:text-mirin-600 line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-mirin-600 font-bold">
                            ฿{product.dailyPrice.toLocaleString()}/วัน
                          </p>
                          <p className="text-gray-400 text-xs">
                            มัดจำ: ฿{product.depositPrice.toLocaleString()}
                          </p>
                        </div>
                        <button className="bg-mirin-500 text-white px-3 py-2 rounded-lg hover:bg-mirin-600 transition-colors text-sm font-medium">
                          เช่าเลย
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
      <section className="bg-gradient-to-r from-mirin-800 to-rose-800 text-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">พร้อมเริ่มเช่าแล้วหรือยัง?</h2>
          <p className="text-lg mb-8 opacity-90">
            เข้าร่วมกับผู้หญิงนับพันที่รักการแต่งตัวสวยโดยไม่ต้องซื้อ
          </p>
          <Link
            href="/register"
            className="bg-white text-mirin-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow inline-block"
          >
            เริ่มต้นวันนี้
          </Link>
        </div>
      </section>
    </main>
  );
}
