import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import CartItem from './CartItem';
import AdminApprovalModal from '../ui/AdminApprovalModal';
import { ShoppingBag, RotateCcw } from 'lucide-react';

export default function CartPanel({ onCheckout }) {
  const { isAdmin } = useAuth();
  const { items, totalPrice, totalItems, updateQty, removeItem, clearCart } = useCart();
  const [pendingAction, setPendingAction] = useState(null);

  const handleClearCartClick = () => {
    if (isAdmin) {
      clearCart();
    } else {
      setPendingAction({ type: 'clear' });
    }
  };

  const handleRemoveItemClick = (productId, itemName = 'Item') => {
    if (isAdmin) {
      removeItem(productId);
    } else {
      setPendingAction({ type: 'remove', productId, itemName });
    }
  };

  const handleUpdateQtyClick = (productId, newQty, itemName = 'Item') => {
    if (newQty <= 0) {
      handleRemoveItemClick(productId, itemName);
    } else {
      updateQty(productId, newQty);
    }
  };

  const handleApproved = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'clear') {
      clearCart();
    } else if (pendingAction.type === 'remove') {
      removeItem(pendingAction.productId);
    }
    setPendingAction(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-gray-700 dark:text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Keranjang</h3>
              {totalItems > 0 && (
                <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
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
        <div className="flex-1 overflow-y-auto px-4">
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
                  onUpdateQty={(pid, qty) => handleUpdateQtyClick(pid, qty, item.name)}
                  onRemove={(pid) => handleRemoveItemClick(pid, item.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 active:shadow-md active:translate-y-0.5 text-sm cursor-pointer"
            >
              Bayar — {formatCurrency(totalPrice)}
            </button>
          </div>
        )}
      </div>

      {/* Supervisor Approval Modal */}
      <AdminApprovalModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onApproved={handleApproved}
        title="Persetujuan Administrator / Supervisi"
        message={
          pendingAction?.type === 'clear'
            ? 'Pengosongan seluruh isi keranjang oleh Kasir memerlukan persetujuan dan verifikasi password Administrator.'
            : `Menghapus item "${pendingAction?.itemName || 'produk'}" dari keranjang oleh Kasir memerlukan verifikasi password Administrator.`
        }
      />
    </>
  );
}
