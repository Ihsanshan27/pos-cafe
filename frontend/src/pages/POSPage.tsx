import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, transactionApi, categoryApi, discountApi, shiftApi, settingsApi, customerApi } from '../lib/api';
import type { Menu, Transaction, Category, Discount, Shift, Customer } from '../lib/api';
import { Search, ShoppingCart, X, Plus, Minus, CheckCircle, Trash2, Printer, Percent, MapPin, Hash, LogIn, Info, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

type CartItem = { menu: Menu; quantity: number; notes?: string };

export default function POSPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT' | 'EWALLET'>('CASH');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cashReceived, setCashReceived] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [detailMenu, setDetailMenu] = useState<Menu | null>(null);

  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [startingCash, setStartingCash] = useState('');

  const { data: menus = [], isLoading: isMenusLoading } = useQuery({ queryKey: ['menus'], queryFn: menuApi.getAll });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryApi.getAll });
  const { data: discounts = [] } = useQuery({ queryKey: ['discounts'], queryFn: discountApi.getAll });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: customerApi.getAll });
  const { data: activeShift, isLoading: isShiftLoading } = useQuery({ 
    queryKey: ['activeShift'], 
    queryFn: shiftApi.getActive,
    retry: 0
  });

  const { data: taxEnabledReq } = useQuery({ queryKey: ['settings', 'TAX_ENABLED'], queryFn: () => settingsApi.getSetting('TAX_ENABLED') });
  const { data: taxRateReq } = useQuery({ queryKey: ['settings', 'TAX_RATE'], queryFn: () => settingsApi.getSetting('TAX_RATE') });
  
  const isTaxEnabled = taxEnabledReq?.value === 'true';
  const taxRate = taxRateReq?.value ? Number(taxRateReq.value) : 10;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openShiftMut = useMutation({
    mutationFn: () => shiftApi.create({ startingCash: Number(startingCash) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeShift'] });
      showToast('Shift opened successfully');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Failed to open shift', 'error'),
  });

  const checkoutMut = useMutation({
    mutationFn: () => {
      let discAmt = 0;
      if (selectedDiscount) {
        if (selectedDiscount.type === 'PERCENTAGE') {
          discAmt = (cartTotal * Number(selectedDiscount.value)) / 100;
        } else {
          discAmt = Number(selectedDiscount.value);
        }
      }

      const taxAmount = isTaxEnabled ? (Math.max(0, cartTotal - discAmt) * (taxRate / 100)) : 0;

      return transactionApi.create({ 
        items: cart.map((c) => ({ menuId: c.menu.id, quantity: c.quantity, notes: c.notes })),
        paymentMethod,
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
        customerName: customerName || undefined,
        customerId: selectedCustomerId || undefined,
        discountAmount: discAmt,
        taxAmount,
        shiftId: activeShift?.id
      } as any);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      setCart([]);
      setTableNumber('');
      setCustomerName('');
      setSelectedCustomerId('');
      setCashReceived('');
      setSelectedDiscount(null);
      setReceiptTx(data);
      showToast('Order placed successfully! 🎉');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Checkout failed';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    },
  });

  const addToCart = (menu: Menu) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.menu.id === menu.id);
      if (exists) return prev.map((c) => c.menu.id === menu.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.menu.id === id ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0));
  };

  const updateNotes = (id: string, notes: string) => {
    setCart((prev) => prev.map((c) => c.menu.id === id ? { ...c, notes } : c));
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.menu.id !== id));
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, c) => sum + Number(c.menu.sellingPrice) * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  
  let discountAmount = 0;
  if (selectedDiscount) {
    if (selectedDiscount.type === 'PERCENTAGE') {
      discountAmount = (cartTotal * Number(selectedDiscount.value)) / 100;
    } else {
      discountAmount = Number(selectedDiscount.value);
    }
  }

  const subtotalAfterDiscount = Math.max(0, cartTotal - discountAmount);
  const taxAmount = isTaxEnabled ? subtotalAfterDiscount * (taxRate / 100) : 0;
  const finalTotal = subtotalAfterDiscount + taxAmount;

  const filtered = menus.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategoryId === 'ALL' || (m as any).categoryId === selectedCategoryId;
    return matchSearch && matchCat;
  });

  if (isShiftLoading) return <div style={{ padding: '2rem' }}>Loading POS...</div>;

  if (!activeShift) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent)' }}>
            <LogIn size={28} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Open Shift</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Hi {user?.name}, you need to open a shift with starting cash before using POS.
          </p>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Starting Cash (Rp)</label>
            <input 
              type="number" 
              className="form-control" 
              placeholder="e.g. 500000" 
              value={startingCash}
              onChange={(e) => setStartingCash(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            disabled={!startingCash || openShiftMut.isPending}
            onClick={() => openShiftMut.mutate()}
          >
            {openShiftMut.isPending ? 'Opening...' : 'Open Shift & Start Selling'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* Menu Grid */}
      <div className="main-content" style={{ flex: 1 }}>
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h2>Point of Sale</h2>
          <p>Select menu items to add to the order</p>
        </div>

        <div className="page-body" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="toolbar" style={{ marginBottom: '1rem' }}>
            <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
              <Search />
              <input id="pos-search" placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <button 
                className={`btn ${selectedCategoryId === 'ALL' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setSelectedCategoryId('ALL')}
              >
                All
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  className={`btn ${selectedCategoryId === cat.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {isMenusLoading ? (
            <div className="empty-state"><ShoppingCart /><p>Loading menus...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><ShoppingCart /><p>No menu items found</p></div>
          ) : (
            <div className="menu-grid" style={{ paddingBottom: '2rem' }}>
              {filtered.map((menu) => {
                const inCart = cart.find((c) => c.menu.id === menu.id);
                return (
                  <div
                    key={menu.id}
                    id={`menu-card-${menu.id}`}
                    className="menu-card"
                    onClick={() => addToCart(menu)}
                    style={inCart ? { borderColor: 'var(--accent)', background: 'rgba(99,102,241,0.07)', position: 'relative' } : { position: 'relative' }}
                  >
                    <button 
                      className="btn-icon" 
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,255,255,0.8)', border: 'none', padding: '0.25rem', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={(e) => { e.stopPropagation(); setDetailMenu(menu); }}
                    >
                      <Info size={16} color="var(--text-secondary)" />
                    </button>
                    {/* Image placeholder */}
                    <div style={{ width: '100%', height: 80, borderRadius: '0.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem', fontSize: '2rem' }}>
                      🍽️
                    </div>
                    <div className="menu-card-name">{menu.name}</div>
                    <div className="menu-card-price">{formatCurrency(Number(menu.sellingPrice))}</div>
                    {inCart && (
                      <div style={{ marginTop: '0.25rem', background: 'var(--accent)', color: 'white', borderRadius: '0.375rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0' }}>
                        {inCart.quantity} in cart
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="cart-panel" style={{ width: 380, display: 'flex', flexDirection: 'column' }}>
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={18} />
            Order
            {cartCount > 0 && (
              <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px' }}>
                {cartCount}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={clearCart}><Trash2 size={13} /> Clear</button>
          )}
        </div>

        <div className="cart-items" style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <ShoppingCart />
              <p>Cart is empty</p>
              <p style={{ fontSize: '0.75rem' }}>Click menu items to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menu.id} className="cart-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="cart-item-name" style={{ flex: 1, marginRight: '0.5rem' }}>
                    {item.menu.name}
                    <input 
                      type="text" 
                      placeholder="Notes (e.g. Less sugar)" 
                      style={{ display: 'block', width: '100%', marginTop: '0.25rem', fontSize: '0.75rem', padding: '0.2rem', border: '1px solid var(--border)', borderRadius: '0.25rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.menu.id, e.target.value)}
                    />
                  </div>
                  <button className="btn btn-danger btn-icon" style={{ width: 22, height: 22, padding: 0 }} onClick={() => removeFromCart(item.menu.id)}>
                    <X size={11} />
                  </button>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.menu.id, -1)}><Minus size={12} /></button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.menu.id, 1)}><Plus size={12} /></button>
                  </div>
                  <span className="cart-item-subtotal">
                    {formatCurrency(Number(item.menu.sellingPrice) * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Order Type */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn ${orderType === 'DINE_IN' ? 'btn-primary' : 'btn-secondary'} btn-sm`} 
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setOrderType('DINE_IN')}
            >
              <MapPin size={14} /> Dine In
            </button>
            <button 
              className={`btn ${orderType === 'TAKEAWAY' ? 'btn-primary' : 'btn-secondary'} btn-sm`} 
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setOrderType('TAKEAWAY')}
            >
              <ShoppingCart size={14} /> Takeaway
            </button>
          </div>

          {orderType === 'DINE_IN' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <Hash size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Table Number (e.g. 12)" 
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
          )}

          {/* Customer Name / Member */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--text-muted)" />
              <select 
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  if (e.target.value) setCustomerName(''); // clear manual name if member selected
                }}
              >
                <option value="">Guest (Non-Member)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.pointBalance} Pts)</option>
                ))}
              </select>
            </div>
            {!selectedCustomerId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Guest Name (Optional)" 
                  style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-primary)', paddingLeft: '1.5rem' }}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <Percent size={16} color="var(--text-muted)" />
            <select 
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
              value={selectedDiscount?.id || ''}
              onChange={(e) => {
                const disc = discounts.find(d => d.id === e.target.value);
                setSelectedDiscount(disc || null);
              }}
            >
              <option value="">No Discount</option>
              {discounts.filter(d => d.isActive).map(d => (
                <option key={d.id} value={d.id}>{d.code} - {d.type === 'PERCENTAGE' ? `${d.value}%` : formatCurrency(Number(d.value))}</option>
              ))}
            </select>
          </div>

          <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--danger)' }}>
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {isTaxEnabled && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>PB1 Tax ({taxRate}%)</span>
              <span>+{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>{formatCurrency(finalTotal)}</span>
          </div>

          {/* Payment Method */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
              {['CASH', 'QRIS', 'DEBIT', 'EWALLET'].map((pm) => (
                <button
                  key={pm}
                  className={`btn ${paymentMethod === pm ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setPaymentMethod(pm as any)}
                  style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'CASH' && (
            <div style={{ marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Cash Received (Rp)</label>
              <input 
                type="number" 
                className="form-control" 
                style={{ marginBottom: '0.25rem' }}
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
              />
              {Number(cashReceived) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Change:</span>
                  <span style={{ fontWeight: 700, color: Number(cashReceived) >= finalTotal ? 'var(--success)' : 'var(--danger)' }}>
                    {formatCurrency(Number(cashReceived) - finalTotal)}
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            id="checkout-btn"
            className="btn btn-success"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={cart.length === 0 || checkoutMut.isPending || (orderType === 'DINE_IN' && !tableNumber) || (paymentMethod === 'CASH' && (Number(cashReceived) < finalTotal || cashReceived === ''))}
            onClick={() => setIsConfirmOpen(true)}
          >
            <CheckCircle size={18} />
            {checkoutMut.isPending ? 'Processing...' : 'Checkout Order'}
          </button>
        </div>
      </div>

      {/* Confirm Checkout Modal */}
      {isConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsConfirmOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 700 }}>Confirm Order</h3>
            <p style={{ marginBottom: '1rem' }}>Are you sure you want to process this order?</p>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type</span>
                <span style={{ fontWeight: 600 }}>{orderType === 'DINE_IN' ? `DINE IN (Table ${tableNumber})` : 'TAKEAWAY'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Items</span>
                <span style={{ fontWeight: 600 }}>{cartCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 600 }}>{paymentMethod}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--danger)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Discount</span>
                  <span style={{ fontWeight: 600 }}>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>Total Amount</span>
                <span style={{ fontWeight: 800, color: 'var(--success)' }}>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsConfirmOpen(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => { setIsConfirmOpen(false); checkoutMut.mutate(); }}
                disabled={checkoutMut.isPending}
              >
                {checkoutMut.isPending ? 'Processing...' : 'Yes, Process Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Detail Modal */}
      {detailMenu && (
        <div className="modal-overlay" onClick={() => setDetailMenu(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Menu Detail</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setDetailMenu(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ width: '100%', height: 120, borderRadius: '0.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '3rem', position: 'relative' }}>
                🍽️
                {(detailMenu as any).category?.name && (
                  <span style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {(detailMenu as any).category.name}
                  </span>
                )}
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{detailMenu.name}</h4>
              <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>{formatCurrency(Number(detailMenu.sellingPrice))}</div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Description</span>
                <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{detailMenu.description || 'No description available.'}</p>
              </div>

              {detailMenu.ingredients && detailMenu.ingredients.length > 0 ? (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Komposisi (Ingredients)</span>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {detailMenu.ingredients.map((ing: any) => (
                      <li key={ing.id} style={{ marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 500 }}>{ing.ingredient?.name}</span>: {ing.quantity} {ing.ingredient?.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Komposisi (Ingredients)</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Tidak ada komposisi tercatat.</p>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { addToCart(detailMenu); setDetailMenu(null); }}>
                <ShoppingCart size={16} /> Add to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptTx && (
        <div className="modal-overlay" onClick={() => setReceiptTx(null)}>
          <div className="modal" style={{ maxWidth: 380, padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div id="receipt-content" style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff', color: '#000' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>SHN COFFEE</h2>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {(receiptTx as any)?.orderType === 'DINE_IN' ? `DINE IN - Table ${(receiptTx as any).tableNumber}` : 'TAKEAWAY'}
                </div>
                {((receiptTx as any)?.customerName || (receiptTx as any)?.customer?.name) && (
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    Customer: {((receiptTx as any)?.customerName || (receiptTx as any)?.customer?.name)}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                  {receiptTx.orderNumber || `Order #${receiptTx.id.slice(0, 8).toUpperCase()}`}
                  <br />
                  {new Date(receiptTx.createdAt).toLocaleString('id-ID')}
                  <br />
                  Method: {receiptTx.paymentMethod || 'CASH'}
                  <br />
                  Cashier: {(receiptTx as any).user?.name || 'System'}
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '1rem 0', marginBottom: '1rem' }}>
                {receiptTx.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.menu?.name || 'Unknown Menu'}</div>
                      {(item as any).notes && (
                        <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>Note: {(item as any).notes}</div>
                      )}
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>{item.quantity} x {formatCurrency(Number(item.priceAtSale))}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(Number(item.subtotal))}</div>
                  </div>
                ))}
              </div>

              {(receiptTx as any).discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(Number((receiptTx as any).discountAmount))}</span>
                </div>
              )}

              {(receiptTx as any).taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>PB1 Tax</span>
                  <span>+{formatCurrency(Number((receiptTx as any).taxAmount))}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                <span>TOTAL</span>
                <span>{formatCurrency(Number(receiptTx.totalAmount))}</span>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}>
                Thank you for your order - SHN COFFEE!
              </div>
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}
                onClick={() => setReceiptTx(null)}
              >
                Close
              </button>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => {
                  const win = window.open('', '', 'width=400,height=600');
                  if (win) {
                    const itemsHtml = receiptTx.items.map(item => `
                      <div style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
                        <div style="font-weight: bold; font-size: 1.2rem;">${item.quantity} x ${item.menu?.name || 'Unknown Menu'}</div>
                        ${(item as any).notes ? `<div style="font-size: 1rem; color: #333; font-weight: bold; margin-top: 5px;">Catatan: ${(item as any).notes}</div>` : ''}
                      </div>
                    `).join('');
                    win.document.write(`
                      <html>
                        <head>
                          <title>Kitchen Ticket</title>
                          <style>
                            body { font-family: monospace; margin: 0; padding: 20px; color: black; background: white; }
                          </style>
                        </head>
                        <body>
                          <h2 style="text-align: center; margin-top: 0; border-bottom: 2px solid black; padding-bottom: 10px;">KITCHEN TICKET</h2>
                          <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 15px;">
                            ${(receiptTx as any)?.orderType === 'DINE_IN' ? `DINE IN - Table ${(receiptTx as any).tableNumber}` : 'TAKEAWAY'}<br/>
                            ${((receiptTx as any)?.customerName || (receiptTx as any)?.customer?.name) ? `Customer: ${((receiptTx as any)?.customerName || (receiptTx as any)?.customer?.name)}<br/>` : ''}
                            Time: ${new Date(receiptTx.createdAt).toLocaleTimeString('id-ID')}
                          </div>
                          <div>${itemsHtml}</div>
                          <script>
                            window.onload = () => { window.print(); window.close(); }
                          </script>
                        </body>
                      </html>
                    `);
                    win.document.close();
                  }
                }}
              >
                <Printer size={16} /> Kitchen
              </button>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => {
                  const content = document.getElementById('receipt-content')?.innerHTML;
                  const win = window.open('', '', 'width=400,height=600');
                  if (win) {
                    win.document.write(`
                      <html>
                        <head>
                          <title>Receipt</title>
                          <style>
                            body { font-family: monospace; margin: 0; padding: 20px; color: black; background: white; }
                          </style>
                        </head>
                        <body>
                          ${content}
                          <script>
                            window.onload = () => { window.print(); window.close(); }
                          </script>
                        </body>
                      </html>
                    `);
                    win.document.close();
                  }
                }}
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
