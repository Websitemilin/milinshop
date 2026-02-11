export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">LUXE Rental</h1>
        <p className="text-xl text-gray-600 mb-8">
          Premium Luxury Fashion Rental Marketplace
        </p>
        <a
          href="/login"
          className="inline-block bg-luxury-600 hover:bg-luxury-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Go to Admin Dashboard
        </a>
      </div>
    </div>
  );
}
