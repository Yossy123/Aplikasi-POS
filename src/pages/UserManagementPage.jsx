import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Users, Search, Plus, Edit3, Trash2, X, User, Mail, ShieldAlert, KeyRound, Store, Building2 } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'kasir', warung_name: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const validate = (formData) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama harus diisi.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Email tidak valid.';
    if (!editingUser && !formData.password) errors.password = 'Password harus diisi.';
    if (formData.password) {
      if (formData.password.length < 8) {
        errors.password = 'Password minimal 8 karakter.';
      } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password harus mengandung huruf dan angka.';
      }
    }
    return errors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validate(form);
    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] || null }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ search, per_page: 10, page });
      setUsers(res.data.data);
      setLastPage(res.data.meta?.last_page || 1);
      setTotal(res.data.meta?.total || 0);
    } catch {
      showToast('Gagal memuat daftar pengguna.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [page]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'kasir', warung_name: '' });
    setFieldErrors({}); setTouched({});
    setShowModal(true);
  };

  const openEdit = (userData) => {
    setEditingUser(userData);
    setForm({
      name: userData.name,
      email: userData.email,
      password: '',
      role: userData.role,
      warung_name: userData.warung_name || '',
    });
    setFieldErrors({}); setTouched({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    setTouched({ name: true, email: true, password: true, role: true });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingUser && !payload.password) delete payload.password; // Don't send empty password on edit

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        showToast('Pengguna berhasil diperbarui.', 'success');
      } else {
        await createUser(payload);
        showToast('Pengguna berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Gagal menyimpan pengguna.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      showToast(`Pengguna "${deleteTarget.name}" berhasil dihapus.`, 'success');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus pengguna.', 'error');
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
    <div className="app-page">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Manajemen Kasir / Akun</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola akun kasir dan administrator</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Tambah Kasir
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
            placeholder="Cari nama atau email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="app-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-gray-800/70">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peran (Role)</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dibuat Pada</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                    <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm font-medium">Tidak ada akun ditemukan</p>
                  </td>
                </tr>
              ) : (
                users.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400'}`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                              {item.warung_name && (
                                <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Store className="w-2.5 h-2.5" />
                                  {item.warung_name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                        {item.role === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {item.role_label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {item.id !== currentUser.id && (
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
            <span className="text-xs text-gray-500 dark:text-gray-400">Total {total} pengguna — Halaman {page} dari {lastPage}</span>
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
                  <div className="w-9 h-9 bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/40 rounded-xl flex items-center justify-center">
                    {editingUser ? <Edit3 className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" /> : <Plus className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Nama Lengkap
                  </label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => handleBlur('name')} className={inputClass('name')} required />
                  {touched.name && fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    Alamat Email
                  </label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={() => handleBlur('email')} className={inputClass('email')} required />
                  {touched.email && fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                    {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                  </label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onBlur={() => handleBlur('password')} className={inputClass('password')} minLength={editingUser ? undefined : 8} required={!editingUser} />
                  {touched.password && fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
                    Peran (Role)
                  </label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option value="kasir">Kasir</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {form.role === 'kasir' && (
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <Store className="w-3.5 h-3.5 text-gray-400" />
                      Nama Warung / Outlet
                    </label>
                    <input
                      type="text"
                      value={form.warung_name}
                      onChange={(e) => setForm({ ...form, warung_name: e.target.value })}
                      placeholder="Misal: Warung 1, Warung Cabang A..."
                      className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all border-gray-200 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50/50 hover:bg-white focus:bg-white dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    Batal
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-linear-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all cursor-pointer">
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
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${deleteTarget?.name}"? Pengguna tidak akan dapat login kembali setelah ini.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
