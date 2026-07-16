export type RoundingMode = 'NONE' | 'NEAREST' | 'UP' | 'DOWN';
export type PricingConfig = {
    taxEnabled: boolean;
    taxRate: number;
    taxInclusive: boolean;
    roundingMode: RoundingMode;
    roundingStep: number;
};
export declare function calculatePricing(subtotal: number, discountAmount: number, config: PricingConfig): {
    baseAmount: number;
    discountAmount: number;
    taxableAmount: number;
    taxAmount: number;
    totalBeforeRounding: number;
    roundingAdjustment: number;
    totalAmount: number;
};
