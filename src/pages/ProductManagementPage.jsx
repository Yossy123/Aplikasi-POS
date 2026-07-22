import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Package, Search, Plus, Edit3, Trash2, X, Tag, Box, DollarSign } from 'lucide-react';

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const validate = (formData) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama produk harus diisi.';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Harga harus lebih dari 0.';
    if (formData.stock === '' || parseInt(formData.stock) < 0) errors.stock = 'Stok tidak valid.';
    return errors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validate(form);
    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] || null }));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ search, per_page: 10, page });
      setProducts(res.data.data);
      setLastPage(res.data.meta?.last_page || 1);
      setTotal(res.data.meta?.total || 0);
    } catch {
      showToast('Gagal memuat daftar produk.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchProducts(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [page]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', price: '', stock: '' });
    setFieldErrors({}); setTouched({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({ name: product.name, price: product.price, stock: product.stock });
    setFieldErrors({}); setTouched({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    setTouched({ name: true, price: true, stock: true });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock) });
        showToast('Produk berhasil diperbarui.', 'success');
      } else {
        await createProduct({ name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock) });
        showToast('Produk berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan produk.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showToast(`Produk "${deleteTarget.name}" berhasil dihapus.`, 'success');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      showToast('Gagal menghapus produk.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${
      touched[field] && fieldErrors[field]
        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30'
        : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50/50 hover:bg-white focus:bg-white'
    }`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Manajemen Produk</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola daftar produk toko Anda</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-gray-800/70">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Produk</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Harga</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stok</th>
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
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/40 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium tabular-nums">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        product.stock > 10
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : product.stock > 0
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock}
                      </span>
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

      {/* Modal Form */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 shadow-black/5 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/40 rounded-xl flex items-center justify-center">
                    {editingProduct ? <Edit3 className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" /> : <Plus className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    Nama Produk
                  </label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => handleBlur('name')} className={inputClass('name')} required />
                  {touched.name && fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    Harga (Rp)
                  </label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} onBlur={() => handleBlur('price')} className={inputClass('price')} min="0" step="100" required />
                  {touched.price && fieldErrors.price && <p className="mt-1 text-xs text-red-500">{fieldErrors.price}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Box className="w-3.5 h-3.5 text-gray-400" />
                    Stok
                  </label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} onBlur={() => handleBlur('stock')} className={inputClass('stock')} min="0" required />
                  {touched.stock && fieldErrors.stock && <p className="mt-1 text-xs text-red-500">{fieldErrors.stock}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    Batal
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all cursor-pointer">
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
