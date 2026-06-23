import { PrismaService } from '../prisma/prisma.service';
import { OutletsService } from '../outlets/outlets.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class PublicOrderService {
    private prisma;
    private outletsService;
    private transactionsService;
    constructor(prisma: PrismaService, outletsService: OutletsService, transactionsService: TransactionsService);
    getMenu(outletSlug: string, tableCode: string): Promise<{
        outlet: {
            id: string;
            name: string;
            slug: string;
            address: string | null;
            phone: string | null;
        };
        table: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            isActive: boolean;
            label: string | null;
        };
        categories: {
            id: string;
            name: string;
        }[];
        menus: ({
            category: {
                id: string;
                name: string;
            } | null;
            ingredients: ({
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
                quantity: number;
                ingredientId: string;
                menuId: string;
            })[];
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
    }>;
    createOrder(outletSlug: string, tableCode: string, data: {
        customerName?: string;
        items: Array<{
            menuId: string;
            quantity: number;
            notes?: string;
        }>;
    }): Promise<{
        user: Omit<{
            outlet: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                phone: string | null;
                slug: string;
                address: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            password: string;
            outletId: string | null;
            role: import("@prisma/client").$Enums.Role;
        }, "password"> | null;
        pricingMetadata: {
            subtotalBeforeDiscount: number;
            discountAmount: number;
            taxableAmount: number;
            taxAmount: number;
            totalAmount: number;
            taxEnabled: boolean;
            taxRate: number;
            taxInclusive: boolean;
            roundingMode: import("../transactions/pricing.util").RoundingMode;
            roundingStep: number;
            roundingAdjustment: number;
        };
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
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
    }>;
}
