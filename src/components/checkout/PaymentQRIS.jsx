import { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { motion } from 'framer-motion';
import { Clock, Smartphone, CheckCircle2 } from 'lucide-react';

export default function PaymentQRIS({ total, onPaymentSuccess }) {
  const [countdown, setCountdown] = useState(300);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmPayment = () => {
    setConfirming(true);
    setTimeout(() => onPaymentSuccess(), 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 text-center"
    >
      {/* Total */}
      <div className="bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-4">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Tagihan</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(total)}</p>
      </div>

      {/* QR Code Image */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 max-w-65 mx-auto shadow-sm flex flex-col items-center">
        <div className="text-primary-700 dark:text-primary-400 font-extrabold text-sm mb-2 italic tracking-wider">QRIS DANA</div>
        <div className="w-52 h-52 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 bg-white flex items-center justify-center">
          <img
            src="/qris-dana.png"
            alt="QRIS Dana"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center text-gray-400 text-xs p-4"><svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/></svg><span>Gambar QRIS belum tersedia</span><span class="text-[10px] mt-1">Ganti file /public/qris-dana.png</span></div>';
            }}
          />
        </div>
        <div className="text-[10px] text-gray-400 mt-2.5 font-medium flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          Scan QR dengan aplikasi e-wallet / m-banking
        </div>
      </div>

      {/* Timer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-center items-center gap-1.5">
        <Clock className={`w-3.5 h-3.5 ${countdown === 0 ? 'text-red-500' : 'text-amber-500'}`} />
        {countdown === 0 ? (
          <span className="text-red-500 font-semibold">Kode QR kadaluarsa, buat transaksi baru</span>
        ) : (
          <span>
            Menunggu pembayaran... Kadaluarsa dalam{' '}
            <strong className="text-gray-700 dark:text-gray-200 font-mono">{formatTime(countdown)}</strong>
          </span>
        )}
      </div>

      {/* Confirm Payment Button */}
      <button
        onClick={handleConfirmPayment}
        disabled={confirming || countdown === 0}
        className="w-full bg-linear-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center gap-2"
      >
        {confirming ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Memproses Pembayaran...
          </>
        ) : countdown === 0 ? (
          <span>Kode QR Kadaluarsa</span>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Konfirmasi Pembayaran QRIS Diterima
          </>
        )}
      </button>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        Pastikan pelanggan sudah menyelesaikan pembayaran melalui QRIS sebelum menekan tombol konfirmasi.
      </p>
    </motion.div>
  );
}
