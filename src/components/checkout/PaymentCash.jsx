import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Check } from 'lucide-react';

export default function PaymentCash({ total, onPaymentSuccess, onError }) {
  const [cashPaid, setCashPaid] = useState('');
  const [change, setChange] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedQuick, setSelectedQuick] = useState(null);

  const handleCashChange = (value) => {
    setCashPaid(value);
    const parsedCash = parseFloat(value) || 0;
    if (parsedCash >= total) {
      setChange(parsedCash - total);
      setErrorMsg('');
    } else {
      setChange(0);
    }
  };

  const handleQuickPay = (amount) => {
    setSelectedQuick(amount);
    handleCashChange(amount.toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedCash = parseFloat(cashPaid) || 0;
    if (parsedCash < total) {
      setErrorMsg('Uang yang dibayarkan kurang dari total belanja.');
      return;
    }
    onPaymentSuccess(parsedCash);
  };

  const suggestions = [];
  const baseSuggestions = [50000, 100000];
  baseSuggestions.forEach(s => { if (s > total && !suggestions.includes(s)) suggestions.push(s); });
  const roundedTotal = Math.ceil(total / 10000) * 10000;
  if (roundedTotal > total && !suggestions.includes(roundedTotal)) suggestions.push(roundedTotal);
  if (!suggestions.includes(total)) suggestions.push(total);
  suggestions.sort((a, b) => a - b);

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-900"
          >
            <span className="w-4 h-4 bg-red-100 dark:bg-red-900/60 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0">!</span>
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 rounded-2xl p-5 text-center">
        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Total Tagihan</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(total)}</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Uang Diterima (Rp)</label>
        <input
          type="number"
          value={cashPaid}
          onChange={(e) => handleCashChange(e.target.value)}
          placeholder="0"
          className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xl font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 tabular-nums"
          autoFocus
          required
        />
      </div>

      {/* Quick Cash Buttons */}
      <div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleQuickPay(amount)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedQuick === amount
                  ? 'bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-800'
                  : 'bg-gray-50 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-900/20 text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
              }`}
            >
              {selectedQuick === amount && <Check className="w-3 h-3" />}
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
      </div>

      {/* Change */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Kembalian</span>
        </div>
        <span className="text-xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">{formatCurrency(change)}</span>
      </div>

      <button
        type="submit"
        disabled={parseFloat(cashPaid) < total || !cashPaid}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
      >
        Selesaikan Pembayaran
      </button>
    </motion.form>
  );
}
