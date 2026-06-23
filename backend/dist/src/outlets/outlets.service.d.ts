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
    update(id: string, data: {
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
    createTableQr(outletId: string, data: {
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
    updateTableQr(id: string, data: {
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
    removeTableQr(id: string): import("@prisma/client").Prisma.Prisma__TableQRCodeClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        code: string;
        isActive: boolean;
        label: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findPublicOutletTable(outletSlug: string, tableCode: string): Promise<{
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
}
