import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifySupervisorCode } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, KeyRound, X, CheckCircle2 } from 'lucide-react';

export default function AdminApprovalModal({
  isOpen,
  onClose,
  onApproved,
  title = 'Persetujuan Administrator',
  message = 'Tindakan ini memerlukan 6-digit Kode OTP Supervisi dari Administrator.',
}) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const userWarung = user?.warung_name || user?.name || 'Warung';

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Masukkan 6 digit Kode OTP Supervisi Admin.');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      await verifySupervisorCode(cleanCode, userWarung);
      showToast(`Persetujuan Kode OTP Supervisi untuk ${userWarung} berhasil!`, 'success');
      setCode('');
      onApproved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || `Kode OTP Supervisi untuk ${userWarung} salah atau kedaluwarsa.`;
      setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
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
                <p className="text-xs text-gray-400">Otorisasi OTP Supervisi ({userWarung})</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-3.5 rounded-2xl">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Masukkan Kode OTP Supervisi ({userWarung})
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-black tracking-widest font-mono text-center focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-gray-50 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-300"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 text-center">
                Minta 6 digit kode OTP khusus <span className="font-semibold text-amber-600 dark:text-amber-400">{userWarung}</span> yang tampil di layar Admin.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={verifying || code.length < 6}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {verifying ? (
                  'Memverifikasi...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verifikasi OTP
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
