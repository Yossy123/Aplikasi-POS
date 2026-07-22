import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyRevenueHistory } from '../api/transactionApi';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  ArrowUpRight,
  TrendingDown,
  Percent,
  CalendarRange,
  ChevronRight,
  Info
} from 'lucide-react';

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tablePage, setTablePage] = useState(1);
  const rowsPerPage = 10;
  const { showToast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getDailyRevenueHistory({ days });
      setData(res.data.data);
      setTablePage(1); // reset ke halaman pertama saat data berubah
    } catch {
      showToast('Gagal memuat data analitik.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  // Calculate stats
  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalTransactions = data.reduce((acc, curr) => acc + curr.tx_count, 0);
  const averageDailyRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const averageBasket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0) || 1;
  const highestDay = data.reduce(
    (max, curr) => (curr.revenue > max.revenue ? curr : max),
    { date: '-', revenue: 0 }
  );

  // SVG Chart Calculations
  const chartHeight = 240;
  const chartWidth = 800;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / Math.max(data.length - 1, 1)) * usableWidth;
    const y = chartHeight - paddingBottom - (d.revenue / maxRevenue) * usableHeight;
    return { x, y, date: d.date, revenue: d.revenue, txCount: d.tx_count };
  });

  // Generate SVG path for line
  const linePath =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

  // Generate SVG path for filled gradient area
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
      : '';

  const formatDate = (dateStr) => {
    if (dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      weekday: days === 7 ? 'long' : undefined,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Analitik Pendapatan</h1>
          <p className="text-sm text-gray-500 mt-1">Visualisasi riwayat pendapatan harian dan statistik penjualan</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl self-end">
          <button
            onClick={() => setDays(7)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              days === 7
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              days === 30
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            30 Hari Terakhir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
            <p className="text-sm text-gray-500 font-medium">Memuat data analitik...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Revenue */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Pendapatan</span>
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalRevenue)}</h3>
              <p className="text-xs text-gray-400 mt-1.5">Selama periode {days} hari</p>
            </div>

            {/* Average Revenue */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rata-rata Harian</span>
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{formatCurrency(averageDailyRevenue)}</h3>
              <p className="text-xs text-gray-400 mt-1.5">Estimasi per hari</p>
            </div>

            {/* Total Transactions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Transaksi</span>
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{totalTransactions} Transaksi</h3>
              <p className="text-xs text-gray-400 mt-1.5">Nilai keranjang avg: {formatCurrency(averageBasket)}</p>
            </div>

            {/* Highest Sales Day */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Penjualan Tertinggi</span>
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{formatCurrency(highestDay.revenue)}</h3>
              <p className="text-xs text-gray-400 mt-1.5">{highestDay.date !== '-' ? formatDate(highestDay.date) : '-'}</p>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Grafik Penjualan Harian</h3>
                <p className="text-xs text-gray-400 mt-0.5">Grafik pendapatan dan tren harian</p>
              </div>
              {hoveredIndex !== null && points[hoveredIndex] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary-50 border border-primary-100 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-4 shadow-sm"
                >
                  <div>
                    <span className="text-gray-500 font-medium">Tanggal:</span>{' '}
                    <span className="font-semibold text-gray-800">{formatDate(points[hoveredIndex].date)}</span>
                  </div>
                  <div className="h-3 w-px bg-primary-200" />
                  <div>
                    <span className="text-gray-500 font-medium">Pendapatan:</span>{' '}
                    <span className="font-bold text-primary-700">{formatCurrency(points[hoveredIndex].revenue)}</span>
                  </div>
                  <div className="h-3 w-px bg-primary-200" />
                  <div>
                    <span className="text-gray-500 font-medium">Transaksi:</span>{' '}
                    <span className="font-semibold text-gray-800">{points[hoveredIndex].txCount}</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Custom SVG Responsive Line Chart */}
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto select-none"
              >
                <defs>
                  {/* Glowing line area gradient */}
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Y Axis Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = chartHeight - paddingBottom - ratio * usableHeight;
                  const value = ratio * maxRevenue;
                  return (
                    <g key={i} className="opacity-40">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] font-medium fill-gray-400 tabular-nums"
                      >
                        {formatCurrency(value).replace(',00', '').replace('Rp ', '')}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Date labels */}
                {data.map((d, index) => {
                  // Only show subset of labels on 30-day mode to prevent clutter
                  if (days === 30 && index % 4 !== 0 && index !== data.length - 1) return null;

                  const x = paddingLeft + (index / Math.max(data.length - 1, 1)) * usableWidth;
                  const date = new Date(d.date);
                  const formattedXLabel = date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <text
                      key={index}
                      x={x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      className="text-[10px] font-medium fill-gray-400"
                    >
                      {formattedXLabel}
                    </text>
                  );
                })}

                {/* Filled Area Gradient */}
                {areaPath && (
                  <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-300" />
                )}

                {/* The Main Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Hover line guide & highlight circle */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                  <g>
                    <line
                      x1={points[hoveredIndex].x}
                      y1={paddingTop}
                      x2={points[hoveredIndex].x}
                      y2={chartHeight - paddingBottom}
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={points[hoveredIndex].x}
                      cy={points[hoveredIndex].y}
                      r="7"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="3"
                      className="shadow-sm"
                    />
                    <circle
                      cx={points[hoveredIndex].x}
                      cy={points[hoveredIndex].y}
                      r="12"
                      fill="#0284c7"
                      fillOpacity="0.15"
                    />
                  </g>
                )}

                {/* Interactive Hover Areas (Vertical slices) */}
                {points.map((p, index) => {
                  const sliceWidth = usableWidth / Math.max(data.length - 1, 1);
                  const hoverX = p.x - sliceWidth / 2;
                  return (
                    <rect
                      key={index}
                      x={hoverX}
                      y={0}
                      width={sliceWidth}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 p-3 rounded-xl mt-4">
              <Info className="w-4 h-4 text-gray-400 shrink-0" />
              <p className="text-[10px] text-gray-500 leading-normal">
                Arahkan kursor (*hover*) di atas grafik untuk melihat rincian pendapatan dan total transaksi pada tanggal tertentu.
              </p>
            </div>
          </div>

          {/* Daily Sales Breakdown Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-150">
              <h3 className="text-sm font-bold text-gray-900">Rincian Penjualan Harian</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tabel riwayat pendapatan per hari selama periode berlangsung</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Transaksi</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendapatan</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Basket Size (Avg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data
                    .slice()
                    .reverse()
                    .slice((tablePage - 1) * rowsPerPage, tablePage * rowsPerPage)
                    .map((row, i) => {
                      const avgValue = row.tx_count > 0 ? row.revenue / row.tx_count : 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-3.5">
                            <span className="text-xs font-semibold text-gray-700">{formatDate(row.date)}</span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="text-xs text-gray-600 font-medium tabular-nums">{row.tx_count} transaksi</span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="text-xs font-bold text-gray-800 tabular-nums">{formatCurrency(row.revenue)}</span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="text-xs text-gray-500 tabular-nums">{formatCurrency(avgValue)}</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            {data.length > rowsPerPage && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Menampilkan {Math.min((tablePage - 1) * rowsPerPage + 1, data.length)}–{Math.min(tablePage * rowsPerPage, data.length)} dari {data.length} hari
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={tablePage <= 1}
                    onClick={() => setTablePage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={tablePage >= Math.ceil(data.length / rowsPerPage)}
                    onClick={() => setTablePage((p) => Math.min(p + 1, Math.ceil(data.length / rowsPerPage)))}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
