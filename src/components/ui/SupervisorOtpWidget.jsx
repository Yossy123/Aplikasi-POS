import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getSupervisorCode, regenerateSupervisorCode } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { Shield, RefreshCw, Store, X, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupervisorOtpWidget() {
  const { isAdmin } = useAuth();
  const [warungs, setWarungs] = useState([]);
  const [loadingWarung, setLoadingWarung] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCodes = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await getSupervisorCode();
      setWarungs(res.data.warungs || []);
    } catch {
      /* ignore */
    }
  }, [isAdmin]);

  const handleRegenerate = async (warungName = null) => {
    if (!isAdmin) return;
    setLoadingWarung(warungName || 'all');
    try {
      const res = await regenerateSupervisorCode(warungName);
      setWarungs(res.data.warungs || []);
    } catch {
      /* ignore */
    } finally {
      setLoadingWarung(null);
    }
  };

  useEffect(() => {
    fetchCodes();
    const interval = setInterval(fetchCodes, 10000);
    return () => clearInterval(interval);
  }, [fetchCodes]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setWarungs((prev) =>
        prev.map((w) => ({
          ...w,
          expires_in_seconds: w.expires_in_seconds > 0 ? w.expires_in_seconds - 1 : 0,
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isAdmin) return null;

  const formatCode = (c) => (c && c.length === 6 ? `${c.slice(0, 3)} ${c.slice(3)}` : c);

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
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Kode OTP Supervisi
                    </h3>
                    <p className="text-xs text-gray-400">
                      Kode 6-digit untuk otorisasi pembatalan per warung
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Warungs List */}
              <div className="space-y-3 max-h-[55vh] overflow-y-auto">
                {warungs.map((w) => (
                  <div
                    key={w.warung_name}
                    className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/70 dark:border-amber-900/50 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-gray-800 dark:text-gray-200">
                        <div className="w-7 h-7 bg-amber-500/15 dark:bg-amber-400/15 rounded-lg flex items-center justify-center">
                          <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        {w.warung_name}
                      </div>
                      <button
                        onClick={() => handleRegenerate(w.warung_name)}
                        disabled={loadingWarung === w.warung_name}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40 hover:bg-amber-200/80 dark:hover:bg-amber-900/70 rounded-lg transition-colors cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${loadingWarung === w.warung_name ? 'animate-spin' : ''}`}
                        />
                        Reset
                      </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                      <p className="text-2xl font-black font-mono tracking-[0.25em] text-amber-600 dark:text-amber-400">
                        {formatCode(w.code)}
                      </p>
                      <span className="text-xs text-gray-400 font-semibold tabular-nums bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                        {w.expires_in_seconds}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <button
                  onClick={() => handleRegenerate(null)}
                  disabled={!!loadingWarung}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold hover:bg-amber-200/80 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingWarung === 'all' ? 'animate-spin' : ''}`} />
                  Reset Semua Warung
                </button>
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
        className="w-full flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 px-3 py-2.5 rounded-2xl shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer text-left group"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            OTP Supervisi
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
            Lihat Kode OTP
            <KeyRound className="w-3 h-3 text-amber-500" />
          </span>
        </div>
      </button>

      {/* Modal rendered via Portal to document.body */}
      {modal}
    </>
  );
}
