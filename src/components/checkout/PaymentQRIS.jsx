import { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { motion } from 'framer-motion';
import { QrCode, Clock, Smartphone } from 'lucide-react';

export default function PaymentQRIS({ total, onPaymentSuccess }) {
  const [countdown, setCountdown] = useState(300);
  const [simulating, setSimulating] = useState(false);

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

  const handleSimulateSuccess = () => {
    setSimulating(true);
    setTimeout(() => onPaymentSuccess(), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 text-center"
    >
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-5">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Tagihan</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(total)}</p>
      </div>

      {/* QR Code */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 max-w-[220px] mx-auto shadow-sm flex flex-col items-center">
        <div className="text-primary-700 dark:text-primary-400 font-extrabold text-sm mb-2 italic tracking-wider">QRIS GPN</div>
        <svg className="w-40 h-40 text-gray-900 dark:text-white" viewBox="0 0 100 100">
          <rect x="0" y="0" width="30" height="30" fill="currentColor" />
          <rect x="5" y="5" width="20" height="20" fill="white" />
          <rect x="10" y="10" width="10" height="10" fill="currentColor" />
          <rect x="70" y="0" width="30" height="30" fill="currentColor" />
          <rect x="75" y="5" width="20" height="20" fill="white" />
          <rect x="80" y="10" width="10" height="10" fill="currentColor" />
          <rect x="0" y="70" width="30" height="30" fill="currentColor" />
          <rect x="5" y="75" width="20" height="20" fill="white" />
          <rect x="80" y="80" width="10" height="10" fill="currentColor" />
          <rect x="35" y="5" width="5" height="15" fill="currentColor" />
          <rect x="45" y="0" width="10" height="5" fill="currentColor" />
          <rect x="60" y="10" width="5" height="10" fill="currentColor" />
          <rect x="35" y="25" width="15" height="5" fill="currentColor" />
          <rect x="55" y="20" width="10" height="15" fill="currentColor" />
          <rect x="5" y="35" width="15" height="10" fill="currentColor" />
          <rect x="25" y="35" width="25" height="5" fill="currentColor" />
          <rect x="55" y="40" width="15" height="20" fill="currentColor" />
          <rect x="75" y="35" width="20" height="5" fill="currentColor" />
          <rect x="0" y="50" width="10" height="5" fill="currentColor" />
          <rect x="15" y="55" width="30" height="5" fill="currentColor" />
          <rect x="75" y="45" width="5" height="20" fill="currentColor" />
          <rect x="85" y="50" width="15" height="15" fill="currentColor" />
          <rect x="35" y="65" width="10" height="20" fill="currentColor" />
          <rect x="50" y="70" width="20" height="5" fill="currentColor" />
          <rect x="55" y="80" width="20" height="15" fill="currentColor" />
          <rect x="80" y="70" width="15" height="5" fill="currentColor" />
        </svg>
        <div className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          Scan QR untuk membayar
        </div>
      </div>

      {/* Timer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-center items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span>
          Menunggu pembayaran... Kadaluarsa dalam{' '}
          <strong className="text-gray-700 dark:text-gray-200 font-mono">{formatTime(countdown)}</strong>
        </span>
      </div>

      <button
        onClick={handleSimulateSuccess}
        disabled={simulating}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 disabled:opacity-50 text-sm cursor-pointer"
      >
        {simulating ? 'Memverifikasi...' : 'Simulasikan Pembayaran Berhasil'}
      </button>
    </motion.div>
  );
}
