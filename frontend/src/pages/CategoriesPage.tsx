import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../lib/api';
import type { Category } from '../lib/api';
import { Plus, Edit2, Trash2, Tag, X, CheckCircle } from 'lucide-react';

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const createMut = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      showToast('Category created successfully');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Error creating category', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (data: { id: string; cat: Partial<Category> }) => categoryApi.update(data.id, data.cat),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      showToast('Category updated successfully');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Error updating category', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      showToast('Category deleted successfully');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Error deleting category', 'error'),
  });

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name });
    } else {
      setEditingCat(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      updateMut.mutate({ id: editingCat.id, cat: formData });
    } else {
      createMut.mutate(formData);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Manage your menu categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="page-body">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={2} style={{ textAlign: 'center', padding: '2rem' }}>Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={2} style={{ textAlign: 'center', padding: '2rem' }}>No categories found.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', borderRadius: '0.5rem' }}>
                          <Tag size={18} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-icon" onClick={() => openModal(cat)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => {
                          if (confirm('Are you sure you want to delete this category?')) {
                            deleteMut.mutate(cat.id);
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
              <h3>{editingCat ? 'Edit Category' : 'New Category'}</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Coffee"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Category'}
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
