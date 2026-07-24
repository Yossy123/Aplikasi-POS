import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import AppRouter from './routes/AppRouter';

function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
