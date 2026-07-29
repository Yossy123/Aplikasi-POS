import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, deleteProduct } from '../api/productApi';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import AddProductModal from '../components/product/AddProductModal';
import { Package, Search, Plus, Edit3, Trash2, Store, Filter } from 'lucide-react';

const WARUNG_OPTIONS = [
  { label: 'Semua Warung', value: '' },
  { label: 'Soto Warung 1', value: 'Soto Warung 1' },
  { label: 'Soto Warung 2', value: 'Soto Warung 2' },
  { label: 'Jus Warung 3', value: 'Jus Warung 3' },
  { label: 'Seblak Warung 4', value: 'Seblak Warung 4' },
];

export default function ProductManagementPage() {
  const { isAdmin, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWarung, setSelectedWarung] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, per_page: 10, page };
      if (isAdmin && selectedWarung) {
        params.warung_name = selectedWarung;
      }
      const res = await getProducts(params);
      setProducts(res.data.data);
      setLastPage(res.data.meta?.last_page || 1);
      setTotal(res.data.meta?.total || 0);
    } catch {
      showToast('Gagal memuat daftar menu.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedWarung, page, isAdmin, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchProducts(); }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedWarung]);

  useEffect(() => { fetchProducts(); }, [page]);

  const openCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showToast(`Menu "${deleteTarget.name}" berhasil dihapus.`, 'success');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      showToast('Gagal menghapus menu.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getWarungBadgeStyle = (warungName) => {
    if (!warungName) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    if (warungName.includes('Soto')) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50';
    if (warungName.includes('Jus')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50';
    if (warungName.includes('Seblak')) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50';
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Manajemen Menu / Produk
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin
              ? 'Kelola daftar menu untuk seluruh warung'
              : `Kelola daftar menu untuk ${user?.warung_name || 'Warung'}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Tambah Menu Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama menu..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Filter Warung (Admin Only) */}
        {isAdmin && (
          <div className="relative min-w-50">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedWarung}
              onChange={(e) => {
                setSelectedWarung(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              {WARUNG_OPTIONS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-gray-800/70">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Produk</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Warung</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Harga</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/80">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
                      Memuat...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                    <Package className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm font-medium">Tidak ada produk ditemukan</p>
                  </td>
                </tr>
              ) : (
                products.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/40 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${getWarungBadgeStyle(product.warung_name)}`}>
                        <Store className="w-3 h-3 opacity-70" />
                        {product.warung_name || 'Semua Warung'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium tabular-nums">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total {total} produk — Halaman {page} dari {lastPage}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= lastPage}
                onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Menu Modal */}
      <AddProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchProducts}
        initialData={editingProduct}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
