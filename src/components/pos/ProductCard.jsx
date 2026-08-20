import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, Package } from 'lucide-react';

export default function ProductCard({ product, onAdd, index = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={() => onAdd(product)}
      className="group relative bg-white/90 dark:bg-gray-900 border rounded-2xl transition-all duration-200 text-left w-full overflow-hidden border-gray-200/80 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 active:translate-y-0 cursor-pointer"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-linear-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-4 sm:p-4.5">
        {/* Icon */}
        <div className="w-11 h-11 bg-linear-to-br from-primary-50 via-sky-50 to-indigo-100 dark:from-primary-900/40 dark:to-primary-800/40 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
          <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2 min-h-10 leading-snug">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-primary-600 dark:text-primary-400 font-bold text-base mb-2.5">
          {formatCurrency(product.price)}
        </p>

        {/* Bottom row: add button */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 group-hover:text-primary-500 transition-colors">Tambah</span>
          <div className="w-8 h-8 bg-primary-500 text-white rounded-xl flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all duration-200 shadow-sm shadow-primary-500/30 group-active:scale-90">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
