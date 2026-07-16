import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
type AuthenticatedUser = {
    id: string;
    role: Role;
    outletId?: string | null;
};
export declare class ShiftsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createShiftDto: CreateShiftDto): Promise<{
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
        }, "password">;
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
    }[]>;
    findActive(user: AuthenticatedUser, outletId?: string): import("@prisma/client").Prisma.Prisma__ShiftClient<{
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
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
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
        }, "password">;
        transactions: {
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
        }[];
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
    } | null>;
    getShiftSummary(user: AuthenticatedUser, id: string): Promise<{
        startingCash: number;
        totalCashSales: number;
        totalNonCashSales: number;
        totalExpenses: number;
        transactionCount: number;
        expectedEndingCash: number;
        expenseDetails: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            outletId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
        }[];
    }>;
    private computeShiftSummary;
    update(user: AuthenticatedUser, id: string, updateShiftDto: UpdateShiftDto): Promise<{
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
    }>;
    private resolveScopedOutletId;
    private assertShiftAccess;
}
export {};
