import { formatCurrency } from '../../utils/formatCurrency';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="flex items-start gap-3 py-3.5 group border-b border-gray-50 dark:border-gray-800 last:border-0">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</h4>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatCurrency(item.price)}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onUpdateQty(item.product_id, item.qty - 1)}
          className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {item.qty}
        </span>
        <button
          onClick={() => onUpdateQty(item.product_id, item.qty + 1)}
          className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm cursor-pointer"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Subtotal + Remove */}
      <div className="text-right flex flex-col items-end min-w-[70px]">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {formatCurrency(item.subtotal)}
        </span>
        <button
          onClick={() => onRemove(item.product_id)}
          className="flex items-center gap-1 text-[10px] text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 mt-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Hapus
        </button>
      </div>
    </div>
  );
}
