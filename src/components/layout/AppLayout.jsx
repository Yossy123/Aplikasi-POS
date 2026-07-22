import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/': 'Kasir',
  '/products': 'Manajemen Produk',
  '/users': 'Manajemen Kasir',
  '/transactions': 'Riwayat Transaksi',
  '/my-transactions': 'Riwayat Transaksi Saya',
  '/analytics': 'Analitik Pendapatan',
};

const pageSubtitles = {
  '/': 'Pilih produk untuk ditambahkan ke keranjang',
  '/products': 'Kelola daftar produk toko Anda',
  '/users': 'Kelola akun kasir dan admin',
  '/transactions': 'Daftar transaksi penjualan POS',
  '/my-transactions': 'Daftar transaksi penjualan yang Anda lakukan',
  '/analytics': 'Visualisasi riwayat pendapatan harian dan statistik penjualan',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const routeTitle = pageTitles[location.pathname]
    || (location.pathname.startsWith('/products') ? 'Manajemen Produk' : null)
    || (location.pathname.startsWith('/users') ? 'Manajemen Kasir' : null)
    || (location.pathname.startsWith('/transactions') ? 'Detail Transaksi' : null)
    || (location.pathname.startsWith('/my-transactions') ? 'Detail Transaksi' : null)
    || (location.pathname.startsWith('/analytics') ? 'Analitik Pendapatan' : null)
    || 'Simple POS';

  const routeSubtitle = pageSubtitles[location.pathname] || undefined;

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        {location.pathname !== '/' && (
          <div className="lg:hidden">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              title={routeTitle}
              subtitle={routeSubtitle}
            />
          </div>
        )}
        {location.pathname === '/' && (
          <div className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800 lg:hidden">
            <div className="flex items-center gap-4 px-4 h-14">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">SimplePOS</span>
              </div>
            </div>
          </div>
        )}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
