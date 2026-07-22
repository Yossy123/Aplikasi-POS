import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProductManagementPage from '../pages/ProductManagementPage';
import UserManagementPage from '../pages/UserManagementPage';
import TransactionHistoryPage from '../pages/TransactionHistoryPage';
import TransactionDetailPage from '../pages/TransactionDetailPage';
import MyTransactionsPage from '../pages/MyTransactionsPage';
import AnalyticsPage from '../pages/AnalyticsPage';

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route
            path="products"
            element={
              <ProtectedRoute adminOnly>
                <ProductManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute adminOnly>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions"
            element={
              <ProtectedRoute adminOnly>
                <TransactionHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions/:id"
            element={
              <ProtectedRoute adminOnly>
                <TransactionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-transactions"
            element={
              <ProtectedRoute>
                <MyTransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-transactions/:id"
            element={
              <ProtectedRoute>
                <TransactionDetailPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
