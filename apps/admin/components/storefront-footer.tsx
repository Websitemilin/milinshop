import Link from 'next/link';
import { Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';

export function StorefrontFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-milin-50 to-milin-100 border-t border-pink-200">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-milin-500" />
              <span className="text-lg font-display font-bold text-milin-600">Milin Shop</span>
            </div>
            <p className="text-gray-600 text-sm">
              Luxury women's fashion rental for every occasion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-milin-900 mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="text-gray-600 hover:text-milin-600">All Products</Link></li>
              <li><Link href="/shop/evening-wear" className="text-gray-600 hover:text-milin-600">Evening Wear</Link></li>
              <li><Link href="/shop/blazers" className="text-gray-600 hover:text-milin-600">Blazers</Link></li>
              <li><Link href="/shop/accessories" className="text-gray-600 hover:text-milin-600">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-milin-900 mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rental-guide" className="text-gray-600 hover:text-milin-600">How It Works</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-milin-600">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-milin-600">Contact</Link></li>
              <li><Link href="/shipping" className="text-gray-600 hover:text-milin-600">Shipping</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-milin-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-gray-600 hover:text-milin-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-milin-600">Privacy Policy</Link></li>
              <li><Link href="/returns" className="text-gray-600 hover:text-milin-600">Returns & Refunds</Link></li>
              <li><Link href="/damage-policy" className="text-gray-600 hover:text-milin-600">Damage Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              © {currentYear} Milin Shop. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-milin-600">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-milin-600">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-milin-600">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
