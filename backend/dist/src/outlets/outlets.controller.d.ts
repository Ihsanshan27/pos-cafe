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
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            isActive: boolean;
            label: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        slug: string;
        address: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            transactions: number;
            users: number;
        };
        tableQRCodes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            isActive: boolean;
            label: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        slug: string;
        address: string | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__OutletClient<({
        tableQRCodes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            isActive: boolean;
            label: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        slug: string;
        address: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            outletId: string;
            code: string;
            isActive: boolean;
            label: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        slug: string;
        address: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        slug: string;
        address: string | null;
    }>;
    createTable(id: string, body: {
        code: string;
        label?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        isActive: boolean;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateTable(id: string, body: {
        code?: string;
        label?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        isActive: boolean;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    removeTable(id: string): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        isActive: boolean;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
