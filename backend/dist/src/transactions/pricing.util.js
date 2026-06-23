"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePricing = calculatePricing;
function roundCurrency(value) {
    return Number(value.toFixed(2));
}
function applyRounding(value, mode, step) {
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
function calculatePricing(subtotal, discountAmount, config) {
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
        }
        else {
            baseAmount = taxableAmount;
            taxAmount = taxableAmount * taxMultiplier;
            totalBeforeRounding = taxableAmount + taxAmount;
        }
    }
    const totalAmount = applyRounding(totalBeforeRounding, config.roundingMode, config.roundingStep);
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
//# sourceMappingURL=pricing.util.js.map