import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100 flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-pink-800 mb-3">✨ Mirin Shop</h1>
          <p className="text-xl text-gray-600 mb-2">Luxury Women's Fashion Rental</p>
          <p className="text-gray-500">Premium designer pieces for every occasion</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md"
          >
            🛍️ Shop Now
          </Link>
          <Link
            href="/login"
            className="inline-block bg-white border-2 border-pink-500 text-pink-600 hover:bg-pink-50 px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
