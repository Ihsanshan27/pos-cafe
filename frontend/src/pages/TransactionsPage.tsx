import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveMediaUrl, transactionApi } from '../lib/api';
import type { Transaction } from '../lib/api';
import { Receipt, Eye, Printer, XCircle, CheckCircle, X, User, Hash, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAppPublicSettings } from '../hooks/useAppPublicSettings';
import { useActiveOutlet } from '../hooks/useActiveOutlet';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function TransactionsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { activeOutletId, activeOutlet } = useActiveOutlet();
  const {
    storeName,
    storeAddress,
    storePhone,
    storeLogoUrl,
    receiptHeader,
    receiptFooter,
    storeTaxId,
    confirmBeforeVoid,
  } = useAppPublicSettings();
  const isManagerOrOwner = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [kitchenTicketTx, setKitchenTicketTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', activeOutletId],
    queryFn: () => transactionApi.getAll(activeOutletId || undefined),
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const voidMut = useMutation({
    mutationFn: (id: string) => transactionApi.void(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['ingredients'] }); // Because we restocked
      showToast('Transaction voided successfully!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message ?? 'Failed to void transaction', 'error');
    },
  });

  const filteredTransactions = transactions.filter(tx => {
    if (!startDate && !endDate) return true;
    const txDate = new Date(tx.createdAt);
    txDate.setHours(0, 0, 0, 0);
    
    let isValid = true;
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      isValid = isValid && txDate >= s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(0, 0, 0, 0);
      isValid = isValid && txDate <= e;
    }
    return isValid;
  });

  const totalRevenue = filteredTransactions.reduce((s, t) => s + Number(t.totalAmount), 0);

  const exportToExcel = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const txData = filteredTransactions.map(tx => ({
      'Pricing Subtotal': Number((tx as any).pricingMetadata?.subtotalBeforeDiscount ?? tx.items.reduce((sum, item) => sum + Number(item.subtotal), 0)),
      'Menu Gross Total': tx.items.reduce((sum, item) => sum + Number(item.subtotal), 0),
      'Order Number': tx.orderNumber || `#${tx.id.slice(0, 8).toUpperCase()}`,
      'Date': new Date(tx.createdAt).toLocaleString('id-ID'),
      'Type': (tx as any).orderType,
      'Customer': (tx as any).customerName || (tx as any).customer?.name || '-',
      'Cashier': (tx as any).user?.name || '-',
      'Status': tx.status,
      'Payment Method': tx.paymentMethod,
      'Subtotal': tx.items.reduce((sum, item) => sum + Number(item.subtotal), 0),
      'Discount': Number((tx as any).discountAmount),
      'Tax (PB1)': Number((tx as any).taxAmount || 0),
      'Rounding Adjustment': Number((tx as any).pricingMetadata?.roundingAdjustment || 0),
      'Tax Inclusive': (tx as any).pricingMetadata?.taxInclusive ? 'Yes' : 'No',
      'Tax Rate': Number((tx as any).pricingMetadata?.taxRate || 0),
      'Total Amount': Number(tx.totalAmount)
    }));

    const menuSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredTransactions.filter(t => t.status === 'COMPLETED').forEach(tx => {
      tx.items.forEach(item => {
        const name = item.menu?.name || 'Unknown';
        if (!menuSales[name]) menuSales[name] = { name, qty: 0, revenue: 0 };
        menuSales[name].qty += item.quantity;
        menuSales[name].revenue += Number(item.subtotal);
      });
    });
    
    const menuData = Object.values(menuSales).sort((a, b) => b.qty - a.qty).map(m => ({
      'Menu Name': m.name,
      'Quantity Sold': m.qty,
      'Total Revenue': m.revenue
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(txData);
    const ws2 = XLSX.utils.json_to_sheet(menuData);

    XLSX.utils.book_append_sheet(wb, ws1, 'Transactions');
    XLSX.utils.book_append_sheet(wb, ws2, 'Menu Sales');

    const safeStoreName = storeName.replace(/\s+/g, '_');
    XLSX.writeFile(wb, `${safeStoreName}_Report_${startDate || 'All'}_to_${endDate || 'All'}.xlsx`);
    showToast('Export successful!');
  };

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text(`${storeName} - Transactions Report`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Period: ${startDate || 'All Time'} to ${endDate || 'All Time'}`, 14, 30);
    
    const tableData = filteredTransactions.map(tx => [
      tx.orderNumber || `#${tx.id.slice(0, 8).toUpperCase()}`,
      new Date(tx.createdAt).toLocaleString('id-ID'),
      (tx as any).orderType,
      (tx as any).customerName || (tx as any).customer?.name || '-',
      tx.status,
      tx.paymentMethod,
      formatCurrency(Number((tx as any).pricingMetadata?.subtotalBeforeDiscount ?? tx.items.reduce((sum, item) => sum + Number(item.subtotal), 0))),
      formatCurrency(Number((tx as any).discountAmount)),
      formatCurrency(Number((tx as any).taxAmount || 0)),
      formatCurrency(Number((tx as any).pricingMetadata?.roundingAdjustment || 0)),
      formatCurrency(Number(tx.totalAmount))
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Order No', 'Date', 'Type', 'Customer', 'Status', 'Payment', 'Subtotal', 'Discount', 'Tax', 'Rounding', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 35;
    
    doc.setFontSize(14);
    doc.text('Menu Sales Summary', 14, finalY + 15);
    
    const menuSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredTransactions.filter(t => t.status === 'COMPLETED').forEach(tx => {
      tx.items.forEach(item => {
        const name = item.menu?.name || 'Unknown';
        if (!menuSales[name]) menuSales[name] = { name, qty: 0, revenue: 0 };
        menuSales[name].qty += item.quantity;
        menuSales[name].revenue += Number(item.subtotal);
      });
    });
    
    const menuData = Object.values(menuSales).sort((a, b) => b.qty - a.qty).map(m => [
      m.name,
      m.qty.toString(),
      formatCurrency(m.revenue)
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Menu Name', 'Quantity Sold', 'Total Revenue']],
      body: menuData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    const safeStoreName = storeName.replace(/\s+/g, '_');
    doc.save(`${safeStoreName}_Report_${startDate || 'All'}_to_${endDate || 'All'}.pdf`);
    showToast('PDF Export successful!');
  };

  const executePrintKitchenTicket = (txToPrint: Transaction) => {
    const win = window.open('', '', 'width=400,height=600');
    if (win) {
      const itemsHtml = txToPrint.items.map(item => `
        <div style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
          <div style="font-weight: bold; font-size: 1.2rem;">${item.quantity} x ${item.menu?.name || 'Unknown Menu'}</div>
          ${(item as any).notes ? `<div style="font-size: 1rem; color: #333; font-weight: bold; margin-top: 5px;">Catatan: ${(item as any).notes}</div>` : ''}
        </div>
      `).join('');
      win.document.write(`
        <html>
          <head>
            <title>Kitchen Ticket</title>
            <style>
              body { font-family: monospace; margin: 0; padding: 20px; color: black; background: white; }
            </style>
          </head>
          <body>
            <h2 style="text-align: center; margin-top: 0; border-bottom: 2px solid black; padding-bottom: 10px;">KITCHEN TICKET</h2>
            <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 15px;">
              ${(txToPrint as any)?.orderType === 'DINE_IN' ? `DINE IN - Table ${(txToPrint as any).tableNumber}` : 'TAKEAWAY'}<br/>
              ${((txToPrint as any)?.customerName || (txToPrint as any)?.customer?.name) ? `Customer: ${((txToPrint as any)?.customerName || (txToPrint as any)?.customer?.name)}<br/>` : ''}
              Time: ${new Date(txToPrint.createdAt).toLocaleTimeString('id-ID')}
            </div>
            <div>${itemsHtml}</div>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Transactions</h2>
          <p>View all order history and revenue{activeOutlet ? ` • ${activeOutlet.name}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>From:</span>
            <input type="date" className="input" style={{ padding: '0.4rem', fontSize: '0.8rem' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>To:</span>
            <input type="date" className="input" style={{ padding: '0.4rem', fontSize: '0.8rem' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={exportToPDF}>
              <Download size={16} /> PDF
            </button>
            <button className="btn btn-primary" onClick={exportToExcel}>
              <Download size={16} /> Excel
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Summary */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Receipt color="#6366f1" />
            </div>
            <div>
              <div className="stat-card-label">Filtered Transactions</div>
              <div className="stat-card-value">{filteredTransactions.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Receipt color="#10b981" />
            </div>
            <div>
              <div className="stat-card-label">Total Revenue</div>
              <div className="stat-card-value" style={{ fontSize: '1.2rem' }}>{formatCurrency(totalRevenue)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Receipt color="#f59e0b" />
            </div>
            <div>
              <div className="stat-card-label">Avg. Order Value</div>
              <div className="stat-card-value" style={{ fontSize: '1.2rem' }}>
                {filteredTransactions.length ? formatCurrency(totalRevenue / filteredTransactions.length) : 'Rp 0'}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state"><Receipt /><p>Loading transactions...</p></div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state"><Receipt /><p>No transactions found for this period.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTransactions.map((tx) => (
              <TransactionCard 
                key={tx.id} 
                tx={tx} 
                onView={() => setReceiptTx(tx)} 
                onVoid={() => voidMut.mutate(tx.id)}
                onPrintKitchen={() => setKitchenTicketTx(tx)}
                confirmBeforeVoid={confirmBeforeVoid}
                isManagerOrOwner={isManagerOrOwner}
                isVoiding={voidMut.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {receiptTx && (
        <div className="modal-overlay" onClick={() => setReceiptTx(null)}>
          <div className="modal" style={{ maxWidth: 380, padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div id="receipt-content" style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff', color: '#000' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                {storeLogoUrl && (
                  <img
                    className="brand-logo-image"
                    src={resolveMediaUrl(storeLogoUrl)}
                    alt={storeName}
                    style={{ width: 56, height: 56, borderRadius: '0.75rem', margin: '0 auto 0.75rem' }}
                  />
                )}
                {receiptHeader && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    {receiptHeader}
                  </div>
                )}
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{storeName}</h2>
                {storeAddress && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.35rem' }}>{storeAddress}</div>}
                {storePhone && <div style={{ fontSize: '0.8rem', color: '#666' }}>{storePhone}</div>}
                {storeTaxId && <div style={{ fontSize: '0.8rem', color: '#666' }}>NPWP/Legal ID: {storeTaxId}</div>}
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {(receiptTx as any)?.orderType === 'DINE_IN' ? `DINE IN - Table ${(receiptTx as any).tableNumber}` : 'TAKEAWAY'}
                </div>
                {((receiptTx as any)?.customerName || (receiptTx as any)?.customer?.name) && (
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    Customer: {((receiptTx as any)?.customerName || (receiptTx as any)?.customer?.name)}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                  {receiptTx.orderNumber || `Order #${receiptTx.id.slice(0, 8).toUpperCase()}`}
                  <br />
                  {new Date(receiptTx.createdAt).toLocaleString('id-ID')}
                  <br />
                  Method: {receiptTx.paymentMethod || 'CASH'}
                  <br />
                  Cashier: {(receiptTx as any).user?.name || 'System'}
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '1rem 0', marginBottom: '1rem' }}>
                {receiptTx.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.menu?.name || 'Unknown Menu'}</div>
                      {(item as any).notes && (
                        <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>Note: {(item as any).notes}</div>
                      )}
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>{item.quantity} x {formatCurrency(Number(item.priceAtSale))}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(Number(item.subtotal))}</div>
                  </div>
                ))}
              </div>

              {(receiptTx as any).discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(Number((receiptTx as any).discountAmount))}</span>
                </div>
              )}

              {Number((receiptTx as any).taxAmount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>
                    {(receiptTx as any).pricingMetadata?.taxInclusive
                      ? `Included PB1 (${Number((receiptTx as any).pricingMetadata?.taxRate || 0)}%)`
                      : `PB1 (${Number((receiptTx as any).pricingMetadata?.taxRate || 0)}%)`}
                  </span>
                  <span>
                    {(receiptTx as any).pricingMetadata?.taxInclusive ? '' : '+'}
                    {formatCurrency(Number((receiptTx as any).taxAmount || 0))}
                  </span>
                </div>
              )}

              {Number((receiptTx as any).pricingMetadata?.roundingAdjustment || 0) !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>Rounding</span>
                  <span>
                    {Number((receiptTx as any).pricingMetadata?.roundingAdjustment) > 0 ? '+' : ''}
                    {formatCurrency(Number((receiptTx as any).pricingMetadata?.roundingAdjustment || 0))}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                <span>TOTAL</span>
                <span>{formatCurrency(Number(receiptTx.totalAmount))}</span>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}>
                {receiptFooter}
              </div>
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}
                onClick={() => setReceiptTx(null)}
              >
                Close
              </button>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setKitchenTicketTx(receiptTx)}
              >
                <Printer size={16} /> Kitchen
              </button>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => {
                  const content = document.getElementById('receipt-content')?.innerHTML;
                  const win = window.open('', '', 'width=400,height=600');
                  if (win) {
                    win.document.write(`
                      <html>
                        <head>
                          <title>Receipt</title>
                          <style>
                            body { font-family: monospace; margin: 0; padding: 20px; color: black; background: white; }
                          </style>
                        </head>
                        <body>
                          ${content}
                          <script>
                            window.onload = () => { window.print(); window.close(); }
                          </script>
                        </body>
                      </html>
                    `);
                    win.document.close();
                  }
                }}
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kitchen Ticket Modal */}
      {kitchenTicketTx && (
        <div className="modal-overlay" onClick={() => setKitchenTicketTx(null)}>
          <div className="modal" style={{ maxWidth: 380, padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div id="kitchen-ticket-content" style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff', color: '#000' }}>
              <h2 style={{ textAlign: 'center', marginTop: 0, borderBottom: '2px solid black', paddingBottom: '10px' }}>KITCHEN TICKET</h2>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>
                {(kitchenTicketTx as any)?.orderType === 'DINE_IN' ? `DINE IN - Table ${(kitchenTicketTx as any).tableNumber}` : 'TAKEAWAY'}<br/>
                {((kitchenTicketTx as any)?.customerName || (kitchenTicketTx as any)?.customer?.name) ? `Customer: ${((kitchenTicketTx as any)?.customerName || (kitchenTicketTx as any)?.customer?.name)}\n` : ''}
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  Time: {new Date(kitchenTicketTx.createdAt).toLocaleTimeString('id-ID')}
                </div>
              </div>
              <div>
                {kitchenTicketTx.items.map(item => (
                  <div key={item.id} style={{ marginBottom: '10px', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.quantity} x {item.menu?.name || 'Unknown Menu'}</div>
                    {(item as any).notes && (
                      <div style={{ fontSize: '1rem', color: '#333', fontWeight: 'bold', marginTop: '5px' }}>
                        Catatan: {(item as any).notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}
                onClick={() => setKitchenTicketTx(null)}
              >
                Close
              </button>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => executePrintKitchenTicket(kitchenTicketTx)}
              >
                <Printer size={16} /> Print Kitchen
              </button>
            </div>
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

function TransactionCard({ 
  tx, 
  onView, 
  onVoid, 
  onPrintKitchen,
  confirmBeforeVoid,
  isManagerOrOwner, 
  isVoiding 
}: { 
  tx: Transaction; 
  onView: () => void; 
  onVoid: () => void;
  onPrintKitchen: () => void;
  confirmBeforeVoid: boolean;
  isManagerOrOwner: boolean;
  isVoiding: boolean;
}) {
  function formatCurrency(val: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  }

  const t: any = tx; // Typecast for new fields

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {tx.orderNumber || `Order #${tx.id.slice(0, 8).toUpperCase()}`}
            <span className={`badge ${t.orderType === 'DINE_IN' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.65rem' }}>
              {t.orderType === 'DINE_IN' ? `DINE IN (Table ${t.tableNumber})` : 'TAKEAWAY'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            {t.user && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <User size={12} /> {t.user.name}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
            {tx.status}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {tx.paymentMethod || 'CASH'}
          </span>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--success)' }}>
            {formatCurrency(Number(tx.totalAmount))}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
        {tx.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
              <span style={{ fontWeight: 500 }}>{item.menu?.name ?? 'Unknown'}</span>
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(Number(item.subtotal))}</span>
          </div>
        ))}
        {t.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 500, color: 'var(--danger)' }}>Discount Applied</span>
            <span style={{ fontWeight: 600, color: 'var(--danger)' }}>-{formatCurrency(Number(t.discountAmount))}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {isManagerOrOwner && tx.status === 'COMPLETED' && (
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => {
                if (!confirmBeforeVoid || confirm('Are you sure you want to void this transaction? Ingredients will be restocked.')) {
                  onVoid();
                }
              }}
              disabled={isVoiding}
            >
              <XCircle size={14} /> Void / Cancel
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* <button className="btn btn-secondary btn-sm" onClick={onPrintKitchen}>
            <Printer size={14} /> Kitchen
          </button> */}
          <button className="btn btn-primary btn-sm" onClick={onView}>
            <Eye size={14} /> Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
