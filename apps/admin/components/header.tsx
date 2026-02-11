import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, User, LogOut, Sparkles } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-white to-pink-50 border-b border-pink-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-milin-500" />
        <div className="text-milin-900">
          <h2 className="text-lg font-semibold font-display">Milin Shop Admin</h2>
          <p className="text-sm text-milin-600">{user?.email}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-pink-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-milin-600" />
        </button>

        <div className="w-10 h-10 bg-gradient-to-br from-milin-500 to-rose-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
          {user?.email?.[0]?.toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-milin-600" />
        </button>
      </div>
    </header>
  );
}
