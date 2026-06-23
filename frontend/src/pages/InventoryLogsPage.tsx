import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryLogApi, ingredientApi } from '../lib/api';
import { Plus, Search, ClipboardList } from 'lucide-react';
import { useAppPublicSettings } from '../hooks/useAppPublicSettings';

function getLogTone(type: string, quantity: number) {
  const isPositive = type === 'IN' || type === 'VOID' || (type === 'ADJUSTMENT' && quantity > 0);

  return {
    background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
    color: isPositive ? '#047857' : '#b91c1c',
    signedQuantity: `${isPositive ? '+' : '-'}${Math.abs(quantity)}`,
  };
}

export default function InventoryLogsPage() {
  const qc = useQueryClient();
  const { requireAdjustmentNote } = useAppPublicSettings();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ ingredientId: '', type: 'IN', quantity: '', notes: '' });

  const { data: logs = [], isLoading } = useQuery({ queryKey: ['inventory-logs'], queryFn: inventoryLogApi.getAll });
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: ingredientApi.getAll });

  const createMut = useMutation({
    mutationFn: () => inventoryLogApi.create({ ...form, quantity: Number(form.quantity) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-logs'] });
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      setIsOpen(false);
      setForm({ ingredientId: '', type: 'IN', quantity: '', notes: '' });
    }
  });

  const adjustmentNeedsNote = requireAdjustmentNote && form.type === 'ADJUSTMENT' && !form.notes.trim();

  const filtered = logs.filter((l) => {
    const query = search.toLowerCase();
    return (
      l.ingredient?.name.toLowerCase().includes(query) ||
      l.type.toLowerCase().includes(query) ||
      (l.createdByName || l.createdBy || '').toLowerCase().includes(query) ||
      (l.notes || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Inventory Logs</h2>
          <p>Riwayat pergerakan barang (Masuk, Keluar, Terjual)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          <Plus size={18} /> Catat Log Manual
        </button>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-bar">
            <Search size={18} />
            <input placeholder="Cari bahan atau tipe..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Bahan Baku</th>
                  <th>Tipe Log</th>
                  <th>Kuantitas</th>
                  <th>Catatan</th>
                  <th>Oleh</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const tone = getLogTone(l.type, l.quantity);

                  return (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span>{new Date(l.createdAt).toLocaleDateString('id-ID')}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(l.createdAt).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{l.ingredient?.name}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        background: tone.background,
                        color: tone.color
                      }}>
                        {l.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: tone.color }}>
                      {tone.signedQuantity} {l.ingredient?.unit}
                    </td>
                    <td style={{ maxWidth: 280 }}>{l.notes || '-'}</td>
                    <td>
                      <span style={{ padding: '0.25rem 0.55rem', borderRadius: '999px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {l.createdByName || l.createdBy || 'System'}
                      </span>
                    </td>
                  </tr>
                )})}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada log pergerakan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Pencatatan Stok Manual</h3>
            <div className="form-group">
              <label>Bahan Baku</label>
              <select className="input" value={form.ingredientId} onChange={e => setForm({...form, ingredientId: e.target.value})}>
                <option value="">Pilih Bahan</option>
                {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} (Stok: {i.stockQuantity} {i.unit})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tipe Log</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="IN">Stok Masuk (IN)</option>
                <option value="OUT">Stok Keluar (OUT / Rusak / Expired)</option>
                <option value="ADJUSTMENT">Penyesuaian (Opname)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Kuantitas (Angka absolut)</label>
              <input type="number" className="input" placeholder="contoh: 500" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Catatan Tambahan</label>
              <input type="text" className="input" placeholder="contoh: Restock mingguan" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              {requireAdjustmentNote && form.type === 'ADJUSTMENT' && (
                <small style={{ color: adjustmentNeedsNote ? 'var(--danger)' : 'var(--text-muted)' }}>
                  Stock adjustment wajib menyertakan catatan alasan/opname.
                </small>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>Batal</button>
              <button
                className="btn btn-primary"
                onClick={() => createMut.mutate()}
                disabled={!form.ingredientId || !form.quantity || adjustmentNeedsNote || createMut.isPending}
              >
                Simpan Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
