import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../lib/api';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveOutlet } from '../hooks/useActiveOutlet';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function ExpensesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { activeOutletId, activeOutlet } = useActiveOutlet();
  const isManagerOrOwner = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', activeOutletId],
    queryFn: () => expenseApi.getAll(activeOutletId || undefined),
  });

  const createMut = useMutation({
    mutationFn: () => expenseApi.create({ description, amount: Number(amount), outletId: activeOutletId || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      setDescription('');
      setAmount('');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (!isManagerOrOwner) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <p>Access Denied. Owner or Manager only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Operational Expenses</h2>
          <p>Track your daily shop expenses{activeOutlet ? ` • ${activeOutlet.name}` : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="page-body">
        <div className="stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: '1fr' }}>
          <div className="stat-card" style={{ maxWidth: 300 }}>
            <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Wallet color="#ef4444" />
            </div>
            <div>
              <div className="stat-card-label">Total Expenses</div>
              <div className="stat-card-value" style={{ fontSize: '1.2rem', color: 'var(--danger)' }}>
                {formatCurrency(totalExpense)}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state"><Wallet /><p>Loading expenses...</p></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state"><Wallet /><p>No expenses recorded yet.</p></div>
        ) : (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      {new Date(exp.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{exp.description}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>
                      {formatCurrency(Number(exp.amount))}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-danger btn-sm" 
                        style={{ padding: '0.4rem', borderRadius: '0.4rem' }}
                        onClick={() => { if(confirm('Delete this expense?')) deleteMut.mutate(exp.id) }}
                        disabled={deleteMut.isPending}
                      >
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 700 }}>Record Expense</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Description (e.g., Token Listrik, Plastik)</label>
                <input
                  type="text"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expense description"
                />
              </div>
              <div>
                <label className="form-label">Amount (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  min="0"
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => createMut.mutate()} 
                disabled={!description || !amount || createMut.isPending}
              >
                {createMut.isPending ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
