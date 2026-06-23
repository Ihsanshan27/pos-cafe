import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { publicOrderApi, resolveMediaUrl } from '../lib/api';
import { ShoppingCart } from 'lucide-react';

type CartItem = { menuId: string; name: string; price: number; quantity: number };

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function PublicOrderPage() {
  const { outletSlug = '', tableCode = '' } = useParams();
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['public-order', outletSlug, tableCode],
    queryFn: () => publicOrderApi.getMenu(outletSlug, tableCode),
  });

  const createMut = useMutation({
    mutationFn: () => publicOrderApi.createOrder(outletSlug, tableCode, {
      customerName: customerName || undefined,
      items: cart.map((item) => ({ menuId: item.menuId, quantity: item.quantity })),
    }),
    onSuccess: () => {
      alert('Order berhasil dikirim ke outlet.');
      setCart([]);
      setCustomerName('');
    },
    onError: (err: any) => alert(err?.response?.data?.message || 'Gagal mengirim order'),
  });

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const addToCart = (menu: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuId === menu.id);
      if (existing) {
        return prev.map((item) => item.menuId === menu.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { menuId: menu.id, name: menu.name, price: Number(menu.sellingPrice), quantity: 1 }];
    });
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading menu...</div>;
  }

  if (!data) {
    return <div style={{ padding: '2rem' }}>Outlet atau meja tidak ditemukan.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h1 style={{ marginBottom: '0.35rem' }}>{data.outlet.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Order meja {data.table.label || data.table.code}</p>
          </div>
          <div className="menu-grid">
            {data.menus.map((menu: any) => (
              <div key={menu.id} className="menu-card" onClick={() => addToCart(menu)}>
                <div style={{ width: '100%', height: 110, borderRadius: '0.6rem', background: menu.imageUrl ? `url(${resolveMediaUrl(menu.imageUrl)}) center/cover no-repeat` : 'linear-gradient(135deg, #dbeafe, #bfdbfe)', marginBottom: '0.5rem' }} />
                <div className="menu-card-name">{menu.name}</div>
                <div className="menu-card-price">{formatCurrency(Number(menu.sellingPrice))}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShoppingCart size={18} />
            <strong>Pesanan Anda</strong>
          </div>
          <div className="form-group">
            <label>Nama Customer</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Opsional" />
          </div>
          <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem' }}>
            {cart.map((item) => (
              <div key={item.menuId} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.7rem', borderRadius: '0.6rem' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.quantity} x {formatCurrency(item.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCart((prev) => prev.map((entry) => entry.menuId === item.menuId ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>-</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCart((prev) => prev.map((entry) => entry.menuId === item.menuId ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Belum ada menu dipilih.</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 800 }}>
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={cart.length === 0 || createMut.isPending} onClick={() => createMut.mutate()}>
            {createMut.isPending ? 'Mengirim...' : 'Kirim Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
