import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTransaction } from '../api/transactionApi';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Receipt from '../components/receipt/Receipt';
import { ArrowLeft, Printer, Package } from 'lucide-react';

export default function TransactionDetailPage() {
  const { isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();

  const backPath = location.state?.from || '/transactions';

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await getTransaction(id);
        setTransaction(res.data.data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) setErrorMsg('Anda tidak memiliki akses ke transaksi ini.');
        else setErrorMsg('Gagal memuat detail transaksi.');
        showToast('Gagal memuat detail transaksi.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !transaction) return;
    const tx = transaction;
    const formatDate = (d) => new Date(d).toLocaleString('id-ID', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const itemRows = (tx.details || []).map(item => `
      <tr>
        <td style="padding:4px 0;font-size:12px;">${item.product?.name || 'Produk'}</td>
        <td style="text-align:center;padding:4px 8px;font-size:12px;">${item.qty}</td>
        <td style="text-align:right;padding:4px 0;font-size:12px;">Rp ${Number(item.price).toLocaleString('id-ID')}</td>
        <td style="text-align:right;padding:4px 0;font-size:12px;">Rp ${Number(item.subtotal).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');
    printWindow.document.write(`
      <html><head><title>Struk - ${tx.invoice_number}</title>
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
        <div class="header"><h2>SIMPLE POS SHOP</h2><p>Jl. Jenderal Sudirman No. 123</p><p>Telp: 021-98765432</p></div>
        <hr>
        <div class="meta">
          <div><span>No. Invoice:</span><span>${tx.invoice_number}</span></div>
          <div><span>Tanggal:</span><span>${formatDate(tx.created_at)}</span></div>
          <div><span>Kasir:</span><span>${tx.user?.name || 'Kasir'}</span></div>
        </div>
        <hr>
        <table><thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Harga</th><th style="text-align:right;">Subtotal</th></tr></thead><tbody>${itemRows}</tbody></table>
        <hr>
        <div class="total"><span>TOTAL</span><span>Rp ${Number(tx.total_price).toLocaleString('id-ID')}</span></div>
        <div class="meta">
          <div><span>Metode Bayar:</span><span style="text-transform:uppercase;font-weight:600;">${tx.payment_method}</span></div>
          ${tx.payment_method === 'cash' ? `<div><span>Bayar (Tunai):</span><span>Rp ${Number(tx.cash_paid).toLocaleString('id-ID')}</span></div><div><span>Kembalian:</span><span style="color:#059669;">Rp ${Number(tx.change).toLocaleString('id-ID')}</span></div>` : ''}
        </div>
        <hr>
        <div class="footer"><p>Terima Kasih Atas Kunjungan Anda</p><p>Barang yang sudah dibeli</p><p>tidak dapat ditukar/dikembalikan</p></div>
      </div>
      <script>window.onload=function(){window.print();window.close();}<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (errorMsg || !transaction) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <p className="text-red-500 font-medium">{errorMsg || 'Transaksi tidak ditemukan.'}</p>
        <button onClick={() => navigate(backPath)}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors cursor-pointer">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(backPath)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors cursor-pointer print:hidden">
        <ArrowLeft className="w-4.5 h-4.5" />
        Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Left Card */}
        <div className={`${isAdmin ? 'md:col-span-3' : 'md:col-span-5'} bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4 print:hidden`}>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Detail Transaksi</h1>
            <p className="text-xs text-gray-500 mt-0.5">Invoice: {transaction.invoice_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-400 font-medium">Metode Pembayaran</p>
              <p className="text-sm font-semibold text-gray-800 uppercase mt-0.5">{transaction.payment_method}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Operator / Kasir</p>
              <p className="text-sm font-semibold text-gray-800 capitalize mt-0.5">{transaction.user?.name || 'Kasir'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Tanggal</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {new Date(transaction.created_at).toLocaleString('id-ID')}
              </p>
            </div>

            {isAdmin && (
              <>
                <div>
                  <p className="text-gray-400 font-medium">Total Belanja</p>
                  <p className="text-sm font-bold text-primary-600 mt-0.5">{formatCurrency(transaction.total_price)}</p>
                </div>
                {transaction.payment_method === 'cash' && (
                  <>
                    <div>
                      <p className="text-gray-400 font-medium">Uang Diterima</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{formatCurrency(transaction.cash_paid)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Uang Kembalian</p>
                      <p className="text-sm font-semibold text-green-600 mt-0.5">{formatCurrency(transaction.change)}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              Item Belanja
            </h3>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              {transaction.details?.map((item) =>
                isAdmin ? (
                  <div key={item.id} className="flex justify-between items-center p-3 text-xs hover:bg-gray-50/50">
                    <div>
                      <p className="font-semibold text-gray-900">{item.product?.name || 'Produk'}</p>
                      <p className="text-gray-400 mt-0.5">{item.qty} x {formatCurrency(item.price)}</p>
                    </div>
                    <span className="font-bold text-gray-800 tabular-nums">{formatCurrency(item.subtotal)}</span>
                  </div>
                ) : (
                  <div key={item.id} className="flex items-center gap-2 p-3 text-xs hover:bg-gray-50/50">
                    <span className="font-semibold text-gray-900">{item.product?.name || 'Produk'}</span>
                    <span className="text-gray-300">×</span>
                    <span className="text-gray-600">{item.qty}</span>
                  </div>
                )
              )}
            </div>

            {/* Kasir: print button */}
            {!isAdmin && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center gap-2 py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-primary-500/25"
                >
                  <Printer className="w-5 h-5" />
                  Cetak Struk Pelanggan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Admin: Receipt preview */}
        {isAdmin && (
          <div className="md:col-span-2 space-y-4">
            <Receipt transaction={transaction} />
          </div>
        )}
      </div>
    </div>
  );
}
