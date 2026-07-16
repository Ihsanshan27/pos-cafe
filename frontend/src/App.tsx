import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import IngredientsPage from './pages/IngredientsPage';
import MenusPage from './pages/MenusPage';
import POSPage from './pages/POSPage';
import TransactionsPage from './pages/TransactionsPage';
import ExpensesPage from './pages/ExpensesPage';
import UsersPage from './pages/UsersPage';
import CategoriesPage from './pages/CategoriesPage';
import DiscountsPage from './pages/DiscountsPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SettingsPage from './pages/SettingsPage';
import KitchenPage from './pages/KitchenPage';
import ProfilePage from './pages/ProfilePage';
import CustomersPage from './pages/CustomersPage';
import InventoryLogsPage from './pages/InventoryLogsPage';
import OutletsPage from './pages/OutletsPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PublicOrderPage from './pages/PublicOrderPage';
import ModifiersPage from './pages/ModifiersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { getFirstAvailableRoute, isFeatureDisabled, type FeatureKey } from './lib/featureAccess';
import { useAppPublicSettings } from './hooks/useAppPublicSettings';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { disabledFeatures, forcePasswordChange } = useAppPublicSettings();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isManagerOrOwner = user?.role === 'OWNER' || user?.role === 'MANAGER';
  const isOwner = user?.role === 'OWNER';
  const fallbackRoute = getFirstAvailableRoute(user?.role, disabledFeatures);
  const mustChangePassword = Boolean(forcePasswordChange && user?.mustChangePassword);

  const guardFeature = (feature: FeatureKey, element: ReactElement) => {
    if (isFeatureDisabled(disabledFeatures, feature)) {
      return <Navigate to={fallbackRoute} replace />;
    }
    return element;
  };

  if (mustChangePassword && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Routes>
        <Route
          path="/"
          element={
            isManagerOrOwner
              ? guardFeature('dashboard', <DashboardPage />)
              : user?.role === 'BARISTA'
                ? <Navigate to={fallbackRoute} replace />
                : <Navigate to={fallbackRoute} replace />
          }
        />
        
        {/* Manager & Owner only routes */}
        <Route path="/ingredients" element={isManagerOrOwner ? guardFeature('ingredients', <IngredientsPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/modifiers" element={isManagerOrOwner ? guardFeature('modifiers', <ModifiersPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/inventory-logs" element={isManagerOrOwner ? guardFeature('inventory-logs', <InventoryLogsPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/menus" element={isManagerOrOwner ? guardFeature('menus', <MenusPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/categories" element={isManagerOrOwner ? guardFeature('categories', <CategoriesPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/discounts" element={isManagerOrOwner ? guardFeature('discounts', <DiscountsPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/expenses" element={isManagerOrOwner ? guardFeature('expenses', <ExpensesPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/analytics" element={isManagerOrOwner ? guardFeature('analytics', <AnalyticsPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/users" element={isManagerOrOwner ? guardFeature('users', <UsersPage />) : <Navigate to={fallbackRoute} replace />} />
        
        {/* Owner only routes */}
        <Route path="/settings" element={isOwner ? <SettingsPage /> : <Navigate to={fallbackRoute} replace />} />
        
        {/* Accessible to POS users (CASHIER, OWNER, MANAGER) */}
        <Route path="/customers" element={user?.role !== 'BARISTA' ? guardFeature('customers', <CustomersPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/outlets" element={isManagerOrOwner ? guardFeature('outlets', <OutletsPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/suppliers" element={isManagerOrOwner ? guardFeature('suppliers', <SuppliersPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/purchase-orders" element={isManagerOrOwner ? guardFeature('purchase-orders', <PurchaseOrdersPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/pos" element={user?.role !== 'BARISTA' ? guardFeature('pos', <POSPage />) : <Navigate to={fallbackRoute} replace />} />
        <Route path="/transactions" element={user?.role !== 'BARISTA' ? guardFeature('transactions', <TransactionsPage />) : <Navigate to={fallbackRoute} replace />} />
        
        {/* Accessible to all */}
        <Route path="/kitchen" element={guardFeature('kitchen', <KitchenPage />)} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/public/order/:outletSlug/:tableCode" element={<PublicOrderPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
