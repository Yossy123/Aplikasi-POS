import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createCancellationRequest,
  getCancellationRequestStatus,
} from '../../api/cancellationApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, RefreshCw, X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminApprovalModal({
  isOpen,
  onClose,
  onApproved,
  title = 'Persetujuan Pembatalan Admin',
  message = 'Permintaan pembatalan ini memerlukan persetujuan dari Administrator.',
  type = 'clear_cart',
  details = '',
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requestId, setRequestId] = useState(null);
  const [requestStatus, setRequestStatus] = useState('initiating'); // initiating, pending, approved, rejected, error
  const [errorMsg, setErrorMsg] = useState('');
  const pollIntervalRef = useRef(null);

  const userWarung = user?.warung_name || user?.name || 'Warung';

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Submit request on modal open
  useEffect(() => {
    if (!isOpen) {
      setRequestId(null);
      setRequestStatus('initiating');
      setErrorMsg('');
      stopPolling();
      return;
    }

    let isMounted = true;

    const startRequest = async () => {
      try {
        setRequestStatus('initiating');
        const res = await createCancellationRequest(type, details);
        if (!isMounted) return;

        const req = res.data.data;
        setRequestId(req.id);
        setRequestStatus('pending');

        // Start polling status
        pollIntervalRef.current = setInterval(async () => {
          try {
            const statusRes = await getCancellationRequestStatus(req.id);
            const updatedReq = statusRes.data.data;

            if (updatedReq.status === 'approved') {
              stopPolling();
              if (isMounted) {
                setRequestStatus('approved');
                showToast(`Pembatalan disetujui oleh Admin!`, 'success');
                setTimeout(() => {
                  onApproved();
                  onClose();
                }, 500);
              }
            } else if (updatedReq.status === 'rejected') {
              stopPolling();
              if (isMounted) {
                setRequestStatus('rejected');
                setErrorMsg('Permintaan pembatalan ditolak oleh Admin.');
              }
            }
          } catch {
            /* ignore transient polling errors */
          }
        }, 2000);
      } catch (err) {
        if (!isMounted) return;
        setRequestStatus('error');
        setErrorMsg(err.response?.data?.message || 'Gagal mengirim permintaan pembatalan ke Admin.');
      }
    };

    startRequest();

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [isOpen, type, details]);

  if (!isOpen) return null;

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      >
        <div className="fixed inset-0" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800 space-y-5 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="text-xs text-gray-400">Pengajuan Pembatalan ({userWarung})</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description / Message */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-3.5 rounded-2xl">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          {/* Status content */}
          <div className="py-4 flex flex-col items-center justify-center text-center space-y-3">
            {requestStatus === 'initiating' && (
              <>
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mengirim permintaan pembatalan...
                </p>
              </>
            )}

            {requestStatus === 'pending' && (
              <>
                <div className="relative">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-spin" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Menunggu Konfirmasi Admin...
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Permintaan telah dikirim ke Dashboard Admin. Harap minta Admin menekan tombol <span className="font-bold text-emerald-600">Oke</span> di layarnya.
                  </p>
                </div>
              </>
            )}

            {requestStatus === 'approved' && (
              <>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Disetujui oleh Admin!
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">Memproses pembatalan...</p>
                </div>
              </>
            )}

            {requestStatus === 'rejected' && (
              <>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
                    Permintaan Ditolak
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{errorMsg}</p>
                </div>
              </>
            )}

            {requestStatus === 'error' && (
              <>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
                    Terjadi Kesalahan
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{errorMsg}</p>
                </div>
              </>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {requestStatus === 'pending' ? 'Batalkan Permintaan' : 'Tutup'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
