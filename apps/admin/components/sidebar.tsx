import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  Sparkles,
} from 'lucide-react';

export function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/dashboard/users', label: 'Users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-milin-900 via-milin-800 to-rose-900 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-milin-700">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-6 h-6 text-milin-300" />
          <h1 className="text-2xl font-bold font-display">Milin Shop</h1>
        </div>
        <p className="text-milin-200 text-sm">Luxury Fashion Rental</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-milin-700 transition-colors text-milin-100 hover:text-white"
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-milin-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-2 rounded-lg hover:bg-milin-700 transition-colors text-milin-200 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
