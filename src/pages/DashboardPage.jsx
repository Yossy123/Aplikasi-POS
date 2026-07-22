import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/pos/SearchBar';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import CheckoutModal from '../components/checkout/CheckoutModal';
import { useAuth } from '../context/AuthContext';
import { getTodayRevenue } from '../api/transactionApi';
import { formatCurrency } from '../utils/formatCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const { addItem, totalItems, items } = useCart();
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts({ search, per_page: 50 });
      setProducts(res.data.data);
    } catch {
      showToast('Gagal memuat daftar produk.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  const fetchTodayRevenue = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await getTodayRevenue();
      setTodayRevenue(res.data.data.today_revenue);
    } catch {
      showToast('Gagal memuat pendapatan hari ini.', 'error');
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    if (isAdmin) fetchTodayRevenue();
  }, [isAdmin, fetchTodayRevenue]);

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    fetchProducts();
    if (isAdmin) fetchTodayRevenue();
  };

  return (
    <>
      <div className="flex h-[calc(100vh-56px)] lg:h-screen">
        {/* Left: Products */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100/80 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center justify-between flex-1">
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Kasir</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Pilih produk untuk ditambahkan ke keranjang</p>
                </div>

                {/* Mobile: cart button + cart count */}
                <div className="flex items-center gap-2 lg:hidden">
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100/60 dark:border-emerald-900/40 px-3 py-1.5 rounded-xl">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(todayRevenue)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className="relative p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-xs"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-red-500/30">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Admin Revenue Card - Desktop */}
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-100/50 dark:border-emerald-900/30 px-4 py-2.5 rounded-2xl self-start sm:self-center"
                >
                  <div className="w-9 h-9 bg-emerald-500 dark:bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Penghasilan Hari Ini</p>
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100">{formatCurrency(todayRevenue)}</p>
                  </div>
                </motion.div>
              )}
            </div>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <ProductGrid products={products} loading={loading} onAdd={addItem} />
          </div>
        </div>

        {/* Desktop Cart */}
        <div className="hidden lg:block w-80 xl:w-[360px]">
          <CartPanel onCheckout={() => setShowCheckout(true)} />
        </div>

        {/* Mobile Cart Overlay */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCart(false)} />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 h-full w-[85vw] max-w-sm shadow-2xl"
              >
                <CartPanel onCheckout={() => { setShowCart(false); setShowCheckout(true); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
