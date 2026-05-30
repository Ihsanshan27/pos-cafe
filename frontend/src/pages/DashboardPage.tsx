import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ingredientApi, menuApi, transactionApi, expenseApi } from '../lib/api';
import {
  Package,
  UtensilsCrossed,
  Receipt,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function DashboardPage() {
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: ingredientApi.getAll });
  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: menuApi.getAll });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: transactionApi.getAll });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: expenseApi.getAll });

  const totalRevenue = transactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + Number(t.totalAmount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const todayTx = transactions.filter((t) => {
    const d = new Date(t.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const lowStock = ingredients.filter((i) => i.stockQuantity < 10);

  // 1. 7-Day Revenue
  const salesData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayTotal = transactions.filter(t => {
      const td = new Date(t.createdAt);
      return td.toDateString() === d.toDateString() && t.status === 'COMPLETED';
    }).reduce((sum, t) => sum + Number(t.totalAmount), 0);
    salesData.push({ name: dateStr, revenue: dayTotal });
  }

  // 2. Best Sellers
  const menuSales: Record<string, { name: string; sold: number }> = {};
  transactions.filter(t => t.status === 'COMPLETED').forEach(t => {
    t.items.forEach(item => {
      if (item.menu) {
        if (!menuSales[item.menu.id]) menuSales[item.menu.id] = { name: item.menu.name, sold: 0 };
        menuSales[item.menu.id].sold += item.quantity;
      }
    });
  });
  const bestSellers = Object.values(menuSales)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // 3. Peak Hours
  const hourCounts: Record<string, number> = {};
  transactions.forEach(t => {
    const hour = new Date(t.createdAt).getHours();
    const key = `${String(hour).padStart(2, '0')}:00`;
    hourCounts[key] = (hourCounts[key] || 0) + 1;
  });
  const peakHours = Object.entries(hourCounts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Receipt color="#6366f1" />
            </div>
            <div>
              <div className="stat-card-label">Total Revenue</div>
              <div className="stat-card-value">{formatCurrency(totalRevenue)}</div>
              <div className="stat-card-sub">Gross income</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Wallet color="#10b981" />
            </div>
            <div>
              <div className="stat-card-label">Net Profit</div>
              <div className="stat-card-value" style={{ color: netProfit < 0 ? 'var(--danger)' : 'var(--success)' }}>
                {formatCurrency(netProfit)}
              </div>
              <div className="stat-card-sub">Revenue - Expenses</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <TrendingUp color="#3b82f6" />
            </div>
            <div>
              <div className="stat-card-label">Today's Orders</div>
              <div className="stat-card-value">{todayTx.length}</div>
              <div className="stat-card-sub">Transactions today</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <UtensilsCrossed color="#f59e0b" />
            </div>
            <div>
              <div className="stat-card-label">Menu Items</div>
              <div className="stat-card-value">{menus.length}</div>
              <div className="stat-card-sub">Active menus</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Package color="#ef4444" />
            </div>
            <div>
              <div className="stat-card-label">Low Stock Items</div>
              <div className="stat-card-value">{lowStock.length}</div>
              <div className="stat-card-sub">Need restocking</div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          {/* Revenue Chart */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>📈 7-Day Revenue</h3>
            <div style={{ height: 250, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>🏆 Best Sellers</h3>
            <div style={{ height: 250, width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bestSellers.length === 0 ? (
                <div className="empty-state" style={{ height: '100%' }}><Package /><p>No sales yet</p></div>
              ) : (
                bestSellers.map((item, index) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS[index], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{index + 1}</div>
                    <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.sold} sold</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          {/* Peak Hours */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>⏰ Peak Hours</h3>
            <div style={{ height: 200, width: '100%' }}>
              {peakHours.length === 0 ? (
                <div className="empty-state" style={{ height: '100%' }}><TrendingUp /><p>No data</p></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours}>
                    <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(99,102,241,0.1)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Low stock alert */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>⚠️ Low Stock Alerts</h3>
              <Link to="/ingredients" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {lowStock.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Package />
                <p>All ingredients are well-stocked!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {lowStock.slice(0, 6).map((i) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={14} color="#ef4444" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{i.name}</span>
                    </div>
                    <span className="badge badge-danger">{i.stockQuantity} {i.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>🧾 Recent Transactions</h3>
              <Link to="/transactions" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {transactions.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Receipt />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {transactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{tx.orderNumber || `#${tx.id.slice(0, 8)}`}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString('id-ID')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(Number(tx.totalAmount))}</div>
                      <span className={`badge badge-${tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'}`}>{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/pos" className="btn btn-primary"><ShoppingCart size={16} /> New Order</Link>
            <Link to="/menus" className="btn btn-secondary"><UtensilsCrossed size={16} /> Manage Menus</Link>
            <Link to="/ingredients" className="btn btn-secondary"><Package size={16} /> Manage Ingredients</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
