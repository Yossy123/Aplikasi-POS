import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = null) => {
    const id = ++toastIdCounter;
    const dismissTime = duration ?? (type === 'error' ? 4000 : type === 'success' ? 3000 : 3500);
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), dismissTime);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const typeStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300',
    error: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300',
    warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300',
    info: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm min-w-[320px] max-w-[420px] toast-slide-in ${typeStyles[toast.type] || typeStyles.info}`}>
      <span className="shrink-0 mt-0.5">{icons[toast.type] || icons.info}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={onClose} className="shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors opacity-60 hover:opacity-100 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
