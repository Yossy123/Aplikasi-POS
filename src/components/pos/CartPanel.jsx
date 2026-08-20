import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import CartItem from './CartItem';
import { ShoppingBag, RotateCcw } from 'lucide-react';

export default function CartPanel({ onCheckout }) {
  const { items, totalPrice, totalItems, updateQty, removeItem, clearCart } = useCart();

  const handleClearCartClick = () => {
    clearCart();
  };

  const handleRemoveItemClick = (productId) => {
    removeItem(productId);
  };

  const handleUpdateQtyClick = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItemClick(productId);
    } else {
      updateQty(productId, newQty);
    }
  };

  return (
    <>
      <div className="bg-white/90 dark:bg-gray-900 border-l border-gray-200/80 dark:border-gray-800 h-full flex flex-col shadow-[-12px_0_30px_-20px_rgba(15,23,42,0.25)]">
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800 bg-linear-to-br from-primary-50/60 via-white to-emerald-50/40 dark:from-primary-950/20 dark:via-gray-900 dark:to-emerald-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-gray-700 dark:text-gray-400" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Keranjang</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Pesanan aktif</p>
              </div>
              {totalItems > 0 && (
                <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {totalItems}
                </span>
              )}
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearCartClick}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Kosongkan
              </button>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Keranjang kosong</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Pilih produk untuk ditambahkan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {items.map((item) => (
                <CartItem
                  key={item.product_id}
                  item={item}
                  onUpdateQty={handleUpdateQtyClick}
                  onRemove={handleRemoveItemClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-3 bg-white/80 dark:bg-gray-900">
            <div className="flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/60 rounded-2xl px-3.5 py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="app-button w-full py-3.5 px-4 text-sm cursor-pointer"
            >
              Bayar — {formatCurrency(totalPrice)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
