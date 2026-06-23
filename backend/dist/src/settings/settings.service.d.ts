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
    setManySettings(settings: Record<string, string>): Promise<{
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
        backendVersion: any;
        frontendVersion: any;
    };
    getSystemInfo(): Promise<{
        appVersion: any;
        backendVersion: any;
        frontendVersion: any;
        logRetentionDays: number;
        generatedAt: string;
    }>;
    exportBackup(): Promise<{
        meta: {
            exportedAt: string;
            systemInfo: {
                appVersion: any;
                backendVersion: any;
                frontendVersion: any;
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
            }[];
            ingredients: {
                id: string;
                name: string;
                unit: string;
                costPerUnit: import("@prisma/client-runtime-utils").Decimal;
                stockQuantity: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
            menus: ({
                category: {
                    id: string;
                    name: string;
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
                value: import("@prisma/client-runtime-utils").Decimal;
                code: string;
                type: string;
                isActive: boolean;
            }[];
            customers: {
                id: string;
                name: string;
                createdAt: Date;
                email: string | null;
                phone: string | null;
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
                status: string;
                userId: string;
                startTime: Date;
                endTime: Date | null;
                startingCash: import("@prisma/client-runtime-utils").Decimal;
                actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
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
                    status: string;
                    userId: string;
                    startTime: Date;
                    endTime: Date | null;
                    startingCash: import("@prisma/client-runtime-utils").Decimal;
                    actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
                } | null;
                customer: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    email: string | null;
                    phone: string | null;
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
                    menuId: string;
                    notes: string | null;
                    priceAtSale: import("@prisma/client-runtime-utils").Decimal;
                    subtotal: import("@prisma/client-runtime-utils").Decimal;
                    transactionId: string;
                })[];
            } & {
                id: string;
                createdAt: Date;
                outletId: string | null;
                status: import("@prisma/client").$Enums.TransactionStatus;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                orderType: import("@prisma/client").$Enums.OrderType;
                tableNumber: string | null;
                discountAmount: import("@prisma/client-runtime-utils").Decimal;
                taxAmount: import("@prisma/client-runtime-utils").Decimal;
                shiftId: string | null;
                customerName: string | null;
                customerId: string | null;
                source: import("@prisma/client").$Enums.TransactionSource;
                userId: string | null;
                orderNumber: string | null;
                totalAmount: import("@prisma/client-runtime-utils").Decimal;
                kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
            })[];
            inventoryLogs: ({
                ingredient: {
                    id: string;
                    name: string;
                    unit: string;
                    costPerUnit: import("@prisma/client-runtime-utils").Decimal;
                    stockQuantity: number;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                quantity: number;
                ingredientId: string;
                notes: string | null;
                type: import("@prisma/client").$Enums.LogType;
                createdBy: string | null;
            })[];
        };
    }>;
    applyLogRetention(): Promise<{
        deletedCount: number;
    }>;
    resetDemoData(): Promise<{
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
            ingredients: number;
        };
    }>;
    restoreBackup(backup: any): Promise<{
        success: boolean;
        summary: {
            settings: number;
            categories: number;
            ingredients: number;
            menus: number;
            discounts: number;
            customers: number;
            expenses: number;
            shifts: number;
            transactions: number;
            inventoryLogs: number;
        };
    }>;
}
