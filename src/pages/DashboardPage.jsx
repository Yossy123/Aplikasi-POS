import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/pos/SearchBar';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import CheckoutModal from '../components/checkout/CheckoutModal';
import AddProductModal from '../components/product/AddProductModal';
import AdminCancellationWidget from '../components/ui/AdminCancellationWidget';
import { useAuth } from '../context/AuthContext';
import { getTodayRevenue } from '../api/transactionApi';
import { formatCurrency } from '../utils/formatCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, TrendingUp, DollarSign, Store, X, Building2, Plus, Filter } from 'lucide-react';

const WARUNG_OPTIONS = [
  { label: 'Semua Warung', value: '' },
  { label: 'Soto Warung 1', value: 'Soto Warung 1' },
  { label: 'Soto Warung 2', value: 'Soto Warung 2' },
  { label: 'Jus Warung 3', value: 'Jus Warung 3' },
  { label: 'Seblak Warung 4', value: 'Seblak Warung 4' },
];

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWarung, setSelectedWarung] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [byWarung, setByWarung] = useState([]);
  const [showWarungModal, setShowWarungModal] = useState(false);
  const { addItem, totalItems } = useCart();
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      const params = { search, per_page: 50 };
      if (isAdmin && selectedWarung) {
        params.warung_name = selectedWarung;
      }
      const res = await getProducts(params);
      setProducts(res.data.data);
    } catch {
      showToast('Gagal memuat daftar produk.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedWarung, isAdmin, showToast]);

  const fetchTodayRevenue = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await getTodayRevenue();
      setTodayRevenue(res.data.data.today_revenue);
      setByWarung(res.data.data.by_warung || []);
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
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                    Kasir POS
                    {!isAdmin && user?.warung_name && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                        {user.warung_name}
                      </span>
                    )}
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isAdmin
                      ? 'Pilih produk untuk transaksi kasir (semua warung)'
                      : `Menampilkan daftar menu khusus ${user?.warung_name || 'Warung'}`}
                  </p>
                </div>

                {/* Mobile: cart button + cart count */}
                <div className="flex items-center gap-2 lg:hidden">
                  {isAdmin && (
                    <button
                      onClick={() => setShowWarungModal(true)}
                      className="flex items-center gap-1.5 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100/60 dark:border-emerald-900/40 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-100/50 transition-all"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(todayRevenue)}</span>
                    </button>
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

              {/* Admin Widgets - Desktop */}
              {isAdmin && (
                <div className="hidden lg:flex items-center gap-3 self-start sm:self-center">
                  <AdminCancellationWidget />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowWarungModal(true)}
                    className="flex items-center gap-3 bg-linear-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-900/40 px-4 py-2 rounded-2xl cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group text-left"
                  >
                    <div className="w-8 h-8 bg-emerald-500 dark:bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Penghasilan Hari Ini</p>
                        <span className="bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                          {byWarung.length} Warung
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(todayRevenue)}</p>
                    </div>
                  </motion.button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1">
                <SearchBar value={search} onChange={setSearch} />
              </div>

              {/* Filter Warung Dropdown (Admin Only) */}
              {isAdmin && (
                <div className="relative min-w-42.5">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedWarung}
                    onChange={(e) => setSelectedWarung(e.target.value)}
                    className="w-full pl-9 pr-7 py-2 bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    {WARUNG_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isAdmin && (
                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-500/20 transition-all cursor-pointer shrink-0 justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Menu</span>
                </button>
              )}
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <ProductGrid products={products} loading={loading} onAdd={addItem} />
          </div>
        </div>

        {/* Desktop Cart */}
        <div className="hidden lg:block w-80 xl:w-90">
          <CartPanel onCheckout={() => setShowCheckout(true)} />
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white dark:bg-gray-900 z-10"
            >
              <CartPanel
                onCheckout={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Add Product / Menu Modal */}
      <AddProductModal
        isOpen={showAddMenuModal}
        onClose={() => setShowAddMenuModal(false)}
        onSuccess={fetchProducts}
      />

      {/* Modal Breakdown Penghasilan Per-Warung (Admin Only) */}
      <AnimatePresence>
        {showWarungModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setShowWarungModal(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 dark:border-gray-800 space-y-5 z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Rincian Pendapatan Hari Ini
                    </h3>
                    <p className="text-xs text-gray-400">Rincian omset harian per warung / outlet</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWarungModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Total Card */}
              <div className="bg-linear-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-2xl text-center">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total Seluruh Warung</p>
                <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{formatCurrency(todayRevenue)}</p>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {byWarung.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">Belum ada transaksi hari ini.</p>
                ) : (
                  byWarung.map((item) => (
                    <div
                      key={item.warung_name}
                      className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs border border-gray-100 dark:border-gray-600">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.warung_name}</p>
                          <p className="text-[11px] text-gray-400">{item.transaction_count} transaksi</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.revenue)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowWarungModal(false)}
                  className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
