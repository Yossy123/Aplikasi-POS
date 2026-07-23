import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProduct, updateProduct } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { X, Tag, DollarSign, Box, Plus, Edit3, Utensils, Store } from 'lucide-react';

const WARUNG_OPTIONS = [
  'Soto Warung 1',
  'Soto Warung 2',
  'Jus Warung 3',
  'Seblak Warung 4',
];

export default function AddProductModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { user } = useAuth();
  const isKasir = user?.role === 'kasir';
  const kasirWarung = user?.warung_name;

  const [form, setForm] = useState({
    name: initialData?.name || '',
    price: initialData?.price ? String(initialData.price) : '',
    stock: initialData?.stock !== undefined ? String(initialData.stock) : '100',
    warung_name: initialData?.warung_name || (isKasir ? kasirWarung : WARUNG_OPTIONS[0]),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        price: initialData.price ? String(initialData.price) : '',
        stock: initialData.stock !== undefined ? String(initialData.stock) : '100',
        warung_name: initialData.warung_name || (isKasir ? kasirWarung : WARUNG_OPTIONS[0]),
      });
    } else {
      setForm({
        name: '',
        price: '',
        stock: '100',
        warung_name: isKasir ? kasirWarung : WARUNG_OPTIONS[0],
      });
    }
  }, [initialData, isOpen, isKasir, kasirWarung]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const validate = (formData) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama menu harus diisi.';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Harga harus lebih dari 0.';
    if (formData.stock === '' || parseInt(formData.stock) < 0) errors.stock = 'Stok tidak valid.';
    if (!formData.warung_name) errors.warung_name = 'Pilih warung terlebih dahulu.';
    return errors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validate(form);
    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    setTouched({ name: true, price: true, stock: true, warung_name: true });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        warung_name: form.warung_name,
      };

      if (initialData) {
        await updateProduct(initialData.id, payload);
        showToast(`Menu "${payload.name}" berhasil diperbarui.`, 'success');
      } else {
        await createProduct(payload);
        showToast(`Menu "${payload.name}" berhasil ditambahkan!`, 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan menu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${
      touched[field] && fieldErrors[field]
        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30 dark:bg-red-900/20'
        : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50/50 hover:bg-white focus:bg-white dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-100'
    }`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      >
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800 space-y-5 z-10"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/60 dark:to-primary-900/60 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                {initialData ? <Edit3 className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {initialData ? 'Edit Menu / Produk' : 'Tambah Menu Baru'}
                </h3>
                <p className="text-xs text-gray-400">Isi rincian menu makanan, minuman, atau produk</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Warung Name (Pilih Warung) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Warung Pemilik Menu
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                {isKasir ? (
                  <input
                    type="text"
                    value={kasirWarung || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={form.warung_name}
                    onChange={(e) => setForm({ ...form, warung_name: e.target.value })}
                    onBlur={() => handleBlur('warung_name')}
                    className={inputClass('warung_name')}
                    required
                  >
                    {WARUNG_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {touched.warung_name && fieldErrors.warung_name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.warung_name}</p>
              )}
            </div>

            {/* Nama Menu */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Nama Menu / Produk
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onBlur={() => handleBlur('name')}
                  placeholder="Misal: Soto Ayam, Jus Alpukat..."
                  className={inputClass('name')}
                  required
                />
              </div>
              {touched.name && fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            {/* Harga */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Harga (Rp)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  onBlur={() => handleBlur('price')}
                  placeholder="15000"
                  className={inputClass('price')}
                  required
                />
              </div>
              {touched.price && fieldErrors.price && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.price}</p>
              )}
            </div>

            {/* Stok */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Stok Awal
              </label>
              <div className="relative">
                <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  onBlur={() => handleBlur('stock')}
                  placeholder="100"
                  className={inputClass('stock')}
                  required
                />
              </div>
              {touched.stock && fieldErrors.stock && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.stock}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-xs font-bold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all shadow-md shadow-primary-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {saving ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {initialData ? 'Simpan Perubahan' : 'Tambah Menu'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
