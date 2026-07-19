import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountApi } from '../lib/api';
import type { Discount } from '../lib/api';
import { Plus, Edit2, Trash2, Percent, X, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useSortableData } from '../hooks/useSortableData';

export default function DiscountsPage() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({ code: '', type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED', value: 0, isActive: true });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: discountApi.getAll,
  });

  const { items: sortedDiscounts, requestSort, sortConfig } = useSortableData(discounts, { key: 'code', direction: 'asc' });

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const createMut = useMutation({
    mutationFn: discountApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      setIsModalOpen(false);
      showToast('Discount created successfully');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Error creating discount', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (data: { id: string; disc: Partial<Discount> }) => discountApi.update(data.id, data.disc),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      setIsModalOpen(false);
      showToast('Discount updated successfully');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Error updating discount', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: discountApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      showToast('Discount deleted successfully');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Error deleting discount', 'error'),
  });

  const openModal = (disc?: Discount) => {
    if (disc) {
      setEditingDisc(disc);
      setFormData({ code: disc.code, type: disc.type, value: Number(disc.value), isActive: disc.isActive });
    } else {
      setEditingDisc(null);
      setFormData({ code: '', type: 'PERCENTAGE', value: 0, isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDisc) {
      updateMut.mutate({ id: editingDisc.id, disc: formData });
    } else {
      createMut.mutate(formData);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Discounts</h2>
          <p>Manage promo codes and discounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Discount
        </button>
      </div>

      <div className="page-body">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('code')}>Code {getSortIcon('code')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('type')}>Type {getSortIcon('type')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('value')}>Value {getSortIcon('value')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('isActive')}>Status {getSortIcon('isActive')}</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading discounts...</td></tr>
              ) : sortedDiscounts.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No discounts found.</td></tr>
              ) : (
                sortedDiscounts.map((disc) => (
                  <tr key={disc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '0.5rem' }}>
                          <Percent size={18} />
                        </div>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{disc.code}</span>
                      </div>
                    </td>
                    <td>{disc.type}</td>
                    <td>{disc.type === 'PERCENTAGE' ? `${disc.value}%` : `Rp ${Number(disc.value).toLocaleString('id-ID')}`}</td>
                    <td>
                      <span className={`badge ${disc.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {disc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-icon" onClick={() => openModal(disc)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => {
                          if (confirm('Are you sure you want to delete this discount?')) {
                            deleteMut.mutate(disc.id);
                          }
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDisc ? 'Edit Discount' : 'New Discount'}</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Discount Code</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., PROMO10"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (Rp)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 15000'}
                  />
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                <label htmlFor="isActive" style={{ margin: 0 }}>Is Active?</label>
              </div>
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
