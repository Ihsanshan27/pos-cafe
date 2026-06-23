import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outletApi } from '../lib/api';
import { Plus, Store, Trash2 } from 'lucide-react';

const emptyForm = { name: '', slug: '', address: '', phone: '', isActive: true };
const emptyTableForm = { code: '', label: '', isActive: true };

export default function OutletsPage() {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [form, setForm] = useState(emptyForm);
  const [tableForm, setTableForm] = useState(emptyTableForm);

  const { data: outlets = [], isLoading } = useQuery({
    queryKey: ['outlets'],
    queryFn: outletApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: () => outletApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outlets'] });
      setForm(emptyForm);
      setIsOpen(false);
    },
  });

  const createTableMut = useMutation({
    mutationFn: () => outletApi.createTable(selectedOutletId, tableForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outlets'] });
      setTableForm(emptyTableForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => outletApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outlets'] }),
  });

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Outlets</h2>
          <p>Kelola cabang, slug outlet, dan QR meja untuk order publik.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          <Plus size={18} /> Tambah Outlet
        </button>
      </div>

      <div className="page-body">
        {isLoading ? (
          <div className="empty-state"><Store /><p>Loading outlets...</p></div>
        ) : outlets.length === 0 ? (
          <div className="empty-state"><Store /><p>Belum ada outlet.</p></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {outlets.map((outlet) => (
              <div key={outlet.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.35rem' }}>{outlet.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      `/{outlet.slug}` • {outlet.address || 'Tanpa alamat'} • {outlet.phone || 'Tanpa telepon'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      {outlet._count?.users || 0} staff • {outlet._count?.transactions || 0} transaksi
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => { if (confirm(`Hapus outlet ${outlet.name}?`)) deleteMut.mutate(outlet.id); }}
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <strong>QR Meja</strong>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedOutletId((prev) => prev === outlet.id ? '' : outlet.id)}
                    >
                      {selectedOutletId === outlet.id ? 'Tutup Form QR' : 'Tambah QR Meja'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {outlet.tableQRCodes?.map((table) => (
                      <div key={table.id} style={{ padding: '0.75rem', borderRadius: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 700 }}>{table.label || table.code}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Link: `/public/order/{outlet.slug}/{table.code}`
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedOutletId === outlet.id && (
                    <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <input placeholder="Kode meja, mis. A1" value={tableForm.code} onChange={(e) => setTableForm((prev) => ({ ...prev, code: e.target.value }))} />
                      <input placeholder="Label meja, mis. Terrace A1" value={tableForm.label} onChange={(e) => setTableForm((prev) => ({ ...prev, label: e.target.value }))} />
                      <button className="btn btn-primary" disabled={!tableForm.code || createTableMut.isPending} onClick={() => createTableMut.mutate()}>
                        Simpan QR Meja
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tambah Outlet</h3>
            <div className="form-group">
              <label>Nama Outlet</label>
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Slug Outlet</label>
              <input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="mis. pusat-menteng" />
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Telepon</label>
              <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={() => createMut.mutate()} disabled={!form.name || !form.slug || createMut.isPending}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
