export type RoundingMode = 'NONE' | 'NEAREST' | 'UP' | 'DOWN';

export type PricingConfig = {
  taxEnabled: boolean;
  taxRate: number;
  taxInclusive: boolean;
  roundingMode: RoundingMode;
  roundingStep: number;
};

export type PricingSummary = {
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalBeforeRounding: number;
  roundingAdjustment: number;
  totalAmount: number;
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function applyRounding(value: number, mode: RoundingMode, step: number) {
  if (mode === 'NONE' || step <= 0) {
    return roundCurrency(value);
  }

  const quotient = value / step;

  if (mode === 'UP') {
    return roundCurrency(Math.ceil(quotient) * step);
  }

  if (mode === 'DOWN') {
    return roundCurrency(Math.floor(quotient) * step);
  }

  return roundCurrency(Math.round(quotient) * step);
}

export function calculatePricing(
  subtotal: number,
  discountAmount: number,
  config: PricingConfig,
): PricingSummary {
  const safeSubtotal = Math.max(0, subtotal);
  const safeDiscount = Math.max(0, Math.min(discountAmount, safeSubtotal));
  const taxableAmount = Math.max(0, safeSubtotal - safeDiscount);
  const safeRate = Math.max(0, config.taxRate);
  const taxMultiplier = safeRate / 100;

  let baseAmount = taxableAmount;
  let taxAmount = 0;
  let totalBeforeRounding = taxableAmount;

  if (config.taxEnabled && taxMultiplier > 0) {
    if (config.taxInclusive) {
      baseAmount = taxableAmount / (1 + taxMultiplier);
      taxAmount = taxableAmount - baseAmount;
      totalBeforeRounding = taxableAmount;
    } else {
      baseAmount = taxableAmount;
      taxAmount = taxableAmount * taxMultiplier;
      totalBeforeRounding = taxableAmount + taxAmount;
    }
  }

  const totalAmount = applyRounding(
    totalBeforeRounding,
    config.roundingMode,
    config.roundingStep,
  );

  return {
    baseAmount: roundCurrency(baseAmount),
    discountAmount: roundCurrency(safeDiscount),
    taxableAmount: roundCurrency(taxableAmount),
    taxAmount: roundCurrency(taxAmount),
    totalBeforeRounding: roundCurrency(totalBeforeRounding),
    roundingAdjustment: roundCurrency(totalAmount - totalBeforeRounding),
    totalAmount,
  };
}
