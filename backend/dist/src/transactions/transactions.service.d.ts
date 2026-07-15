import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Role } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';
import { type RoundingMode } from './pricing.util';
import { KdsGateway } from './kds.gateway';
type AuthenticatedUser = {
    id: string;
    role: Role;
    outletId?: string | null;
};
export declare class TransactionsService {
    private prisma;
    private settingsService;
    private kdsGateway;
    constructor(prisma: PrismaService, settingsService: SettingsService, kdsGateway: KdsGateway);
    create(user: AuthenticatedUser | null, createTransactionDto: CreateTransactionDto): Promise<{
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
            roundingMode: RoundingMode;
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
            modifiers: import("@prisma/client/runtime/client").JsonValue | null;
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
    findAll(user: AuthenticatedUser, outletId?: string): Promise<{
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
            modifiers: import("@prisma/client/runtime/client").JsonValue | null;
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
    findOne(user: AuthenticatedUser, id: string): Promise<{
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
            modifiers: import("@prisma/client/runtime/client").JsonValue | null;
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
    voidTransaction(user: any, id: string, ip?: string): Promise<{
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
    } & {
        pricingMetadata: any;
    }>;
    updateKitchenStatus(user: AuthenticatedUser, id: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE'): Promise<{
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
            modifiers: import("@prisma/client/runtime/client").JsonValue | null;
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
    private attachPricingMetadata;
    private resolveCustomerTier;
    private resolveScopedOutletId;
    private assertTransactionAccess;
}
export {};
