import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllSettings(): Promise<{
        key: string;
        value: string;
    }[]>;
    getSetting(key: string): Promise<{
        key: string;
        value: string;
    } | null>;
    setSetting(key: string, value: string): Promise<{
        key: string;
        value: string;
    }>;
    setManySettings(settings: Record<string, string>, user?: any, ip?: string): Promise<{
        key: string;
        value: string;
    }[]>;
    getAllowRegistration(): Promise<boolean>;
    getPasswordChangedKey(userId: string): string;
    getTransactionPricingMetaKey(transactionId: string): string;
    getForcePasswordChangeRequired(userId: string): Promise<boolean>;
    markPasswordChanged(userId: string): Promise<{
        key: string;
        value: string;
    }>;
    saveTransactionPricingMetadata(transactionId: string, metadata: Record<string, unknown>, tx?: PrismaService | any): Promise<any>;
    getTransactionPricingMetadataMap(transactionIds: string[]): Promise<Map<string, any>>;
    getPackageVersions(): {
        backendVersion: string;
        frontendVersion: string;
    };
    getSystemInfo(): Promise<{
        appVersion: string;
        backendVersion: string;
        frontendVersion: string;
        logRetentionDays: number;
        generatedAt: string;
    }>;
    exportBackup(): Promise<{
        meta: {
            exportedAt: string;
            systemInfo: {
                appVersion: string;
                backendVersion: string;
                frontendVersion: string;
                logRetentionDays: number;
                generatedAt: string;
            };
        };
        data: {
            settings: {
                key: string;
                value: string;
            }[];
            users: {
                id: string;
                name: string;
                createdAt: Date;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            }[];
            categories: {
                id: string;
                name: string;
                isStickerPrintable: boolean;
            }[];
            ingredients: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                unit: string;
                costPerUnit: import("@prisma/client-runtime-utils").Decimal;
            }[];
            menus: ({
                category: {
                    id: string;
                    name: string;
                    isStickerPrintable: boolean;
                } | null;
                ingredients: {
                    id: string;
                    quantity: number;
                    ingredientId: string;
                    menuId: string;
                }[];
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sellingPrice: import("@prisma/client-runtime-utils").Decimal;
                imageUrl: string | null;
                categoryId: string | null;
            })[];
            discounts: {
                id: string;
                isActive: boolean;
                value: import("@prisma/client-runtime-utils").Decimal;
                code: string;
                type: string;
            }[];
            customers: {
                id: string;
                name: string;
                phone: string | null;
                createdAt: Date;
                email: string | null;
                pointBalance: number;
                tier: import("@prisma/client").$Enums.CustomerTier;
            }[];
            expenses: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                outletId: string | null;
                amount: import("@prisma/client-runtime-utils").Decimal;
            }[];
            shifts: ({
                user: {
                    id: string;
                    name: string;
                    email: string;
                    role: import("@prisma/client").$Enums.Role;
                };
            } & {
                id: string;
                outletId: string | null;
                userId: string;
                startTime: Date;
                endTime: Date | null;
                startingCash: import("@prisma/client-runtime-utils").Decimal;
                actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
                expectedEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
                cashDifference: import("@prisma/client-runtime-utils").Decimal | null;
                totalCashSales: import("@prisma/client-runtime-utils").Decimal | null;
                totalNonCashSales: import("@prisma/client-runtime-utils").Decimal | null;
                totalExpenses: import("@prisma/client-runtime-utils").Decimal | null;
                transactionCount: number | null;
                notes: string | null;
                status: string;
            })[];
            transactions: ({
                user: {
                    id: string;
                    name: string;
                    email: string;
                    role: import("@prisma/client").$Enums.Role;
                } | null;
                shift: {
                    id: string;
                    outletId: string | null;
                    userId: string;
                    startTime: Date;
                    endTime: Date | null;
                    startingCash: import("@prisma/client-runtime-utils").Decimal;
                    actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
                    expectedEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
                    cashDifference: import("@prisma/client-runtime-utils").Decimal | null;
                    totalCashSales: import("@prisma/client-runtime-utils").Decimal | null;
                    totalNonCashSales: import("@prisma/client-runtime-utils").Decimal | null;
                    totalExpenses: import("@prisma/client-runtime-utils").Decimal | null;
                    transactionCount: number | null;
                    notes: string | null;
                    status: string;
                } | null;
                customer: {
                    id: string;
                    name: string;
                    phone: string | null;
                    createdAt: Date;
                    email: string | null;
                    pointBalance: number;
                    tier: import("@prisma/client").$Enums.CustomerTier;
                } | null;
                items: ({
                    menu: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
                        description: string | null;
                        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
                        imageUrl: string | null;
                        categoryId: string | null;
                    };
                } & {
                    id: string;
                    quantity: number;
                    notes: string | null;
                    menuId: string;
                    priceAtSale: import("@prisma/client-runtime-utils").Decimal;
                    subtotal: import("@prisma/client-runtime-utils").Decimal;
                    transactionId: string;
                    modifiers: import("@prisma/client/runtime/client").JsonValue | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                outletId: string | null;
                userId: string | null;
                status: import("@prisma/client").$Enums.TransactionStatus;
                orderNumber: string | null;
                source: import("@prisma/client").$Enums.TransactionSource;
                totalAmount: import("@prisma/client-runtime-utils").Decimal;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                orderType: import("@prisma/client").$Enums.OrderType;
                tableNumber: string | null;
                discountAmount: import("@prisma/client-runtime-utils").Decimal;
                taxAmount: import("@prisma/client-runtime-utils").Decimal;
                customerName: string | null;
                customerId: string | null;
                shiftId: string | null;
                kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
            })[];
            inventoryLogs: ({
                ingredient: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    unit: string;
                    costPerUnit: import("@prisma/client-runtime-utils").Decimal;
                };
            } & {
                id: string;
                createdAt: Date;
                quantity: number;
                ingredientId: string;
                outletId: string | null;
                type: import("@prisma/client").$Enums.LogType;
                notes: string | null;
                createdBy: string | null;
            })[];
            outletIngredients: {
                id: string;
                ingredientId: string;
                outletId: string;
                stockQuantity: number;
            }[];
            outletMenus: {
                id: string;
                isActive: boolean;
                sellingPrice: import("@prisma/client-runtime-utils").Decimal;
                outletId: string;
                menuId: string;
            }[];
        };
    }>;
    applyLogRetention(): Promise<{
        deletedCount: number;
        deletedAuditCount: number;
    }>;
    resetDemoData(user?: any, ip?: string): Promise<{
        success: boolean;
        summary: {
            transactionPricingMeta: number;
            transactionItems: number;
            transactions: number;
            inventoryLogs: number;
            expenses: number;
            discounts: number;
            customers: number;
            shifts: number;
            recipeItems: number;
            menus: number;
            categories: number;
            outletIngredients: number;
            outletMenus: number;
            ingredients: number;
        };
    }>;
    restoreBackup(backup: any, user?: any, ip?: string): Promise<{
        success: boolean;
        summary: {
            settings: number;
            categories: number;
            ingredients: number;
            outletIngredients: number;
            outletMenus: number;
            menus: number;
            discounts: number;
            customers: number;
            expenses: number;
            shifts: number;
            transactions: number;
            inventoryLogs: number;
        };
    }>;
    getAuditLogs(): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        userEmail: string | null;
        userName: string | null;
        action: string;
        target: string;
        details: string | null;
        ipAddress: string | null;
    }[]>;
}
