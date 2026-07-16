import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modifierApi } from '../lib/api';
import type { ModifierGroup, ModifierOption } from '../lib/api';
import { ListPlus, Plus, Trash2, Edit, X } from 'lucide-react';
import { useSortableData } from '../hooks/useSortableData';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ModifiersPage() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);

  const [name, setName] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [options, setOptions] = useState<{ id?: string; name: string; price: number }[]>([]);

  const { data: modifiers = [], isLoading } = useQuery({
    queryKey: ['modifiers'],
    queryFn: modifierApi.getAll,
  });

  const { items: sortedModifiers, requestSort, sortConfig } = useSortableData(modifiers, { key: 'name', direction: 'asc' });

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const resetForm = () => {
    setName('');
    setIsRequired(false);
    setIsMultiple(false);
    setOptions([]);
    setEditingGroup(null);
  };

  const createMut = useMutation({
    mutationFn: () => modifierApi.create({ name, isRequired, isMultiple, options }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modifiers'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () => modifierApi.update(editingGroup!.id, { name, isRequired, isMultiple, options: options as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modifiers'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => modifierApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modifiers'] }),
  });

  const handleEdit = (g: ModifierGroup) => {
    setEditingGroup(g);
    setName(g.name);
    setIsRequired(g.isRequired);
    setIsMultiple(g.isMultiple);
    setOptions(g.options.map(o => ({ id: o.id, name: o.name, price: Number(o.price) })));
    setIsModalOpen(true);
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>General Modifiers</h2>
          <p>Kelola pilihan tambahan (topping, level pedas) yang dapat digunakan oleh banyak menu.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Modifier
        </button>
      </div>

      <div className="page-body">
        {isLoading ? (
          <div className="empty-state"><ListPlus /><p>Loading modifiers...</p></div>
        ) : sortedModifiers.length === 0 ? (
          <div className="empty-state">
            <ListPlus />
            <p>Belum ada modifier terdaftar</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsModalOpen(true)}>
              Create First Modifier
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => requestSort('name')}>Name {getSortIcon('name')}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => requestSort('isRequired')}>Required {getSortIcon('isRequired')}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => requestSort('isMultiple')}>Multiple Selection {getSortIcon('isMultiple')}</th>
                  <th>Options count</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedModifiers.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600 }}>{g.name}</td>
                    <td>{g.isRequired ? <span className="badge badge-warning">Wajib</span> : <span className="badge badge-secondary">Opsional</span>}</td>
                    <td>{g.isMultiple ? <span className="badge badge-primary">Bisa Pilih Banyak</span> : <span className="badge badge-secondary">Pilih Satu</span>}</td>
                    <td>{g.options.length} options</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }} onClick={() => handleEdit(g)}>
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '0.4rem' }} 
                          onClick={() => { if(confirm('Delete this modifier group?')) deleteMut.mutate(g.id); }}
                          disabled={deleteMut.isPending}
                        >
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGroup ? 'Edit Modifier Group' : 'New Modifier Group'}</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Group Name (e.g. Pilihan Susu, Level Pedas)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Group Name" autoFocus />
              </div>

              <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
                  <span>Wajib Dipilih (Required)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isMultiple} onChange={e => setIsMultiple(e.target.checked)} />
                  <span>Bisa Pilih Banyak (Multiple)</span>
                </label>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label>Options</label>
                  <button className="btn btn-secondary btn-sm" onClick={() => setOptions([...options, { name: '', price: 0 }])}>
                    <Plus size={14} /> Add Option
                  </button>
                </div>
                
                {options.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Belum ada opsi. Klik Add Option.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {options.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="Nama (mis: Oat Milk)" 
                          value={opt.name} 
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[idx].name = e.target.value;
                            setOptions(newOpts);
                          }}
                          style={{ flex: 1 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0 0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>+Rp</span>
                          <input 
                            type="number" 
                            min="0"
                            placeholder="Harga Tambahan" 
                            value={opt.price} 
                            onChange={(e) => {
                              const newOpts = [...options];
                              newOpts[idx].price = Number(e.target.value);
                              setOptions(newOpts);
                            }}
                            style={{ width: '120px', border: 'none', background: 'transparent' }}
                          />
                        </div>
                        <button className="btn btn-danger btn-icon" onClick={() => setOptions(options.filter((_, i) => i !== idx))}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => editingGroup ? updateMut.mutate() : createMut.mutate()}
                disabled={!name.trim() || options.some(o => !o.name.trim())}
              >
                {editingGroup ? 'Save Changes' : 'Create Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
