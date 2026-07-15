import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resolveMediaUrl, settingsApi } from '../lib/api';
import { printerService } from '../lib/printer';
import { FEATURE_OPTIONS, stringifyJsonArray, type FeatureKey } from '../lib/featureAccess';
import {
  Archive,
  Bell,
  Building2,
  CheckCircle,
  CreditCard,
  Database,
  Package,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  X,
  Users,
} from 'lucide-react';

type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'EWALLET';
type RoundingMode = 'NONE' | 'NEAREST' | 'UP' | 'DOWN';

type SettingsForm = {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogoUrl: string;
  receiptHeader: string;
  storeTaxId: string;
  receiptFooter: string;
  taxEnabled: boolean;
  taxRate: number;
  taxInclusive: boolean;
  roundingMode: RoundingMode;
  roundingStep: number;
  lowStockThreshold: number;
  blockSaleOnLowStock: boolean;
  requireAdjustmentNote: boolean;
  loyaltyEnabled: boolean;
  pointsPerSpend: number;
  silverMinPoints: number;
  goldMinPoints: number;
  allowRegistration: boolean;
  defaultOrderType: 'DINE_IN' | 'TAKEAWAY';
  requireTableNumber: boolean;
  requireCustomerName: boolean;
  confirmBeforeCheckout: boolean;
  confirmBeforeVoid: boolean;
  autoPrintReceipt: boolean;
  enableCupStickers: boolean;
  printerPaperSize: '58mm' | '80mm';
  enabledPaymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod;
  qrisPaymentNote: string;
  kdsSoundEnabled: boolean;
  kdsRefreshInterval: number;
  kdsDoneHideMinutes: number;
  kdsHighlightNotes: boolean;
  sessionTimeoutMinutes: number;
  forcePasswordChange: boolean;
  disabledFeatures: FeatureKey[];
  logRetentionDays: number;
  auditLogRetentionDays: number;
  appVersion: string;
};

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'QRIS', 'DEBIT', 'EWALLET'];

const DEFAULT_FORM: SettingsForm = {
  storeName: '',
  storeAddress: '',
  storePhone: '',
  storeLogoUrl: '',
  receiptHeader: '',
  storeTaxId: '',
  receiptFooter: 'Terima kasih sudah berkunjung.',
  taxEnabled: false,
  taxRate: 10,
  taxInclusive: false,
  roundingMode: 'NONE',
  roundingStep: 0,
  lowStockThreshold: 10,
  blockSaleOnLowStock: false,
  requireAdjustmentNote: true,
  loyaltyEnabled: true,
  pointsPerSpend: 10000,
  silverMinPoints: 100,
  goldMinPoints: 300,
  allowRegistration: true,
  defaultOrderType: 'DINE_IN',
  requireTableNumber: true,
  requireCustomerName: false,
  confirmBeforeCheckout: true,
  confirmBeforeVoid: true,
  autoPrintReceipt: false,
  enableCupStickers: false,
  printerPaperSize: '58mm',
  enabledPaymentMethods: [...PAYMENT_METHODS],
  defaultPaymentMethod: 'CASH',
  qrisPaymentNote: '',
  kdsSoundEnabled: true,
  kdsRefreshInterval: 5,
  kdsDoneHideMinutes: 120,
  kdsHighlightNotes: true,
  sessionTimeoutMinutes: 120,
  forcePasswordChange: false,
  disabledFeatures: [],
  logRetentionDays: 30,
  auditLogRetentionDays: 30,
  appVersion: '',
};

function parseStoredArray(value: string | undefined | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function SettingSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'var(--accent-light)',
            color: '#a5b4fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{title}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleCard({
  checked,
  label,
  description,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0.9rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18 }}
        disabled={disabled}
      />
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{description}</div>
      </div>
    </label>
  );
}

function SelectableChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
      style={{ justifyContent: 'center' }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM);
  const [logoUploadKey, setLogoUploadKey] = useState(0);
  const [backupUploadKey, setBackupUploadKey] = useState(0);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
  });

  const { data: systemInfo } = useQuery({
    queryKey: ['settings', 'system-info'],
    queryFn: () => settingsApi.getSystemInfo(),
  });

  const { data: auditLogs = [], isLoading: isAuditLogsLoading, refetch: refetchAuditLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => settingsApi.getAuditLogs(),
  });

  const initialForm = useMemo<SettingsForm>(() => {
    const map = new Map(settings.map((setting) => [setting.key, setting.value]));
    const parsedTaxRate = Number(map.get('TAX_RATE') ?? DEFAULT_FORM.taxRate);
    const parsedRoundingStep = Number(map.get('ROUNDING_STEP') ?? DEFAULT_FORM.roundingStep);
    const parsedKdsRefresh = Number(map.get('KDS_REFRESH_INTERVAL') ?? DEFAULT_FORM.kdsRefreshInterval);
    const parsedKdsDoneHide = Number(map.get('KDS_DONE_HIDE_MINUTES') ?? DEFAULT_FORM.kdsDoneHideMinutes);
    const parsedSessionTimeout = Number(map.get('SESSION_TIMEOUT_MINUTES') ?? DEFAULT_FORM.sessionTimeoutMinutes);
    const parsedLogRetention = Number(map.get('LOG_RETENTION_DAYS') ?? DEFAULT_FORM.logRetentionDays);
    const parsedAuditLogRetention = Number(map.get('AUDIT_LOG_RETENTION_DAYS') ?? DEFAULT_FORM.auditLogRetentionDays);
    const parsedLowStockThreshold = Number(map.get('LOW_STOCK_THRESHOLD') ?? DEFAULT_FORM.lowStockThreshold);
    const parsedPointsPerSpend = Number(map.get('POINTS_PER_SPEND') ?? DEFAULT_FORM.pointsPerSpend);
    const parsedSilverMinPoints = Number(map.get('SILVER_MIN_POINTS') ?? DEFAULT_FORM.silverMinPoints);
    const parsedGoldMinPoints = Number(map.get('GOLD_MIN_POINTS') ?? DEFAULT_FORM.goldMinPoints);
    const parsedPaymentMethods = parseStoredArray(map.get('ENABLED_PAYMENT_METHODS')).filter((value): value is PaymentMethod =>
      PAYMENT_METHODS.includes(value as PaymentMethod),
    );
    const enabledPaymentMethods = parsedPaymentMethods.length > 0 ? parsedPaymentMethods : [...PAYMENT_METHODS];
    const defaultPaymentMethod = enabledPaymentMethods.includes((map.get('DEFAULT_PAYMENT_METHOD') ?? DEFAULT_FORM.defaultPaymentMethod) as PaymentMethod)
      ? ((map.get('DEFAULT_PAYMENT_METHOD') ?? DEFAULT_FORM.defaultPaymentMethod) as PaymentMethod)
      : enabledPaymentMethods[0];
    const disabledFeatures = parseStoredArray(map.get('DISABLED_FEATURES')).filter((value): value is FeatureKey =>
      FEATURE_OPTIONS.some((feature) => feature.key === value),
    );

    return {
      storeName: map.get('STORE_NAME') ?? DEFAULT_FORM.storeName,
      storeAddress: map.get('STORE_ADDRESS') ?? DEFAULT_FORM.storeAddress,
      storePhone: map.get('STORE_PHONE') ?? DEFAULT_FORM.storePhone,
      storeLogoUrl: map.get('STORE_LOGO_URL') ?? DEFAULT_FORM.storeLogoUrl,
      receiptHeader: map.get('RECEIPT_HEADER') ?? DEFAULT_FORM.receiptHeader,
      storeTaxId: map.get('STORE_TAX_ID') ?? DEFAULT_FORM.storeTaxId,
      receiptFooter: map.get('RECEIPT_FOOTER') ?? DEFAULT_FORM.receiptFooter,
      taxEnabled: (map.get('TAX_ENABLED') ?? 'false') === 'true',
      taxRate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : DEFAULT_FORM.taxRate,
      taxInclusive: (map.get('TAX_INCLUSIVE') ?? 'false') === 'true',
      roundingMode:
        map.get('ROUNDING_MODE') === 'UP' ||
        map.get('ROUNDING_MODE') === 'DOWN' ||
        map.get('ROUNDING_MODE') === 'NEAREST'
          ? (map.get('ROUNDING_MODE') as RoundingMode)
          : 'NONE',
      roundingStep: Number.isFinite(parsedRoundingStep) ? parsedRoundingStep : DEFAULT_FORM.roundingStep,
      lowStockThreshold:
        Number.isFinite(parsedLowStockThreshold) && parsedLowStockThreshold >= 0
          ? parsedLowStockThreshold
          : DEFAULT_FORM.lowStockThreshold,
      blockSaleOnLowStock: (map.get('BLOCK_SALE_ON_LOW_STOCK') ?? 'false') === 'true',
      requireAdjustmentNote: (map.get('REQUIRE_ADJUSTMENT_NOTE') ?? 'true') === 'true',
      loyaltyEnabled: (map.get('LOYALTY_ENABLED') ?? 'true') === 'true',
      pointsPerSpend:
        Number.isFinite(parsedPointsPerSpend) && parsedPointsPerSpend > 0
          ? parsedPointsPerSpend
          : DEFAULT_FORM.pointsPerSpend,
      silverMinPoints:
        Number.isFinite(parsedSilverMinPoints) && parsedSilverMinPoints >= 0
          ? parsedSilverMinPoints
          : DEFAULT_FORM.silverMinPoints,
      goldMinPoints:
        Number.isFinite(parsedGoldMinPoints) && parsedGoldMinPoints >= 0
          ? parsedGoldMinPoints
          : DEFAULT_FORM.goldMinPoints,
      allowRegistration: (map.get('ALLOW_REGISTRATION') ?? 'true') === 'true',
      defaultOrderType: map.get('DEFAULT_ORDER_TYPE') === 'TAKEAWAY' ? 'TAKEAWAY' : 'DINE_IN',
      requireTableNumber: (map.get('REQUIRE_TABLE_NUMBER') ?? 'true') === 'true',
      requireCustomerName: (map.get('REQUIRE_CUSTOMER_NAME') ?? 'false') === 'true',
      confirmBeforeCheckout: (map.get('CONFIRM_BEFORE_CHECKOUT') ?? 'true') === 'true',
      confirmBeforeVoid: (map.get('CONFIRM_BEFORE_VOID') ?? 'true') === 'true',
      autoPrintReceipt: (map.get('AUTO_PRINT_RECEIPT') ?? 'false') === 'true',
      enableCupStickers: (map.get('ENABLE_CUP_STICKERS') ?? 'false') === 'true',
      printerPaperSize: (map.get('PRINTER_PAPER_SIZE') === '80mm' ? '80mm' : '58mm'),
      enabledPaymentMethods,
      defaultPaymentMethod,
      qrisPaymentNote: map.get('QRIS_PAYMENT_NOTE') ?? DEFAULT_FORM.qrisPaymentNote,
      kdsSoundEnabled: (map.get('KDS_SOUND_ENABLED') ?? 'true') === 'true',
      kdsRefreshInterval: Number.isFinite(parsedKdsRefresh) && parsedKdsRefresh > 0 ? parsedKdsRefresh : DEFAULT_FORM.kdsRefreshInterval,
      kdsDoneHideMinutes: Number.isFinite(parsedKdsDoneHide) && parsedKdsDoneHide >= 0 ? parsedKdsDoneHide : DEFAULT_FORM.kdsDoneHideMinutes,
      kdsHighlightNotes: (map.get('KDS_HIGHLIGHT_NOTES') ?? 'true') === 'true',
      sessionTimeoutMinutes: Number.isFinite(parsedSessionTimeout) && parsedSessionTimeout >= 0 ? parsedSessionTimeout : DEFAULT_FORM.sessionTimeoutMinutes,
      forcePasswordChange: (map.get('FORCE_PASSWORD_CHANGE') ?? 'false') === 'true',
      disabledFeatures,
      logRetentionDays: Number.isFinite(parsedLogRetention) && parsedLogRetention >= 0 ? parsedLogRetention : DEFAULT_FORM.logRetentionDays,
      auditLogRetentionDays: Number.isFinite(parsedAuditLogRetention) && parsedAuditLogRetention >= 0 ? parsedAuditLogRetention : DEFAULT_FORM.auditLogRetentionDays,
      appVersion: map.get('APP_VERSION') ?? systemInfo?.backendVersion ?? DEFAULT_FORM.appVersion,
    };
  }, [settings, systemInfo?.backendVersion]);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateForm = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      if (form.enabledPaymentMethods.length === 0) {
        throw new Error('Aktifkan minimal satu metode pembayaran.');
      }
      if (form.pointsPerSpend < 1) {
        throw new Error('Rasio poin harus lebih besar dari 0.');
      }
      if (form.goldMinPoints < form.silverMinPoints) {
        throw new Error('Threshold Gold tidak boleh lebih kecil dari Silver.');
      }

      const safeDefaultPaymentMethod = form.enabledPaymentMethods.includes(form.defaultPaymentMethod)
        ? form.defaultPaymentMethod
        : form.enabledPaymentMethods[0];

      await settingsApi.setMany({
        STORE_NAME: form.storeName.trim(),
        STORE_ADDRESS: form.storeAddress.trim(),
        STORE_PHONE: form.storePhone.trim(),
        STORE_LOGO_URL: form.storeLogoUrl.trim(),
        RECEIPT_HEADER: form.receiptHeader.trim(),
        STORE_TAX_ID: form.storeTaxId.trim(),
        RECEIPT_FOOTER: form.receiptFooter.trim(),
        TAX_ENABLED: form.taxEnabled ? 'true' : 'false',
        TAX_RATE: String(form.taxRate),
        TAX_INCLUSIVE: form.taxInclusive ? 'true' : 'false',
        ROUNDING_MODE: form.roundingMode,
        ROUNDING_STEP: String(form.roundingStep),
        LOW_STOCK_THRESHOLD: String(form.lowStockThreshold),
        BLOCK_SALE_ON_LOW_STOCK: form.blockSaleOnLowStock ? 'true' : 'false',
        REQUIRE_ADJUSTMENT_NOTE: form.requireAdjustmentNote ? 'true' : 'false',
        LOYALTY_ENABLED: form.loyaltyEnabled ? 'true' : 'false',
        POINTS_PER_SPEND: String(form.pointsPerSpend),
        SILVER_MIN_POINTS: String(form.silverMinPoints),
        GOLD_MIN_POINTS: String(form.goldMinPoints),
        ALLOW_REGISTRATION: form.allowRegistration ? 'true' : 'false',
        DEFAULT_ORDER_TYPE: form.defaultOrderType,
        REQUIRE_TABLE_NUMBER: form.requireTableNumber ? 'true' : 'false',
        REQUIRE_CUSTOMER_NAME: form.requireCustomerName ? 'true' : 'false',
        CONFIRM_BEFORE_CHECKOUT: form.confirmBeforeCheckout ? 'true' : 'false',
        CONFIRM_BEFORE_VOID: form.confirmBeforeVoid ? 'true' : 'false',
        AUTO_PRINT_RECEIPT: form.autoPrintReceipt ? 'true' : 'false',
        ENABLE_CUP_STICKERS: form.enableCupStickers ? 'true' : 'false',
        PRINTER_PAPER_SIZE: form.printerPaperSize,
        ENABLED_PAYMENT_METHODS: stringifyJsonArray(form.enabledPaymentMethods),
        DEFAULT_PAYMENT_METHOD: safeDefaultPaymentMethod,
        QRIS_PAYMENT_NOTE: form.qrisPaymentNote.trim(),
        KDS_SOUND_ENABLED: form.kdsSoundEnabled ? 'true' : 'false',
        KDS_REFRESH_INTERVAL: String(form.kdsRefreshInterval),
        KDS_DONE_HIDE_MINUTES: String(form.kdsDoneHideMinutes),
        KDS_HIGHLIGHT_NOTES: form.kdsHighlightNotes ? 'true' : 'false',
        SESSION_TIMEOUT_MINUTES: String(form.sessionTimeoutMinutes),
        FORCE_PASSWORD_CHANGE: form.forcePasswordChange ? 'true' : 'false',
        DISABLED_FEATURES: stringifyJsonArray(form.disabledFeatures),
        LOG_RETENTION_DAYS: String(form.logRetentionDays),
        AUDIT_LOG_RETENTION_DAYS: String(form.auditLogRetentionDays),
        APP_VERSION: form.appVersion.trim(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      qc.invalidateQueries({ queryKey: ['settings', 'system-info'] });
      showToast('App settings berhasil disimpan.');
    },
    onError: (err: any) => showToast(err?.message || 'Gagal menyimpan app settings.', 'error'),
  });

  const uploadLogoMut = useMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(file),
    onSuccess: ({ imageUrl }) => {
      updateForm('storeLogoUrl', imageUrl);
      qc.invalidateQueries({ queryKey: ['settings'] });
      setLogoUploadKey((prev) => prev + 1);
      showToast('Logo toko berhasil diupload.');
    },
    onError: () => {
      setLogoUploadKey((prev) => prev + 1);
      showToast('Gagal upload logo toko.', 'error');
    },
  });

  const exportBackupMut = useMutation({
    mutationFn: () => settingsApi.exportBackup(),
    onSuccess: (payload) => {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Backup berhasil diexport.');
    },
    onError: () => showToast('Gagal export backup.', 'error'),
  });

  const restoreBackupMut = useMutation({
    mutationFn: (backup: any) => settingsApi.restoreBackup(backup),
    onSuccess: ({ summary }) => {
      qc.invalidateQueries();
      setBackupUploadKey((prev) => prev + 1);
      showToast(`Backup berhasil direstore. ${Object.values(summary).reduce((sum, value) => sum + Number(value || 0), 0)} record diproses.`);
    },
    onError: () => {
      setBackupUploadKey((prev) => prev + 1);
      showToast('Gagal restore backup.', 'error');
    },
  });

  const applyLogRetentionMut = useMutation({
    mutationFn: () => settingsApi.applyLogRetention(),
    onSuccess: (data: any) => {
      showToast(`Retensi log diterapkan. ${data.deletedCount} log inventory lama dan ${data.deletedAuditCount || 0} log audit lama dihapus.`);
      refetchAuditLogs();
    },
    onError: () => showToast('Gagal menerapkan retensi log.', 'error'),
  });

  const resetDemoDataMut = useMutation({
    mutationFn: () => settingsApi.resetDemoData(),
    onSuccess: () => {
      qc.invalidateQueries();
      showToast('Demo/sample data berhasil di-reset.');
    },
    onError: () => showToast('Gagal reset demo data.', 'error'),
  });

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);

  const togglePaymentMethod = (paymentMethod: PaymentMethod) => {
    const isActive = form.enabledPaymentMethods.includes(paymentMethod);
    const next = isActive
      ? form.enabledPaymentMethods.filter((item) => item !== paymentMethod)
      : [...form.enabledPaymentMethods, paymentMethod];

    updateForm('enabledPaymentMethods', next.length > 0 ? next : [paymentMethod]);
    if (isActive && form.defaultPaymentMethod === paymentMethod) {
      updateForm('defaultPaymentMethod', next[0] ?? paymentMethod);
    }
  };

  const toggleFeature = (feature: FeatureKey) => {
    const isDisabled = form.disabledFeatures.includes(feature);
    updateForm(
      'disabledFeatures',
      isDisabled ? form.disabledFeatures.filter((item) => item !== feature) : [...form.disabledFeatures, feature],
    );
  };

  const actionBusy =
    saveMut.isPending ||
    uploadLogoMut.isPending ||
    exportBackupMut.isPending ||
    restoreBackupMut.isPending ||
    applyLogRetentionMut.isPending ||
    resetDemoDataMut.isPending;

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>App Settings</h2>
        <p>Kelola branding toko, payment, KDS, keamanan akses, dan operasi sistem dari satu tempat.</p>
      </div>

      <div className="page-body">
        <div className="stats-grid" style={{ marginBottom: '1rem' }}>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Building2 />
            </div>
            <div>
              <div className="stat-card-label">Store Name</div>
              <div className="stat-card-value" style={{ fontSize: '1.1rem' }}>{form.storeName || 'Belum diatur'}</div>
              <div className="stat-card-sub">Dipakai di branding aplikasi, receipt, dan report.</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CreditCard />
            </div>
            <div>
              <div className="stat-card-label">Payment Active</div>
              <div className="stat-card-value" style={{ fontSize: '1.1rem' }}>{form.enabledPaymentMethods.length} metode</div>
              <div className="stat-card-sub">Default saat ini: {form.defaultPaymentMethod}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Bell />
            </div>
            <div>
              <div className="stat-card-label">KDS Refresh</div>
              <div className="stat-card-value" style={{ fontSize: '1.1rem' }}>{form.kdsRefreshInterval} detik</div>
              <div className="stat-card-sub">Sound {form.kdsSoundEnabled ? 'aktif' : 'nonaktif'} • hide done {form.kdsDoneHideMinutes} menit</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <ShieldCheck />
            </div>
            <div>
              <div className="stat-card-label">Security</div>
              <div className="stat-card-value" style={{ fontSize: '1.1rem' }}>{form.sessionTimeoutMinutes} menit</div>
              <div className="stat-card-sub">{form.forcePasswordChange ? 'Force password change aktif' : 'Security standard mode'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <SettingSection
            icon={<Building2 size={18} />}
            title="Store Profile"
            description="Data identitas toko, header receipt, dan informasi legal yang tampil di area publik aplikasi."
          >
            <div className="form-group">
              <label>Nama Toko</label>
              <input type="text" value={form.storeName} onChange={(e) => updateForm('storeName', e.target.value)} placeholder="Contoh: SHN Coffee" />
            </div>

            <div className="form-group">
              <label>Alamat Toko</label>
              <textarea rows={3} value={form.storeAddress} onChange={(e) => updateForm('storeAddress', e.target.value)} placeholder="Alamat lengkap toko" />
            </div>

            <div className="form-group">
              <label>No. Telepon / WhatsApp</label>
              <input type="text" value={form.storePhone} onChange={(e) => updateForm('storePhone', e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>

            <div className="form-group">
              <label>Logo Toko</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed var(--border)', background: 'var(--bg-secondary)' }}>
                <div style={{ width: 72, height: 72, borderRadius: '1rem', overflow: 'hidden', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.storeLogoUrl ? (
                    <img className="brand-logo-image" src={resolveMediaUrl(form.storeLogoUrl)} alt={form.storeName || 'Store logo'} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Building2 size={28} color="var(--text-muted)" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <input
                    key={logoUploadKey}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // If file is > 5MB, compress it
                      if (file.size > 5 * 1024 * 1024) {
                        showToast('File besar! Sedang memproses kompresi...', 'success');
                        try {
                          const img = new Image();
                          img.src = URL.createObjectURL(file);
                          await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                          });

                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          
                          // max dimension 1024
                          const MAX_DIMENSION = 1024;
                          if (width > height && width > MAX_DIMENSION) {
                            height = Math.round((height * MAX_DIMENSION) / width);
                            width = MAX_DIMENSION;
                          } else if (height > MAX_DIMENSION) {
                            width = Math.round((width * MAX_DIMENSION) / height);
                            height = MAX_DIMENSION;
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            canvas.toBlob((blob) => {
                              if (blob) {
                                const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                                uploadLogoMut.mutate(compressedFile);
                              } else {
                                uploadLogoMut.mutate(file);
                              }
                            }, 'image/jpeg', 0.8);
                          } else {
                            uploadLogoMut.mutate(file);
                          }
                        } catch (err) {
                          showToast('Gagal memproses kompresi gambar', 'error');
                          uploadLogoMut.mutate(file);
                        }
                      } else {
                        uploadLogoMut.mutate(file);
                      }
                    }}
                    disabled={uploadLogoMut.isPending}
                  />
                  <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                    Upload file logo langsung ke folder gambar aplikasi. Maksimal 5 MB.
                  </small>
                </div>
              </div>
              <input type="text" value={form.storeLogoUrl} onChange={(e) => updateForm('storeLogoUrl', e.target.value)} placeholder="/img/store-logo-...png" style={{ marginTop: '0.75rem' }} />
            </div>

            <div className="form-group">
              <label>Receipt Header</label>
              <input type="text" value={form.receiptHeader} onChange={(e) => updateForm('receiptHeader', e.target.value)} placeholder="Contoh: Coffee • Eatery • Roastery" />
            </div>

            <div className="form-group">
              <label>NPWP / Legal ID</label>
              <input type="text" value={form.storeTaxId} onChange={(e) => updateForm('storeTaxId', e.target.value)} placeholder="Contoh: NPWP 01.234.567.8-999.000" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Footer Struk</label>
              <textarea rows={3} value={form.receiptFooter} onChange={(e) => updateForm('receiptFooter', e.target.value)} placeholder="Pesan penutup yang tampil di struk" />
            </div>
          </SettingSection>

          <SettingSection
            icon={<Receipt size={18} />}
            title="Tax & Pricing"
            description="Atur PB1, model harga inclusive atau exclusive, dan pembulatan total transaksi."
          >
            <ToggleCard checked={form.taxEnabled} label="Aktifkan PB1" description="Jika aktif, pajak otomatis dihitung saat checkout." onChange={(checked) => updateForm('taxEnabled', checked)} />

            <div className="form-group" style={{ opacity: form.taxEnabled ? 1 : 0.55, marginBottom: 0 }}>
              <label>Persentase PB1 (%)</label>
              <input type="number" value={form.taxRate} onChange={(e) => updateForm('taxRate', Number(e.target.value))} min="0" max="100" disabled={!form.taxEnabled} />
            </div>

            <ToggleCard checked={form.taxInclusive} label="Harga sudah termasuk PB1" description="Jika aktif, harga menu dianggap sudah termasuk pajak." onChange={(checked) => updateForm('taxInclusive', checked)} disabled={!form.taxEnabled} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Rounding Mode</label>
                <select value={form.roundingMode} onChange={(e) => updateForm('roundingMode', e.target.value as RoundingMode)}>
                  <option value="NONE">No Rounding</option>
                  <option value="NEAREST">Nearest</option>
                  <option value="UP">Round Up</option>
                  <option value="DOWN">Round Down</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0, opacity: form.roundingMode === 'NONE' ? 0.55 : 1 }}>
                <label>Rounding Step</label>
                <input type="number" min="0" step="1" value={form.roundingStep} onChange={(e) => updateForm('roundingStep', Number(e.target.value))} disabled={form.roundingMode === 'NONE'} />
              </div>
            </div>
          </SettingSection>

          <SettingSection
            icon={<CreditCard size={18} />}
            title="Payment"
            description="Pilih metode pembayaran yang aktif di POS, default method, dan instruksi QRIS untuk kasir."
          >
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Metode Pembayaran Aktif</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {PAYMENT_METHODS.map((method) => (
                  <SelectableChip
                    key={method}
                    active={form.enabledPaymentMethods.includes(method)}
                    label={method}
                    onClick={() => togglePaymentMethod(method)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Default Payment Method</label>
              <select value={form.defaultPaymentMethod} onChange={(e) => updateForm('defaultPaymentMethod', e.target.value as PaymentMethod)}>
                {form.enabledPaymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Instruksi QRIS</label>
              <textarea
                rows={3}
                value={form.qrisPaymentNote}
                onChange={(e) => updateForm('qrisPaymentNote', e.target.value)}
                placeholder="Contoh: Pastikan nominal sesuai total, lalu tunjukkan bukti pembayaran ke kasir."
              />
            </div>
          </SettingSection>

          <SettingSection
            icon={<Settings size={18} />}
            title="POS Behavior"
            description="Tentukan default order type, validasi order, konfirmasi, dan auto print."
          >
            <div className="form-group">
              <label>Default Order Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <SelectableChip active={form.defaultOrderType === 'DINE_IN'} label="Dine In" onClick={() => updateForm('defaultOrderType', 'DINE_IN')} />
                <SelectableChip active={form.defaultOrderType === 'TAKEAWAY'} label="Takeaway" onClick={() => updateForm('defaultOrderType', 'TAKEAWAY')} />
              </div>
            </div>

            <ToggleCard checked={form.requireTableNumber} label="Wajib nomor meja untuk dine in" description="Kasir tidak bisa checkout dine in tanpa nomor meja." onChange={(checked) => updateForm('requireTableNumber', checked)} />
            <ToggleCard checked={form.requireCustomerName} label="Wajib nama customer untuk takeaway" description="Bisa dipenuhi lewat member terpilih atau nama guest manual." onChange={(checked) => updateForm('requireCustomerName', checked)} />
            <ToggleCard checked={form.confirmBeforeCheckout} label="Konfirmasi sebelum checkout" description="Jika nonaktif, checkout langsung diproses tanpa modal konfirmasi." onChange={(checked) => updateForm('confirmBeforeCheckout', checked)} />
            <ToggleCard checked={form.confirmBeforeVoid} label="Konfirmasi sebelum void" description="Jika nonaktif, tombol void langsung mengeksekusi pembatalan transaksi." onChange={(checked) => updateForm('confirmBeforeVoid', checked)} />
            <ToggleCard checked={form.autoPrintReceipt} label="Auto print receipt setelah pembayaran" description="Receipt akan langsung dibuka ke mode print setelah checkout berhasil." onChange={(checked) => updateForm('autoPrintReceipt', checked)} />
            <ToggleCard checked={form.enableCupStickers} label="Aktifkan Cup Stickers" description="Stiker otomatis dicetak untuk setiap item di order setelah cetak receipt utama." onChange={(checked) => updateForm('enableCupStickers', checked)} />
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label style={{ fontWeight: 600 }}>Printer Paper Size</label>
              <select
                className="form-control"
                value={form.printerPaperSize}
                onChange={(e) => updateForm('printerPaperSize', e.target.value as '58mm' | '80mm')}
              >
                <option value="58mm">58mm (Kecil)</option>
                <option value="80mm">80mm (Lebar)</option>
              </select>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1rem' }}>
                Menyesuaikan ukuran kertas printer kasir Anda untuk merapikan struk dan format receipt.
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    const success = await printerService.connectSerial();
                    if (!success) {
                      showToast('Gagal menghubungkan printer', 'error');
                      return;
                    }
                    try {
                      await printerService.printReceipt({
                        customerName: 'Test Customer',
                        orderType: 'DINE_IN',
                        items: [
                          { name: 'Test Menu 1', quantity: 2, price: 15000 },
                          { name: 'Test Menu 2', quantity: 1, price: 20000 }
                        ],
                        total: 50000
                      }, form.storeName || 'My Cafe', form.printerPaperSize);
                      showToast('Test print struk berhasil dikirim', 'success');
                    } catch (e: any) {
                      showToast('Error: ' + e.message, 'error');
                    }
                  }}
                >
                  <Receipt size={16} /> Test Print Struk
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    const success = await printerService.connectSerial();
                    if (!success) {
                      showToast('Gagal menghubungkan printer', 'error');
                      return;
                    }
                    try {
                      await printerService.printCupSticker({
                        orderNumber: 'TEST-001',
                        customerName: 'Test Customer',
                        itemIndex: 1,
                        totalItems: 3,
                        menuName: 'Iced Caramel Latte',
                        modifiers: { 'Shot': [{ name: 'Espresso' }], 'Susu': [{ name: 'Oat Milk' }] },
                        notes: 'Less Sugar'
                      }, form.storeName || 'My Cafe', form.printerPaperSize);
                      showToast('Test print stiker berhasil dikirim', 'success');
                    } catch (e: any) {
                      showToast('Error: ' + e.message, 'error');
                    }
                  }}
                >
                  <Receipt size={16} /> Test Print Stiker
                </button>
              </div>
            </div>
          </SettingSection>

          <SettingSection
            icon={<Package size={18} />}
            title="Inventory"
            description="Atur warning stok minimum, blok penjualan saat stok kritis, dan disiplin pencatatan stock adjustment."
          >
            <div className="form-group">
              <label>Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => updateForm('lowStockThreshold', Number(e.target.value))}
              />
              <small style={{ color: 'var(--text-muted)' }}>
                Dipakai untuk badge stok di Ingredients dan validasi stok kritis di POS.
              </small>
            </div>

            <ToggleCard
              checked={form.blockSaleOnLowStock}
              label="Blok jual jika stok tersisa di bawah threshold"
              description="Checkout akan ditolak jika sesudah transaksi stok bahan turun di bawah batas minimum global."
              onChange={(checked) => updateForm('blockSaleOnLowStock', checked)}
            />

            <ToggleCard
              checked={form.requireAdjustmentNote}
              label="Wajib catatan saat stock adjustment"
              description="Inventory log manual tipe adjustment harus menyertakan alasan atau catatan opname."
              onChange={(checked) => updateForm('requireAdjustmentNote', checked)}
            />
          </SettingSection>

          <SettingSection
            icon={<Bell size={18} />}
            title="Kitchen / KDS"
            description="Kontrol perilaku KDS: suara order baru, refresh interval, tampilan note, dan auto-hide pesanan selesai."
          >
            <ToggleCard checked={form.kdsSoundEnabled} label="Suara notifikasi order baru" description="Memainkan bunyi ketika ada order baru masuk ke kolom pending." onChange={(checked) => updateForm('kdsSoundEnabled', checked)} />
            <ToggleCard checked={form.kdsHighlightNotes} label="Highlight notes item" description="Catatan item diberi warna lebih mencolok agar cepat terlihat oleh tim dapur." onChange={(checked) => updateForm('kdsHighlightNotes', checked)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Refresh Interval (detik)</label>
                <input type="number" min="3" value={form.kdsRefreshInterval} onChange={(e) => updateForm('kdsRefreshInterval', Number(e.target.value))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Auto-hide Done (menit)</label>
                <input type="number" min="0" value={form.kdsDoneHideMinutes} onChange={(e) => updateForm('kdsDoneHideMinutes', Number(e.target.value))} />
              </div>
            </div>
          </SettingSection>

          <SettingSection
            icon={<Users size={18} />}
            title="Customer & Loyalty"
            description="Kontrol apakah point reward aktif, rasio perolehan poin, dan batas tier customer."
          >
            <ToggleCard
              checked={form.loyaltyEnabled}
              label="Aktifkan loyalty points"
              description="Jika nonaktif, checkout tidak akan menambah poin customer."
              onChange={(checked) => updateForm('loyaltyEnabled', checked)}
            />

            <div className="form-group" style={{ marginBottom: 0, opacity: form.loyaltyEnabled ? 1 : 0.55 }}>
              <label>1 Poin per Belanja (Rp)</label>
              <input
                type="number"
                min="1"
                value={form.pointsPerSpend}
                onChange={(e) => updateForm('pointsPerSpend', Number(e.target.value))}
                disabled={!form.loyaltyEnabled}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0, opacity: form.loyaltyEnabled ? 1 : 0.55 }}>
                <label>Min. Silver</label>
                <input
                  type="number"
                  min="0"
                  value={form.silverMinPoints}
                  onChange={(e) => updateForm('silverMinPoints', Number(e.target.value))}
                  disabled={!form.loyaltyEnabled}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0, opacity: form.loyaltyEnabled ? 1 : 0.55 }}>
                <label>Min. Gold</label>
                <input
                  type="number"
                  min="0"
                  value={form.goldMinPoints}
                  onChange={(e) => updateForm('goldMinPoints', Number(e.target.value))}
                  disabled={!form.loyaltyEnabled}
                />
              </div>
            </div>

            <small style={{ color: 'var(--text-muted)' }}>
              Tier otomatis: Bronze di bawah Silver, Silver saat poin mencapai batas silver, Gold saat mencapai batas gold.
            </small>
          </SettingSection>

          <SettingSection
            icon={<ShieldCheck size={18} />}
            title="Security & Access"
            description="Kontrol timeout sesi, kewajiban ganti password, registrasi, dan kunci akses modul per fitur."
          >
            <ToggleCard checked={form.allowRegistration} label="Izinkan registrasi akun baru" description="Nonaktifkan jika pembuatan user hanya boleh lewat owner/admin." onChange={(checked) => updateForm('allowRegistration', checked)} />
            <ToggleCard checked={form.forcePasswordChange} label="Force change password" description="User harus mengganti password lewat halaman profile sebelum bebas membuka modul lain." onChange={(checked) => updateForm('forcePasswordChange', checked)} />

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Session Timeout (menit)</label>
              <input type="number" min="0" value={form.sessionTimeoutMinutes} onChange={(e) => updateForm('sessionTimeoutMinutes', Number(e.target.value))} />
              <small style={{ color: 'var(--text-muted)' }}>Isi `0` jika ingin mematikan auto logout karena idle.</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Disable Feature Access</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {FEATURE_OPTIONS.map((feature) => (
                  <SelectableChip
                    key={feature.key}
                    active={form.disabledFeatures.includes(feature.key)}
                    label={feature.label}
                    onClick={() => toggleFeature(feature.key)}
                  />
                ))}
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                Fitur yang dipilih akan disembunyikan dari sidebar dan route-nya akan dikunci untuk user non-settings.
              </small>
            </div>
          </SettingSection>

          <SettingSection
            icon={<Database size={18} />}
            title="Backup & System"
            description="Export backup JSON, reset demo data, kelola retensi inventory log, dan tampilkan info versi aplikasi."
          >
            <div className="form-group">
              <label>App Version</label>
              <input type="text" value={form.appVersion} onChange={(e) => updateForm('appVersion', e.target.value)} placeholder={systemInfo?.backendVersion || '0.0.1'} />
              <small style={{ color: 'var(--text-muted)' }}>
                Backend package: {systemInfo?.backendVersion || '-'} • Frontend package: {systemInfo?.frontendVersion || '-'}
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Inventory Log Retention (hari)</label>
              <input type="number" min="0" value={form.logRetentionDays} onChange={(e) => updateForm('logRetentionDays', Number(e.target.value))} />
              <small style={{ color: 'var(--text-muted)' }}>
                Yang dibersihkan hanya riwayat pada halaman Inventory Logs, bukan transaksi atau data master lain.
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Audit Log Retention (hari)</label>
              <input type="number" min="0" value={form.auditLogRetentionDays} onChange={(e) => updateForm('auditLogRetentionDays', Number(e.target.value))} />
              <small style={{ color: 'var(--text-muted)' }}>
                Batas hari penyimpanan untuk riwayat aktivitas administratif pada tabel Audit Log.
              </small>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => exportBackupMut.mutate()} disabled={actionBusy}>
                <Archive size={16} /> Export Backup JSON
              </button>
              <div style={{ padding: '0.9rem 1rem', borderRadius: '0.75rem', border: '1px dashed var(--border)', background: 'var(--bg-secondary)' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Restore Backup JSON</label>
                <input
                  key={backupUploadKey}
                  type="file"
                  accept="application/json"
                  disabled={actionBusy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!confirm('Restore backup akan menimpa data operasional saat ini. Lanjutkan?')) {
                      setBackupUploadKey((prev) => prev + 1);
                      return;
                    }

                    try {
                      const text = await file.text();
                      const parsed = JSON.parse(text);
                      restoreBackupMut.mutate(parsed);
                    } catch {
                      setBackupUploadKey((prev) => prev + 1);
                      showToast('File backup tidak valid.', 'error');
                    }
                  }}
                />
                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                  Gunakan file hasil export backup dari sistem ini untuk restore data operasional dan settings.
                </small>
              </div>
              <button className="btn btn-secondary" onClick={() => applyLogRetentionMut.mutate()} disabled={actionBusy}>
                <RotateCcw size={16} /> Bersihkan Inventory Logs Lama
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirm('Reset demo data akan menghapus transaksi, menu, stok, customer, diskon, dan data operasional lain. Lanjutkan?')) {
                    resetDemoDataMut.mutate();
                  }
                }}
                disabled={actionBusy}
              >
                <Database size={16} /> Reset Demo / Sample Data
              </button>
            </div>
          </SettingSection>
        </div>

        <div className="card" style={{ position: 'sticky', bottom: '1.5rem', zIndex: 50, boxShadow: '0 -10px 25px rgba(0,0,0,0.08)', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', border: '1px solid var(--accent)' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Simpan perubahan</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {hasChanges ? 'Ada perubahan yang belum disimpan.' : 'Semua pengaturan sudah sinkron.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setForm(initialForm)} disabled={actionBusy || !hasChanges || isLoading}>
              Reset
            </button>
            <button className="btn btn-primary" onClick={() => saveMut.mutate()} disabled={actionBusy || !hasChanges || isLoading}>
              {uploadLogoMut.isPending ? 'Uploading logo...' : saveMut.isPending ? 'Menyimpan...' : 'Simpan Settings'}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--accent)" /> Audit Trail (Log Aktivitas Admin)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Menampilkan 200 aktivitas administratif terbaru yang direkam oleh sistem.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => refetchAuditLogs()} disabled={isAuditLogsLoading}>
              {isAuditLogsLoading ? 'Refreshing...' : 'Refresh Logs'}
            </button>
          </div>

          {isAuditLogsLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit trail...</div>
          ) : auditLogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada log aktivitas administratif yang tercatat.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem' }}>Waktu</th>
                    <th style={{ padding: '0.75rem' }}>Pengguna</th>
                    <th style={{ padding: '0.75rem' }}>Aksi</th>
                    <th style={{ padding: '0.75rem' }}>Target</th>
                    <th style={{ padding: '0.75rem' }}>Detail</th>
                    <th style={{ padding: '0.75rem' }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: any) => {
                    let actionBadgeClass = 'badge-secondary';
                    if (log.action === 'UPDATE_MENU' || log.action === 'OVERRIDE_MENU_BRANCH') {
                      actionBadgeClass = 'badge-primary';
                    } else if (log.action === 'DELETE_MENU' || log.action === 'DELETE_MENU_BRANCH_OVERRIDE') {
                      actionBadgeClass = 'badge-danger';
                    } else if (log.action === 'VOID_TRANSACTION') {
                      actionBadgeClass = 'badge-warning';
                    } else if (log.action === 'UPDATE_SETTINGS') {
                      actionBadgeClass = 'badge-info';
                    } else if (log.action === 'RESTORE_BACKUP' || log.action === 'RESET_DEMO_DATA') {
                      actionBadgeClass = 'badge-success';
                    }

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600 }}>{log.userName || 'System'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.userEmail || '-'}</div>
                        </td>
                        <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                          <span className={`badge ${actionBadgeClass}`}>{log.action}</span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{log.target}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{log.details || '-'}</td>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{log.ipAddress || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
