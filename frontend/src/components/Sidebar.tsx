import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
  ChefHat,
  LogOut,
  User,
  Wallet,
  Tags,
  PercentCircle,
  Settings,
  Users,
  ClipboardList,
  Store,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppPublicSettings } from '../hooks/useAppPublicSettings';
import { isFeatureDisabled, type FeatureKey } from '../lib/featureAccess';
import { resolveMediaUrl } from '../lib/api';
import { useActiveOutlet } from '../hooks/useActiveOutlet';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', category: 'Main', end: true, roles: ['OWNER', 'MANAGER'], featureKey: 'dashboard' as FeatureKey },
  { to: '/pos', icon: ShoppingCart, label: 'Point of Sale', category: 'Main', badge: 'POS', roles: ['OWNER', 'MANAGER', 'CASHIER'], featureKey: 'pos' as FeatureKey },
  { to: '/kitchen', icon: ChefHat, label: 'KDS', category: 'Main', badge: 'NEW', roles: ['OWNER', 'MANAGER', 'CASHIER', 'BARISTA'], featureKey: 'kitchen' as FeatureKey },

  { to: '/transactions', icon: Receipt, label: 'Transactions', category: 'Sales & Finance', roles: ['OWNER', 'MANAGER', 'CASHIER'], featureKey: 'transactions' as FeatureKey },
  { to: '/expenses', icon: Wallet, label: 'Expenses', category: 'Sales & Finance', roles: ['OWNER', 'MANAGER'], featureKey: 'expenses' as FeatureKey },

  { to: '/menus', icon: UtensilsCrossed, label: 'Menus', category: 'Catalog', roles: ['OWNER', 'MANAGER'], featureKey: 'menus' as FeatureKey },
  { to: '/categories', icon: Tags, label: 'Categories', category: 'Catalog', roles: ['OWNER', 'MANAGER'], featureKey: 'categories' as FeatureKey },
  { to: '/discounts', icon: PercentCircle, label: 'Discounts', category: 'Catalog', roles: ['OWNER', 'MANAGER'], featureKey: 'discounts' as FeatureKey },

  { to: '/ingredients', icon: Package, label: 'Ingredients', category: 'Inventory', roles: ['OWNER', 'MANAGER'], featureKey: 'ingredients' as FeatureKey },
  { to: '/inventory-logs', icon: ClipboardList, label: 'Inventory Logs', category: 'Inventory', roles: ['OWNER', 'MANAGER'], featureKey: 'inventory-logs' as FeatureKey },
  { to: '/suppliers', icon: Truck, label: 'Suppliers', category: 'Inventory', roles: ['OWNER', 'MANAGER'], featureKey: 'suppliers' as FeatureKey },
  { to: '/purchase-orders', icon: ShoppingBag, label: 'Purchase Orders', category: 'Inventory', roles: ['OWNER', 'MANAGER'], featureKey: 'purchase-orders' as FeatureKey },

  { to: '/customers', icon: Users, label: 'Customers', category: 'People', roles: ['OWNER', 'MANAGER', 'CASHIER'], featureKey: 'customers' as FeatureKey },
  { to: '/users', icon: User, label: 'Staffs', category: 'People', roles: ['OWNER', 'MANAGER'], featureKey: 'users' as FeatureKey },

  { to: '/outlets', icon: Store, label: 'Outlets', category: 'System', roles: ['OWNER', 'MANAGER'], featureKey: 'outlets' as FeatureKey },
  { to: '/settings', icon: Settings, label: 'Settings', category: 'System', roles: ['OWNER'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { storeName, storeLogoUrl, disabledFeatures } = useAppPublicSettings();
  const { outlets, activeOutletId, setActiveOutletId, isLockedToUserOutlet } = useActiveOutlet();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        {storeLogoUrl ? (
          <img
            className="brand-logo-image"
            src={resolveMediaUrl(storeLogoUrl)}
            alt={storeName}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              border: '1px solid var(--border)',
              background: 'white',
            }}
          />
        ) : (
          <div className="sidebar-logo-icon">
            <ChefHat size={20} color="white" />
          </div>
        )}
        <div className="sidebar-logo-text">
          <h1>{storeName}</h1>
          <p>Restaurant System</p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
        {outlets.length > 0 && user?.role !== 'BARISTA' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700 }}>
              Active Outlet
            </div>
            <select
              value={activeOutletId}
              onChange={(e) => setActiveOutletId(e.target.value)}
              disabled={isLockedToUserOutlet}
              style={{ width: '100%' }}
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {Array.from(new Set(navItems.map(item => item.category))).map(category => {
          const items = navItems
            .filter(item => item.category === category)
            .filter((item) => item.roles.includes(user?.role as string))
            .filter((item) => !item.featureKey || !isFeatureDisabled(disabledFeatures, item.featureKey));

          if (items.length === 0) return null;

          return (
            <div key={category} style={{ marginBottom: '1.5rem' }}>
              <div className="sidebar-section-label" style={{ marginBottom: '0.5rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {items.map(({ to, icon: Icon, label, badge, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  >
                    <Icon />
                    <span>{label}</span>
                    {badge && <span className="nav-badge">{badge}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* User info + Logout */}
      <div style={{ marginTop: 'auto' }}>
        <div className="divider" />

        {/* User card */}
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem',
            background: 'var(--bg-card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            marginBottom: '0.5rem',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={16} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'User'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {user?.role ?? ''} • Edit Profile
              </div>
            </div>
          </div>
        </Link>

        {/* Logout button */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
