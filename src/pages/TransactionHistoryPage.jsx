import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTransactions } from '../api/transactionApi';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../context/ToastContext';
import { Search, ScrollText, FilterX, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { search, payment_method: paymentMethod, date_from: dateFrom, date_to: dateTo, page, per_page: 15 };
      const res = await getTransactions(params);
      setTransactions(res.data.data);
      setLastPage(res.data.meta?.last_page || 1);
    } catch {
      showToast('Gagal memuat riwayat transaksi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchTransactions(), 300);
    return () => clearTimeout(timer);
  }, [search, paymentMethod, dateFrom, dateTo, page]);

  const handleResetFilters = () => {
    setSearch(''); setPaymentMethod(''); setDateFrom(''); setDateTo(''); setPage(1);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  const hasFilters = search || paymentMethod || dateFrom || dateTo;

  return (
    <div className="app-page">
      <div className="mb-6 hidden lg:block">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Riwayat Transaksi</h1>
        <p className="text-sm text-gray-500 mt-1">Daftar transaksi penjualan POS</p>
      </div>

      {/* Filters */}
      <div className="app-panel p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cari Invoice</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="INV-XXXX..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-gray-50/50 hover:bg-white focus:bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Metode Bayar</label>
            <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-gray-50/50 hover:bg-white focus:bg-white">
              <option value="">Semua Metode</option>
              <option value="cash">Tunai (Cash)</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-gray-50/50 hover:bg-white focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-gray-50/50 hover:bg-white focus:bg-white" />
          </div>
        </div>
        {hasFilters && (
          <div className="flex justify-end pt-1">
            <button onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors cursor-pointer">
              <FilterX className="w-3.5 h-3.5" />
              Bersihkan Filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="app-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="text-left px-6 py-4">No. Invoice</th>
                <th className="text-left px-6 py-4">Waktu Transaksi</th>
                <th className="text-left px-6 py-4">Kasir</th>
                <th className="text-center px-6 py-4">Metode</th>
                <th className="text-right px-6 py-4">Total Tagihan</th>
                <th className="text-center px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <ScrollText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-medium">Tidak ada transaksi ditemukan.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{tx.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(tx.created_at)}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{tx.user?.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.payment_method === 'qris' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {tx.payment_method === 'qris' ? 'QRIS' : 'Tunai'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 tabular-nums">{formatCurrency(tx.total_price)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => navigate(`/transactions/${tx.id}`, { state: { from: '/transactions' } })}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-semibold hover:underline cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="px-6 py-4 bg-gray-50/40 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Halaman {page} dari {lastPage}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                <ChevronLeft className="w-3 h-3" /> Sebelumnya
              </button>
              <button disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Berikutnya <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
