import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supplierApi } from '../lib/api';
import { Plus, Trash2, Truck } from 'lucide-react';

const emptyForm = { name: '', phone: '', email: '', address: '', notes: '' };

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: () => supplierApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setForm(emptyForm);
      setIsOpen(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Suppliers</h2>
          <p>Kelola pemasok bahan baku untuk kebutuhan purchase order.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          <Plus size={18} /> Tambah Supplier
        </button>
      </div>

      <div className="page-body">
        {isLoading ? (
          <div className="empty-state"><Truck /><p>Loading suppliers...</p></div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state"><Truck /><p>Belum ada supplier.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kontak</th>
                  <th>Alamat</th>
                  <th>PO</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td style={{ fontWeight: 700 }}>{supplier.name}</td>
                    <td>{supplier.phone || supplier.email || '-'}</td>
                    <td>{supplier.address || '-'}</td>
                    <td>{supplier._count?.purchaseOrders || 0}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Hapus supplier ${supplier.name}?`)) deleteMut.mutate(supplier.id); }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tambah Supplier</h3>
            <div className="form-group"><label>Nama</label><input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} /></div>
            <div className="form-group"><label>Telepon</label><input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} /></div>
            <div className="form-group"><label>Email</label><input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} /></div>
            <div className="form-group"><label>Alamat</label><input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} /></div>
            <div className="form-group"><label>Catatan</label><textarea rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} /></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={() => createMut.mutate()} disabled={!form.name || createMut.isPending}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
