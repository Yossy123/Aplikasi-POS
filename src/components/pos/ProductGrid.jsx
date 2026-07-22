import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, onAdd }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
            <div className="w-11 h-11 bg-gray-100 rounded-xl mb-3" />
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-5 bg-gray-100 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Produk tidak ditemukan</p>
        <p className="text-xs text-gray-400 mt-1">Coba gunakan kata kunci lain</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} index={i} />
      ))}
    </div>
  );
}
