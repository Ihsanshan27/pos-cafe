import { PublicOrderService } from './public-order.service';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';
export declare class PublicOrderController {
    private readonly publicOrderService;
    constructor(publicOrderService: PublicOrderService);
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            label: string | null;
        };
        categories: {
            id: string;
            name: string;
        }[];
        menus: {
            sellingPrice: import("@prisma/client-runtime-utils").Decimal;
            isActive: boolean;
            category: {
                id: string;
                name: string;
            } | null;
            ingredients: ({
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
                quantity: number;
                ingredientId: string;
                menuId: string;
            })[];
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            imageUrl: string | null;
            categoryId: string | null;
        }[];
    }>;
    createOrder(outletSlug: string, tableCode: string, body: CreatePublicOrderDto): Promise<{
        user: Omit<{
            outlet: {
                id: string;
                name: string;
                slug: string;
                address: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        })[];
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
    }>;
}
