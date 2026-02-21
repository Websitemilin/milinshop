'use client';
import Link from 'next/link';
import { ShoppingBag, User, Menu, Sparkles, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function StorefrontHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <header className="border-b border-pink-200 bg-white sticky top-0 z-40 shadow-sm">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/shop" className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-mirin-500" />
          <span className="text-xl font-display font-bold text-mirin-600">Mirin Shop</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/shop" className="text-gray-700 hover:text-mirin-600 transition text-sm font-medium">
            หน้าหลัก
          </Link>
          <Link href="/shop" className="text-gray-700 hover:text-mirin-600 transition text-sm font-medium">
            สินค้าทั้งหมด
          </Link>
          <Link href="/rental-guide" className="text-gray-700 hover:text-mirin-600 transition text-sm font-medium">
            วิธีการเช่า
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-mirin-600 transition text-sm font-medium">
            เกี่ยวกับเรา
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/cart" className="p-2 hover:bg-pink-50 rounded-lg transition relative">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-mirin-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <Link href="/profile" className="p-2 hover:bg-pink-50 rounded-lg transition">
              <User className="w-5 h-5 text-gray-700" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1 text-sm text-gray-700 hover:text-mirin-600 px-3 py-2 rounded-lg hover:bg-pink-50 transition"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="hidden md:block bg-mirin-500 hover:bg-mirin-600 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}

          <button
            className="md:hidden p-2 hover:bg-pink-50 rounded-lg transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white px-6 py-4 space-y-3">
          <Link href="/shop" className="block text-gray-700 hover:text-mirin-600 text-sm py-2" onClick={() => setMenuOpen(false)}>
            สินค้าทั้งหมด
          </Link>
          <Link href="/rental-guide" className="block text-gray-700 hover:text-mirin-600 text-sm py-2" onClick={() => setMenuOpen(false)}>
            วิธีการเช่า
          </Link>
          <Link href="/about" className="block text-gray-700 hover:text-mirin-600 text-sm py-2" onClick={() => setMenuOpen(false)}>
            เกี่ยวกับเรา
          </Link>
          {!isLoggedIn && (
            <>
              <Link href="/login" className="block text-gray-700 hover:text-mirin-600 text-sm py-2" onClick={() => setMenuOpen(false)}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="block text-mirin-600 font-medium text-sm py-2" onClick={() => setMenuOpen(false)}>
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
