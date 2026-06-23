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
            createdAt: Date;
            outletId: string;
            isActive: boolean;
            updatedAt: Date;
            code: string;
            label: string | null;
        };
        categories: {
            name: string;
            id: string;
        }[];
        menus: {
            sellingPrice: import("@prisma/client-runtime-utils").Decimal;
            isActive: boolean;
            category: {
                name: string;
                id: string;
            } | null;
            ingredients: ({
                ingredient: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    unit: string;
                    costPerUnit: import("@prisma/client-runtime-utils").Decimal;
                };
            } & {
                id: string;
                menuId: string;
                quantity: number;
                ingredientId: string;
            })[];
            name: string;
            id: string;
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
                name: string;
                id: string;
                createdAt: Date;
                slug: string;
                address: string | null;
                phone: string | null;
                isActive: boolean;
                updatedAt: Date;
            } | null;
        } & {
            name: string;
            id: string;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
            outletId: string | null;
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
            name: string;
            id: string;
            createdAt: Date;
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            updatedAt: Date;
        } | null;
        customer: {
            name: string;
            id: string;
            email: string | null;
            createdAt: Date;
            phone: string | null;
            pointBalance: number;
            tier: import("@prisma/client").$Enums.CustomerTier;
        } | null;
        items: ({
            menu: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sellingPrice: import("@prisma/client-runtime-utils").Decimal;
                imageUrl: string | null;
                categoryId: string | null;
            };
        } & {
            id: string;
            menuId: string;
            quantity: number;
            priceAtSale: import("@prisma/client-runtime-utils").Decimal;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            notes: string | null;
            transactionId: string;
        })[];
        id: string;
        createdAt: Date;
        outletId: string | null;
        orderNumber: string | null;
        source: import("@prisma/client").$Enums.TransactionSource;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        status: import("@prisma/client").$Enums.TransactionStatus;
        orderType: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        customerName: string | null;
        kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
        customerId: string | null;
        shiftId: string | null;
        userId: string | null;
    }>;
}
