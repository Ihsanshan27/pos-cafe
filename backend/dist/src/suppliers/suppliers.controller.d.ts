import { SuppliersService } from './suppliers.service';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(body: {
        name: string;
        phone?: string;
        email?: string;
        address?: string;
        notes?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            purchaseOrders: number;
        };
    } & {
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
    })[]>;
    update(id: string, body: {
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        notes?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        notes: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
