import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100 flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-pink-800">Mirin Shop</h1>
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-xl text-gray-600 mb-2">เช่าแฟชั่นหรูสำหรับผู้หญิง</p>
          <p className="text-gray-500">เสื้อผ้าดีไซเนอร์สำหรับทุกโอกาส</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md"
          >
            เลือกซื้อสินค้า
          </Link>
          <Link
            href="/register"
            className="inline-block bg-white border-2 border-pink-500 text-pink-600 hover:bg-pink-50 px-8 py-3 rounded-full font-semibold transition-colors"
          >
            สมัครสมาชิก
          </Link>
        </div>
        <div className="mt-6">
          <Link href="/login" className="text-sm text-gray-400 hover:text-pink-600">
            เข้าสู่ระบบ Admin →
          </Link>
        </div>
      </div>
    </div>
  );
}
