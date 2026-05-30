import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import SettingsPage from './pages/SettingsPage';
import KitchenPage from './pages/KitchenPage';
import ProfilePage from './pages/ProfilePage';
import CustomersPage from './pages/CustomersPage';
import InventoryLogsPage from './pages/InventoryLogsPage';
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
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isManagerOrOwner = user?.role === 'OWNER' || user?.role === 'MANAGER';
  const isOwner = user?.role === 'OWNER';

  return (
    <div className="app-layout">
      <Sidebar />
      <Routes>
        <Route path="/" element={isManagerOrOwner ? <DashboardPage /> : (user?.role === 'BARISTA' ? <Navigate to="/kitchen" replace /> : <Navigate to="/pos" replace />)} />
        
        {/* Manager & Owner only routes */}
        <Route path="/ingredients" element={isManagerOrOwner ? <IngredientsPage /> : <Navigate to="/pos" replace />} />
        <Route path="/inventory-logs" element={isManagerOrOwner ? <InventoryLogsPage /> : <Navigate to="/pos" replace />} />
        <Route path="/menus" element={isManagerOrOwner ? <MenusPage /> : <Navigate to="/pos" replace />} />
        <Route path="/categories" element={isManagerOrOwner ? <CategoriesPage /> : <Navigate to="/pos" replace />} />
        <Route path="/discounts" element={isManagerOrOwner ? <DiscountsPage /> : <Navigate to="/pos" replace />} />
        <Route path="/expenses" element={isManagerOrOwner ? <ExpensesPage /> : <Navigate to="/pos" replace />} />
        <Route path="/users" element={isManagerOrOwner ? <UsersPage /> : <Navigate to="/pos" replace />} />
        
        {/* Owner only routes */}
        <Route path="/settings" element={isOwner ? <SettingsPage /> : <Navigate to="/pos" replace />} />
        
        {/* Accessible to POS users (CASHIER, OWNER, MANAGER) */}
        <Route path="/customers" element={user?.role !== 'BARISTA' ? <CustomersPage /> : <Navigate to="/kitchen" replace />} />
        <Route path="/pos" element={user?.role !== 'BARISTA' ? <POSPage /> : <Navigate to="/kitchen" replace />} />
        <Route path="/transactions" element={user?.role !== 'BARISTA' ? <TransactionsPage /> : <Navigate to="/kitchen" replace />} />
        
        {/* Accessible to all */}
        <Route path="/kitchen" element={<KitchenPage />} />
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
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
