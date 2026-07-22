import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: { btn: 'bg-red-600 hover:bg-red-700 text-white', icon: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    primary: { btn: 'bg-primary-600 hover:bg-primary-700 text-white', icon: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
    warning: { btn: 'bg-amber-500 hover:bg-amber-600 text-white', icon: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  };

  const colors = variantStyles[variant] || variantStyles.danger;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className={`absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} />

      <div className={`relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${colors.icon}`}>
          {variant === 'danger' ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <Trash2 className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-center text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg cursor-pointer ${colors.btn}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                {confirmText}
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
