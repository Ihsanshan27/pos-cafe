import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ShiftsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createShiftDto: CreateShiftDto): Promise<{
        id: string;
        status: string;
        userId: string;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
        startTime: Date;
        endTime: Date | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        status: string;
        userId: string;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
        startTime: Date;
        endTime: Date | null;
    })[]>;
    findActive(userId: string): import("@prisma/client").Prisma.Prisma__ShiftClient<{
        id: string;
        status: string;
        userId: string;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
        startTime: Date;
        endTime: Date | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ShiftClient<({
        transactions: {
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
        }[];
    } & {
        id: string;
        status: string;
        userId: string;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
        startTime: Date;
        endTime: Date | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateShiftDto: UpdateShiftDto): Promise<{
        id: string;
        status: string;
        userId: string;
        startingCash: import("@prisma/client-runtime-utils").Decimal;
        actualEndingCash: import("@prisma/client-runtime-utils").Decimal | null;
        startTime: Date;
        endTime: Date | null;
    }>;
}
