import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
export declare class CustomersService {
    private prisma;
    private settingsService;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    create(data: {
        name: string;
        phone?: string;
        email?: string;
    }): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        email: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): Promise<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        email: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }[]>;
    findOne(id: string): Promise<({
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
    } & {
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        email: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }) | null>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        email: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        email: string | null;
        pointBalance: number;
        tier: import("@prisma/client").$Enums.CustomerTier;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    private attachResolvedTier;
    private resolveTier;
}
