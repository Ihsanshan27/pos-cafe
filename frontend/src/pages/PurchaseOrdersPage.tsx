import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ingredientApi, outletApi, purchaseOrderApi, supplierApi } from '../lib/api';
import { Plus, ShoppingBag } from 'lucide-react';
import { useActiveOutlet } from '../hooks/useActiveOutlet';

export default function PurchaseOrdersPage() {
  const qc = useQueryClient();
  const { activeOutletId } = useActiveOutlet();
  const [isOpen, setIsOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ ingredientId: '', quantity: '1', unitCost: '0' }]);

  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: supplierApi.getAll });
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: ingredientApi.getAll });
  const { data: outlets = [] } = useQuery({ queryKey: ['outlets'], queryFn: outletApi.getAll });
  const { data: purchaseOrders = [], isLoading } = useQuery({
    queryKey: ['purchase-orders', activeOutletId],
    queryFn: () => purchaseOrderApi.getAll(activeOutletId || undefined),
  });

  const createMut = useMutation({
    mutationFn: () =>
      purchaseOrderApi.create({
        supplierId,
        outletId: activeOutletId || undefined,
        expectedDate: expectedDate || undefined,
        notes,
        items: items.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      setIsOpen(false);
      setSupplierId('');
      setExpectedDate('');
      setNotes('');
      setItems([{ ingredientId: '', quantity: '1', unitCost: '0' }]);
    },
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ORDERED' | 'RECEIVED' | 'CANCELLED' }) =>
      purchaseOrderApi.updateStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });

  const activeOutlet = useMemo(() => outlets.find((item) => item.id === activeOutletId), [activeOutletId, outlets]);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Purchase Orders</h2>
          <p>Kelola pembelian bahan baku dan receiving stok. Outlet aktif: {activeOutlet?.name || 'Semua / belum dipilih'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          <Plus size={18} /> Buat PO
        </button>
      </div>

      <div className="page-body">
        {isLoading ? (
          <div className="empty-state"><ShoppingBag /><p>Loading purchase orders...</p></div>
        ) : purchaseOrders.length === 0 ? (
          <div className="empty-state"><ShoppingBag /><p>Belum ada purchase order.</p></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {purchaseOrders.map((po) => (
              <div key={po.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>{po.orderNumber}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {po.supplier.name} • {po.outlet?.name || 'Global'} • {new Date(po.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <span className={`badge ${po.status === 'RECEIVED' ? 'badge-success' : po.status === 'CANCELLED' ? 'badge-danger' : po.status === 'ORDERED' ? 'badge-warning' : 'badge-secondary'}`}>
                    {po.status}
                  </span>
                </div>

                <div style={{ marginTop: '0.85rem', display: 'grid', gap: '0.45rem' }}>
                  {po.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', background: 'var(--bg-secondary)' }}>
                      <span>{item.ingredient.name} • {item.quantity} {item.ingredient.unit}</span>
                      <strong>Rp {Number(item.unitCost).toLocaleString('id-ID')}</strong>
                    </div>
                  ))}
                </div>

                {po.status === 'DRAFT' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => updateStatusMut.mutate({ id: po.id, status: 'ORDERED' })}>Mark Ordered</button>
                    <button className="btn btn-success" onClick={() => updateStatusMut.mutate({ id: po.id, status: 'RECEIVED' })}>Receive Stock</button>
                    <button className="btn btn-danger" onClick={() => updateStatusMut.mutate({ id: po.id, status: 'CANCELLED' })}>Cancel</button>
                  </div>
                )}
                {po.status === 'ORDERED' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-success" onClick={() => updateStatusMut.mutate({ id: po.id, status: 'RECEIVED' })}>Receive Stock</button>
                    <button className="btn btn-danger" onClick={() => updateStatusMut.mutate({ id: po.id, status: 'CANCELLED' })}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Buat Purchase Order</h3>
            <div className="form-group">
              <label>Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Pilih supplier</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Expected Date</label>
              <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Catatan</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
                  <select value={item.ingredientId} onChange={(e) => setItems((prev) => prev.map((entry, idx) => idx === index ? { ...entry, ingredientId: e.target.value } : entry))}>
                    <option value="">Pilih bahan</option>
                    {ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}
                  </select>
                  <input type="number" min="0" value={item.quantity} onChange={(e) => setItems((prev) => prev.map((entry, idx) => idx === index ? { ...entry, quantity: e.target.value } : entry))} />
                  <input type="number" min="0" value={item.unitCost} onChange={(e) => setItems((prev) => prev.map((entry, idx) => idx === index ? { ...entry, unitCost: e.target.value } : entry))} />
                </div>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '0.75rem' }} onClick={() => setItems((prev) => [...prev, { ingredientId: '', quantity: '1', unitCost: '0' }])}>
              Tambah Item
            </button>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={() => createMut.mutate()} disabled={!supplierId || items.some((item) => !item.ingredientId) || createMut.isPending}>
                Simpan PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
