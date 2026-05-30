import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(data: {
        name: string;
        phone?: string;
        email?: string;
    }): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__CustomerClient<({
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
        name: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
