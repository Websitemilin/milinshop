import Link from 'next/link';
import { ShoppingBag, Heart, User, Menu, Sparkles } from 'lucide-react';

export function StorefrontHeader() {
  return (
    <header className="border-b border-pink-200 bg-white sticky top-0 z-40 shadow-sm">
      <nav className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-milin-500" />
          <span className="text-2xl font-display font-bold text-milin-600">Milin Shop</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-700 hover:text-milin-600 transition">
            Home
          </Link>
          <Link href="/shop" className="text-gray-700 hover:text-milin-600 transition">
            Shop
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-milin-600 transition">
            About
          </Link>
          <Link href="/rental-guide" className="text-gray-700 hover:text-milin-600 transition">
            How It Works
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-pink-50 rounded-lg transition">
            <Heart className="w-6 h-6 text-gray-700" />
          </button>
          <Link href="/cart" className="p-2 hover:bg-pink-50 rounded-lg transition relative">
            <ShoppingBag className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-milin-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </Link>
          <Link href="/login" className="p-2 hover:bg-pink-50 rounded-lg transition">
            <User className="w-6 h-6 text-gray-700" />
          </Link>
          <button className="md:hidden p-2 hover:bg-pink-50 rounded-lg transition">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>
    </header>
  );
}
