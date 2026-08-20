import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout as logoutApi } from '../../api/authApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ScrollText,
  History,
  LogOut,
  ShoppingCart,
  ChevronLeft,
  User,
  Users,
  Store,
  TrendingUp,
  Utensils,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isKasir, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) { /* ignore */ }
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-800'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
    }`;

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate="open"
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/70 dark:border-gray-800 flex flex-col lg:translate-x-0 lg:fixed lg:z-40 shadow-xl shadow-slate-900/5 ${
          isOpen ? '' : 'hidden lg:flex'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800 bg-linear-to-br from-primary-50/70 via-white to-emerald-50/40 dark:from-primary-950/40 dark:via-gray-900 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary-500 via-primary-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 ring-4 ring-white/70 dark:ring-gray-900">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">SimplePOS</h1>
                <p className="text-[10px] text-primary-700/60 dark:text-primary-300/60 -mt-0.5 font-medium">Point of Sale</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.16em] px-3 pb-2 pt-1">
            Menu Utama
          </div>

          <NavLink to="/" end className={linkClass} onClick={onClose}>
            <LayoutDashboard className="w-5 h-5" />
            Kasir
          </NavLink>

          {isAdmin && (
            <>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.16em] px-3 pb-2 pt-4">
                Manajemen
              </div>
              <NavLink to="/products" className={linkClass} onClick={onClose}>
                <Utensils className="w-5 h-5" />
                Menu / Produk
              </NavLink>
              <NavLink to="/users" className={linkClass} onClick={onClose}>
                <Users className="w-5 h-5" />
                Manajemen Kasir
              </NavLink>
              <NavLink to="/transactions" className={linkClass} onClick={onClose}>
                <ScrollText className="w-5 h-5" />
                Riwayat Transaksi
              </NavLink>
              <NavLink to="/analytics" className={linkClass} onClick={onClose}>
                <TrendingUp className="w-5 h-5" />
                Analitik
              </NavLink>
            </>
          )}

          {isKasir && (
            <>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.16em] px-3 pb-2 pt-4">
                Riwayat
              </div>
              <NavLink to="/my-transactions" className={linkClass} onClick={onClose}>
                <History className="w-5 h-5" />
                Transaksi Saya
              </NavLink>
            </>
          )}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-linear-to-r from-gray-50 to-primary-50/40 dark:from-gray-800 dark:to-primary-950/20 border border-gray-100 dark:border-gray-800">
            <div className="w-9 h-9 bg-linear-to-br from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
}
