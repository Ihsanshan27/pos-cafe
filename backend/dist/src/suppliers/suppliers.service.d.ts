import { PrismaService } from '../prisma/prisma.service';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        phone?: string;
        email?: string;
        address?: string;
        notes?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
        isActive: boolean;
        phone: string | null;
        address: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            purchaseOrders: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
        isActive: boolean;
        phone: string | null;
        address: string | null;
    })[]>;
    update(id: string, data: {
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        notes?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
        isActive: boolean;
        phone: string | null;
        address: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
        isActive: boolean;
        phone: string | null;
        address: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
