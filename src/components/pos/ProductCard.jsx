import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, Package } from 'lucide-react';

export default function ProductCard({ product, onAdd, index = 0 }) {
  const outOfStock = product.stock <= 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={`group relative bg-white dark:bg-gray-900 border transition-all duration-200 text-left w-full overflow-hidden ${
        outOfStock
          ? 'border-gray-100 dark:border-gray-800 opacity-55 cursor-not-allowed'
          : 'border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-4">
        {/* Icon */}
        <div className="w-11 h-11 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
          <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2 min-h-[2.5rem] leading-snug">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-primary-600 dark:text-primary-400 font-bold text-base mb-2.5">
          {formatCurrency(product.price)}
        </p>

        {/* Bottom row: stock badge + add button */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              product.stock > 10
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : product.stock > 0
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {product.stock}
          </span>

          {!outOfStock && (
            <div className="w-7 h-7 bg-primary-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm shadow-primary-500/30 group-active:scale-90">
              <Plus className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
