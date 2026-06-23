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
        status: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    findAll(user: AuthenticatedUser, outletId?: string): Promise<{
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
        }, "password">;
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
        id: string;
        outletId: string | null;
        status: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
    }[]>;
    findActive(user: AuthenticatedUser, outletId?: string): import("@prisma/client").Prisma.Prisma__ShiftClient<{
        id: string;
        outletId: string | null;
        status: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
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
        }, "password">;
        transactions: {
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
        }[];
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
        id: string;
        outletId: string | null;
        status: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
    } | null>;
    update(user: AuthenticatedUser, id: string, updateShiftDto: UpdateShiftDto): Promise<{
        id: string;
        outletId: string | null;
        status: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    private resolveScopedOutletId;
    private assertShiftAccess;
}
export {};
