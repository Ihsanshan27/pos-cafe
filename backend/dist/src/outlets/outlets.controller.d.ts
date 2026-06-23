import { OutletsService } from './outlets.service';
export declare class OutletsController {
    private readonly outletsService;
    constructor(outletsService: OutletsService);
    create(body: {
        name: string;
        slug: string;
        address?: string;
        phone?: string;
        isActive?: boolean;
    }): Promise<{
        tableQRCodes: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            label: string | null;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        tableQRCodes: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            label: string | null;
        }[];
        _count: {
            users: number;
            transactions: number;
        };
    } & {
        id: string;
        name: string;
        slug: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__OutletClient<({
        tableQRCodes: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            label: string | null;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: {
        name?: string;
        slug?: string;
        address?: string;
        phone?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__OutletClient<{
        tableQRCodes: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            label: string | null;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createTable(id: string, body: {
        code: string;
        label?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateTable(id: string, body: {
        code?: string;
        label?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    removeTable(id: string): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
