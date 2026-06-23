import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(req: any, createTransactionDto: CreateTransactionDto): Promise<{
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
            roundingMode: import("./pricing.util").RoundingMode;
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
    findAll(req: any, outletId?: string): Promise<{
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
        pricingMetadata: any;
    }[]>;
    findOne(req: any, id: string): Promise<{
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
        pricingMetadata: any;
    } | null>;
    voidTransaction(req: any, id: string): Promise<{
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
    } & {
        pricingMetadata: any;
    }>;
    updateKitchenStatus(req: any, id: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE'): Promise<{
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
        pricingMetadata: any;
    }>;
}
