import { Menu } from 'lucide-react';

export default function Header({ onMenuClick, title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/70 dark:border-gray-800 shadow-sm shadow-slate-200/30 dark:shadow-none">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[11px] text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-3">{children}</div>
        )}
      </div>
    </header>
  );
}
