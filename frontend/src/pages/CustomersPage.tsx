import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../lib/api';
import { Plus, Users, Search, Trash2 } from 'lucide-react';

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: customerApi.getAll });

  const createMut = useMutation({
    mutationFn: () => customerApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setIsOpen(false);
      setForm({ name: '', phone: '', email: '' });
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] })
  });

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Customers (CRM)</h2>
          <p>Kelola data pelanggan dan point reward</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          <Plus size={18} /> Tambah Customer
        </button>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-bar">
            <Search size={18} />
            <input placeholder="Cari pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Telepon</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Point Reward</th>
                  <th style={{ width: 100 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td><span className={`badge`} style={{ background: c.tier === 'GOLD' ? '#fbbf24' : c.tier === 'SILVER' ? '#9ca3af' : '#d97706', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>{c.tier}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{c.pointBalance} Pts</td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon danger" onClick={() => { if(confirm('Hapus pelanggan?')) deleteMut.mutate(c.id); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Tambah Customer Baru</h3>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input type="text" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Nomor Telepon</label>
              <input type="text" className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={() => createMut.mutate()} disabled={!form.name || createMut.isPending}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
