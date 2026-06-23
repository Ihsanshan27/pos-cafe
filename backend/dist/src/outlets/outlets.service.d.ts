import { PrismaService } from '../prisma/prisma.service';
export declare class OutletsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
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
    update(id: string, data: {
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
    createTableQr(outletId: string, data: {
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
    updateTableQr(id: string, data: {
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
    removeTableQr(id: string): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findPublicOutletTable(outletSlug: string, tableCode: string): Promise<{
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
}
