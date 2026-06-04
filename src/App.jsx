import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import SessionWarningModal from './components/SessionWarningModal';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WalletsPage from './pages/WalletsPage';
import TradesPage from './pages/TradesPage';
import LedgerPage from './pages/LedgerPage';
import RatesPage from './pages/RatesPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  const { isAuthenticated, logout } = useAuth();
  return (
    <>
      {isAuthenticated && <SessionWarningModal onLogout={logout} />}
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="trades" element={<TradesPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="rates" element={<RatesPage />} />
          <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
