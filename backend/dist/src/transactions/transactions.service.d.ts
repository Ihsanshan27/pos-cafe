import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createTransactionDto: CreateTransactionDto): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
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
        status: import("@prisma/client").$Enums.TransactionStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        orderType: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shiftId: string | null;
        customerName: string | null;
        customerId: string | null;
        orderNumber: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
        userId: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
        shift: {
            id: string;
            status: string;
            userId: string;
            startingCash: import("@prisma/client-runtime-utils").Decimal;
            actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
            startTime: Date;
            endTime: Date | null;
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
        status: import("@prisma/client").$Enums.TransactionStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        orderType: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shiftId: string | null;
        customerName: string | null;
        customerId: string | null;
        orderNumber: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
        userId: string | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__TransactionClient<({
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
        shift: {
            id: string;
            status: string;
            userId: string;
            startingCash: import("@prisma/client-runtime-utils").Decimal;
            actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
            startTime: Date;
            endTime: Date | null;
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
        status: import("@prisma/client").$Enums.TransactionStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        orderType: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shiftId: string | null;
        customerName: string | null;
        customerId: string | null;
        orderNumber: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
        userId: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    voidTransaction(id: string): Promise<{
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
        status: import("@prisma/client").$Enums.TransactionStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        orderType: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shiftId: string | null;
        customerName: string | null;
        customerId: string | null;
        orderNumber: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
        userId: string | null;
    }>;
    updateKitchenStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE'): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
        shift: {
            id: string;
            status: string;
            userId: string;
            startingCash: import("@prisma/client-runtime-utils").Decimal;
            actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
            startTime: Date;
            endTime: Date | null;
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
        status: import("@prisma/client").$Enums.TransactionStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        orderType: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shiftId: string | null;
        customerName: string | null;
        customerId: string | null;
        orderNumber: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        kitchenStatus: import("@prisma/client").$Enums.KitchenStatus;
        userId: string | null;
    }>;
}
