import { useRef, useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '../../context/ToastContext';

export default function Receipt({ transaction }) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);

    try {
      // Create canvas from receipt ref
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // higher quality
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      // Calculate PDF dimensions (assuming thermal paper/receipt proportion)
      const pdfWidth = 80; // 80mm typical receipt width
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight + 10], // add margin
      });

      pdf.addImage(imgData, 'PNG', 0, 5, pdfWidth, pdfHeight);
      pdf.save(`receipt-${transaction.invoice_number}.pdf`);
      showToast('Struk berhasil diunduh.', 'success');
    } catch {
      showToast('Gagal mendownload PDF.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const details = transaction.details || [];

  return (
    <div className="space-y-4">
      {/* Receipt Canvas */}
      <div
        ref={receiptRef}
        className="bg-white p-6 rounded-xl border border-gray-100 max-w-[360px] mx-auto text-gray-800 font-mono text-xs shadow-xs receipt-printable"
        style={{ color: '#1e293b' }}
      >
        {/* Store Header */}
        <div className="text-center space-y-1 mb-4">
          <h2 className="text-base font-bold tracking-tight text-gray-900">SIMPLE POS SHOP</h2>
          <p className="text-[10px] text-gray-400">Jl. Jenderal Sudirman No. 123</p>
          <p className="text-[10px] text-gray-400">Telp: 021-98765432</p>
        </div>

        {/* Divider */}
        <div className="border-b border-dashed border-gray-200 my-3"></div>

        {/* Meta Info */}
        <div className="space-y-1 text-[10px] text-gray-600">
          <div className="flex justify-between">
            <span>No. Invoice:</span>
            <span className="font-semibold text-gray-900">{transaction.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{formatDate(transaction.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span className="capitalize">{transaction.user?.name || 'Kasir'}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-dashed border-gray-200 my-3"></div>

        {/* Items List */}
        <div className="space-y-2">
          {details.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="flex justify-between font-medium text-gray-900">
                <span className="max-w-[200px] truncate">{item.product?.name || 'Produk'}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>
                  {item.qty} x {formatCurrency(item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-b border-dashed border-gray-200 my-3"></div>

        {/* Totals */}
        <div className="space-y-1.5 font-medium">
          <div className="flex justify-between text-gray-900 text-sm font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(transaction.total_price)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Metode Bayar:</span>
            <span className="uppercase font-semibold text-gray-700">{transaction.payment_method}</span>
          </div>
          {transaction.payment_method === 'cash' && (
            <>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Bayar (Tunai):</span>
                <span>{formatCurrency(transaction.cash_paid)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Kembalian:</span>
                <span className="font-semibold text-green-600">{formatCurrency(transaction.change)}</span>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-b border-dashed border-gray-200 my-3"></div>

        {/* Footer Greetings */}
        <div className="text-center space-y-1 mt-4 text-[10px] text-gray-400">
          <p>Terima Kasih Atas Kunjungan Anda</p>
          <p>Barang yang sudah dibeli</p>
          <p>tidak dapat ditukar/dikembalikan</p>
        </div>
      </div>

      {/* Control Buttons (hidden when printing) */}
      <div className="flex gap-2 max-w-[360px] mx-auto print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 rounded-xl text-xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak Struk
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloading ? 'Mengunduh...' : 'Unduh PDF'}
        </button>
      </div>
    </div>
  );
}
