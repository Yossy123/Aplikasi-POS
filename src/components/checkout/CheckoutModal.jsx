import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { createTransaction } from '../../api/transactionApi';
import PaymentCash from './PaymentCash';
import PaymentQRIS from './PaymentQRIS';
import Receipt from '../receipt/Receipt';
import AdminApprovalModal from '../ui/AdminApprovalModal';
import { useAuth } from '../../context/AuthContext';
import { X, Banknote, QrCode, CheckCircle, Printer } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { escapeHtml } from '../../utils/escapeHtml';
import { STORE_CONFIG } from '../../utils/storeConfig';

export default function CheckoutModal({ onClose, onSuccess }) {
  const { isAdmin } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdTransaction, setCreatedTransaction] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const handleCancelClick = () => {
    if (createdTransaction) {
      handleFinish();
    } else if (isAdmin) {
      clearCart();
      onClose();
    } else {
      setShowApprovalModal(true);
    }
  };

  const handlePayment = async (cashPaid = null) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        payment_method: paymentMethod,
        items: items.map((item) => ({ product_id: item.product_id, qty: item.qty })),
      };
      if (paymentMethod === 'cash') payload.cash_paid = cashPaid;
      const res = await createTransaction(payload);
      setCreatedTransaction(res.data.data);
      clearCart();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memproses transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!createdTransaction) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const tx = createdTransaction;
    const formatDate = (d) => new Date(d).toLocaleString('id-ID', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const itemRows = (tx.details || []).map(item => `
      <tr>
        <td style="padding:4px 0;font-size:12px;">${escapeHtml(item.product?.name || 'Produk')}</td>
        <td style="text-align:center;padding:4px 8px;font-size:12px;">${item.qty}</td>
        <td style="text-align:right;padding:4px 0;font-size:12px;">Rp ${Number(item.price).toLocaleString('id-ID')}</td>
        <td style="text-align:right;padding:4px 0;font-size:12px;">Rp ${Number(item.subtotal).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');
    printWindow.document.write(`
      <html><head><title>Struk - ${escapeHtml(tx.invoice_number)}</title>
      <style>
        @page{margin:0;size:80mm auto;}
        body{font-family:'Courier New',monospace;font-size:12px;margin:0;padding:10px;color:#1e293b;}
        .receipt{max-width:80mm;margin:0 auto;}
        .header{text-align:center;margin-bottom:10px;}
        .header h2{margin:0;font-size:14px;font-weight:bold;}
        .header p{margin:2px 0;font-size:10px;color:#666;}
        hr{border:none;border-top:1px dashed #ccc;margin:8px 0;}
        .meta{font-size:10px;color:#666;}
        .meta div{display:flex;justify-content:space-between;margin:2px 0;}
        table{width:100%;border-collapse:collapse;}
        th{font-size:10px;text-align:left;padding:4px 0;border-bottom:1px dashed #ccc;}
        .total{font-weight:bold;font-size:13px;display:flex;justify-content:space-between;margin:4px 0;}
        .footer{text-align:center;margin-top:10px;font-size:10px;color:#666;}
      </style></head><body>
      <div class="receipt">
        <div class="header"><h2>${escapeHtml(STORE_CONFIG.name)}</h2><p>${escapeHtml(STORE_CONFIG.address)}</p><p>${escapeHtml(STORE_CONFIG.phone)}</p></div>
        <hr>
        <div class="meta">
          <div><span>No. Invoice:</span><span>${escapeHtml(tx.invoice_number)}</span></div>
          <div><span>Tanggal:</span><span>${formatDate(tx.created_at)}</span></div>
          <div><span>Kasir:</span><span>${escapeHtml(tx.user?.name || 'Kasir')}</span></div>
        </div>
        <hr>
        <table><thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Harga</th><th style="text-align:right;">Subtotal</th></tr></thead><tbody>${itemRows}</tbody></table>
        <hr>
        <div class="total"><span>TOTAL</span><span>Rp ${Number(tx.total_price).toLocaleString('id-ID')}</span></div>
        <div class="meta">
          <div><span>Metode Bayar:</span><span style="text-transform:uppercase;font-weight:600;">${escapeHtml(tx.payment_method)}</span></div>
          ${tx.payment_method === 'cash' ? `<div><span>Bayar (Tunai):</span><span>Rp ${Number(tx.cash_paid).toLocaleString('id-ID')}</span></div><div><span>Kembalian:</span><span style="color:#059669;">Rp ${Number(tx.change).toLocaleString('id-ID')}</span></div>` : ''}
        </div>
        <hr>
        <div class="footer"><p>Terima Kasih Atas Kunjungan Anda</p><p>Barang yang sudah dibeli</p><p>tidak dapat ditukar/dikembalikan</p></div>
      </div>
      <script>window.onload=function(){window.print();window.close();}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleFinish = () => onSuccess();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancelClick} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col shadow-black/5 border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {createdTransaction ? 'Transaksi Berhasil' : 'Pilih Metode Pembayaran'}
          </h3>
          {!createdTransaction && (
            <button onClick={handleCancelClick} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900 mb-4"
            >
              <span className="w-5 h-5 bg-red-100 dark:bg-red-900/60 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">!</span>
              {errorMsg}
            </motion.div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs flex flex-col items-center justify-center z-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mb-4" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Memproses Transaksi...</p>
            </div>
          )}

          {createdTransaction ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pembayaran Berhasil!</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Invoice: {createdTransaction.invoice_number}</p>
                </div>
              </div>

              {/* Only admin sees receipt preview */}
              {isAdmin && (
                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-gray-800/30">
                  <Receipt transaction={createdTransaction} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Struk
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-[2] bg-primary-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  Transaksi Baru
                </button>
              </div>
            </div>
          ) : !paymentMethod ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('cash')}
                className="flex flex-col items-center justify-center p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/20 rounded-2xl transition-all duration-200 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Banknote className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Tunai</span>
                <span className="text-xs text-gray-400 mt-1">Pembayaran manual</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('qris')}
                className="flex flex-col items-center justify-center p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 rounded-2xl transition-all duration-200 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">QRIS</span>
                <span className="text-xs text-gray-400 mt-1">Scan kode QR</span>
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMethod(null)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors mb-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke metode pembayaran
              </button>

              {paymentMethod === 'cash' ? (
                <PaymentCash total={totalPrice} onPaymentSuccess={handlePayment} onError={(e) => setErrorMsg(e)} />
              ) : (
                <PaymentQRIS total={totalPrice} onPaymentSuccess={() => handlePayment()} />
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Admin Approval Modal for Checkout Cancellation */}
      <AdminApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onApproved={() => {
          setShowApprovalModal(false);
          onClose();
        }}
        type="cancel_checkout"
        title="Konfirmasi Pembatalan Checkout"
        message="Membatalkan proses pembayaran / checkout oleh Kasir memerlukan konfirmasi dan persetujuan Admin."
      />
    </motion.div>
  );
}
