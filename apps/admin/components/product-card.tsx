import { ShoppingBag, Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  dailyPrice: number;
  depositPrice: number;
  available: boolean;
}

export function ProductCard({
  id,
  title,
  image,
  dailyPrice,
  depositPrice,
  available,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
      <div className="relative h-72 bg-gray-200 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {available && (
          <div className="absolute top-4 right-4 bg-milin-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Available
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-milin-900 mb-2 group-hover:text-milin-600 line-clamp-2">
          {title}
        </h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-milin-600 font-bold">฿{dailyPrice.toLocaleString()}/day</p>
            <p className="text-gray-500 text-xs">Deposit: ฿{depositPrice.toLocaleString()}</p>
          </div>
          <button className="bg-milin-500 text-white p-2 rounded-lg hover:bg-milin-600 transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
