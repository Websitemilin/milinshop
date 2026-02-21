'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'สินค้า', icon: Package },
    { href: '/dashboard/orders', label: 'คำสั่งซื้อ', icon: ShoppingCart },
    { href: '/dashboard/users', label: 'ผู้ใช้งาน', icon: Users },
    { href: '/dashboard/categories', label: 'หมวดหมู่', icon: Tag },
    { href: '/dashboard/payments', label: 'การชำระเงิน', icon: CreditCard },
    { href: '/dashboard/settings', label: 'ตั้งค่า', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-pink-900 via-pink-800 to-rose-900 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-pink-700">
        <div className="flex items-center space-x-2 mb-1">
          <Sparkles className="w-6 h-6 text-pink-300" />
          <h1 className="text-xl font-bold">Mirin Shop</h1>
        </div>
        <p className="text-pink-200 text-xs">ระบบจัดการร้านค้า</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                active
                  ? 'bg-white/20 text-white font-medium shadow-sm'
                  : 'text-pink-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-pink-700">
        <Link
          href="/shop"
          className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-pink-200 hover:text-white text-sm mb-1"
        >
          <Sparkles className="w-4 h-4" />
          <span>ดูหน้าร้าน</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-pink-200 hover:text-white text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
