import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { transactionApi, expenseApi, menuApi } from '../lib/api';
import { useActiveOutlet } from '../hooks/useActiveOutlet';
import {
  TrendingUp,
  Package,
  Wallet,
  Calendar,
  UtensilsCrossed,
  DollarSign,
  Activity,
  PieChart as PieChartIcon
} from 'lucide-react';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

function formatPercentage(val: number) {
  return `${val.toFixed(1)}%`;
}

type DateRange = 'TODAY' | '7_DAYS' | '30_DAYS' | 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME';

export default function AnalyticsPage() {
  const { activeOutletId } = useActiveOutlet();
  const [dateRange, setDateRange] = useState<DateRange>('30_DAYS');

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', activeOutletId],
    queryFn: () => transactionApi.getAll(activeOutletId),
  });

  const { data: expenses = [], isLoading: loadingExp } = useQuery({
    queryKey: ['expenses', activeOutletId],
    queryFn: () => expenseApi.getAll(activeOutletId),
  });

  const { data: menus = [], isLoading: loadingMenus } = useQuery({
    queryKey: ['menus', activeOutletId],
    queryFn: () => menuApi.getAll(activeOutletId || undefined),
  });

  const isLoading = loadingTx || loadingExp || loadingMenus;

  // Filter Data by Date Range
  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate = new Date(0); // ALL_TIME
    
    if (dateRange === 'TODAY') {
      startDate = today;
    } else if (dateRange === '7_DAYS') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else if (dateRange === '30_DAYS') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
    } else if (dateRange === 'THIS_MONTH') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (dateRange === 'THIS_YEAR') {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    const filteredTx = transactions.filter(t => t.status === 'COMPLETED' && new Date(t.createdAt) >= startDate);
    const filteredExp = expenses.filter(e => new Date(e.date) >= startDate);

    return { filteredTx, filteredExp, startDate };
  }, [transactions, expenses, dateRange]);

  const { filteredTx, filteredExp } = filteredData;

  // Financial Calculations
  const metrics = useMemo(() => {
    const totalRevenue = filteredTx.reduce((sum, t) => sum + (Number(t.totalAmount) - Number(t.taxAmount || 0)), 0);
    
    const totalCogs = filteredTx.reduce((sum, t) => {
      const txCogs = t.items.reduce((itemSum, item) => {
        const menu = menus.find(m => m.id === item.menu?.id);
        if (!menu || !menu.ingredients) return itemSum;
        const recipeCost = menu.ingredients.reduce((recipeSum, mi) => {
          return recipeSum + (Number(mi.quantity) * Number(mi.ingredient.costPerUnit));
        }, 0);
        return itemSum + (recipeCost * item.quantity);
      }, 0);
      return sum + txCogs;
    }, 0);

    const grossProfit = totalRevenue - totalCogs;
    const totalExpenses = filteredExp.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = grossProfit - totalExpenses;

    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalCogs, grossProfit, totalExpenses, netProfit, grossMargin, netMargin };
  }, [filteredTx, filteredExp, menus]);

  // Chart Data: Revenue vs Profit Trend
  const trendData = useMemo(() => {
    if (filteredTx.length === 0) return [];
    
    // Group by Date (YYYY-MM-DD)
    const grouped: Record<string, { revenue: number, cogs: number, expenses: number }> = {};
    
    filteredTx.forEach(t => {
      const dateStr = new Date(t.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!grouped[dateStr]) grouped[dateStr] = { revenue: 0, cogs: 0, expenses: 0 };
      grouped[dateStr].revenue += (Number(t.totalAmount) - Number(t.taxAmount || 0));
      
      const txCogs = t.items.reduce((itemSum, item) => {
        const menu = menus.find(m => m.id === item.menu?.id);
        if (!menu || !menu.ingredients) return itemSum;
        const recipeCost = menu.ingredients.reduce((recipeSum, mi) => {
          return recipeSum + (Number(mi.quantity) * Number(mi.ingredient.costPerUnit));
        }, 0);
        return itemSum + (recipeCost * item.quantity);
      }, 0);
      grouped[dateStr].cogs += txCogs;
    });

    filteredExp.forEach(e => {
      const dateStr = new Date(e.date).toLocaleDateString('en-CA');
      if (grouped[dateStr]) { // Only if there were sales that day or create it
        grouped[dateStr].expenses += Number(e.amount);
      } else {
        grouped[dateStr] = { revenue: 0, cogs: 0, expenses: Number(e.amount) };
      }
    });

    // Sort by date
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        Revenue: data.revenue,
        Profit: data.revenue - data.cogs - data.expenses,
      }));
  }, [filteredTx, filteredExp, menus]);

  // Chart Data: Revenue by Category
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredTx.forEach(t => {
      t.items.forEach(item => {
        const menu = menus.find(m => m.id === item.menu?.id);
        if (menu && menu.category) {
          const catName = menu.category.name;
          cats[catName] = (cats[catName] || 0) + (Number(item.priceAtSale) * item.quantity);
        }
      });
    });
    
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTx, menus]);

  // Top Sellers by Revenue
  const topSellers = useMemo(() => {
    const items: Record<string, { name: string, qty: number, revenue: number }> = {};
    filteredTx.forEach(t => {
      t.items.forEach(item => {
        if (item.menu) {
          if (!items[item.menu.id]) items[item.menu.id] = { name: item.menu.name, qty: 0, revenue: 0 };
          items[item.menu.id].qty += item.quantity;
          items[item.menu.id].revenue += (Number(item.priceAtSale) * item.quantity);
        }
      });
    });

    return Object.values(items)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTx]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Analytics...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Finance Analytics</h2>
          <p>Comprehensive financial insights and performance metrics.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <Calendar size={18} color="var(--text-secondary)" />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="TODAY">Today</option>
            <option value="7_DAYS">Last 7 Days</option>
            <option value="30_DAYS">Last 30 Days</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_YEAR">This Year</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>
      </div>

      <div className="page-body">
        {/* Key Metrics - Income Statement Style */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <DollarSign color="#6366f1" />
            </div>
            <div>
              <div className="stat-card-label">Total Revenue</div>
              <div className="stat-card-value">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="stat-card-sub">Gross Sales (Excl. Tax)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Package color="#ef4444" />
            </div>
            <div>
              <div className="stat-card-label">COGS</div>
              <div className="stat-card-value">{formatCurrency(metrics.totalCogs)}</div>
              <div className="stat-card-sub">Cost of Goods Sold</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Activity color="#10b981" />
            </div>
            <div>
              <div className="stat-card-label">Gross Profit</div>
              <div className="stat-card-value" style={{ color: metrics.grossProfit < 0 ? 'var(--danger)' : 'var(--success)' }}>
                {formatCurrency(metrics.grossProfit)}
              </div>
              <div className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Margin: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatPercentage(metrics.grossMargin)}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Wallet color="#f59e0b" />
            </div>
            <div>
              <div className="stat-card-label">OpEx</div>
              <div className="stat-card-value">{formatCurrency(metrics.totalExpenses)}</div>
              <div className="stat-card-sub">Operational Expenses</div>
            </div>
          </div>

          <div className="stat-card" style={{ border: '2px solid var(--accent)', background: 'var(--bg-secondary)' }}>
            <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.2)' }}>
              <TrendingUp color="var(--accent)" />
            </div>
            <div>
              <div className="stat-card-label">Net Profit</div>
              <div className="stat-card-value" style={{ color: metrics.netProfit < 0 ? 'var(--danger)' : 'var(--accent)' }}>
                {formatCurrency(metrics.netProfit)}
              </div>
              <div className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Margin: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatPercentage(metrics.netMargin)}</span>
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Trend Chart */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--accent)" />
              Revenue & Profit Trend
            </h3>
            <div style={{ height: 350 }}>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `Rp ${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No data available for selected period
                </div>
              )}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChartIcon size={18} color="var(--accent)" />
              Revenue by Category
            </h3>
            <div style={{ height: 300 }}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Sellers */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UtensilsCrossed size={18} color="var(--accent)" />
              Top Menu Contributors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topSellers.length > 0 ? topSellers.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '28px', height: '28px', 
                      borderRadius: '50%', 
                      background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.1)', 
                      color: i === 0 ? '#f59e0b' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '0.8rem'
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.qty} sold</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No sales data available
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
