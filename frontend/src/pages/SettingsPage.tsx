import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../lib/api';
import { Settings, CheckCircle, X } from 'lucide-react';

export default function SettingsPage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data: taxEnabledReq } = useQuery({ queryKey: ['settings', 'TAX_ENABLED'], queryFn: () => settingsApi.getSetting('TAX_ENABLED') });
  const { data: taxRateReq } = useQuery({ queryKey: ['settings', 'TAX_RATE'], queryFn: () => settingsApi.getSetting('TAX_RATE') });

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(10);

  useEffect(() => {
    if (taxEnabledReq?.value) setTaxEnabled(taxEnabledReq.value === 'true');
    if (taxRateReq?.value) setTaxRate(Number(taxRateReq.value));
  }, [taxEnabledReq, taxRateReq]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      await settingsApi.setSetting('TAX_ENABLED', taxEnabled ? 'true' : 'false');
      await settingsApi.setSetting('TAX_RATE', String(taxRate));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      showToast('Settings saved successfully!');
    },
    onError: () => showToast('Failed to save settings', 'error'),
  });

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage application settings and tax configurations</p>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} /> Tax Management (PB1)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Configure whether restaurant tax is applied to all orders automatically.
          </p>

          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <input 
                type="checkbox" 
                checked={taxEnabled} 
                onChange={(e) => setTaxEnabled(e.target.checked)} 
                style={{ width: 18, height: 18 }} 
              />
              Enable PB1 Tax
            </label>
          </div>

          <div className="form-group" style={{ opacity: taxEnabled ? 1 : 0.5, pointerEvents: taxEnabled ? 'auto' : 'none' }}>
            <label>Tax Rate (%)</label>
            <input 
              type="number" 
              className="input" 
              value={taxRate} 
              onChange={e => setTaxRate(Number(e.target.value))} 
              min="0" max="100" 
            />
            <small style={{ color: 'var(--text-muted)' }}>Default is 10% for Indonesian restaurant tax.</small>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
