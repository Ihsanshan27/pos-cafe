import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { settingsApi } from '../lib/api';
import { parseJsonArray } from '../lib/featureAccess';
import type { RoundingMode } from '../lib/pricing';

const SETTING_KEYS = [
  'STORE_NAME',
  'STORE_ADDRESS',
  'STORE_PHONE',
  'STORE_LOGO_URL',
  'RECEIPT_HEADER',
  'STORE_TAX_ID',
  'RECEIPT_FOOTER',
  'ALLOW_REGISTRATION',
  'DEFAULT_ORDER_TYPE',
  'REQUIRE_TABLE_NUMBER',
  'REQUIRE_CUSTOMER_NAME',
  'CONFIRM_BEFORE_CHECKOUT',
  'CONFIRM_BEFORE_VOID',
  'AUTO_PRINT_RECEIPT',
  'ENABLED_PAYMENT_METHODS',
  'DEFAULT_PAYMENT_METHOD',
  'QRIS_PAYMENT_NOTE',
  'KDS_SOUND_ENABLED',
  'KDS_REFRESH_INTERVAL',
  'KDS_DONE_HIDE_MINUTES',
  'KDS_HIGHLIGHT_NOTES',
  'SESSION_TIMEOUT_MINUTES',
  'FORCE_PASSWORD_CHANGE',
  'DISABLED_FEATURES',
  'LOG_RETENTION_DAYS',
  'APP_VERSION',
  'TAX_ENABLED',
  'TAX_RATE',
  'TAX_INCLUSIVE',
  'ROUNDING_MODE',
  'ROUNDING_STEP',
  'LOW_STOCK_THRESHOLD',
  'BLOCK_SALE_ON_LOW_STOCK',
  'REQUIRE_ADJUSTMENT_NOTE',
  'LOYALTY_ENABLED',
  'POINTS_PER_SPEND',
  'SILVER_MIN_POINTS',
  'GOLD_MIN_POINTS',
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];
type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'EWALLET';
type SettingsMap = Record<SettingKey, string | null>;

type PublicSettingsResult = {
  isLoading: boolean;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogoUrl: string;
  receiptHeader: string;
  storeTaxId: string;
  receiptFooter: string;
  allowRegistration: boolean;
  defaultOrderType: 'DINE_IN' | 'TAKEAWAY';
  requireTableNumber: boolean;
  requireCustomerName: boolean;
  confirmBeforeCheckout: boolean;
  confirmBeforeVoid: boolean;
  autoPrintReceipt: boolean;
  enabledPaymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod;
  qrisPaymentNote: string;
  kdsSoundEnabled: boolean;
  kdsRefreshInterval: number;
  kdsDoneHideMinutes: number;
  kdsHighlightNotes: boolean;
  sessionTimeoutMinutes: number;
  forcePasswordChange: boolean;
  disabledFeatures: string[];
  logRetentionDays: number;
  appVersion: string;
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
};

const ALL_PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'QRIS', 'DEBIT', 'EWALLET'];

const DEFAULT_SETTINGS: SettingsMap = {
  STORE_NAME: 'POS F&B',
  STORE_ADDRESS: null,
  STORE_PHONE: null,
  STORE_LOGO_URL: null,
  RECEIPT_HEADER: null,
  STORE_TAX_ID: null,
  RECEIPT_FOOTER: 'Terima kasih sudah berkunjung.',
  ALLOW_REGISTRATION: 'true',
  DEFAULT_ORDER_TYPE: 'DINE_IN',
  REQUIRE_TABLE_NUMBER: 'true',
  REQUIRE_CUSTOMER_NAME: 'false',
  CONFIRM_BEFORE_CHECKOUT: 'true',
  CONFIRM_BEFORE_VOID: 'true',
  AUTO_PRINT_RECEIPT: 'false',
  ENABLED_PAYMENT_METHODS: JSON.stringify(ALL_PAYMENT_METHODS),
  DEFAULT_PAYMENT_METHOD: 'CASH',
  QRIS_PAYMENT_NOTE: '',
  KDS_SOUND_ENABLED: 'true',
  KDS_REFRESH_INTERVAL: '5',
  KDS_DONE_HIDE_MINUTES: '120',
  KDS_HIGHLIGHT_NOTES: 'true',
  SESSION_TIMEOUT_MINUTES: '120',
  FORCE_PASSWORD_CHANGE: 'false',
  DISABLED_FEATURES: '[]',
  LOG_RETENTION_DAYS: '30',
  APP_VERSION: '',
  TAX_ENABLED: 'false',
  TAX_RATE: '10',
  TAX_INCLUSIVE: 'false',
  ROUNDING_MODE: 'NONE',
  ROUNDING_STEP: '0',
  LOW_STOCK_THRESHOLD: '10',
  BLOCK_SALE_ON_LOW_STOCK: 'false',
  REQUIRE_ADJUSTMENT_NOTE: 'true',
  LOYALTY_ENABLED: 'true',
  POINTS_PER_SPEND: '10000',
  SILVER_MIN_POINTS: '100',
  GOLD_MIN_POINTS: '300',
};

export function useAppPublicSettings(): PublicSettingsResult {
  const results = useQueries({
    queries: SETTING_KEYS.map((key) => ({
      queryKey: ['settings', key],
      queryFn: () => settingsApi.getSetting(key),
      staleTime: 60_000,
    })),
  });

  const settings = useMemo<SettingsMap>(() => {
    return SETTING_KEYS.reduce((acc, key, index) => {
      acc[key] = results[index]?.data?.value ?? DEFAULT_SETTINGS[key];
      return acc;
    }, {} as SettingsMap);
  }, [results]);

  const parsedTaxRate = Number(settings.TAX_RATE ?? '10');
  const parsedRoundingStep = Number(settings.ROUNDING_STEP ?? '0');
  const parsedRefreshInterval = Number(settings.KDS_REFRESH_INTERVAL ?? '5');
  const parsedDoneHideMinutes = Number(settings.KDS_DONE_HIDE_MINUTES ?? '120');
  const parsedSessionTimeoutMinutes = Number(settings.SESSION_TIMEOUT_MINUTES ?? '120');
  const parsedLogRetentionDays = Number(settings.LOG_RETENTION_DAYS ?? '30');
  const parsedLowStockThreshold = Number(settings.LOW_STOCK_THRESHOLD ?? '10');
  const parsedPointsPerSpend = Number(settings.POINTS_PER_SPEND ?? '10000');
  const parsedSilverMinPoints = Number(settings.SILVER_MIN_POINTS ?? '100');
  const parsedGoldMinPoints = Number(settings.GOLD_MIN_POINTS ?? '300');
  const roundingMode: RoundingMode =
    settings.ROUNDING_MODE === 'UP' ||
    settings.ROUNDING_MODE === 'DOWN' ||
    settings.ROUNDING_MODE === 'NEAREST'
      ? settings.ROUNDING_MODE
      : 'NONE';

  const parsedPaymentMethods = parseJsonArray(settings.ENABLED_PAYMENT_METHODS).filter(
    (method): method is PaymentMethod =>
      method === 'CASH' || method === 'QRIS' || method === 'DEBIT' || method === 'EWALLET',
  );
  const enabledPaymentMethods = parsedPaymentMethods.length > 0 ? parsedPaymentMethods : ALL_PAYMENT_METHODS;
  const defaultPaymentMethod =
    enabledPaymentMethods.includes((settings.DEFAULT_PAYMENT_METHOD ?? 'CASH') as PaymentMethod)
      ? ((settings.DEFAULT_PAYMENT_METHOD ?? 'CASH') as PaymentMethod)
      : enabledPaymentMethods[0];

  return {
    isLoading: results.some((result) => result.isLoading),
    storeName: settings.STORE_NAME ?? 'POS F&B',
    storeAddress: settings.STORE_ADDRESS || '',
    storePhone: settings.STORE_PHONE || '',
    storeLogoUrl: settings.STORE_LOGO_URL || '',
    receiptHeader: settings.RECEIPT_HEADER || '',
    storeTaxId: settings.STORE_TAX_ID || '',
    receiptFooter: settings.RECEIPT_FOOTER ?? 'Terima kasih sudah berkunjung.',
    allowRegistration: (settings.ALLOW_REGISTRATION ?? 'true') === 'true',
    defaultOrderType: settings.DEFAULT_ORDER_TYPE === 'TAKEAWAY' ? 'TAKEAWAY' : 'DINE_IN',
    requireTableNumber: (settings.REQUIRE_TABLE_NUMBER ?? 'true') === 'true',
    requireCustomerName: (settings.REQUIRE_CUSTOMER_NAME ?? 'false') === 'true',
    confirmBeforeCheckout: (settings.CONFIRM_BEFORE_CHECKOUT ?? 'true') === 'true',
    confirmBeforeVoid: (settings.CONFIRM_BEFORE_VOID ?? 'true') === 'true',
    autoPrintReceipt: (settings.AUTO_PRINT_RECEIPT ?? 'false') === 'true',
    enabledPaymentMethods,
    defaultPaymentMethod,
    qrisPaymentNote: settings.QRIS_PAYMENT_NOTE || '',
    kdsSoundEnabled: (settings.KDS_SOUND_ENABLED ?? 'true') === 'true',
    kdsRefreshInterval:
      Number.isFinite(parsedRefreshInterval) && parsedRefreshInterval > 0 ? parsedRefreshInterval : 5,
    kdsDoneHideMinutes:
      Number.isFinite(parsedDoneHideMinutes) && parsedDoneHideMinutes >= 0 ? parsedDoneHideMinutes : 120,
    kdsHighlightNotes: (settings.KDS_HIGHLIGHT_NOTES ?? 'true') === 'true',
    sessionTimeoutMinutes:
      Number.isFinite(parsedSessionTimeoutMinutes) && parsedSessionTimeoutMinutes >= 0
        ? parsedSessionTimeoutMinutes
        : 120,
    forcePasswordChange: (settings.FORCE_PASSWORD_CHANGE ?? 'false') === 'true',
    disabledFeatures: parseJsonArray(settings.DISABLED_FEATURES ?? '[]'),
    logRetentionDays:
      Number.isFinite(parsedLogRetentionDays) && parsedLogRetentionDays >= 0 ? parsedLogRetentionDays : 30,
    appVersion: settings.APP_VERSION || '',
    taxEnabled: (settings.TAX_ENABLED ?? 'false') === 'true',
    taxRate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : 10,
    taxInclusive: (settings.TAX_INCLUSIVE ?? 'false') === 'true',
    roundingMode,
    roundingStep: Number.isFinite(parsedRoundingStep) ? parsedRoundingStep : 0,
    lowStockThreshold:
      Number.isFinite(parsedLowStockThreshold) && parsedLowStockThreshold >= 0 ? parsedLowStockThreshold : 10,
    blockSaleOnLowStock: (settings.BLOCK_SALE_ON_LOW_STOCK ?? 'false') === 'true',
    requireAdjustmentNote: (settings.REQUIRE_ADJUSTMENT_NOTE ?? 'true') === 'true',
    loyaltyEnabled: (settings.LOYALTY_ENABLED ?? 'true') === 'true',
    pointsPerSpend: Number.isFinite(parsedPointsPerSpend) && parsedPointsPerSpend > 0 ? parsedPointsPerSpend : 10000,
    silverMinPoints: Number.isFinite(parsedSilverMinPoints) && parsedSilverMinPoints >= 0 ? parsedSilverMinPoints : 100,
    goldMinPoints: Number.isFinite(parsedGoldMinPoints) && parsedGoldMinPoints >= 0 ? parsedGoldMinPoints : 300,
  };
}
