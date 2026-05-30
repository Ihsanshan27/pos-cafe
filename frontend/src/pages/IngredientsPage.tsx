import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientApi } from '../lib/api';
import type { Ingredient } from '../lib/api';
import { Plus, Search, Pencil, Trash2, Package, X, Check } from 'lucide-react';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

type FormData = { name: string; unit: string; costPerUnit: string; stockQuantity: string };
const empty: FormData = { name: '', unit: '', costPerUnit: '', stockQuantity: '' };

export default function IngredientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data: ingredients = [], isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientApi.getAll,
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const createMut = useMutation({
    mutationFn: (data: FormData) =>
      ingredientApi.create({ name: data.name, unit: data.unit, costPerUnit: Number(data.costPerUnit), stockQuantity: Number(data.stockQuantity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingredients'] }); setModal(null); showToast('Ingredient created!'); },
    onError: () => showToast('Failed to create ingredient', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (data: FormData) =>
      ingredientApi.update(selected!.id, { name: data.name, unit: data.unit, costPerUnit: Number(data.costPerUnit), stockQuantity: Number(data.stockQuantity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingredients'] }); setModal(null); showToast('Ingredient updated!'); },
    onError: () => showToast('Failed to update ingredient', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => ingredientApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingredients'] }); showToast('Ingredient deleted!'); },
    onError: () => showToast('Failed to delete ingredient', 'error'),
  });

  const openCreate = () => { setForm(empty); setModal('create'); };
  const openEdit = (i: Ingredient) => {
    setSelected(i);
    setForm({ name: i.name, unit: i.unit, costPerUnit: String(i.costPerUnit), stockQuantity: String(i.stockQuantity) });
    setModal('edit');
  };

  const filtered = ingredients.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Ingredients</h2>
        <p>Manage raw materials, stock, and costs</p>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
              <Search />
              <input id="ingredient-search" placeholder="Search ingredients..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <button id="create-ingredient-btn" className="btn btn-primary" onClick={openCreate}>
            <Plus /> Add Ingredient
          </button>
        </div>

        {isLoading ? (
          <div className="empty-state"><Package /><p>Loading ingredients...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Package /><p>No ingredients found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Unit</th>
                  <th>Cost per Unit</th>
                  <th>Stock</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600 }}>{i.name}</td>
                    <td><span className="badge badge-accent">{i.unit}</span></td>
                    <td>{formatCurrency(Number(i.costPerUnit))}</td>
                    <td style={{ fontWeight: 600 }}>{i.stockQuantity}</td>
                    <td>
                      <span className={`badge ${i.stockQuantity < 10 ? 'badge-danger' : i.stockQuantity < 50 ? 'badge-warning' : 'badge-success'}`}>
                        {i.stockQuantity < 10 ? 'Low Stock' : i.stockQuantity < 50 ? 'Medium' : 'Good'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(i)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm(`Delete "${i.name}"?`)) deleteMut.mutate(i.id); }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Add Ingredient' : 'Edit Ingredient'}</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setModal(null)}><X size={16} /></button>
            </div>

            <div className="form-group">
              <label htmlFor="ing-name">Name *</label>
              <input id="ing-name" placeholder="e.g. Sugar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="ing-unit">Unit *</label>
              <input id="ing-unit" placeholder="e.g. gram, ml, pcs" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label htmlFor="ing-cost">Cost per Unit (Rp) *</label>
                <input id="ing-cost" type="number" min="0" placeholder="0" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="ing-stock">Stock Quantity *</label>
                <input id="ing-stock" type="number" min="0" placeholder="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                id="save-ingredient-btn"
                className="btn btn-primary"
                disabled={createMut.isPending || updateMut.isPending}
                onClick={() => modal === 'create' ? createMut.mutate(form) : updateMut.mutate(form)}
              >
                <Check size={16} /> {modal === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
