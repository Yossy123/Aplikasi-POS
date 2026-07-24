import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  getPendingCancellationRequests,
  approveCancellationRequest,
  rejectCancellationRequest,
} from '../../api/cancellationApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, Check, X, Store, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCancellationWidget() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setIsFetching(true);
      const res = await getPendingCancellationRequests();
      setRequests(res.data.data || []);
    } catch {
      /* ignore background error */
    } finally {
      setIsFetching(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleApprove = async (id, warungName) => {
    setLoadingId(id);
    try {
      await approveCancellationRequest(id);
      showToast(`Permintaan pembatalan dari ${warungName} disetujui.`, 'success');
      await fetchRequests();
    } catch {
      showToast('Gagal memproses persetujuan.', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id, warungName) => {
    setLoadingId(id);
    try {
      await rejectCancellationRequest(id);
      showToast(`Permintaan pembatalan dari ${warungName} ditolak.`, 'info');
      await fetchRequests();
    } catch {
      showToast('Gagal memproses penolakan.', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  if (!isAdmin) return null;

  const getTypeLabel = (type, details) => {
    switch (type) {
      case 'clear_cart':
        return 'Kosongkan Keranjang';
      case 'remove_item':
        return details ? `Hapus Item: ${details}` : 'Hapus Item Keranjang';
      case 'cancel_checkout':
        return 'Batal Pembayaran / Checkout';
      case 'cancel_transaction':
        return details ? `Batal Transaksi (${details})` : 'Pembatalan Transaksi';
      default:
        return details || 'Permintaan Pembatalan';
    }
  };

  const modal = isOpen
    ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 dark:border-gray-800 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Konfirmasi Pembatalan Kasir
                    </h3>
                    <p className="text-xs text-gray-400">
                      Permintaan pembatalan pemesanan masing-masing warung
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRequests}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tidak ada permintaan pembatalan
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Semua transaksi kasir berjalan dengan lancar.
                    </p>
                  </div>
                ) : (
                  requests.map((req) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
                          <div className="w-7 h-7 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                            <Store className="w-4 h-4" />
                          </div>
                          {req.warung_name}
                        </div>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              {getTypeLabel(req.type, req.details)}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Kasir: <span className="font-semibold text-gray-700 dark:text-gray-300">{req.user?.name || 'Kasir'}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Oke vs Tidak */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleReject(req.id, req.warung_name)}
                          disabled={loadingId === req.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Tidak (Tolak)
                        </button>
                        <button
                          onClick={() => handleApprove(req.id, req.warung_name)}
                          disabled={loadingId === req.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Oke (Setujui)
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="text-xs text-gray-400 font-medium">
                  Status memuat otomatis setiap 3 detik
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl shadow-2xs transition-all cursor-pointer text-left group border ${
          requests.length > 0
            ? 'bg-gradient-to-r from-red-500 to-amber-600 text-white border-red-400 shadow-red-500/20 animate-pulse'
            : 'bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/20 border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0 ${
            requests.length > 0
              ? 'bg-white/20 text-white'
              : 'bg-gradient-to-br from-amber-500 to-red-600 text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              requests.length > 0 ? 'text-white/90' : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            Persetujuan Admin
          </span>
          <span
            className={`text-xs font-bold flex items-center gap-1 ${
              requests.length > 0 ? 'text-white' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            Batal Kasir
            {requests.length > 0 && (
              <span className="ml-auto bg-white text-red-600 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {requests.length}
              </span>
            )}
          </span>
        </div>
      </button>

      {/* Modal rendered via Portal to document.body */}
      {modal}
    </>
  );
}
