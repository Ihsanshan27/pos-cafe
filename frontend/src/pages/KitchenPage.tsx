import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../lib/api';
import type { Transaction } from '../lib/api';
import { CheckCircle, Clock, Play, Check, Wifi, WifiOff } from 'lucide-react';
import { useAppPublicSettings } from '../hooks/useAppPublicSettings';
import { useActiveOutlet } from '../hooks/useActiveOutlet';
import { io, Socket } from 'socket.io-client';

const KDS_WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000');

function playDing() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio play failed', e);
  }
}

export default function KitchenPage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const { kdsSoundEnabled, kdsRefreshInterval, kdsDoneHideMinutes, kdsHighlightNotes } = useAppPublicSettings();
  const { activeOutletId } = useActiveOutlet();

  // Local transaction state managed via WebSocket events
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const prevPendingCount = useRef(0);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load initial data via REST then switch to WebSocket
  const loadInitialData = useCallback(async () => {
    try {
      const data = await transactionApi.getAll(activeOutletId || undefined);
      setTransactions(data);
    } catch {
      showToast('Gagal memuat data pesanan', 'error');
    } finally {
      setIsInitialLoading(false);
    }
  }, [activeOutletId]);

  // Merge incoming transaction into state
  const mergeTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => {
      const existing = prev.findIndex((t) => t.id === tx.id);
      if (existing !== -1) {
        const next = [...prev];
        next[existing] = tx;
        return next;
      }
      return [tx, ...prev];
    });
  }, []);

  // WebSocket connection management
  useEffect(() => {
    loadInitialData();

    const socket = io(`${KDS_WS_URL}/kds`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join room based on active outlet
      socket.emit('kds:join', { outletId: activeOutletId || undefined });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('order:new', (tx: Transaction) => {
      mergeTransaction(tx);
    });

    socket.on('order:updated', (tx: Transaction) => {
      mergeTransaction(tx);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeOutletId, loadInitialData, mergeTransaction]);

  // Fallback polling when WebSocket is disconnected
  useEffect(() => {
    if (isConnected) return; // WebSocket is live, no need to poll
    const interval = setInterval(async () => {
      try {
        const data = await transactionApi.getAll(activeOutletId || undefined);
        setTransactions(data);
      } catch {}
    }, Math.max(3, kdsRefreshInterval) * 1000);
    return () => clearInterval(interval);
  }, [isConnected, activeOutletId, kdsRefreshInterval]);

  // Filter completed payments, split by kitchen status
  const pendingOrders = transactions
    .filter(tx => (tx.status === 'COMPLETED' || tx.source === 'PUBLIC_QR') && tx.kitchenStatus === 'PENDING')
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  const inProgressOrders = transactions
    .filter(tx => (tx.status === 'COMPLETED' || tx.source === 'PUBLIC_QR') && tx.kitchenStatus === 'IN_PROGRESS')
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  // Show only last 20 done orders within kdsDoneHideMinutes
  const doneOrders = transactions
    .filter(tx => (tx.status === 'COMPLETED' || tx.source === 'PUBLIC_QR') && tx.kitchenStatus === 'DONE')
    .filter((tx) => {
      if (kdsDoneHideMinutes <= 0) return true;
      const completedAt = new Date(tx.createdAt).getTime();
      return Date.now() - completedAt <= kdsDoneHideMinutes * 60 * 1000;
    })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 20);

  // Sound notification for new pending orders
  useEffect(() => {
    if (kdsSoundEnabled && pendingOrders.length > prevPendingCount.current && pendingOrders.length > 0) {
      playDing();
    }
    prevPendingCount.current = pendingOrders.length;
  }, [kdsSoundEnabled, pendingOrders.length]);

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'IN_PROGRESS' | 'DONE' }) =>
      transactionApi.updateKitchenStatus(id, status),
    onSuccess: (updatedTx) => {
      // Optimistically update local state immediately
      mergeTransaction(updatedTx);
      // Also invalidate React Query cache
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => {
      showToast('Gagal update status pesanan', 'error');
    }
  });

  if (isInitialLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading KDS...</div>;

  const renderCard = (tx: any, isPending: boolean, isInProgress: boolean) => (
    <div key={tx.id} style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ padding: '1rem', background: tx.orderType === 'DINE_IN' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)', borderBottom: '2px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: tx.orderType === 'DINE_IN' ? '#3b82f6' : '#f59e0b' }}>
            {tx.orderType === 'DINE_IN' ? `DINE IN (${tx.tableNumber})` : 'TAKEAWAY'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> {new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {tx.orderNumber || `#${tx.id.slice(0, 8).toUpperCase()}`}
          {(tx as any).customerName || (tx as any).customer?.name ? ` • ${(tx as any).customerName || (tx as any).customer?.name}` : ''}
        </div>
      </div>

      <div style={{ padding: '1rem', flex: 1 }}>
        {tx.items.map((item: any) => (
          <div key={item.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
              <span style={{ background: 'var(--accent)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '0.25rem' }}>{item.quantity}</span>
              <span>{item.menu?.name}</span>
            </div>
            {item.notes && (
              <div
                style={{
                  marginTop: '0.25rem',
                  fontSize: '0.9rem',
                  color: kdsHighlightNotes ? 'var(--danger)' : 'var(--text-secondary)',
                  fontWeight: kdsHighlightNotes ? 700 : 500,
                  background: kdsHighlightNotes ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                  padding: kdsHighlightNotes ? '0.35rem 0.5rem' : 0,
                  borderRadius: kdsHighlightNotes ? '0.5rem' : 0,
                }}
              >
                Catatan: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {(isPending || isInProgress) && (
        <div style={{ padding: '1rem', borderTop: '2px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
          {isPending && (
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => updateStatusMut.mutate({ id: tx.id, status: 'IN_PROGRESS' })}
              disabled={updateStatusMut.isPending}
            >
              <Play size={18} /> Proses
            </button>
          )}
          {isInProgress && (
            <button 
              className="btn btn-success" 
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => updateStatusMut.mutate({ id: tx.id, status: 'DONE' })}
              disabled={updateStatusMut.isPending}
            >
              <Check size={18} /> Selesai
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', width: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Kitchen Display System (KDS)</h1>
          <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isConnected
              ? 'Real-time via WebSocket'
              : `Fallback polling ${Math.max(3, kdsRefreshInterval)}s`}
            {' '}• Sound {kdsSoundEnabled ? 'ON' : 'OFF'} • Done hide {kdsDoneHideMinutes} menit
          </div>
        </div>
        {/* Connection status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '2rem',
          background: isConnected ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontSize: '0.82rem',
          fontWeight: 600,
          color: isConnected ? '#059669' : '#dc2626',
        }}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* PENDING Column */}
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '2px dashed rgba(239, 68, 68, 0.2)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', fontWeight: 800, textAlign: 'center', fontSize: '1.2rem', borderBottom: '2px solid rgba(239, 68, 68, 0.2)' }}>
            Pesanan Masuk ({pendingOrders.length})
          </div>
          <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
            {pendingOrders.map(tx => renderCard(tx, true, false))}
            {pendingOrders.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Tidak ada pesanan</div>}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '2px dashed rgba(245, 158, 11, 0.2)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', color: '#b45309', fontWeight: 800, textAlign: 'center', fontSize: '1.2rem', borderBottom: '2px solid rgba(245, 158, 11, 0.2)' }}>
            Sedang Diproses ({inProgressOrders.length})
          </div>
          <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
            {inProgressOrders.map(tx => renderCard(tx, false, true))}
            {inProgressOrders.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Tidak ada pesanan diproses</div>}
          </div>
        </div>

        {/* DONE Column */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '2px dashed rgba(16, 185, 129, 0.2)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#047857', fontWeight: 800, textAlign: 'center', fontSize: '1.2rem', borderBottom: '2px solid rgba(16, 185, 129, 0.2)' }}>
            Selesai ({doneOrders.length})
          </div>
          <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, opacity: 0.8 }}>
            {doneOrders.map(tx => renderCard(tx, false, false))}
            {doneOrders.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Belum ada pesanan selesai</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
