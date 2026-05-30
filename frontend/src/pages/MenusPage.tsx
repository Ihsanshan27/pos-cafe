import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, ingredientApi, categoryApi } from '../lib/api';
import type { Menu, CreateMenuPayload, Category } from '../lib/api';
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, X, Check, TrendingUp, Eye } from 'lucide-react';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

type RecipeRow = { ingredientId: string; quantity: string };

type FormData = {
  name: string;
  description: string;
  sellingPrice: string;
  imageUrl: string;
  categoryId: string;
  ingredients: RecipeRow[];
};

const emptyForm: FormData = { name: '', description: '', sellingPrice: '', imageUrl: '', categoryId: '', ingredients: [] };

export default function MenusPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Menu | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data: menus = [], isLoading } = useQuery({ queryKey: ['menus'], queryFn: menuApi.getAll });
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: ingredientApi.getAll });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryApi.getAll });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const buildPayload = (f: FormData): CreateMenuPayload & { categoryId?: string | null } => ({
    name: f.name,
    description: f.description || undefined,
    sellingPrice: Number(f.sellingPrice),
    imageUrl: f.imageUrl || undefined,
    categoryId: f.categoryId || null,
    ingredients: f.ingredients.filter((r) => r.ingredientId && r.quantity).map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity) })),
  });

  const createMut = useMutation({
    mutationFn: (f: FormData) => menuApi.create(buildPayload(f) as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menus'] }); setModal(null); showToast('Menu created!'); },
    onError: () => showToast('Failed to create menu', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (f: FormData) => menuApi.update(selected!.id, buildPayload(f) as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menus'] }); setModal(null); showToast('Menu updated!'); },
    onError: () => showToast('Failed to update menu', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => menuApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menus'] }); showToast('Menu deleted!'); },
    onError: () => showToast('Failed to delete menu', 'error'),
  });

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openView = (m: Menu) => {
    setSelected(m);
    setModal('view');
  };
  const openEdit = (m: Menu) => {
    setSelected(m);
    setForm({
      name: m.name,
      description: m.description ?? '',
      sellingPrice: String(m.sellingPrice),
      imageUrl: m.imageUrl ?? '',
      categoryId: (m as any).categoryId ?? '',
      ingredients: m.ingredients.map((r) => ({ ingredientId: r.ingredientId, quantity: String(r.quantity) })),
    });
    setModal('edit');
  };

  const addRecipeRow = () => setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ingredientId: '', quantity: '' }] }));
  const removeRecipeRow = (idx: number) => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  const updateRecipeRow = (idx: number, key: keyof RecipeRow, val: string) =>
    setForm((f) => ({ ...f, ingredients: f.ingredients.map((r, i) => i === idx ? { ...r, [key]: val } : r) }));

  const filtered = menus.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const profitPct = (menu: Menu) => {
    const hpp = Number(menu.hpp);
    const price = Number(menu.sellingPrice);
    if (!hpp || !price) return null;
    return (((price - hpp) / price) * 100).toFixed(1);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Menus</h2>
        <p>Manage menu items, recipes, and pricing</p>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
              <Search />
              <input id="menu-search" placeholder="Search menus..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <button id="create-menu-btn" className="btn btn-primary" onClick={openCreate}>
            <Plus /> Add Menu
          </button>
        </div>

        {isLoading ? (
          <div className="empty-state"><UtensilsCrossed /><p>Loading menus...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><UtensilsCrossed /><p>No menus found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Selling Price</th>
                  <th>HPP (COGS)</th>
                  <th>Profit Margin</th>
                  <th>Recipe Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const pct = profitPct(m);
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{(m as any).category?.name || '-'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(Number(m.sellingPrice))}</td>
                      <td style={{ color: 'var(--warning)' }}>{formatCurrency(Number(m.hpp))}</td>
                      <td>
                        {pct ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: Number(pct) >= 30 ? 'var(--success)' : 'var(--warning)' }}>
                            <TrendingUp size={13} />{pct}%
                          </span>
                        ) : '-'}
                      </td>
                      <td><span className="badge badge-accent">{m.ingredients.length} items</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openView(m)}><Eye size={14} /></button>
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(m)}><Pencil size={14} /></button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm(`Delete "${m.name}"?`)) deleteMut.mutate(m.id); }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Menu Details</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            
            <div style={{ padding: '0.5rem 0' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{selected.name}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{selected.description || 'No description available.'}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selling Price</div>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(Number(selected.sellingPrice))}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HPP (COGS)</div>
                  <div style={{ fontWeight: 600, color: 'var(--warning)' }}>{formatCurrency(Number(selected.hpp))}</div>
                </div>
              </div>

              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UtensilsCrossed size={16} /> Recipe
              </h5>
              
              {selected.ingredients.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>No recipe ingredients defined.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selected.ingredients.map((item) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed var(--border)', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 500 }}>{item.ingredient.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.quantity} {item.ingredient.unit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setModal(null)} style={{ width: '100%', justifyContent: 'center' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {modal && modal !== 'view' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Add Menu' : 'Edit Menu'}</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setModal(null)}><X size={16} /></button>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '70vh', paddingRight: '0.25rem' }}>
              <div className="form-group">
                <label>Name *</label>
                <input placeholder="e.g. Nasi Goreng Spesial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} placeholder="Optional description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">No Category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Selling Price (Rp) *</label>
                  <input type="number" min="0" placeholder="0" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
                </div>
              </div>

              {/* Recipe Items */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ margin: 0 }}>Recipe Ingredients</label>
                  <button className="btn btn-secondary btn-sm" onClick={addRecipeRow}><Plus size={13} /> Add</button>
                </div>
                {form.ingredients.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                    No recipe items yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {form.ingredients.map((row, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <select value={row.ingredientId} onChange={(e) => updateRecipeRow(idx, 'ingredientId', e.target.value)}>
                          <option value="">Select ingredient...</option>
                          {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                        </select>
                        <input type="number" min="0" step="0.1" placeholder="Qty" value={row.quantity} onChange={(e) => updateRecipeRow(idx, 'quantity', e.target.value)} />
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeRecipeRow(idx)}><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
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

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
